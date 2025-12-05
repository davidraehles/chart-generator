# Execution Quick Reference - HD Chart Generator Production Readiness

**Quick Navigation**: Jump to section → Copy → Paste → Execute

---

## 🎯 Phase 1: Foundation Setup (2 hours)

### ⚡ Parallel Setup - Run in 3 separate terminals

#### Terminal 1: Backend Stabilization
```bash
# Navigate to backend
cd /home/darae/chart-generator/backend

# 1. Setup virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment file
cp .env.example .env

# 4. Verify installation
pip list | grep -E "fastapi|pyswisseph|pydantic|uvicorn"

# Expected output:
# fastapi             0.101.0
# pydantic            1.10.14
# pyswisseph          2.10.3.2
# uvicorn             0.24.0
```

#### Terminal 2: Frontend Stabilization
```bash
# Navigate to frontend
cd /home/darae/chart-generator/frontend

# 1. Install dependencies (if not already done)
npm install

# 2. Update baseline-browser-mapping
npm update baseline-browser-mapping@latest -D

# 3. Run production build
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Generating static pages
# ○ (Static) prerendered as static content

# 4. Verify build
ls -la .next/
```

#### Terminal 3: Test Suites
```bash
# In backend directory
cd /home/darae/chart-generator/backend
source venv/bin/activate

# Run backend tests (if tests exist)
python -m pytest tests/ -v

# In frontend directory (new shell)
cd /home/darae/chart-generator/frontend

# Run E2E tests
npm run e2e

# Expected: 12/12 tests passing
```

---

## 🔗 Phase 2: Local Integration (1 hour)

### Step 1: Start Backend
```bash
# Terminal 1 (from backend directory)
cd /home/darae/chart-generator/backend
source venv/bin/activate

# Start with uvicorn (CORRECT WAY)
uvicorn src.main:app --reload --host 0.0.0.0 --port 5000

# Expected output:
# INFO: Uvicorn running on http://0.0.0.0:5000
# INFO: Application startup complete

# Verify in browser:
# http://localhost:5000/health
# http://localhost:5000/docs
```

### Step 2: Start Frontend
```bash
# Terminal 2 (new terminal)
cd /home/darae/chart-generator/frontend

# Verify .env.local is set to local backend
echo $NEXT_PUBLIC_API_URL
# Should output: http://localhost:5000 (or empty, will use default)

# Start development server
npm run dev

# Expected output:
# ▲ Next.js 16.0.4
# - Local: http://localhost:3000
# - Environments: .env.local
```

### Step 3: Test Integration
```bash
# Terminal 3 (for testing/curl commands)
cd /home/darae/chart-generator

# Test 1: Backend health
curl http://localhost:5000/health
# Expected: {"status":"healthy","service":"hd-chart-generator"}

# Test 2: Chart generation
curl -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1992-11-23",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "birthCountry": "Germany"
  }'

# Expected: Full chart response with type, authority, profile, etc.

# Test 3: Frontend UI
# Open http://localhost:3000 in browser
# Fill form with: 1992-11-23, 14:30, Berlin, Germany
# Click "Chart erstellen"
# Should see chart within 2 seconds
# Try submitting email
```

---

## 🏗️ Phase 3: Production Configuration (1 hour)

### Railway Backend Setup

#### Option A: Via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to project
cd /home/darae/chart-generator

# Initialize Railway project
railway init

# Follow prompts:
# 1. Select "Backend" service
# 2. Configure Python runtime

# Deploy
railway up
```

#### Option B: Manual Railway Dashboard
```
1. Visit https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select: davidraehles/chart-generator
5. Let Railway auto-detect backend folder
6. Go to Variables tab, add:
   - FRONTEND_URL=https://[placeholder].vercel.app
   - HD_API_KEY=placeholder
   - HD_API_URL=https://api.humandesign.ai/v1
   - DEBUG=false
7. Deploy
8. Note the URL: https://[backend].railway.app
```

### Vercel Frontend Setup

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd /home/darae/chart-generator/frontend

# Deploy
vercel --prod

# During setup:
# - Project name: chart-generator
# - Framework: Next.js (auto-detect)
# - Root directory: frontend (IMPORTANT!)
# - Build command: default
# - Output directory: default
```

#### Option B: Manual Vercel Dashboard
```
1. Visit https://vercel.com
2. Click "Add New" → "Project"
3. Import GitHub repo: davidraehles/chart-generator
4. Configure:
   - Framework: Next.js (auto)
   - Root Directory: frontend (IMPORTANT!)
5. Go to Settings → Environment Variables
6. Add: NEXT_PUBLIC_API_URL = [Railway URL]
   (e.g., https://chart-generator-prod.railway.app)
7. Redeploy from Deployments tab
8. Note the URL: https://[frontend].vercel.app
```

### Update Backend CORS
```bash
# After frontend is deployed, update backend:
# 1. Go to Railway project settings
# 2. Update FRONTEND_URL to exact Vercel URL
#    (e.g., https://chart-generator.vercel.app)
# 3. Railway auto-redeploys
```

---

## ✅ Phase 4: Production Verification (1.5 hours)

### Endpoint Verification
```bash
# Test backend health
curl https://[backend-railway-url]/health
# Expected: {"status":"healthy","service":"hd-chart-generator"}

# Test chart generation
curl -X POST https://[backend-railway-url]/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1992-11-23",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "birthCountry": "Germany"
  }'

# Test email capture
curl -X POST https://[backend-railway-url]/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "interests": ["reading"]
  }'
```

