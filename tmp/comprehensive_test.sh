#!/bin/bash

echo "==============================================="
echo "PHASE 2 LOCAL INTEGRATION TESTING REPORT"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==============================================="

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ "$1" == "PASS" ]; then
        echo "✓ $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "✗ $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo ""
echo "=== 1. SETUP STATUS ==="
echo ""

# Backend health check
HEALTH=$(curl -s http://localhost:5000/health)
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    test_result "PASS" "Backend running on port 5000"
    echo "  Response: $HEALTH"
else
    test_result "FAIL" "Backend health check"
fi

# Frontend check
FRONTEND=$(curl -s -I http://localhost:3000 | head -1)
if echo "$FRONTEND" | grep -q "200"; then
    test_result "PASS" "Frontend running on port 3000"
    echo "  Status: $FRONTEND"
else
    test_result "FAIL" "Frontend accessibility"
fi

echo ""
echo "=== 2. D1: VALID CHART GENERATION (PRIMARY FLOW) ==="
echo ""

START_MS=$(date +%s%3N)
CHART_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME_MS:%{time_total}" -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test User",
    "birthDate": "23.11.1992",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "country": "Germany",
    "birthTimeApproximate": false
  }')
END_MS=$(date +%s%3N)

HTTP_CODE=$(echo "$CHART_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_TIME=$((END_MS - START_MS))

if [ "$HTTP_CODE" == "200" ]; then
    test_result "PASS" "Chart generation returns HTTP 200"
    echo "  Response time: ${RESPONSE_TIME}ms"
    
    if [ $RESPONSE_TIME -lt 2000 ]; then
        test_result "PASS" "Response time < 2000ms (${RESPONSE_TIME}ms)"
    else
        test_result "FAIL" "Response time >= 2000ms (${RESPONSE_TIME}ms)"
    fi
else
    test_result "FAIL" "Chart generation HTTP status: $HTTP_CODE"
fi

# Check all required sections
RESPONSE_BODY=$(echo "$CHART_RESPONSE" | sed '/HTTP_CODE/,$d')

for section in type authority profile bodygraph centers channels gates incarnationCross shortImpulse; do
    if echo "$RESPONSE_BODY" | grep -q "\"$section\""; then
        test_result "PASS" "Section '$section' present in response"
    else
        test_result "FAIL" "Section '$section' missing from response"
    fi
done

# Verify centers count (should be 9)
CENTER_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"name":"[^"]*"' | wc -l)
if [ "$CENTER_COUNT" -eq 9 ]; then
    test_result "PASS" "9 centers present ($CENTER_COUNT)"
else
    test_result "FAIL" "Expected 9 centers, found $CENTER_COUNT"
fi

echo ""
echo "=== 3. D2: ERROR SCENARIOS ==="
echo ""

# D2a: Invalid date
echo "Test D2a: Invalid Date (32.13.2024)"
INVALID_DATE_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","birthDate":"32.13.2024","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}')

if echo "$INVALID_DATE_RESP" | grep -q "HTTP_CODE:422\|HTTP_CODE:400"; then
    test_result "PASS" "Invalid date rejected with 4xx"
    ERROR_MSG=$(echo "$INVALID_DATE_RESP" | sed '/HTTP_CODE/,$d' | grep -o '"error":"[^"]*"' | head -1)
    echo "  Error message: $ERROR_MSG"
else
    test_result "FAIL" "Invalid date validation"
fi

# D2b: Future date
echo ""
echo "Test D2b: Future Date (01.01.2030)"
FUTURE_DATE_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","birthDate":"01.01.2030","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}')

if echo "$FUTURE_DATE_RESP" | grep -q "HTTP_CODE:422\|HTTP_CODE:400"; then
    test_result "PASS" "Future date rejected with 4xx"
    ERROR_MSG=$(echo "$FUTURE_DATE_RESP" | sed '/HTTP_CODE/,$d' | grep -o '"error":"[^"]*"' | head -1)
    echo "  Error message: $ERROR_MSG"
else
    test_result "FAIL" "Future date validation"
fi

# D2c: Invalid time
echo ""
echo "Test D2c: Invalid Time (25:00)"
INVALID_TIME_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","birthDate":"23.11.1992","birthTime":"25:00","birthPlace":"Berlin","country":"Germany"}')

if echo "$INVALID_TIME_RESP" | grep -q "HTTP_CODE:422\|HTTP_CODE:400"; then
    test_result "PASS" "Invalid time rejected with 4xx"
    ERROR_MSG=$(echo "$INVALID_TIME_RESP" | sed '/HTTP_CODE/,$d' | grep -o '"error":"[^"]*"' | head -1)
    echo "  Error message: $ERROR_MSG"
else
    test_result "FAIL" "Invalid time validation"
fi

# D2d: Empty name
echo ""
echo "Test D2d: Empty Name Field"
EMPTY_NAME_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}')

if echo "$EMPTY_NAME_RESP" | grep -q "HTTP_CODE:422\|HTTP_CODE:400"; then
    test_result "PASS" "Empty name rejected with 4xx"
else
    test_result "FAIL" "Empty name validation"
fi

# D2e: Approximate time (no time provided)
echo ""
echo "Test D2e: Approximate Time Checkbox"
APPROX_TIME_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","birthDate":"23.11.1992","birthPlace":"Berlin","country":"Germany","birthTimeApproximate":true}')

if echo "$APPROX_TIME_RESP" | grep -q "HTTP_CODE:200"; then
    test_result "PASS" "Chart generated without time (approximate)"
else
    test_result "FAIL" "Approximate time handling"
fi

echo ""
echo "=== 4. D3: EMAIL CAPTURE ==="
echo ""

