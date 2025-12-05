#!/bin/bash
# Phase 2: Local Integration Testing Script
# This script executes all tests for Workstream D

set -e  # Exit on error

echo "=========================================="
echo "Phase 2: Local Integration Testing"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results array
declare -a TEST_RESULTS

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    TEST_RESULTS+=("PASS: $1")
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    TEST_RESULTS+=("FAIL: $1")
}

log_warning() {
    echo -e "${YELLOW}!${NC} $1"
    TEST_RESULTS+=("WARN: $1")
}

# Workstream D.1: Verify backend is running on port 5000
echo "=== D.1: Backend Health Check ==="
echo "Testing: http://localhost:5000/health"

if curl -s http://localhost:5000/health > /tmp/health_response.json 2>&1; then
    HEALTH_RESPONSE=$(cat /tmp/health_response.json)
    echo "Response: $HEALTH_RESPONSE"

    if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"' && echo "$HEALTH_RESPONSE" | grep -q '"service":"hd-chart-generator"'; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check returned unexpected response"
    fi
else
    log_error "Backend is not running on port 5000 or not reachable"
fi
echo ""

# Workstream D.2: Test Chart Generation Endpoint
echo "=== D.2: Chart Generation Test ==="
echo "Testing: POST /api/hd-chart with valid data"

CHART_REQUEST='{"firstName":"Test User","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany","birthTimeApproximate":false}'

CHART_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
    -H "Content-Type: application/json" \
    -d "$CHART_REQUEST")

echo "Response received (first 200 chars):"
echo "$CHART_RESPONSE" | head -c 200
echo ""

if echo "$CHART_RESPONSE" | grep -q '"name"'; then
    log_success "Chart generation successful"

    # Check for required sections
    if echo "$CHART_RESPONSE" | grep -q '"type"'; then
        log_success "Type section present"
    else
        log_warning "Type section missing"
    fi

    if echo "$CHART_RESPONSE" | grep -q '"authority"'; then
        log_success "Authority section present"
    else
        log_warning "Authority section missing"
    fi

    if echo "$CHART_RESPONSE" | grep -q '"profile"'; then
        log_success "Profile section present"
    else
        log_warning "Profile section missing"
    fi

    if echo "$CHART_RESPONSE" | grep -q '"bodygraph"'; then
        log_success "Bodygraph section present"
    else
        log_warning "Bodygraph section missing"
    fi
else
    log_error "Chart generation failed or returned invalid response"
fi
echo ""

# Workstream D.4: Test Error Scenarios
echo "=== D.4: Error Scenario Tests ==="

# Test 1: Invalid date
echo "Test: Invalid date (32.13.2024)"
INVALID_DATE_REQUEST='{"firstName":"Test","birthDate":"32.13.2024","birthTime":"14:30","birthPlace":"Berlin","country":"Germany","birthTimeApproximate":false}'
ERROR_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
    -H "Content-Type: application/json" \
    -d "$INVALID_DATE_REQUEST")

if echo "$ERROR_RESPONSE" | grep -q '"error"\|"detail"'; then
    log_success "Invalid date properly rejected"
else
    log_error "Invalid date not properly validated"
fi

# Test 2: Future date
echo "Test: Future date"
FUTURE_DATE_REQUEST='{"firstName":"Test","birthDate":"01.01.2030","birthTime":"14:30","birthPlace":"Berlin","country":"Germany","birthTimeApproximate":false}'
FUTURE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
    -H "Content-Type: application/json" \
    -d "$FUTURE_DATE_REQUEST")

if echo "$FUTURE_RESPONSE" | grep -q '"error"\|"detail"'; then
    log_success "Future date properly rejected"
else
    log_error "Future date not properly validated"
fi

# Test 3: Empty fields
echo "Test: Empty firstName"
EMPTY_NAME_REQUEST='{"firstName":"","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany","birthTimeApproximate":false}'
EMPTY_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
    -H "Content-Type: application/json" \
    -d "$EMPTY_NAME_REQUEST")

if echo "$EMPTY_RESPONSE" | grep -q '"error"\|"detail"'; then
    log_success "Empty name properly rejected"
else
    log_error "Empty name not properly validated"
fi
echo ""

# Workstream D.5: Test Email Capture
echo "=== D.5: Email Capture Test ==="

# Generate random email to avoid duplicates
RANDOM_NUM=$RANDOM
TEST_EMAIL="test${RANDOM_NUM}@example.com"

EMAIL_REQUEST="{\"email\":\"${TEST_EMAIL}\"}"

echo "Testing: POST /api/email-capture with ${TEST_EMAIL}"
EMAIL_RESPONSE=$(curl -s -X POST http://localhost:5000/api/email-capture \
    -H "Content-Type: application/json" \
    -d "$EMAIL_REQUEST")

echo "Response: $EMAIL_RESPONSE"

if echo "$EMAIL_RESPONSE" | grep -q '"success":true'; then
    log_success "Email capture successful"

    # Test duplicate email
    echo "Test: Duplicate email"
    DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/email-capture \
        -H "Content-Type: application/json" \
        -d "$EMAIL_REQUEST")

    if echo "$DUPLICATE_RESPONSE" | grep -q '"error"\|"detail"'; then
        log_success "Duplicate email properly rejected"
    else
        log_warning "Duplicate email not properly detected"
    fi
else
    log_error "Email capture failed"
fi
echo ""

# Workstream D.7: Check CORS Headers
echo "=== D.7: CORS Configuration Test ==="
CORS_RESPONSE=$(curl -s -I -X OPTIONS http://localhost:5000/api/hd-chart \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    log_success "CORS headers present"
else
    log_warning "CORS headers missing or incomplete"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
PASS_COUNT=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "^PASS:" || true)
FAIL_COUNT=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "^FAIL:" || true)
WARN_COUNT=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "^WARN:" || true)

echo "Total Tests: ${#TEST_RESULTS[@]}"
echo -e "${GREEN}Passed: ${PASS_COUNT}${NC}"
echo -e "${RED}Failed: ${FAIL_COUNT}${NC}"
echo -e "${YELLOW}Warnings: ${WARN_COUNT}${NC}"
echo ""

echo "Detailed Results:"
printf '%s\n' "${TEST_RESULTS[@]}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review.${NC}"
    exit 1
fi
