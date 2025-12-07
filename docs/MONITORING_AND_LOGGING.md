# Monitoring and Logging Guide

This document provides comprehensive guidance on monitoring, logging, and troubleshooting the HD Chart Generator application in production.

## Table of Contents
1. [Accessing Logs](#accessing-logs)
2. [Key Metrics to Monitor](#key-metrics-to-monitor)
3. [Alert Thresholds](#alert-thresholds)
4. [Troubleshooting Common Issues](#troubleshooting-common-issues)
5. [Log Analysis](#log-analysis)
6. [Performance Monitoring](#performance-monitoring)
7. [Incident Response](#incident-response)

---

## Accessing Logs

### Railway Backend Logs

**Via Railway Dashboard:**
1. Go to [railway.app](https://railway.app)
2. Log in to your account
3. Select your project
4. Click on the backend service
5. Click on "Logs" tab

**Log Features:**
- Real-time log streaming
- Search and filter capabilities
- Download logs
- Set time range

**Via Railway CLI:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
cd /home/darae/chart-generator/backend
railway link

# View live logs
railway logs

# View logs with follow
railway logs --follow

# View specific deployment logs
railway logs --deployment <deployment-id>

# Filter logs by service
railway logs --service backend
```

**Log Levels:**
- `INFO`: Normal operation (requests, responses)
- `WARNING`: Non-critical issues (deprecated features, slow queries)
- `ERROR`: Errors that were handled (validation failures, API errors)
- `CRITICAL`: Critical errors (database connection loss, unhandled exceptions)

### Vercel Frontend Logs

**Via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Log in to your account
3. Select your project
4. Click on "Logs" tab

**Log Types:**
- Build Logs: Logs from `npm run build`
- Runtime Logs: Logs from server-side rendering (SSR)
- Static Logs: Logs from static page generation

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# View production logs
cd /home/darae/chart-generator/frontend
vercel logs

# Follow logs in real-time
vercel logs --follow

# Filter by deployment
vercel logs <deployment-url>
```

**Frontend Log Sources:**
- Server Components (Next.js SSR)
- API Routes (if any)
- Build process
- Edge Functions (if used)

### Browser Console Logs

**For Client-Side Debugging:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for errors or warnings

**Common Console Issues:**
- Network errors (CORS, failed requests)
- JavaScript errors
- React warnings
- Unhandled promise rejections

**To Clear Console Logs in Production:**
Ensure no `console.log` statements in production code:
```bash
# From frontend directory
# Build will show warnings if console.log found
npm run build
```

---

## Key Metrics to Monitor

### Backend Metrics

**1. Request Rate**
- Metric: Requests per minute (RPM)
- Normal Range: 10-1000 RPM (depends on traffic)
- Monitor in: Railway dashboard or logs

**2. Response Time**
- Metric: Average response time in milliseconds
- Target: < 2000ms for chart generation, < 500ms for email capture
- Monitor: Railway logs, timestamps

**3. Error Rate**
- Metric: Error responses / Total requests
- Target: < 1%
- Monitor: Count 4xx and 5xx responses in logs

**4. CPU Usage**
- Metric: CPU utilization percentage
- Normal Range: 10-70%
- Alert Threshold: > 80% sustained
- Monitor: Railway dashboard

**5. Memory Usage**
- Metric: RAM utilization in MB
- Normal Range: 200-800 MB
- Alert Threshold: > 90% of allocated memory
- Monitor: Railway dashboard

**6. Database Connections**
- Metric: Active database connections
- Normal Range: 1-10
- Alert Threshold: Connection errors or pool exhaustion
- Monitor: Backend logs, database metrics

**7. Uptime**
- Metric: Service availability percentage
- Target: 99.9% (< 43 minutes downtime/month)
- Monitor: Railway status, external monitoring

### Frontend Metrics

**1. Page Load Time**
- Metric: Time to First Byte (TTFB), First Contentful Paint (FCP)
- Target: TTFB < 600ms, FCP < 1.5s
- Monitor: Browser DevTools, Vercel Analytics

**2. Build Success Rate**
- Metric: Successful builds / Total builds
- Target: 100%
- Monitor: Vercel dashboard

**3. Deployment Frequency**
- Metric: Deployments per day/week
- Monitor: Vercel deployment logs

**4. Bundle Size**
- Metric: Total JavaScript size in KB
- Target: < 500 KB
- Monitor: Build output, Vercel Analytics

**5. Core Web Vitals**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- Monitor: Vercel Analytics, Google PageSpeed Insights

### Business Metrics

**1. Chart Generation Success Rate**
- Metric: Successful charts / Total attempts
- Target: > 95%
- Monitor: Backend logs (200 vs 400/500 responses)

**2. Email Capture Rate**
- Metric: Emails captured / Charts generated
- Monitor: Database query, logs

**3. User Journey Completion**
- Metric: Users who complete full flow
- Monitor: Frontend analytics (if implemented)

---

## Alert Thresholds

### Critical Alerts (Immediate Action Required)

**Backend Down**
- Condition: Health endpoint returns non-200 for > 2 minutes
- Action: Check Railway status, review logs, restart if needed

**High Error Rate**
- Condition: > 5% of requests return 5xx errors
- Action: Check backend logs, identify failing endpoint, rollback if needed

**Database Connection Failure**
- Condition: Database connection errors in logs
- Action: Check Railway database status, check connection string

**High Memory Usage**
- Condition: > 90% memory usage for > 5 minutes
- Action: Check for memory leaks, restart service, scale up if needed

**Frontend Down**
- Condition: Frontend returns non-200 for > 2 minutes
- Action: Check Vercel status, review deployment logs

### Warning Alerts (Action Within 1 Hour)

**Elevated Error Rate**
- Condition: > 2% of requests return 4xx/5xx errors
- Action: Review logs for patterns, investigate common errors

**Slow Response Time**
- Condition: Average response time > 3 seconds
- Action: Check database queries, API performance, server load

**High CPU Usage**
- Condition: CPU > 70% for > 10 minutes
- Action: Review active processes, check for infinite loops

**Build Failures**
- Condition: Frontend build fails
- Action: Review build logs, fix errors, redeploy

### Info Alerts (Monitor and Track)

**Moderate Traffic Spike**
- Condition: 2x normal traffic
- Action: Monitor performance, prepare to scale if needed

**Increased Validation Errors**
- Condition: > 10% of requests have validation errors
- Action: Review user input patterns, improve form UX

---

## Troubleshooting Common Issues

### Issue 1: Chart Generation Fails

**Symptoms:**
- 500 error returned from `/api/hd-chart`
- Error in backend logs
- User sees error message

**Diagnosis Steps:**
1. Check backend logs for error details
2. Review request payload
3. Test with known working data
4. Check database connection
5. Verify Swiss Ephemeris data files

**Common Causes:**
- Invalid location data (geocoding failure)
- Missing Swiss Ephemeris data
- Database connection issue
- Calculation error

**Resolution:**
```bash
# Check backend logs
railway logs | grep ERROR

# Test endpoint manually
curl -X POST https://your-backend.railway.app/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}'

# Restart backend if needed
railway restart
```

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows CORS error
- Network requests fail from frontend
- Error: "Access to fetch... has been blocked by CORS policy"

**Diagnosis:**
1. Check browser console for exact error
2. Verify frontend URL in backend CORS config
3. Check request origin

**Resolution:**
```bash
# Check backend environment variables
railway variables

# Verify FRONTEND_URL is correct
# Should match: https://your-frontend.vercel.app

# Update if needed
railway variables set FRONTEND_URL=https://your-actual-frontend.vercel.app

# Restart backend
railway restart
```

### Issue 3: Database Connection Errors

**Symptoms:**
- Email capture fails
- Database connection errors in logs
- "could not connect to database" errors

**Diagnosis:**
1. Check Railway database status
2. Verify DATABASE_URL environment variable
3. Test database connection

**Resolution:**
```bash
# Check database status in Railway dashboard
# Verify DATABASE_URL
railway variables | grep DATABASE_URL

# Test connection
railway run python -c "from src.database import get_db_session; s = get_db_session(); print('Connected')"

# Restart database if needed (via Railway dashboard)
```

### Issue 4: Frontend Not Loading

**Symptoms:**
- Blank page
- 404 error
- Build errors

**Diagnosis:**
1. Check Vercel deployment status
2. Review build logs
3. Check browser console

**Resolution:**
```bash
# Check deployment status
vercel ls

# Review logs
vercel logs

# Redeploy if needed
vercel --prod

# Or rollback to previous deployment
# (via Vercel dashboard > Deployments > Promote to Production)
```

### Issue 5: Slow Performance

**Symptoms:**
- Chart takes > 3 seconds to generate
- Page load slow
- High server CPU/memory

**Diagnosis:**
1. Check Railway metrics (CPU, memory)
2. Review slow query logs
3. Test API response times
4. Check frontend bundle size

**Resolution:**
```bash
# Check backend response time
time curl -X POST https://your-backend.railway.app/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin","country":"Germany"}'

# Check frontend bundle size
cd frontend
npm run build
# Review output for large bundles

# Scale up backend if needed (via Railway dashboard)
# Optimize queries or add caching
```

### Issue 6: Email Duplicates Not Detected

**Symptoms:**
- Same email can be submitted multiple times
- No 409 error for duplicates

**Diagnosis:**
1. Check database constraints
2. Review email handler logic
3. Test duplicate submission

**Resolution:**
```python
# Check database schema
# Ensure unique constraint on email field

# Test via API
curl -X POST https://your-backend.railway.app/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Submit again - should return 409
curl -X POST https://your-backend.railway.app/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Issue 7: Environment Variables Not Loading

**Symptoms:**
- Backend uses default values
- Features not working (geocoding, etc.)
- Errors about missing configuration

**Diagnosis:**
1. Check Railway/Vercel environment variables
2. Verify variable names
3. Check .env file loading

**Resolution:**
```bash
# Backend (Railway)
railway variables
# Ensure all required variables are set

# Frontend (Vercel)
vercel env ls
# Ensure NEXT_PUBLIC_API_URL is set

# Redeploy after updating variables
railway up  # for backend
vercel --prod  # for frontend
```

---

## Log Analysis

### Understanding Backend Logs

**Successful Chart Request:**
```
INFO: 192.168.1.1:12345 - "POST /api/hd-chart HTTP/1.1" 200 OK
INFO: Chart generated for Test User (Berlin, Germany)
INFO: Response time: 1.24s
```

**Failed Validation:**
```
WARNING: Validation error for field 'birthDate': Invalid date format
INFO: 192.168.1.1:12345 - "POST /api/hd-chart HTTP/1.1" 400 Bad Request
```

**Server Error:**
```
ERROR: Unexpected error in chart generation: NoneType object has no attribute 'latitude'
ERROR: Traceback: [stack trace]
INFO: 192.168.1.1:12345 - "POST /api/hd-chart HTTP/1.1" 500 Internal Server Error
```

### Log Patterns to Monitor

**High Traffic Pattern:**
```bash
# Count requests per minute
railway logs | grep "POST /api/hd-chart" | grep "$(date +%H:%M)" | wc -l
```

**Error Rate:**
```bash
# Count 5xx errors
railway logs | grep "500 Internal Server Error" | wc -l

# Count 4xx errors
railway logs | grep "400 Bad Request" | wc -l
```

**Slow Requests:**
```bash
# Find requests > 3 seconds
railway logs | grep "Response time" | awk '$4 > 3.0 {print}'
```

### Frontend Log Analysis

**Build Logs:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages (3/3)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.02 kB        87.9 kB
└ ○ /_not-found                          0 B            0 B
```

**Runtime Errors:**
```
Error: Failed to fetch chart data
    at ChartForm.tsx:45
    at async handleSubmit
```

---

## Performance Monitoring

### Backend Performance Queries

**Average Response Time:**
```bash
# Calculate from logs
railway logs | grep "Response time" | awk '{sum+=$4; count++} END {print sum/count}'
```

**Request Distribution:**
```bash
# Count by endpoint
railway logs | grep "POST" | awk '{print $3}' | sort | uniq -c
```

### Frontend Performance

**Use Vercel Analytics:**
1. Enable Analytics in Vercel dashboard
2. Monitor Core Web Vitals
3. Track page performance over time

**Lighthouse Testing:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-frontend.vercel.app --view

# Check scores for:
# - Performance
# - Accessibility
# - Best Practices
# - SEO
```

### Database Performance

**Query Performance:**
```sql
-- Check slow queries (if PostgreSQL)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Incident Response

### Incident Response Plan

**1. Detection**
- Alert triggered or user report
- Verify issue is real
- Assess severity

**2. Classification**
- **Critical**: Service down, data loss
- **High**: Major feature broken, affecting many users
- **Medium**: Minor feature broken, workaround available
- **Low**: Cosmetic issue, no functional impact

**3. Communication**
- Notify team members
- Update status page (if applicable)
- Keep stakeholders informed

**4. Investigation**
- Check logs (Railway, Vercel)
- Review recent deployments
- Test locally if needed
- Identify root cause

**5. Resolution**
- Apply fix or rollback
- Test fix in production
- Monitor for recurrence

**6. Post-Incident**
- Write incident report
- Schedule post-mortem
- Update documentation
- Implement preventive measures

### Incident Response Checklist

**For Backend Issues:**
- [ ] Check Railway service status
- [ ] Review backend logs
- [ ] Test health endpoint
- [ ] Test chart generation endpoint
- [ ] Check database connection
- [ ] Verify environment variables
- [ ] Check recent deployments
- [ ] Consider rollback
- [ ] Apply fix or restart
- [ ] Monitor for 30 minutes
- [ ] Update team

**For Frontend Issues:**
- [ ] Check Vercel deployment status
- [ ] Review build logs
- [ ] Test in browser
- [ ] Check browser console
- [ ] Test API connectivity
- [ ] Verify environment variables
- [ ] Check recent commits
- [ ] Consider rollback
- [ ] Redeploy if needed
- [ ] Monitor for 30 minutes
- [ ] Update team

---

## Monitoring Tools Recommendations

### Recommended External Tools

**1. Uptime Monitoring**
- [UptimeRobot](https://uptimerobot.com/) (Free tier available)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

**Setup:**
- Monitor `/health` endpoint every 5 minutes
- Alert on 3 consecutive failures

**2. Error Tracking**
- [Sentry](https://sentry.io/) (Free tier available)
- Tracks JavaScript errors
- Tracks backend exceptions
- Provides stack traces and context

**3. Performance Monitoring**
- Vercel Analytics (included with Vercel)
- Google Analytics
- Google PageSpeed Insights

**4. Log Aggregation**
- [Logtail](https://logtail.com/) (integrates with Railway)
- [Papertrail](https://www.papertrail.com/)
- Better log search and retention

---

## Regular Maintenance Tasks

### Daily Tasks
- [ ] Check error rates in logs
- [ ] Monitor response times
- [ ] Review any alerts received
- [ ] Check database size growth

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check disk space usage
- [ ] Review and clean old logs
- [ ] Test backup/restore (if backups enabled)
- [ ] Review security updates

### Monthly Tasks
- [ ] Review and update dependencies
- [ ] Performance audit (Lighthouse)
- [ ] Security audit
- [ ] Review and update documentation
- [ ] Test disaster recovery procedures
- [ ] Review and optimize costs

---

## Contact Information

**For Production Issues:**
- Technical Lead: [Name and contact]
- DevOps: [Name and contact]
- On-Call Engineer: [Rotation schedule]

**Platform Support:**
- Railway Support: [support@railway.app](mailto:support@railway.app)
- Vercel Support: [support@vercel.com](mailto:support@vercel.com)

**Emergency Escalation:**
1. Technical Lead
2. CTO/Engineering Manager
3. Platform support

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Logging](https://fastapi.tiangolo.com/tutorial/logging/)
- [Next.js Logging](https://nextjs.org/docs/api-reference/next.config.js/logging)

---

**Last Updated**: 2025-12-05
**Version**: 1.0.0
