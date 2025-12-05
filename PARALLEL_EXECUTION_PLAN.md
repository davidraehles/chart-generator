# Parallel Task Execution Strategy - Production Readiness Plan

**Date**: 2025-12-05
**Status**: Ready for Implementation
**Objective**: Wire frontend + backend + achieve production readiness

---

## 📊 Current Project Status

### ✅ Completed
- **Feature 001**: HD Chart Generator (Phases 1-5 complete)
- **Feature 002**: Ephemeris Sources (Swiss Ephemeris integrated)
- Frontend: Next.js 16 with Tailwind CSS (builds successfully)
- Backend: FastAPI with pyswisseph (dependencies installed)
- E2E Tests: 12/12 passing
- API contracts: `/api/hd-chart`, `/api/email-capture`, `/health`

### ⚠️ Issues to Resolve
1. **Backend Module Import**: `ModuleNotFoundError: No module named 'src'`
   - Running Python directly fails; needs proper uvicorn invocation
2. **Frontend Warnings**: baseline-browser-mapping outdated
3. **Environment Setup**: Not all .env files configured for local development
4. **Integration Testing**: Need to verify frontend↔backend communication
5. **Deployment Configs**: Railway.json and vercel.json exist but need verification

---

## 🎯 Execution Strategy: Parallel Workstreams

### **Phase 1: Foundation (Days 1-2)**
Run these tasks in **parallel**:

#### **Workstream A: Backend Stabilization**
- [ ] **A1**: Fix module import issues
  - Use `uvicorn src.main:app --reload` instead of direct Python
  - Verify PYTHONPATH settings
  - Test with proper invocation

- [ ] **A2**: Complete backend .env configuration
  - Copy .env.example → .env
  - Set all required variables
  - Verify against requirements

- [ ] **A3**: Run backend health checks
  - Test `/health` endpoint
  - Test `/api/hd-chart` with sample data
  - Test `/api/email-capture` endpoint
  - Verify response formats match frontend expectations

#### **Workstream B: Frontend Stabilization**
- [ ] **B1**: Fix dependency warnings
  - Run `npm update baseline-browser-mapping`
  - Audit remaining dependencies
  - Run `npm audit fix` if needed

- [ ] **B2**: Complete frontend .env configuration
  - Ensure .env.local points to local backend
  - Set `NEXT_PUBLIC_API_URL=http://localhost:5000`
  - Verify no hardcoded URLs in code

- [ ] **B3**: Verify frontend build quality
  - Run production build again
  - Check build output for warnings/errors
  - Verify static generation works

#### **Workstream C: Test Suites**
- [ ] **C1**: Run backend test suite
  - Unit tests (if exist)
  - Integration tests
  - Fix any failures

- [ ] **C2**: Run frontend test suite
  - Component tests
  - E2E tests (should be 12/12 passing)
  - Add missing test coverage if needed

---

### **Phase 2: Integration (Days 2-3)**
Run these tasks in **parallel** after Phase 1 completes:

#### **Workstream D: Local Integration**
- [ ] **D1**: Start backend locally
  - Run: `cd backend && uvicorn src.main:app --reload --host 0.0.0.0 --port 5000`
  - Verify API docs at http://localhost:5000/docs

- [ ] **D2**: Start frontend locally
  - Run: `cd frontend && npm run dev`
  - Verify loads at http://localhost:3000

- [ ] **D3**: Test full user flow locally
  - Fill form with valid birth data
  - Verify chart generates
  - Verify no CORS errors
  - Verify email capture works
  - Test error scenarios

#### **Workstream E: Production Build Verification**
- [ ] **E1**: Test frontend production build locally
  - Run: `npm run build && npm run start`
  - Verify pages render correctly
  - Test API communication

- [ ] **E2**: Prepare backend production configuration
  - Ensure environment variables are production-ready
  - Configure proper logging
  - Set DEBUG=false

- [ ] **E3**: Performance verification
  - Measure chart generation time (should be < 2s)
  - Check bundle sizes
  - Verify no memory leaks in calculations

---

### **Phase 3: Deployment Setup (Days 3-4)**
Run these tasks in **parallel**:

