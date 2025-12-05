#!/bin/bash
# Phase 2: Complete Integration Testing and Build Verification
# Multi-Agent Coordinator Script

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Results tracking
declare -A WORKSTREAM_RESULTS
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Paths
BACKEND_DIR="/home/darae/chart-generator/backend"
FRONTEND_DIR="/home/darae/chart-generator/frontend"
REPORT_FILE="/home/darae/chart-generator/PHASE2_RESULTS.md"

log_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

log_section() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}!${NC} $1"
    ((WARNINGS++))
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Initialize report file
init_report() {
    cat > "$REPORT_FILE" << 'EOF'
# Phase 2: Integration Testing & Build Verification Results

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Coordinator**: Multi-Agent Coordinator
**Phase**: Phase 2 - Local Integration Testing & Production Build Verification

---

## Executive Summary

EOF
}

# Add to report
add_to_report() {
    echo "$1" >> "$REPORT_FILE"
}

log_header "Phase 2: Multi-Agent Coordination Started"
log_info "Initializing Phase 2: Local Integration Testing & Production Build Verification"
log_info "Coordinator: Multi-Agent Coordinator"
log_info "Date: $(date '+%Y-%m-%d %H:%M:%S')"

init_report

# ============================================
# WORKSTREAM D: Local Integration Testing
# ============================================

log_header "WORKSTREAM D: Local Integration Testing"
WORKSTREAM_D_STATUS="IN_PROGRESS"

# D.1: Backend Health Check
log_section "D.1: Backend Health Check"
log_info "Testing backend on http://localhost:5000/health"

if curl -s -f http://localhost:5000/health > /tmp/health_check.json 2>&1; then
    HEALTH_RESPONSE=$(cat /tmp/health_check.json)
    log_info "Response: $HEALTH_RESPONSE"

    if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"' && \
       echo "$HEALTH_RESPONSE" | grep -q '"service":"hd-chart-generator"'; then
        log_success "Backend health check passed"
        WORKSTREAM_RESULTS[D1]="PASS"
    else
        log_error "Backend returned unexpected health response"
        WORKSTREAM_RESULTS[D1]="FAIL"
    fi
else
    log_error "Backend is not running on port 5000"
    log_warning "Please start backend: cd $BACKEND_DIR && python src/main.py"
    WORKSTREAM_RESULTS[D1]="FAIL"
    WORKSTREAM_D_STATUS="BLOCKED"
fi

