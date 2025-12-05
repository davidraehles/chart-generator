# Phase 2: Execution Guide

**Coordinator**: Multi-Agent Coordinator
**Phase**: Phase 2 - Local Integration Testing & Production Build Verification
**Created**: 2025-12-05

---

## Quick Start

### Prerequisites

**Backend Requirements**:
- Python 3.12+ installed
- Virtual environment activated
- Dependencies installed (`pip install -r requirements.txt`)
- Backend running on port 5000

**Frontend Requirements**:
- Node.js 20+ installed
- Dependencies installed (`npm install`)
- Can run on port 3000

**System Requirements**:
- `curl` command available
- `bc` command available (for calculations)
- Browser available for manual tests

---

## Execution Steps

### Step 1: Start Backend (if not running)

```bash
# Navigate to backend directory
cd /home/darae/chart-generator/backend

# Activate virtual environment
source venv/bin/activate

# Start backend server
python src/main.py
```

**Expected Output**:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000
```

**Verification**:
```bash
# In a new terminal
curl http://localhost:5000/health
# Expected: {"status":"healthy","service":"hd-chart-generator"}
```

### Step 2: Run Automated Tests

```bash
# Navigate to backend directory
cd /home/darae/chart-generator/backend

# Make script executable
chmod +x execute_phase2.sh

# Run Phase 2 tests
bash execute_phase2.sh
```

**Expected Duration**: 5-10 minutes

**What It Does**:
1. Tests backend health
2. Tests chart generation
3. Tests error scenarios
4. Tests email capture
5. Tests CORS configuration
6. Builds frontend production bundle
7. Measures performance
8. Verifies documentation exists
9. Generates comprehensive report

### Step 3: Review Results

```bash
# View the generated report
cat /home/darae/chart-generator/PHASE2_RESULTS.md

# Or open in your preferred editor
code /home/darae/chart-generator/PHASE2_RESULTS.md
```

### Step 4: Complete Manual Tests (Optional but Recommended)

#### Manual Test 1: Full User Flow

1. **Start Frontend** (in new terminal):
```bash
cd /home/darae/chart-generator/frontend
npm run dev
```

2. **Open Browser**:
- Navigate to: http://localhost:3000
- Open DevTools (F12)
- Go to Console tab

3. **Test Chart Generation**:
- Fill form with:
  - First Name: "Test User"
  - Birth Date: "23.11.1992"
  - Birth Time: "14:30"
  - Birth Place: "Berlin"
  - Country: "Germany"
- Click "Chart generieren"
- Wait for chart to appear
- Verify all sections display

4. **Check for Errors**:
- Console should be clean (no errors)
- Network tab: all requests should succeed (200/201)
- No CORS errors

#### Manual Test 2: Production Build Test

1. **Build Frontend**:
```bash
cd /home/darae/chart-generator/frontend
npm run build
```

2. **Start Production Server**:
```bash
npm run start
```

3. **Test in Browser**:
- Open: http://localhost:3000
- Test chart generation
- Verify everything works in production mode

---

## Understanding Test Results

### Result Indicators

**In Console Output**:
- ✓ (Green checkmark) = Test passed
- ✗ (Red X) = Test failed
- ! (Yellow exclamation) = Warning
- ℹ (Blue info) = Information

**In Report**:
- `PASS` = Test completed successfully
- `FAIL` = Test failed, needs attention
- `WARN` = Warning, may need attention
- `MANUAL` = Requires manual verification
- `SKIP` = Test skipped due to dependencies

### Workstream Status

- `COMPLETED` = All tests in workstream passed
- `FAILED` = One or more tests failed
- `BLOCKED` = Cannot proceed (e.g., backend not running)
- `INCOMPLETE` = Not all tests completed
- `IN_PROGRESS` = Currently executing

### Success Criteria

**Ready for Phase 3 if**:
- ✅ Backend health check passes
- ✅ Chart generation works
- ✅ Email capture works
- ✅ Frontend builds successfully
- ✅ CORS configured correctly
- ✅ All documentation created
- ✅ Minimal critical failures

**Not Ready if**:
- ❌ Backend not running
- ❌ Chart generation fails
- ❌ Frontend won't build
- ❌ Multiple critical failures

---

## Common Issues and Solutions

### Issue 1: Backend Not Running

**Symptom**: Tests show "Backend is not running on port 5000"

**Solution**:
```bash
cd /home/darae/chart-generator/backend
source venv/bin/activate
python src/main.py
```

Then re-run tests in a new terminal.

### Issue 2: Frontend Build Fails

**Symptom**: `npm run build` shows errors

**Solution**:
```bash
# Clean install
cd /home/darae/chart-generator/frontend
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Issue 3: CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**:
1. Check backend `.env` file has: `FRONTEND_URL=http://localhost:3000`
2. Restart backend
3. Clear browser cache
4. Try again

