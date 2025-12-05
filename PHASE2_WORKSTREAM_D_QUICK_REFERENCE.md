# Workstream D: Quick Reference

## Current Status
- ✅ Backend: Running on port 5000
- ✅ Frontend: Running on port 3000
- ✅ Integration: 100% tests passing
- ✅ Ready for Phase 3

## Quick Commands

### Start Backend
```bash
cd /home/darae/chart-generator/backend
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 5000
```

### Start Frontend
```bash
cd /home/darae/chart-generator/frontend
npm run dev
```

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Chart Generation
```bash
curl -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "birthDate": "23.11.1992",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "country": "Germany"
  }'
```

## Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/docs

## Test Results
- Automated Tests: 28/28 PASSED
- Performance: Exceeds targets by 55-95%
- German Language: Complete
- CORS: Properly configured

## Reports Generated
1. `/home/darae/chart-generator/PHASE2_WORKSTREAM_D_INTEGRATION_TEST_REPORT.md`
2. `/home/darae/chart-generator/PHASE2_WORKSTREAM_D_SUMMARY.md`
3. `/home/darae/chart-generator/tmp/comprehensive_test.sh`

## Next Steps
1. Proceed to Phase 3: Deployment Setup
2. Review deployment checklist
3. Configure production environment
4. Set up monitoring

---
Last Updated: 2025-12-05