#### **Workstream F: Railway Configuration**
- [ ] **F1**: Create/configure Railway project
  - Create new Railway project
  - Connect GitHub repository
  - Set root directory (ensure backend is discoverable)

- [ ] **F2**: Configure Railway environment variables
  - `FRONTEND_URL` (from Vercel, can be placeholder initially)
  - `HD_API_KEY=placeholder`
  - `HD_API_URL=https://api.humandesign.ai/v1`
  - `DEBUG=false`

- [ ] **F3**: Configure Railway build settings
  - Verify Python version (3.11+)
  - Check Procfile is correct
  - Verify requirements.txt is complete

#### **Workstream G: Vercel Configuration**
- [ ] **G1**: Create/configure Vercel project
  - Import GitHub repository
  - Set root directory to `frontend`
  - Verify build settings

- [ ] **G2**: Configure Vercel environment variables
  - `NEXT_PUBLIC_API_URL` (from Railway, placeholder initially)

- [ ] **G3**: Test Vercel preview deployment
  - Deploy to preview environment
  - Test with placeholder API URL
  - Fix any deployment issues

#### **Workstream H: Documentation**
- [ ] **H1**: Create deployment checklist
  - Step-by-step verification steps
  - Common issues and fixes
  - Rollback procedures

- [ ] **H2**: Create post-deployment verification guide
  - Health checks
  - E2E test procedures
  - Monitoring setup

- [ ] **H3**: Create monitoring and logging guide
  - How to check Railway logs
  - How to check Vercel logs
  - Error tracking setup

---

### **Phase 4: Deployment & Verification (Days 4-5)**
Run these tasks **sequentially** (with parallel monitoring):

#### **Workstream I: Staged Deployment**
- [ ] **I1**: Deploy backend to Railway
  - Trigger deployment
  - Monitor logs for errors
  - Verify health endpoint responds
  - Note Railway URL

- [ ] **I2**: Update frontend environment variable
  - Add Railway URL to Vercel `NEXT_PUBLIC_API_URL`
  - Trigger redeployment

- [ ] **I3**: Deploy frontend to Vercel
  - Trigger deployment
  - Monitor build logs
  - Verify deployment completes
  - Note Vercel URL

- [ ] **I4**: Update backend CORS configuration
  - Add Vercel URL to Railway `FRONTEND_URL`
  - Trigger redeployment

#### **Workstream J: Production Verification**
- [ ] **J1**: Verify backend endpoints
  - Test `/health`
  - Test `/api/hd-chart`
  - Test `/api/email-capture`
  - Check response times

- [ ] **J2**: Verify frontend loads
  - Visit production URL
  - Verify no console errors
  - Check network requests

- [ ] **J3**: Execute full user flow in production
  - Test with valid birth data
  - Verify chart generation
  - Test email capture
  - Test error handling

- [ ] **J4**: Performance monitoring
  - Check Vercel analytics
  - Check Railway resource usage
  - Verify no errors in logs

#### **Workstream K: Post-Deployment Tasks**
- [ ] **K1**: Monitor for 24-48 hours
  - Check logs regularly
  - Monitor error rates
  - Verify no unexpected behavior

- [ ] **K2**: Document final configuration
  - Update DEPLOYMENT.md with actual URLs
  - Document any issues encountered
  - Create runbook for future deployments

- [ ] **K3**: Set up continuous monitoring
  - Configure log aggregation (if applicable)
  - Set up error notifications
  - Create dashboard for key metrics

---

## 🔄 Parallel Execution Schedule

### **Day 1 (4 hours)**
```
Start 9:00 AM
├─ Phase 1A: Backend Stabilization (A1, A2, A3) [2 hours]
├─ Phase 1B: Frontend Stabilization (B1, B2, B3) [2 hours parallel]
└─ Phase 1C: Test Suites (C1, C2) [1 hour parallel]
Complete by 1:00 PM
```

### **Day 2 (4 hours)**
```
Start 2:00 PM (after Phase 1 completes)
├─ Phase 2D: Local Integration (D1, D2, D3) [2 hours]
├─ Phase 2E: Production Build Verification (E1, E2, E3) [1.5 hours parallel]
└─ Buffer for issues [0.5 hours]
Complete by 6:00 PM
```