### Issue 4: Dependencies Missing

**Symptom**: "command not found" errors

**Solution**:
```bash
# Install bc (for calculations)
sudo apt-get install bc

# Verify curl installed
which curl
```

### Issue 5: Port Already in Use

**Symptom**: "Address already in use" error

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 python src/main.py
```

---

## Interpreting Performance Metrics

### Chart Generation Time

**Target**: < 2 seconds
**Acceptable**: 2-3 seconds
**Needs Optimization**: > 3 seconds

**Measured by**: Average of 3 test attempts

**If slow**:
- Check database connection
- Check geocoding service
- Check ephemeris calculations
- Consider caching

### Frontend Build Time

**Target**: < 60 seconds
**Acceptable**: 60-120 seconds
**Needs Optimization**: > 120 seconds

**If slow**:
- Check dependencies
- Clear cache
- Optimize imports
- Check bundle size

### Bundle Size

**Target**: < 500KB total
**Acceptable**: 500-750KB
**Needs Optimization**: > 750KB

**If large**:
- Check for unnecessary dependencies
- Enable tree-shaking
- Optimize images
- Split code

---

## Next Steps After Phase 2

### If All Tests Pass:

1. **Review Documentation**:
   - Read `DEPLOYMENT_CHECKLIST.md`
   - Read `POST_DEPLOYMENT_VERIFICATION.md`
   - Read `MONITORING_AND_LOGGING.md`

2. **Prepare for Deployment**:
   - Set up Railway account
   - Set up Vercel account
   - Prepare production environment variables
   - Plan deployment window

3. **Proceed to Phase 3**:
   - Phase 3: Deployment Setup
   - Follow deployment checklist
   - Execute post-deployment verification

### If Tests Fail:

1. **Document Failures**:
   - Note which tests failed
   - Capture error messages
   - Check logs for details

2. **Prioritize Issues**:
   - Critical: Blocks deployment (must fix)
   - High: Major feature broken (should fix)
   - Medium: Minor issue (can fix later)
   - Low: Cosmetic (nice to fix)

3. **Fix Issues**:
   - Fix critical issues first
   - Test fixes locally
   - Re-run Phase 2 tests
   - Repeat until pass

4. **Request Help if Needed**:
   - Review error logs
   - Check documentation
   - Consult team members
   - Search for similar issues

---

## Manual Test Checklists

### Checklist: Full User Flow Test

Location: Browser at http://localhost:3000

- [ ] **Step 1**: Form loads correctly
- [ ] **Step 2**: Fill in all fields
  - [ ] First Name: "Test User"
  - [ ] Birth Date: "23.11.1992"
  - [ ] Birth Time: "14:30"
  - [ ] Birth Place: "Berlin"
  - [ ] Country: "Germany"
- [ ] **Step 3**: Click submit button
- [ ] **Step 4**: Chart appears within 3 seconds
- [ ] **Step 5**: Verify sections present:
  - [ ] Type (e.g., "Generator")
  - [ ] Authority (e.g., "Sacral Authority")
  - [ ] Profile (e.g., "1/3")
  - [ ] Bodygraph (visual diagram)
  - [ ] Centers (list of centers)
  - [ ] Channels (list of channels)
  - [ ] Gates (list of gates)
  - [ ] Incarnation Cross
  - [ ] Impulse (definition type)
- [ ] **Step 6**: Check browser console
  - [ ] No red errors
  - [ ] No CORS errors
  - [ ] No 404 errors
- [ ] **Step 7**: Check Network tab
  - [ ] POST to /api/hd-chart returns 200
  - [ ] Response time reasonable (< 3s)
  - [ ] Response contains chart data

**Result**: ☐ PASS  ☐ FAIL  ☐ WARNINGS

**Notes**: _________________________________

### Checklist: Email Capture Test

Location: Chart results page

- [ ] **Step 1**: Locate email input field
- [ ] **Step 2**: Enter email: "test@example.com"
- [ ] **Step 3**: Click submit
- [ ] **Step 4**: Success message appears
- [ ] **Step 5**: Try same email again
- [ ] **Step 6**: Error message shows (duplicate)
- [ ] **Step 7**: Try invalid email: "notanemail"
- [ ] **Step 8**: Validation error shows

**Result**: ☐ PASS  ☐ FAIL  ☐ WARNINGS

**Notes**: _________________________________

### Checklist: Error Handling Test

Location: Form page

Test each error scenario:

- [ ] **Invalid Date**: "32.13.2024"
  - [ ] Error message shows
  - [ ] Field highlighted
  - [ ] Message in German
- [ ] **Future Date**: "01.01.2030"
  - [ ] Error message shows
  - [ ] Validation prevents submission
- [ ] **Empty Name**: ""
  - [ ] Required field error
  - [ ] Cannot submit
- [ ] **Invalid Time**: "25:99"
  - [ ] Validation error
  - [ ] Clear error message
- [ ] **Invalid Location**: "NonexistentCity12345"
  - [ ] Geocoding error
  - [ ] Helpful error message

**Result**: ☐ PASS  ☐ FAIL  ☐ WARNINGS

**Notes**: _________________________________

---

## Troubleshooting Commands

### Check Backend Status
```bash
curl http://localhost:5000/health
```

### Check Backend Logs
```bash
# If running in foreground, check terminal
# If running in background:
ps aux | grep python
```

### Test Specific Endpoint
```bash
# Chart generation
curl -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "birthDate": "23.11.1992",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "country": "Germany"
  }'