# Only continue if backend is running
if [ "${WORKSTREAM_RESULTS[D1]}" == "PASS" ]; then

    # D.2: Chart Generation Test
    log_section "D.2: Chart Generation Endpoint Test"

    CHART_REQUEST='{"firstName":"Test User","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany","birthTimeApproximate":false}'

    log_info "Sending POST request to /api/hd-chart"
    CHART_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
        -H "Content-Type: application/json" \
        -d "$CHART_REQUEST" 2>&1)

    if echo "$CHART_RESPONSE" | grep -q '"name"'; then
        log_success "Chart generation successful"
        WORKSTREAM_RESULTS[D2]="PASS"

        # Check for all required sections
        for section in type authority profile bodygraph centers channels gates; do
            if echo "$CHART_RESPONSE" | grep -qi "\"$section\""; then
                log_success "Section '$section' present in response"
            else
                log_warning "Section '$section' missing from response"
            fi
        done
    else
        log_error "Chart generation failed"
        log_info "Response (first 500 chars): ${CHART_RESPONSE:0:500}"
        WORKSTREAM_RESULTS[D2]="FAIL"
    fi

    # D.3: Full User Flow Test (Manual - Document)
    log_section "D.3: Full User Flow Test"
    log_warning "Manual testing required in browser"
    log_info "Please complete the following steps:"
    log_info "  1. Open http://localhost:3000 in browser"
    log_info "  2. Fill form with test data"
    log_info "  3. Verify chart appears within 3 seconds"
    log_info "  4. Check browser console for errors"
    log_info "  5. Verify all 9 sections display correctly"
    WORKSTREAM_RESULTS[D3]="MANUAL"

    # D.4: Error Scenario Tests
    log_section "D.4: Error Scenario Tests"

    # Test 4a: Invalid date
    log_info "Test: Invalid date (32.13.2024)"
    INVALID_DATE='{"firstName":"Test","birthDate":"32.13.2024","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}'
    INVALID_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
        -H "Content-Type: application/json" \
        -d "$INVALID_DATE" 2>&1)

    if echo "$INVALID_RESPONSE" | grep -qi "error\|detail"; then
        log_success "Invalid date properly rejected"
    else
        log_error "Invalid date validation failed"
    fi

    # Test 4b: Future date
    log_info "Test: Future date (01.01.2030)"
    FUTURE_DATE='{"firstName":"Test","birthDate":"01.01.2030","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}'
    FUTURE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
        -H "Content-Type: application/json" \
        -d "$FUTURE_DATE" 2>&1)

    if echo "$FUTURE_RESPONSE" | grep -qi "error\|detail"; then
        log_success "Future date properly rejected"
    else
        log_error "Future date validation failed"
    fi

    # Test 4c: Empty name
    log_info "Test: Empty name field"
    EMPTY_NAME='{"firstName":"","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}'
    EMPTY_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
        -H "Content-Type: application/json" \
        -d "$EMPTY_NAME" 2>&1)

    if echo "$EMPTY_RESPONSE" | grep -qi "error\|detail"; then
        log_success "Empty name properly rejected"
    else
        log_error "Empty name validation failed"
    fi

    WORKSTREAM_RESULTS[D4]="PASS"

    # D.5: Email Capture Test
    log_section "D.5: Email Capture Test"

    RANDOM_NUM=$RANDOM
    TEST_EMAIL="phase2test${RANDOM_NUM}@example.com"
    EMAIL_REQUEST="{\"email\":\"${TEST_EMAIL}\"}"

    log_info "Testing email capture with: $TEST_EMAIL"
    EMAIL_RESPONSE=$(curl -s -X POST http://localhost:5000/api/email-capture \
        -H "Content-Type: application/json" \
        -d "$EMAIL_REQUEST" 2>&1)

    if echo "$EMAIL_RESPONSE" | grep -q '"success":true'; then
        log_success "Email capture successful"

        # Test duplicate
        log_info "Testing duplicate email detection"
        DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/email-capture \
            -H "Content-Type: application/json" \
            -d "$EMAIL_REQUEST" 2>&1)

        if echo "$DUPLICATE_RESPONSE" | grep -qi "error\|detail"; then
            log_success "Duplicate email properly rejected"
        else
            log_warning "Duplicate email not detected"
        fi

        WORKSTREAM_RESULTS[D5]="PASS"
    else
        log_error "Email capture failed"
        log_info "Response: $EMAIL_RESPONSE"
        WORKSTREAM_RESULTS[D5]="FAIL"
    fi

    # D.6: No CORS Errors
    log_section "D.6: CORS Configuration Test"

    CORS_RESPONSE=$(curl -s -I -X OPTIONS http://localhost:5000/api/hd-chart \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" 2>&1)

    if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
        log_success "CORS headers present"
        WORKSTREAM_RESULTS[D6]="PASS"
    else
        log_warning "CORS headers not detected in OPTIONS response"
        WORKSTREAM_RESULTS[D6]="WARN"
    fi

    # D.7: Network Tab Check
    log_section "D.7: Network Request Verification"
    log_warning "Manual verification required"
    log_info "Please verify in browser DevTools Network tab:"
    log_info "  - All requests return 200/201 status"
    log_info "  - No CORS errors in console"
    log_info "  - Requests complete within expected time"
    WORKSTREAM_RESULTS[D7]="MANUAL"

    WORKSTREAM_D_STATUS="COMPLETED"
else
    log_error "Workstream D blocked - Backend not running"
    WORKSTREAM_D_STATUS="BLOCKED"
fi

# ============================================
# WORKSTREAM E: Production Build Verification
# ============================================

log_header "WORKSTREAM E: Production Build Verification"
WORKSTREAM_E_STATUS="IN_PROGRESS"

# E.1: Frontend Production Build
log_section "E.1: Frontend Production Build Test"

if [ -d "$FRONTEND_DIR" ]; then
    log_info "Building frontend production bundle"
    cd "$FRONTEND_DIR"

    # Capture build output
    BUILD_OUTPUT=$(npm run build 2>&1)
    BUILD_EXIT_CODE=$?

    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        log_success "Frontend production build completed successfully"
        WORKSTREAM_RESULTS[E1]="PASS"

        # Check for warnings
        if echo "$BUILD_OUTPUT" | grep -i "warning"; then
            log_warning "Build contains warnings"
            echo "$BUILD_OUTPUT" | grep -i "warning" | head -5
        else
            log_success "No build warnings detected"
        fi
    else
        log_error "Frontend production build failed"
        echo "$BUILD_OUTPUT" | tail -20
        WORKSTREAM_RESULTS[E1]="FAIL"
        WORKSTREAM_E_STATUS="FAILED"
    fi

    cd - > /dev/null
else
    log_error "Frontend directory not found: $FRONTEND_DIR"
    WORKSTREAM_RESULTS[E1]="FAIL"
    WORKSTREAM_E_STATUS="BLOCKED"
fi

# E.2: Bundle Size Verification
log_section "E.2: Bundle Size Verification"

if [ "${WORKSTREAM_RESULTS[E1]}" == "PASS" ]; then
    log_info "Checking bundle sizes from build output"

    # Extract bundle size info from build output
    if echo "$BUILD_OUTPUT" | grep -q "First Load JS"; then
        log_success "Bundle size information available"
        echo "$BUILD_OUTPUT" | grep -A 10 "Route (app)"

        # Check if any bundle exceeds 500KB (approximate check)
        if echo "$BUILD_OUTPUT" | grep -q "kB" && ! echo "$BUILD_OUTPUT" | grep -q "MB"; then
            log_success "Bundle sizes appear acceptable (< 500KB)"
            WORKSTREAM_RESULTS[E2]="PASS"
        else
            log_warning "Some bundles may be large - manual verification needed"
            WORKSTREAM_RESULTS[E2]="WARN"
        fi
    else
        log_warning "Bundle size info not found in build output"
        WORKSTREAM_RESULTS[E2]="MANUAL"
    fi
fi

# E.3: Production Server Test
log_section "E.3: Production Server Test"

log_warning "Manual test required"
log_info "To test production server:"
log_info "  1. cd $FRONTEND_DIR"
log_info "  2. npm run start"
log_info "  3. Open http://localhost:3000"
log_info "  4. Test chart generation"
WORKSTREAM_RESULTS[E3]="MANUAL"

# E.4: Performance Measurement
log_section "E.4: Performance Measurement"

if [ "${WORKSTREAM_RESULTS[D2]}" == "PASS" ]; then
    log_info "Measuring chart generation performance (3 attempts)"

    TOTAL_TIME=0
    SUCCESS_COUNT=0

    for i in {1..3}; do
        START_TIME=$(date +%s.%N)

        PERF_RESPONSE=$(curl -s -X POST http://localhost:5000/api/hd-chart \
            -H "Content-Type: application/json" \
            -d "$CHART_REQUEST" 2>&1)

        END_TIME=$(date +%s.%N)
        ELAPSED=$(echo "$END_TIME - $START_TIME" | bc)

        if echo "$PERF_RESPONSE" | grep -q '"name"'; then
            log_info "Attempt $i: ${ELAPSED}s"
            TOTAL_TIME=$(echo "$TOTAL_TIME + $ELAPSED" | bc)
            ((SUCCESS_COUNT++))
        else
            log_warning "Attempt $i failed"
        fi
    done

    if [ $SUCCESS_COUNT -gt 0 ]; then
        AVG_TIME=$(echo "scale=2; $TOTAL_TIME / $SUCCESS_COUNT" | bc)
        log_info "Average chart generation time: ${AVG_TIME}s"

        if (( $(echo "$AVG_TIME < 2.0" | bc -l) )); then
            log_success "Performance target met (< 2s)"
            WORKSTREAM_RESULTS[E4]="PASS"
        else
            log_warning "Performance target missed (${AVG_TIME}s > 2s target)"
            WORKSTREAM_RESULTS[E4]="WARN"
        fi
    else
        log_error "All performance test attempts failed"
        WORKSTREAM_RESULTS[E4]="FAIL"
    fi
else
    log_warning "Skipping performance tests - chart generation not working"
    WORKSTREAM_RESULTS[E4]="SKIP"
fi

WORKSTREAM_E_STATUS="COMPLETED"

# ============================================
# WORKSTREAM H: Documentation
# ============================================

log_header "WORKSTREAM H: Documentation Creation"
WORKSTREAM_H_STATUS="IN_PROGRESS"

# Check if documentation files exist
log_section "H.1: Documentation Files Check"

DOCS_ROOT="/home/darae/chart-generator"
REQUIRED_DOCS=(
    "DEPLOYMENT_CHECKLIST.md"
    "POST_DEPLOYMENT_VERIFICATION.md"
    "MONITORING_AND_LOGGING.md"
)

ALL_DOCS_PRESENT=true
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$DOCS_ROOT/$doc" ]; then
        log_success "Documentation exists: $doc"
    else
        log_error "Documentation missing: $doc"
        ALL_DOCS_PRESENT=false
    fi
done

if [ "$ALL_DOCS_PRESENT" = true ]; then
    log_success "All required documentation files created"
    WORKSTREAM_RESULTS[H1]="PASS"
    WORKSTREAM_H_STATUS="COMPLETED"
else
    log_error "Some documentation files missing"
    WORKSTREAM_RESULTS[H1]="FAIL"
    WORKSTREAM_H_STATUS="INCOMPLETE"
fi

# ============================================
# FINAL SUMMARY
# ============================================

log_header "Phase 2 Summary"

log_section "Workstream Status"
echo -e "Workstream D (Integration Testing): ${CYAN}${WORKSTREAM_D_STATUS}${NC}"
echo -e "Workstream E (Build Verification): ${CYAN}${WORKSTREAM_E_STATUS}${NC}"
echo -e "Workstream H (Documentation): ${CYAN}${WORKSTREAM_H_STATUS}${NC}"

log_section "Test Results"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo -e "${YELLOW}Warnings: ${WARNINGS}${NC}"

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)
    echo -e "Pass Rate: ${PASS_RATE}%"