### **Day 3 (4 hours)**
```
Start 9:00 AM
├─ Phase 3F: Railway Configuration (F1, F2, F3) [1.5 hours]
├─ Phase 3G: Vercel Configuration (G1, G2, G3) [1.5 hours parallel]
└─ Phase 3H: Documentation (H1, H2, H3) [1 hour parallel]
Complete by 1:00 PM
```

### **Days 4-5 (8 hours)**
```
Day 4: 9:00 AM - 5:00 PM
├─ Phase 4I: Staged Deployment (I1-I4) [4 hours sequential]
├─ Phase 4J: Production Verification (J1-J4) [2 hours]
└─ Phase 4K: Post-Deployment (K1-K3) [2 hours]

Day 5: 9:00 AM - 12:00 PM (monitoring)
└─ Continuous monitoring and hotfixes
```

---

## 📋 Parallel Dependencies

```
Phase 1
├─ Workstream A (Backend) ──┐
├─ Workstream B (Frontend)  ├─→ All independent, can run in parallel
├─ Workstream C (Tests)     ┘
        ↓
Phase 2 (depends on Phase 1)
├─ Workstream D (Integration) ──┐
├─ Workstream E (Prod Build)    ├─→ All independent
└─ Workstream H (Docs)          ┘
        ↓
Phase 3 (depends on Phase 2)
├─ Workstream F (Railway) ──┐
├─ Workstream G (Vercel)    ├─→ All independent
└─ Workstream H (Docs)      ┘
        ↓
Phase 4 (depends on Phase 3)
├─ Workstream I (Deploy) ────→ SEQUENTIAL (specific order required)
├─ Workstream J (Verify) ────→ SEQUENTIAL (after deployment)
└─ Workstream K (Monitor)  → CONTINUOUS
```

---

## 🛠️ Tools & Commands Reference

### Backend
```bash
# Development
cd backend
source venv/bin/activate  # or: . venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 5000

# Production
gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.main:app

# Testing
python -m pytest tests/
```

### Frontend
```bash
# Development
cd frontend
npm run dev          # http://localhost:3000

# Production build
npm run build
npm run start

# Testing
npm run test
npm run e2e          # Playwright E2E tests
```

### Deployment Verification
```bash
# Health checks
curl https://[backend-url]/health
curl https://[frontend-url]

# API test
curl -X POST https://[backend-url]/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1992-11-23","birthTime":"14:30","birthPlace":"Berlin","birthCountry":"Germany"}'
```

---

## ✅ Success Criteria

### Phase 1: Foundation
- [ ] Backend runs with `uvicorn` without import errors
- [ ] Both applications have complete .env configuration
- [ ] Frontend builds with 0 production warnings
- [ ] All tests pass locally
- [ ] No console errors in either application

### Phase 2: Integration
- [ ] Frontend connects to backend successfully
- [ ] Chart generation works end-to-end
- [ ] Email capture works end-to-end
- [ ] All error scenarios handled gracefully
- [ ] Production builds work correctly

### Phase 3: Deployment Setup
- [ ] Railway project created and configured
- [ ] Vercel project created and configured
- [ ] All environment variables set correctly
- [ ] Documentation complete and accurate
- [ ] Deployment checklists ready

### Phase 4: Deployment & Verification
- [ ] Backend deployed successfully to Railway
- [ ] Frontend deployed successfully to Vercel
- [ ] Production health checks pass
- [ ] End-to-end user flow works in production
- [ ] No errors in logs for 24+ hours
- [ ] Performance metrics acceptable (< 2s for chart generation)

---

## 🚀 Quick Start Commands

```bash
# Phase 1: Get everything running
cd /home/darae/chart-generator
git status

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with needed values
uvicorn src.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run build
npm run dev
```

---

## 📞 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'src'` | Use `uvicorn src.main:app` instead of direct Python |
| CORS errors | Check `FRONTEND_URL` matches exactly in Railway |
| Build fails | Check `.env` file has all required variables |
| Tests fail | Verify all dependencies installed |
| Slow chart generation | Check Swiss Ephemeris installed correctly |
| 403 on Vercel | Verify root directory set to `frontend` |

---

**Ready to begin Phase 1? Start with Workstreams A, B, and C in parallel!**
