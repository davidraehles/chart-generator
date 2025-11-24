# Deployment Guide - Human Design Chart Generator

## ✅ Current Status: Ready for Deployment

Both frontend and backend are correctly structured and committed to git.

## 📁 Repository Structure (Verified)

```
chart-generator/
│
├── backend/                    ← ✅ Correctly at root level
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py            ← FastAPI application
│   │   ├── models/
│   │   │   ├── chart.py
│   │   │   └── email.py
│   │   └── services/
│   │       ├── hd_api_client.py
│   │       ├── normalization_service.py
│   │       └── validation_service.py
│   ├── requirements.txt        ← Python dependencies
│   ├── railway.json            ← Railway deployment config
│   ├── Procfile                ← Railway start command
│   ├── runtime.txt             ← Python version
│   ├── .env.example            ← Environment template
│   ├── .gitignore
│   └── README.md
│
└── frontend/                   ← ✅ Correctly at root level
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ChartForm.tsx
    │   ├── ChartDisplay.tsx
    │   ├── Bodygraph.tsx
    │   ├── EmailCaptureSection.tsx
    │   └── sections/
    ├── services/
    │   └── api.ts
    ├── types/
    │   └── chart.ts
    ├── utils/
    │   └── constants.ts
    ├── styles/
    │   └── globals.css
    ├── package.json            ← Node dependencies
    ├── vercel.json             ← Vercel deployment config
    ├── next.config.js          ← Next.js configuration
    ├── tailwind.config.ts      ← Tailwind CSS config
    ├── tsconfig.json           ← TypeScript config
    └── .env.local              ← Environment variables
```

## 🚀 Step-by-Step Deployment

### 1. Deploy Backend to Railway

**Option A: Via Railway Dashboard (Recommended)**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository: `davidraehles/chart-generator`
4. Railway will auto-detect the backend configuration
5. Set **Root Directory**: Leave empty (Railway will find backend folder)
6. Set environment variables in Railway dashboard:
   ```
   FRONTEND_URL=https://your-app.vercel.app (add after deploying frontend)
   HD_API_KEY=placeholder (uses mock data for now)
   HD_API_URL=https://api.humandesign.ai/v1
   DEBUG=false
   ```
7. Railway will deploy and provide a URL like: `https://chart-generator-production.up.railway.app`

**Option B: Via Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd /path/to/chart-generator
railway init

# Deploy
railway up
```

### 2. Deploy Frontend to Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `davidraehles/chart-generator`
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT: Must set this!**
   - **Build Command**: Leave default (auto-detected)
   - **Output Directory**: Leave default (auto-detected)
5. Click "Deploy" (deployment may fail initially - that's ok)
6. After project is created, go to **Settings** → **Environment Variables**
7. Add environment variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend.railway.app` (from step 1, Railway URL)
   - **Environments**: Check all (Production, Preview, Development)
8. Go to **Deployments** tab → Click "Redeploy" on the latest deployment
9. Vercel will provide a URL like: `https://chart-generator.vercel.app`

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

### 3. Update CORS Configuration

After both are deployed:
1. Go back to Railway dashboard
2. Update `FRONTEND_URL` environment variable with your actual Vercel URL
3. Railway will automatically redeploy

### 4. Verify Deployment

**Backend Health Check:**
```bash
curl https://your-backend.railway.app/health
# Expected: {"status":"healthy","service":"hd-chart-generator"}
```

**Frontend:**
- Visit: https://your-app.vercel.app
- Fill out the form with test data
- Verify chart generation works

## 🔧 Environment Variables Reference

### Backend (Railway)
| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `PORT` | Auto-set by Railway | Yes | Don't set manually |
| `FRONTEND_URL` | Your Vercel URL | Yes | For CORS |
| `HD_API_KEY` | placeholder | No | Uses mock data |
| `HD_API_URL` | https://api.humandesign.ai/v1 | No | For future |
| `DEBUG` | false | Yes | Set to false in production |
| `DATABASE_URL` | (optional) | No | For future email storage |

### Frontend (Vercel)
| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL | Yes | Must include https:// |

## ✅ What's Deployed

### Frontend Features
- ✅ Birth data form with validation
- ✅ German language interface
- ✅ Chart display with 9 sections
- ✅ Visual Bodygraph SVG
- ✅ Email capture form
- ✅ Mobile-responsive design
- ✅ Error handling with retry

### Backend Features
- ✅ FastAPI REST API
- ✅ Chart generation endpoint
- ✅ Email capture endpoint
- ✅ Input validation (German errors)
- ✅ Mock HD calculation
- ✅ CORS configured
- ✅ Health check endpoint

## 📝 Testing Production

1. **Test Form Validation:**
   - Try invalid date: `32.13.2024` → Should show error
   - Try future date → Should show error
   - Try invalid time: `25:00` → Should show error

2. **Test Chart Generation:**
   - Valid data: `23.11.1992, 14:30, Berlin, Germany`
   - Should display complete chart within 3 seconds

3. **Test Email Capture:**
   - Enter valid email → Should show success message
   - Enter invalid email → Should show error

## 🔄 Future Updates

When you push to the `main` branch:
- Vercel auto-deploys frontend
- Railway auto-deploys backend

No manual deployment needed!

## ⚠️ Common Issues

**Issue: 403 Forbidden Error on Vercel**
- **Cause**: Root directory not set correctly or build failed
- **Fix**:
  1. Go to Vercel project Settings → General
  2. Verify "Root Directory" is set to `frontend`
  3. Click "Save"
  4. Redeploy from Deployments tab

**Issue: Vercel deployment fails with "Cannot find module"**
- **Cause**: Missing dependencies or incorrect build directory
- **Fix**:
  1. Check that `frontend/package.json` exists in repository
  2. Verify Root Directory is set to `frontend` in Vercel settings
  3. Redeploy

**Issue: Frontend can't connect to backend**
- **Cause**: Missing or incorrect API URL environment variable
- **Fix**:
  1. Go to Vercel Settings → Environment Variables
  2. Verify `NEXT_PUBLIC_API_URL` is set with your Railway URL
  3. Must include `https://` (e.g., `https://chart-generator-production.up.railway.app`)
  4. Redeploy after setting environment variable

**Issue: CORS errors in browser console**
- **Cause**: Backend FRONTEND_URL doesn't match Vercel URL
- **Fix**:
  1. Go to Railway project → Variables
  2. Update `FRONTEND_URL` to exact Vercel URL (including `https://`)
  3. Railway will auto-redeploy

**Issue: Backend not starting on Railway**
- **Fix**: Check Railway logs for errors
  1. Click on Railway deployment
  2. View logs tab
  3. Look for Python errors or missing dependencies

**Issue: "Application error" on Vercel**
- **Fix**: Check Vercel deployment logs
  1. Go to Deployments tab
  2. Click on failed deployment
  3. View Function Logs for errors

## 📞 Support

For deployment issues:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- GitHub Issues: https://github.com/davidraehles/chart-generator/issues

---

**Last Updated:** 2025-11-24
**Repository:** https://github.com/davidraehles/chart-generator
**Branch:** claude/continue-ui-backend-01WhPwkbT8qLYfVirWA1Ppj4
