# Deployment Checklist

This document provides a comprehensive checklist for deploying the HD Chart Generator application to production.

## Table of Contents
1. [Pre-Deployment Verification](#pre-deployment-verification)
2. [Railway Backend Deployment](#railway-backend-deployment)
3. [Vercel Frontend Deployment](#vercel-frontend-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Verification

### Backend Pre-Checks
- [ ] All unit tests pass (`pytest`)
- [ ] Backend health endpoint responds correctly
- [ ] All required environment variables are set
- [ ] Database migrations are up to date
- [ ] No hardcoded secrets in code
- [ ] Dependencies are locked (`requirements.txt` updated)
- [ ] CORS configuration includes production frontend URL
- [ ] Swiss Ephemeris data files are included
- [ ] Logging is configured for production
- [ ] Error handling covers all edge cases

### Frontend Pre-Checks
- [ ] Production build completes without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Bundle size is acceptable (< 500KB for main chunk)
- [ ] Environment variables configured for production
- [ ] API endpoints point to production backend
- [ ] No console.log statements in production code
- [ ] All images optimized
- [ ] Meta tags and SEO configured
- [ ] Analytics configured (if applicable)

### Integration Pre-Checks
- [ ] End-to-end user flow tested locally
- [ ] Chart generation tested with multiple scenarios
- [ ] Email capture tested and verified
- [ ] Error scenarios handled gracefully
- [ ] Performance metrics meet targets (< 2s chart generation)
- [ ] No CORS errors in local testing
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)

---

## Railway Backend Deployment

### Step 1: Prepare Railway Project
```bash
# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to existing project or create new
railway link
```

### Step 2: Configure Environment Variables
Set the following environment variables in Railway dashboard:

**Required Variables:**
```
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend-domain.vercel.app
DATABASE_URL=<railway-provided-postgres-url>
DEBUG=false
```

**Optional Variables:**
```
HD_API_URL=https://api.humandesign.ai/v1
HD_API_KEY=<your-api-key-if-using>
```

### Step 3: Configure Build Settings
In Railway dashboard:
- **Root Directory**: `/backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- **Python Version**: 3.12

### Step 4: Deploy Backend
```bash
# From project root
cd backend

# Deploy to Railway
railway up

# Monitor deployment
railway logs
```

### Step 5: Verify Backend Deployment
```bash
# Test health endpoint
curl https://your-backend-domain.railway.app/health

# Expected response:
# {"status":"healthy","service":"hd-chart-generator"}
```

### Step 6: Database Migration (if using PostgreSQL)
```bash
# Connect to Railway database
railway run alembic upgrade head
```

---

## Vercel Frontend Deployment

### Step 1: Prepare Vercel Project
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link to existing project or create new
cd frontend
vercel link
```

### Step 2: Configure Environment Variables
Set in Vercel dashboard under Project Settings > Environment Variables:

**Production Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NODE_ENV=production
```

### Step 3: Configure Build Settings
In Vercel dashboard:
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x

### Step 4: Deploy Frontend
```bash
# From frontend directory
cd frontend

# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy enabled)
git push origin main
```

### Step 5: Configure Custom Domain (Optional)
In Vercel dashboard:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

### Step 6: Update Backend CORS
After frontend is deployed, update backend environment variable:
```
FRONTEND_URL=https://your-actual-frontend-domain.vercel.app
```

Redeploy backend to apply CORS changes.

---

## Post-Deployment Verification

### Backend Verification
- [ ] Health endpoint responds: `GET /health`
- [ ] Chart generation works: `POST /api/hd-chart`
- [ ] Email capture works: `POST /api/email-capture`
- [ ] Error responses are properly formatted
- [ ] Logs are accessible in Railway dashboard
- [ ] Response times are acceptable (< 2s)
- [ ] Database connections are stable
- [ ] No memory leaks (monitor for 24 hours)

### Frontend Verification
- [ ] Homepage loads correctly
- [ ] Form validation works
- [ ] Chart generation displays results
- [ ] Email capture shows success message
- [ ] Error messages display properly
- [ ] No console errors in browser
- [ ] Mobile view works correctly
- [ ] Images load properly
- [ ] SEO meta tags present
- [ ] Analytics tracking works (if applicable)

### Integration Verification
- [ ] End-to-end user flow works
- [ ] No CORS errors
- [ ] Network requests succeed (check DevTools)
- [ ] Performance meets targets
- [ ] Error scenarios handled gracefully
- [ ] Multiple simultaneous users work
- [ ] Load testing passed (if applicable)

### Security Verification
- [ ] HTTPS enabled on both frontend and backend
- [ ] Environment variables not exposed in client
- [ ] Rate limiting configured (if applicable)
- [ ] Input validation working
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection configured (if applicable)

---

## Rollback Procedures

### Railway Backend Rollback

**Option 1: Via Railway Dashboard**
1. Go to Railway project dashboard
2. Click on Deployments tab
3. Find previous working deployment
4. Click "Redeploy"

**Option 2: Via Railway CLI**
```bash
# View deployment history
railway logs --deployment <deployment-id>

# Rollback to specific deployment
railway rollback <deployment-id>
```

**Option 3: Git Revert**
```bash
# Find commit to revert to
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Railway will auto-deploy
```

### Vercel Frontend Rollback

**Option 1: Via Vercel Dashboard**
1. Go to Vercel project dashboard
2. Click on Deployments tab
3. Find previous working deployment
4. Click "Promote to Production"

**Option 2: Via Vercel CLI**
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

**Option 3: Git Revert**
```bash
# Find commit to revert to
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel will auto-deploy
```

### Emergency Rollback Checklist
- [ ] Identify the issue and severity
- [ ] Notify team members
- [ ] Execute rollback procedure
- [ ] Verify rollback successful
- [ ] Update status page (if applicable)
- [ ] Document incident
- [ ] Schedule post-mortem
- [ ] Fix issue in development
- [ ] Test fix thoroughly
- [ ] Deploy fix when ready

---

## Deployment Timeline

**Estimated Total Time: 2-3 hours**

1. Pre-deployment verification: 30 minutes
2. Backend deployment: 30 minutes
3. Frontend deployment: 30 minutes
4. Post-deployment verification: 30-60 minutes
5. Monitoring and adjustments: 30 minutes

---

## Emergency Contacts

**Technical Lead**: [Name and contact]
**DevOps**: [Name and contact]
**Backend Developer**: [Name and contact]
**Frontend Developer**: [Name and contact]

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

---

**Last Updated**: 2025-12-05
**Version**: 1.0.0