### Frontend Verification
```
1. Visit https://[frontend-vercel-url] in browser
2. Verify page loads (check browser console for errors)
3. Fill form: 1992-11-23, 14:30, Berlin, Germany
4. Click "Chart erstellen"
5. Verify chart appears within 3 seconds
6. Try email capture with valid email
7. Verify success message appears
```

### Log Verification
```bash
# Railway logs
# 1. Visit https://railway.app
# 2. Select project → Logs tab
# 3. Look for any ERROR or CRITICAL messages
# 4. Should see chart generation requests

# Vercel logs
# 1. Visit https://vercel.com
# 2. Select project → Deployments
# 3. Click latest deployment → Function Logs
# 4. Look for any errors
# 5. Should see GET / requests
```

---

## 🐛 Troubleshooting Commands

### Backend Module Error
```bash
# ❌ Wrong:
python3 src/main.py
# Error: ModuleNotFoundError: No module named 'src'

# ✅ Correct:
uvicorn src.main:app --reload

# Or with full path:
cd /home/darae/chart-generator/backend
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 5000
```

### CORS Errors
```bash
# Check FRONTEND_URL is set correctly
curl -H "Origin: https://your-vercel-url" \
  -v https://[backend-url]/api/hd-chart 2>&1 | grep -i "access-control"

# If error, update Railway env var:
# FRONTEND_URL must exactly match your Vercel URL (with https://)
```

### Frontend Build Fails
```bash
# Check .env.local
cat /home/darae/chart-generator/frontend/.env.local

# Ensure NEXT_PUBLIC_API_URL is set correctly
echo "NEXT_PUBLIC_API_URL=https://your-backend.railway.app" >> .env.local

# Rebuild
npm run build
```

### Chart Generation Timeout
```bash
# Check backend is running and healthy
curl http://localhost:5000/health

# Check logs for slow queries
# Backend logs should show calculation time

# Common cause: Swiss Ephemeris not installed
pip list | grep pyswisseph
# If missing: pip install pyswisseph==2.10.3.2
```

### Email Capture Not Working
```bash
# Test backend endpoint directly
curl -X POST http://localhost:5000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check logs for database connection errors
# Verify email-validator is installed:
pip list | grep email-validator
```

---

## 📊 Environment Variables Quick Reference

### Backend (.env)
```
# Railway automatically sets these:
# PORT=[auto-set]
# RAILWAY_ENVIRONMENT_NAME=production

# You should set these:
FRONTEND_URL=https://[your-vercel-app].vercel.app
DEBUG=false
HD_API_KEY=placeholder
HD_API_URL=https://api.humandesign.ai/v1

# Optional:
# DATABASE_URL=postgresql://...
# LOG_LEVEL=info
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
# For production (Vercel), set via Vercel dashboard to:
# NEXT_PUBLIC_API_URL=https://[your-railway-backend].railway.app
```

---

## 🎯 Success Checklist

### Phase 1 Complete When:
- [ ] Backend installs without errors
- [ ] Frontend installs without errors
- [ ] Both build successfully
- [ ] Tests pass (or skip if no tests)
- [ ] Environment files created

### Phase 2 Complete When:
- [ ] Backend starts with uvicorn (no errors)
- [ ] Frontend starts with npm run dev (no errors)
- [ ] Both localhost URLs accessible
- [ ] Chart generation works locally (< 2 seconds)
- [ ] Email capture works locally
- [ ] No console errors in browser

### Phase 3 Complete When:
- [ ] Railway project created and configured
- [ ] Vercel project created and configured
- [ ] All env vars set in both platforms
- [ ] Preview deployment successful (if applicable)
- [ ] Documentation complete

### Phase 4 Complete When:
- [ ] Backend health endpoint responds
- [ ] Chart generation works in production
- [ ] Email capture works in production
- [ ] No errors in logs for 24+ hours
- [ ] Performance metrics acceptable
- [ ] Monitoring configured

---

## 📱 Performance Benchmarks

| Metric | Expected | ✅ Good | ⚠️ Warning | ❌ Critical |
|--------|----------|--------|-----------|-----------|
| Chart Generation | < 2s | < 2.5s | 2.5-5s | > 5s |
| Page Load | < 3s | < 3s | 3-5s | > 5s |
| Email Submit | < 1s | < 1s | 1-2s | > 2s |
| API Response | < 500ms | < 500ms | 500ms-1s | > 1s |
| Build Time | < 30s | < 30s | 30-60s | > 60s |

### Test Performance
```bash
# Measure chart generation
time curl -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1992-11-23","birthTime":"14:30","birthPlace":"Berlin","birthCountry":"Germany"}'

# Should complete in < 2 seconds

# Measure frontend build
cd /home/darae/chart-generator/frontend
time npm run build
# Should complete in < 30 seconds
```

---

## 🔗 Useful Links

- **FastAPI Docs**: http://localhost:5000/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Railway**: https://railway.app/dashboard
- **Vercel**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/davidraehles/chart-generator
- **PySwissEph**: https://pypi.org/project/pyswisseph/

---

## ⏱️ Time Estimate Summary

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Foundation Setup (3 parallel streams) | 2 hours |
| 2 | Local Integration + Testing | 1 hour |
| 3 | Deployment Configuration | 1 hour |
| 4 | Deployment + Verification | 1.5 hours |
| | **TOTAL** | **5.5 hours** |

**Recommended Schedule**:
- Day 1: Phases 1-2 (3 hours)
- Day 2: Phase 3 (1 hour) + Phase 4 (1.5 hours)
- Days 3+: Monitoring + Hotfixes

---

## 🎉 Ready to Start?

```bash
# Execute this to begin Phase 1
cd /home/darae/chart-generator
git status  # Verify clean state
# Then follow Phase 1 instructions above in 3 terminals
```

**Good luck! 🚀**
