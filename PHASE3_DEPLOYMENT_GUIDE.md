# Phase 3: Deployment Guide

**Phase**: Phase 3 - Production Deployment
**Target Platforms**: Railway (Backend) + Vercel (Frontend)
**Prerequisites**: Phase 2 completed successfully
**Estimated Time**: 45-60 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Railway Backend Deployment](#railway-backend-deployment)
3. [Vercel Frontend Deployment](#vercel-frontend-deployment)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Verification Procedures](#verification-procedures)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Phase 2 Completion Checklist

Verify Phase 2 results before proceeding:

- [x] Backend health check passed
- [x] Chart generation working (< 2s)
- [x] Email capture functional
- [x] Production build successful
- [x] Performance targets met
- [x] Documentation reviewed
- [ ] Manual browser tests completed (recommended)

### Required Accounts

1. **Railway Account**
   - Sign up at: https://railway.app
   - Connect GitHub account
   - Add payment method (free tier available)

2. **Vercel Account**
   - Sign up at: https://vercel.com
   - Connect GitHub account
   - Free tier sufficient for initial deployment

### Required Information

Prepare the following information before deployment:

**Backend (Railway)**:
- GitHub repository URL
- Branch name (e.g., `001-hd-chart-generator` or `main`)
- Environment variables (see section below)

**Frontend (Vercel)**:
- GitHub repository URL
- Branch name
- Production API URL (obtained after Railway deployment)

---

## Railway Backend Deployment

### Step 1: Create Railway Project

1. **Login to Railway**
   - Go to https://railway.app
   - Click "Login" and authenticate with GitHub

2. **Create New Project**
   - Click "+ New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repositories
   - Select: `davidraehles/chart-generator`

3. **Configure Deployment**
   - Service name: `hd-chart-backend`
   - Branch: `001-hd-chart-generator` (or your current branch)
   - Root directory: `/backend`

### Step 2: Configure Build Settings

Railway should auto-detect Python, but verify:

**Build Configuration**:
```
Build Command: pip install -r requirements.txt
Start Command: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**Deployment Settings**:
- Runtime: Python 3.12
- Region: Choose nearest to your users (e.g., `eu-west-1` for Europe)
- Port: Railway will auto-assign (use `$PORT` variable)

### Step 3: Set Environment Variables

In Railway dashboard, go to **Variables** tab and add:

**Required Variables**:

```env
# Application
ENVIRONMENT=production

# Frontend URL (temporary - update after Vercel deployment)
FRONTEND_URL=https://localhost:3000

# Database (SQLite for MVP, or upgrade to PostgreSQL)
DATABASE_URL=sqlite:///./hd_chart.db

# API Configuration
API_TITLE=HD Chart Generator API
API_VERSION=1.0.0

# Swiss Ephemeris (if needed)
# Add any specific ephemeris configuration
```

**Optional Variables** (recommended for production):
```env
# Logging
LOG_LEVEL=INFO

# CORS (will update after Vercel deployment)
CORS_ORIGINS=https://localhost:3000

# Rate Limiting (if implemented)
RATE_LIMIT_PER_MINUTE=60

# Email (if using external service)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
```

### Step 4: Deploy Backend

1. **Trigger Deployment**
   - Click "Deploy" button
   - Railway will build and deploy automatically
   - Monitor build logs for errors

2. **Wait for Deployment**
   - Build time: ~2-3 minutes
   - Status will change to "Active" when ready

3. **Get Production URL**
   - Railway will assign a URL like: `https://hd-chart-backend-production.up.railway.app`
   - **SAVE THIS URL** - you'll need it for frontend deployment

### Step 5: Verify Backend Deployment

Test the deployed backend:

```bash
# Replace with your Railway URL
BACKEND_URL="https://hd-chart-backend-production.up.railway.app"

# Test health endpoint
curl $BACKEND_URL/health

# Expected response:
# {"status":"healthy","service":"hd-chart-generator"}

# Test API docs
curl $BACKEND_URL/docs
# Should return Swagger UI HTML
```

**Health Check URL**: `https://YOUR-RAILWAY-URL.up.railway.app/health`
**API Docs URL**: `https://YOUR-RAILWAY-URL.up.railway.app/docs`

### Step 6: Backend Deployment Checklist

- [ ] Railway project created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint responding
- [ ] API docs accessible
- [ ] Production URL saved

---

## Vercel Frontend Deployment

### Step 1: Create Vercel Project

1. **Login to Vercel**
   - Go to https://vercel.com
   - Click "Login" and authenticate with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select: `davidraehles/chart-generator`
   - Click "Import"

3. **Configure Project**
   - Project name: `hd-chart-generator`
   - Framework: Next.js (auto-detected)
   - Root Directory: `frontend`
   - Branch: `001-hd-chart-generator` (or your current branch)

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js settings:

**Build Configuration**:
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**Node.js Version**: 18.x or later (auto-detected)

### Step 3: Set Environment Variables

In Vercel project settings, go to **Environment Variables** and add:

**Production Environment Variables**:

```env
# Backend API URL (use your Railway URL from Step 5)
NEXT_PUBLIC_API_URL=https://hd-chart-backend-production.up.railway.app
```

**Important Notes**:
- Use `NEXT_PUBLIC_` prefix for client-side accessible variables
- Replace the URL with your actual Railway backend URL
- Do NOT include trailing slash

### Step 4: Deploy Frontend

1. **Trigger Deployment**
   - Click "Deploy" button
   - Vercel will build and deploy automatically
   - Build time: ~1-2 minutes

2. **Monitor Build**
   - Check build logs for errors
   - Verify no TypeScript errors
   - Confirm successful deployment

3. **Get Production URL**
   - Vercel will assign: `https://hd-chart-generator.vercel.app`
   - Or custom domain if configured
   - **SAVE THIS URL** - needed for CORS update

### Step 5: Verify Frontend Deployment

Test the deployed frontend:

1. **Visit Production URL**
   - Open: `https://hd-chart-generator.vercel.app`
   - Verify page loads without errors

2. **Test Form Rendering**
   - Check all form fields display
   - Verify styling is correct
   - Confirm responsive design works

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for any errors
   - Verify no CORS errors yet (will fix in next section)

### Step 6: Frontend Deployment Checklist

- [ ] Vercel project created
- [ ] Build settings configured
- [ ] Environment variables set (API URL)
- [ ] Deployment successful
- [ ] Production URL obtained
- [ ] Page loads correctly
- [ ] No critical errors in console

---

## Post-Deployment Configuration

### Step 1: Update CORS Configuration

**CRITICAL**: Update backend CORS to allow frontend origin

1. **Go to Railway Dashboard**
   - Select your backend project
   - Go to "Variables" tab

2. **Update FRONTEND_URL**
   ```env
   FRONTEND_URL=https://hd-chart-generator.vercel.app
   ```

3. **Update CORS_ORIGINS** (if set)
   ```env
   CORS_ORIGINS=https://hd-chart-generator.vercel.app
   ```

4. **Redeploy Backend**
   - Railway will automatically redeploy with new variables
   - Wait ~1-2 minutes for redeployment

### Step 2: Verify Cross-Origin Communication

Test that frontend can communicate with backend:

1. **Open Frontend in Browser**
   - Navigate to: `https://hd-chart-generator.vercel.app`
   - Open DevTools Console (F12)

2. **Test Chart Generation**
   - Fill out the form with valid data:
     - Name: "Test User"
     - Birth Date: "23.11.1992"
     - Birth Time: "14:30"
     - Birth Place: "Berlin"
     - Country: "Germany"
   - Submit the form

3. **Verify Response**
   - Chart should generate within 2-3 seconds
   - Check Network tab - all requests should return 200
   - Console should have no CORS errors
   - Chart data should display

4. **Test Error Scenarios**
   - Try invalid date (e.g., "32.13.2024")
   - Verify error message displays
   - Confirm graceful error handling

### Step 3: Test Email Capture

1. **Generate a Chart**
   - Use valid birth data
   - Wait for chart to display

2. **Capture Email**
   - Enter test email: `test@example.com`
   - Submit email capture form
   - Verify success message

3. **Test Duplicate Detection**
   - Try same email again
   - Should show error about duplicate
   - Verify proper error handling

### Step 4: Post-Configuration Checklist

- [ ] CORS updated in Railway
- [ ] Backend redeployed with new CORS
- [ ] Frontend can communicate with backend
- [ ] No CORS errors in console
- [ ] Chart generation works end-to-end
- [ ] Email capture works
- [ ] Error scenarios handled gracefully

---

## Verification Procedures

### Complete End-to-End Test

Run through full user flow:

1. **Load Application**
   ```
   URL: https://hd-chart-generator.vercel.app
   Expected: Page loads in < 3 seconds
   Check: No console errors
   ```

2. **Fill Form**
   ```
   Data: Valid birth information
   Expected: All fields accept input
   Check: Form validation works
   ```

3. **Generate Chart**
   ```
   Action: Submit form
   Expected: Chart displays within 3 seconds
   Check: All sections present (type, authority, profile)
   Note: Bodygraph may be incomplete (known issue)
   ```

4. **Capture Email**
   ```
   Action: Enter email and submit
   Expected: Success message displays
   Check: Email saved to database
   ```

5. **Test Error Handling**
   ```
   Action: Submit invalid data
   Expected: Error message displays
   Check: No application crash
   ```

### Performance Verification

Measure production performance:

```bash
# Test backend response time
time curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "birthDate": "23.11.1992",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "country": "Germany",
    "birthTimeApproximate": false
  }'

# Target: < 3 seconds (includes network latency)
```

### Security Verification

Check security configurations:

1. **HTTPS Enabled**
   - Both Railway and Vercel use HTTPS by default
   - Verify padlock icon in browser
   - Check certificate validity

2. **CORS Properly Configured**
   - Only your frontend domain allowed
   - No wildcard (*) in production
   - OPTIONS requests working

3. **No Exposed Secrets**
   - No API keys in frontend code
   - No database credentials in logs
   - Environment variables properly set

### Monitoring Setup

1. **Railway Monitoring**
   - Go to Railway dashboard
   - Check "Metrics" tab
   - Monitor CPU, Memory, Network usage
   - Set up alerts if available

2. **Vercel Analytics**
   - Enable Vercel Analytics (if desired)
   - Monitor page load times
   - Track user interactions
   - Set up error reporting

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Backend Build Fails

**Symptoms**:
- Railway deployment fails
- Build errors in logs
- Missing dependencies

**Solutions**:
```bash
# Verify requirements.txt is up to date
pip freeze > requirements.txt

# Check for missing system dependencies
# Add to Railway if needed via Nixpacks

# Ensure Python version matches
# Railway uses Python 3.12 by default
```

#### Issue 2: Frontend Build Fails

**Symptoms**:
- Vercel deployment fails
- TypeScript errors
- Missing environment variables

**Solutions**:
```bash
# Test build locally first
cd frontend
npm run build

# Fix TypeScript errors
npm run type-check

# Verify environment variables set in Vercel
# NEXT_PUBLIC_API_URL must be set
```

#### Issue 3: CORS Errors

**Symptoms**:
- Network requests blocked
- Console errors: "CORS policy blocked"
- API calls fail from frontend

**Solutions**:
1. Verify FRONTEND_URL in Railway exactly matches Vercel URL
2. No trailing slash in URLs
3. Redeploy backend after changing CORS settings
4. Clear browser cache and test in incognito mode

```python
# Backend CORS configuration should include:
FRONTEND_URL=https://hd-chart-generator.vercel.app

# In main.py verify:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Issue 4: Chart Generation Fails in Production

**Symptoms**:
- Works locally but not in production
- 500 errors from backend
- Timeout errors

**Solutions**:
1. Check Railway logs for detailed errors
2. Verify Swiss Ephemeris data files are included
3. Check database connection
4. Verify all environment variables set

```bash
# Check Railway logs
railway logs

# Test API directly
curl -X POST https://YOUR-URL/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test",...}'
```

#### Issue 5: Database Issues

**Symptoms**:
- Email capture fails
- Database connection errors
- Data not persisting

**Solutions**:
1. **For SQLite**: Ensure persistent volume configured in Railway
2. **Consider PostgreSQL**: Railway offers managed PostgreSQL
3. Run database migrations in Railway

```bash
# Upgrade to PostgreSQL (recommended for production)
# In Railway:
# 1. Add PostgreSQL service
# 2. Update DATABASE_URL variable
# 3. Run migrations
```

#### Issue 6: Slow Performance

**Symptoms**:
- Chart generation > 5 seconds
- High response times
- Timeout errors

**Solutions**:
1. Check Railway metrics (CPU, Memory)
2. Upgrade Railway plan if needed
3. Optimize chart generation code
4. Add caching layer

```bash
# Monitor Railway performance
# Dashboard → Metrics

# Consider Redis for caching
# Add Redis service in Railway
```

### Getting Help

1. **Railway Docs**: https://docs.railway.app
2. **Vercel Docs**: https://vercel.com/docs
3. **Application Logs**:
   - Railway: Dashboard → Deployments → Logs
   - Vercel: Dashboard → Deployments → Function Logs

4. **Support Channels**:
   - Railway Discord: https://discord.gg/railway
   - Vercel Community: https://github.com/vercel/vercel/discussions

---

## Deployment Success Checklist

### Pre-Deployment
- [x] Phase 2 tests passed
- [x] Documentation reviewed
- [ ] Accounts created (Railway + Vercel)
- [ ] GitHub repository accessible

### Railway Backend
- [ ] Project created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint responding
- [ ] Production URL saved

### Vercel Frontend
- [ ] Project created
- [ ] Build settings configured
- [ ] API URL environment variable set
- [ ] Deployment successful
- [ ] Page loads correctly
- [ ] Production URL saved

### Post-Deployment
- [ ] CORS updated and redeployed
- [ ] Frontend-backend communication working
- [ ] Chart generation tested
- [ ] Email capture tested
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Security verified

### Final Verification
- [ ] Complete end-to-end user flow
- [ ] No console errors
- [ ] All features functional
- [ ] Performance metrics met
- [ ] Documentation updated with URLs
- [ ] Team notified of deployment

---

## Next Steps After Deployment

### Immediate (First 24 Hours)

1. **Monitor Closely**
   - Check Railway metrics every 2 hours
   - Monitor Vercel function logs
   - Watch for any errors

2. **Test Thoroughly**
   - Multiple test chart generations
   - Various birth data scenarios
   - Different browsers and devices

3. **Gather Feedback**
   - Internal team testing
   - Document any issues
   - Prioritize fixes

### Short-Term (First Week)

1. **Performance Optimization**
   - Analyze response times
   - Identify bottlenecks
   - Implement caching if needed

2. **Issue Resolution**
   - Fix bodygraph data issue
   - Address any bugs found
   - Improve error messages

3. **Monitoring Setup**
   - Configure alerts
   - Set up error tracking (e.g., Sentry)
   - Implement analytics

### Long-Term (After Launch)

1. **Database Migration**
   - Migrate from SQLite to PostgreSQL
   - Set up automated backups
   - Implement data retention policies

2. **Feature Enhancements**
   - Complete bodygraph visualization
   - Add more HD insights
   - Improve UI/UX

3. **Scale Preparation**
   - Load testing
   - CDN for assets
   - Database optimization

---

## Production URLs Reference

After deployment, update this section with actual URLs:

```
Frontend Production: https://hd-chart-generator.vercel.app
Backend Production: https://hd-chart-backend-production.up.railway.app
Backend Health: https://hd-chart-backend-production.up.railway.app/health
Backend API Docs: https://hd-chart-backend-production.up.railway.app/docs
```

**Save these URLs** for monitoring and troubleshooting.

---

## Rollback Procedures

If deployment fails or critical issues found:

### Railway Backend Rollback

1. Go to Railway Dashboard
2. Select deployment
3. Click "Deployments" tab
4. Find previous working deployment
5. Click "Redeploy"

### Vercel Frontend Rollback

1. Go to Vercel Dashboard
2. Select project
3. Click "Deployments"
4. Find previous working deployment
5. Click "···" → "Promote to Production"

### Emergency Procedures

If both platforms have issues:
1. Revert to development URLs temporarily
2. Update frontend to use local backend
3. Notify users of maintenance
4. Fix issues in staging
5. Redeploy when ready

---

## Conclusion

This guide provides step-by-step instructions for deploying the HD Chart Generator to production using Railway and Vercel. Follow each step carefully, verify each checkpoint, and refer to troubleshooting section for common issues.

**Estimated Total Time**: 45-60 minutes
**Difficulty**: Intermediate
**Prerequisites**: Phase 2 completed

**Upon successful completion**:
- Backend deployed to Railway
- Frontend deployed to Vercel
- Both services communicating
- Full production functionality
- Ready for user testing

---

**Guide Version**: 1.0
**Last Updated**: 2025-12-05
**Phase**: 3 - Production Deployment
**Status**: Ready for Execution

---

END OF DEPLOYMENT GUIDE