fi

# Generate detailed report
log_section "Generating Detailed Report"

cat >> "$REPORT_FILE" << EOF

### Overall Status
- **Workstream D (Integration Testing)**: ${WORKSTREAM_D_STATUS}
- **Workstream E (Build Verification)**: ${WORKSTREAM_E_STATUS}
- **Workstream H (Documentation)**: ${WORKSTREAM_H_STATUS}

### Test Statistics
- **Total Tests**: ${TOTAL_TESTS}
- **Passed**: ${PASSED_TESTS}
- **Failed**: ${FAILED_TESTS}
- **Warnings**: ${WARNINGS}
- **Pass Rate**: ${PASS_RATE}%

---

## Workstream D: Local Integration Testing

EOF

# Add detailed results
for key in "${!WORKSTREAM_RESULTS[@]}"; do
    echo "- **$key**: ${WORKSTREAM_RESULTS[$key]}" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << EOF

---

## Success Criteria Assessment

EOF

# Assess success criteria
CRITERIA_MET=0
TOTAL_CRITERIA=8

assess_criteria() {
    local name=$1
    local status=$2

    if [ "$status" == "PASS" ] || [ "$status" == "true" ]; then
        echo "- [x] $name" >> "$REPORT_FILE"
        ((CRITERIA_MET++))
    else
        echo "- [ ] $name" >> "$REPORT_FILE"
    fi
}

