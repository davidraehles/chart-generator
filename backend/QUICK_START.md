# Backend Quick Start

## Start Server
```bash
cd /home/darae/chart-generator/backend
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 5000
```

## Test Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Generate Chart
```bash
curl -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "birthDate": "23.11.1992",
    "birthTime": "14:30",
    "birthTimeApproximate": false,
    "birthPlace": "Berlin, Germany"
  }'
```

### Capture Email
```bash
curl -X POST http://localhost:5000/api/email-capture \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## API Documentation
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

## Status
✅ All systems operational
✅ Response times < 500ms
✅ Ready for frontend integration