# Email capture
curl -X POST http://localhost:5000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Check Frontend Build
```bash
cd /home/darae/chart-generator/frontend
npm run build 2>&1 | tee build_output.log
```

### Check Port Usage
```bash
# Check if port 5000 in use
lsof -i :5000

# Check if port 3000 in use
lsof -i :3000
```

### Verify Environment
```bash
# Backend
cd /home/darae/chart-generator/backend
cat .env

# Frontend
cd /home/darae/chart-generator/frontend
cat .env.local  # if exists
```

---

## Files Created by Phase 2

### Execution Scripts
- `/home/darae/chart-generator/backend/execute_phase2.sh` - Main test orchestrator
- `/home/darae/chart-generator/backend/phase2_integration_test.sh` - Backend-only tests

### Documentation
- `/home/darae/chart-generator/DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `/home/darae/chart-generator/POST_DEPLOYMENT_VERIFICATION.md` - Post-deploy tests
- `/home/darae/chart-generator/MONITORING_AND_LOGGING.md` - Monitoring guide

### Coordination Documents
- `/home/darae/chart-generator/PHASE2_COORDINATION_PLAN.md` - Coordination strategy
- `/home/darae/chart-generator/PHASE2_EXECUTION_GUIDE.md` - This file

### Generated Reports
- `/home/darae/chart-generator/PHASE2_RESULTS.md` - Test results (created after execution)

---

## Success Metrics

### Automated Testing
- **Target**: 90%+ pass rate
- **Minimum**: 75% pass rate for Phase 3 readiness
- **Critical**: 0 critical failures

### Performance
- **Chart Generation**: < 2 seconds average
- **Email Capture**: < 500ms
- **Frontend Build**: < 60 seconds
- **Bundle Size**: < 500KB

### Documentation
- **Completeness**: All 3 docs created
- **Quality**: Comprehensive and actionable
- **Readiness**: Ready for production use

### Overall Phase 2 Success
- ✅ All critical tests pass
- ✅ Performance acceptable
- ✅ Documentation complete
- ✅ Manual tests documented
- ✅ Ready for Phase 3

---

## Support and Resources

### Documentation
- Main project README: `/home/darae/chart-generator/README.md`
- Backend documentation: `/home/darae/chart-generator/backend/README.md`
- Frontend documentation: `/home/darae/chart-generator/frontend/README.md`

### Logs and Debugging
- Backend logs: Check terminal where backend is running
- Frontend logs: Browser DevTools Console
- Build logs: Terminal output from `npm run build`

### Getting Help
1. Review this execution guide
2. Check error messages carefully
3. Review related documentation
4. Search for similar issues
5. Ask team members

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-05
**Status**: READY FOR USE

---

## Quick Reference

### Start Backend
```bash
cd /home/darae/chart-generator/backend && source venv/bin/activate && python src/main.py
```

### Start Frontend (Dev)
```bash
cd /home/darae/chart-generator/frontend && npm run dev
```

### Run Phase 2 Tests
```bash
cd /home/darae/chart-generator/backend && bash execute_phase2.sh
```

### View Results
```bash
cat /home/darae/chart-generator/PHASE2_RESULTS.md
```