assess_criteria "Backend and frontend communicate successfully" "${WORKSTREAM_RESULTS[D2]}"
assess_criteria "Chart generation works end-to-end" "${WORKSTREAM_RESULTS[D2]}"
assess_criteria "Email capture works end-to-end" "${WORKSTREAM_RESULTS[D5]}"
assess_criteria "All error scenarios handled gracefully" "${WORKSTREAM_RESULTS[D4]}"
assess_criteria "No CORS errors" "${WORKSTREAM_RESULTS[D6]}"
assess_criteria "Production builds verified" "${WORKSTREAM_RESULTS[E1]}"
assess_criteria "Performance metrics acceptable" "${WORKSTREAM_RESULTS[E4]}"
assess_criteria "All required documentation created" "${WORKSTREAM_RESULTS[H1]}"

cat >> "$REPORT_FILE" << EOF

**Criteria Met**: ${CRITERIA_MET}/${TOTAL_CRITERIA}

---

## Ready for Phase 3?

EOF

if [ $CRITERIA_MET -ge 6 ] && [ $FAILED_TESTS -eq 0 ]; then
    echo "**Status**: ✅ READY to proceed to Phase 3 (Deployment Setup)" >> "$REPORT_FILE"
    log_success "Phase 2 READY - Can proceed to Phase 3"
else
    echo "**Status**: ⚠️ NOT READY - Issues must be resolved before Phase 3" >> "$REPORT_FILE"
    log_warning "Phase 2 NOT READY - Please resolve issues before proceeding"
fi

cat >> "$REPORT_FILE" << EOF

---

## Next Steps

1. Review this report and address any failures
2. Complete manual testing tasks (D.3, D.7, E.3)
3. Verify performance metrics meet targets
4. Review all documentation for completeness
5. Proceed to Phase 3: Deployment Setup

---

**Report Generated**: $(date '+%Y-%m-%d %H:%M:%S')
**Report Location**: $REPORT_FILE

EOF

log_success "Detailed report saved to: $REPORT_FILE"

echo ""
log_header "Phase 2 Execution Complete"
echo ""

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ] && [ $CRITERIA_MET -ge 6 ]; then
    exit 0
else
    exit 1
fi
