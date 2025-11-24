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
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app (from step 1)
   ```
6. Click "Deploy"
7. Vercel will provide a URL like: `https://chart-generator.vercel.app`

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

**Issue: Frontend can't connect to backend**
- Check `NEXT_PUBLIC_API_URL` in Vercel includes `https://`
- Verify Railway backend is running (check health endpoint)

**Issue: CORS errors**
- Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check Railway logs: `railway logs`

**Issue: Backend not starting**
- Check Railway logs for errors
- Verify `requirements.txt` has all dependencies

## 📞 Support

For deployment issues:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- GitHub Issues: https://github.com/davidraehles/chart-generator/issues

---

**Last Updated:** 2025-11-24
**Repository:** https://github.com/davidraehles/chart-generator
**Branch:** claude/continue-ui-backend-01WhPwkbT8qLYfVirWA1Ppj4