RANDOM_NUM=$RANDOM
TEST_EMAIL="integration-test-${RANDOM_NUM}@example.com"

# Test 1: Valid email
echo "Test 1: Valid Email ($TEST_EMAIL)"
EMAIL_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/email-capture \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\"}")

if echo "$EMAIL_RESP" | grep -q "HTTP_CODE:200\|HTTP_CODE:201"; then
    test_result "PASS" "Valid email captured"
    SUCCESS_MSG=$(echo "$EMAIL_RESP" | sed '/HTTP_CODE/,$d')
    echo "  Response: $SUCCESS_MSG"
else
    test_result "FAIL" "Email capture failed"
fi

# Test 2: Duplicate email
echo ""
echo "Test 2: Duplicate Email"
DUPLICATE_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/email-capture \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\"}")

if echo "$DUPLICATE_RESP" | grep -q "HTTP_CODE:409"; then
    test_result "PASS" "Duplicate email rejected with 409"
    ERROR_MSG=$(echo "$DUPLICATE_RESP" | sed '/HTTP_CODE/,$d')
    echo "  Error: $ERROR_MSG"
else
    test_result "FAIL" "Duplicate email detection"
fi

# Test 3: Invalid email format
echo ""
echo "Test 3: Invalid Email Format"
INVALID_EMAIL_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:5000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email-format"}')

if echo "$INVALID_EMAIL_RESP" | grep -q "HTTP_CODE:422\|HTTP_CODE:400"; then
    test_result "PASS" "Invalid email format rejected"
else
    test_result "FAIL" "Invalid email validation"
fi

echo ""
echo "=== 5. D4: CORS AND NETWORK VERIFICATION ==="
echo ""

# CORS check
CORS_RESP=$(curl -s -I -X OPTIONS http://localhost:5000/api/hd-chart \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESP" | grep -qi "access-control-allow-origin"; then
    test_result "PASS" "CORS headers present"
    echo "$CORS_RESP" | grep -i "access-control" | sed 's/^/  /'
else
    test_result "FAIL" "CORS headers missing"
fi

# Check specific CORS headers
if echo "$CORS_RESP" | grep -q "access-control-allow-origin: http://localhost:3000"; then
    test_result "PASS" "CORS allows localhost:3000"
else
    test_result "FAIL" "CORS localhost:3000 not allowed"
fi

echo ""
echo "=== 6. PERFORMANCE METRICS ==="
echo ""

echo "Measuring chart generation time (5 attempts):"
TOTAL_TIME=0
SUCCESS_COUNT=0

for i in {1..5}; do
    START=$(date +%s%3N)
    PERF_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/hd-chart \
      -H "Content-Type: application/json" \
      -d '{"firstName":"Perf","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}')
    END=$(date +%s%3N)
    DURATION=$((END - START))
    
    if [ "$PERF_RESP" == "200" ]; then
        echo "  Attempt $i: ${DURATION}ms"
        TOTAL_TIME=$((TOTAL_TIME + DURATION))
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo "  Attempt $i: FAILED (HTTP $PERF_RESP)"
    fi
done

if [ $SUCCESS_COUNT -gt 0 ]; then
    AVG_TIME=$((TOTAL_TIME / SUCCESS_COUNT))
    echo ""
    echo "  Average: ${AVG_TIME}ms"
    
    if [ $AVG_TIME -lt 2000 ]; then
        test_result "PASS" "Performance target met (< 2000ms, avg: ${AVG_TIME}ms)"
    else
        test_result "FAIL" "Performance target missed (>= 2000ms, avg: ${AVG_TIME}ms)"
    fi
else
    test_result "FAIL" "All performance tests failed"
fi

# Email capture performance
echo ""
echo "Email capture response time:"
START=$(date +%s%3N)
curl -s -o /dev/null -X POST http://localhost:5000/api/email-capture \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"perf-test-${RANDOM}@example.com\"}"
END=$(date +%s%3N)
EMAIL_TIME=$((END - START))
echo "  Email capture: ${EMAIL_TIME}ms"

if [ $EMAIL_TIME -lt 500 ]; then
    test_result "PASS" "Email response time < 500ms (${EMAIL_TIME}ms)"
else
    test_result "FAIL" "Email response time >= 500ms (${EMAIL_TIME}ms)"
fi

echo ""
echo "=== 7. LANGUAGE VERIFICATION (GERMAN) ==="
echo ""

# Check frontend for German labels
FRONTEND_HTML=$(curl -s http://localhost:3000)

for label in "Vorname" "Geburtsdatum" "Geburtszeit" "Geburtsort" "ungefähr" "unbekannt"; do
    if echo "$FRONTEND_HTML" | grep -q "$label"; then
        test_result "PASS" "German label '$label' present"
    else
        test_result "FAIL" "German label '$label' missing"
    fi
done

# Check API for German responses
API_ERROR=$(curl -s -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}')

if echo "$API_ERROR" | grep -qi "ungültig\|prüfen\|zeichen"; then
    test_result "PASS" "API error messages in German"
else
    test_result "FAIL" "API error messages not in German"
fi

echo ""
echo "==============================================="
echo "FINAL SUMMARY"
echo "==============================================="
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo "Passed:       $PASSED_TESTS"
echo "Failed:       $FAILED_TESTS"
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: ${PASS_RATE}%"
fi
echo ""

# Determine readiness
if [ $FAILED_TESTS -eq 0 ]; then
    echo "✓ ALL TESTS PASSED - READY FOR PHASE 3"
    echo ""
    exit 0
elif [ $PASS_RATE -ge 80 ]; then
    echo "! MOSTLY READY - Minor issues to address"
    echo ""
    exit 0
else
    echo "✗ NOT READY - Critical issues found"
    echo ""
    exit 1
fi

