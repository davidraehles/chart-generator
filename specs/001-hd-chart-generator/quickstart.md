# Quickstart: Human Design Chart Generator

**Phase**: 1 (Design & Contracts) | **Date**: 2025-11-23 | **Duration**: ~15 minutes for first run

This guide gets you from zero to running the complete HD Chart Generator locally (frontend + backend + database).

---

## Prerequisites

Before starting, ensure you have installed:

- **Git**: `git --version` (v2.20+)
- **Node.js**: `node --version` (18+)
- **npm**: `npm --version` (9+)
- **Python**: `python --version` (3.11+)
- **PostgreSQL**: `psql --version` (14+) or use Docker
- **Docker** (optional, for PostgreSQL): `docker --version` (20.10+)

---

## Clone Repository

```bash
cd /path/to/projects
git clone https://github.com/raedical-co/chart-generator.git
cd chart-generator
```

---

## Option A: Full Local Setup (Frontend + Backend + PostgreSQL)

### Step 1: Start PostgreSQL (Local or Docker)

**Option A1: Using Docker** (recommended for quick setup)

```bash
docker run --name chart-generator-db \
  -e POSTGRES_USER=chart_user \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=chart_generator \
  -p 5432:5432 \
  postgres:15-alpine
```

This creates a running PostgreSQL container at `localhost:5432`.

**Option A2: Using local PostgreSQL installation**

```bash
# Create database and user
createdb chart_generator
createuser chart_user --createdb
psql -U chart_user -d chart_generator -c "ALTER USER chart_user WITH PASSWORD 'dev_password';"
```

### Step 2: Setup Backend (FastAPI + Python)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env.local file
cat > .env.local << 'DOTENV'
DATABASE_URL=postgresql://chart_user:dev_password@localhost:5432/chart_generator
HD_API_KEY=your_humandesign_ai_api_key_here
FRONTEND_URL=http://localhost:3000
DEBUG=true
DOTENV

# Run database migrations
alembic upgrade head

# Start backend server
python -m uvicorn src.main:app --reload --port 5000
```

Backend runs at `http://localhost:5000`

### Step 3: Setup Frontend (Next.js + React)

**In a new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << 'DOTENV'
NEXT_PUBLIC_API_URL=http://localhost:5000
DOTENV

# Start frontend dev server
npm run dev
```

Frontend runs at `http://localhost:3000`

### Step 4: Verify Both Are Running

```bash
# Test backend health check
curl http://localhost:5000/health

# Test frontend (should load in browser)
open http://localhost:3000
```

---

## Option B: Backend Only (API Testing without Frontend)

If you only want to test the API:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up database (same as Step 1 + Step 2 above)
export DATABASE_URL=postgresql://chart_user:dev_password@localhost:5432/chart_generator
export HD_API_KEY=your_humandesign_ai_api_key_here
alembic upgrade head

# Start server
python -m uvicorn src.main:app --reload --port 5000

# Test in another terminal
curl -X POST http://localhost:5000/api/hd-chart \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "birthDate": "23.11.1992",
    "birthTime": "14:30",
    "birthTimeApproximate": false,
    "birthPlace": "Berlin, Germany"
  }'
```

---

## Option C: Frontend Only (Static Testing without Backend)

If you only want to test the UI (with mock data):

```bash
cd frontend
npm install
npm run dev

# Frontend runs at http://localhost:3000
# Mock API responses in src/services/api.ts for development
```

---

## Obtaining HD API Key

1. Visit [HumanDesign.ai](https://humandesign.ai)
2. Sign up for Creator tier account ($25-30/month)
3. Navigate to API settings
4. Copy your API key
5. Add to backend `.env.local`: `HD_API_KEY=your_key_here`

**For development/testing**: Contact the project team for a shared test API key.

---

## Running Tests

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# Visual regression (Bodygraph component)
npm run test:visual

# All tests with coverage
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Unit tests
pytest tests/unit/ -v

# Integration tests
pytest tests/integration/ -v

# Contract tests (API schema validation)
pytest tests/contract/ -v

# All tests with coverage
pytest tests/ -v --cov=src

# Run specific test file
pytest tests/unit/test_validation.py -v
```

### End-to-End Tests

```bash
# Both frontend and backend must be running
cd tests/e2e

# Run Cypress tests
npx cypress run

# Or interactive mode
npx cypress open
```

---

## Database Migrations

### Create Migration (Backend)

```bash
cd backend

# Generate new migration file after model changes
alembic revision --autogenerate -m "Add new field to lead_emails"

# Review generated migration file in backend/alembic/versions/

# Apply migration
alembic upgrade head
```

### Rollback Migration

```bash
cd backend

# Rollback one version
alembic downgrade -1

# Rollback to specific version
alembic downgrade 1d1e3b5c0f8e
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GA_ID=optional_google_analytics_id
```

### Backend (`backend/.env.local`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chart_generator

# HD API
HD_API_KEY=your_humandesign_ai_api_key

# Application
FRONTEND_URL=http://localhost:3000
DEBUG=true
PORT=5000
LOG_LEVEL=debug
```

---

## Troubleshooting

### Backend Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
python -m uvicorn src.main:app --reload --port 5001
```

### Frontend Can't Connect to Backend

1. Ensure backend is running: `curl http://localhost:5000/health`
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Check browser console for CORS errors
4. Verify backend's `FRONTEND_URL` environment variable

### PostgreSQL Connection Failed

```bash
# Test database connection
psql -h localhost -U chart_user -d chart_generator

# If using Docker, check container is running
docker ps | grep chart-generator-db

# View Docker logs
docker logs chart-generator-db
```

### HD API Key Invalid

1. Verify API key in `backend/.env.local`
2. Check API key has valid permissions
3. Review HumanDesign.ai account settings
4. Test API key directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" \
     https://app.humandesign.ai/api/v1/charts
   ```

### Database Migrations Failed

```bash
# Check migration status
cd backend
alembic current

# View migration history
alembic history

# Downgrade to last working state
alembic downgrade -1

# Re-apply migrations
alembic upgrade head
```

---

## Project Structure Quick Reference

```
chart-generator/
├── frontend/                # Next.js frontend (Vercel deployment)
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   ├── services/       # API client (src/services/api.ts)
│   │   └── types/          # TypeScript types
│   ├── tests/              # Jest/Vitest unit + integration tests
│   └── package.json
│
├── backend/                 # FastAPI backend (Railway deployment)
│   ├── src/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic (normalizationService.py)
│   │   ├── models/         # SQLAlchemy models
│   │   └── config/         # Configuration + data files (profiles.json, impulses.json)
│   ├── tests/              # pytest unit + integration tests
│   ├── alembic/            # Database migrations
│   └── requirements.txt
│
├── contracts/              # API contracts
│   └── openapi.yaml        # OpenAPI 3.0 specification
│
├── specs/001-hd-chart-generator/  # Specification documents
│   ├── spec.md             # Feature specification
│   ├── plan.md             # Implementation plan (Phase 0, 1 deliverables)
│   ├── research.md         # Phase 0 research findings
│   ├── data-model.md       # Data model (this phase)
│   └── quickstart.md       # This guide
│
└── README.md               # Project overview
```

---

## Next Steps

After successful local setup:

1. **Frontend Development**: 
   - Start modifying components in `frontend/src/components/`
   - Run tests with `npm run test --watch`

2. **Backend Development**:
   - Add new endpoints in `backend/src/api/routes.py`
   - Run tests with `pytest tests/ --watch`

3. **Database Changes**:
   - Create migration: `alembic revision --autogenerate -m "description"`
   - Apply: `alembic upgrade head`

4. **Deployment** (later phases):
   - Frontend: Push to `main` branch → automatic Vercel deploy
   - Backend: Push to `main` branch → automatic Railway deploy
   - Environment variables configured in Vercel and Railway dashboards

---

## Common Commands Cheatsheet

```bash
# Start local development (run in 3 separate terminals)
Terminal 1: cd backend && source venv/bin/activate && python -m uvicorn src.main:app --reload --port 5000
Terminal 2: cd frontend && npm run dev
Terminal 3: docker run --name chart-generator-db ... (if using Docker)

# Run tests
npm run test --prefix frontend
pytest backend/tests/ -v

# Database
cd backend && alembic upgrade head
cd backend && alembic revision --autogenerate -m "message"

# Code formatting
cd frontend && npm run format
cd backend && black src/ && isort src/

# Build for production
cd frontend && npm run build
cd backend && pip freeze > requirements.txt
```

---

**Questions?** Check the project README or review the implementation plan in `specs/001-hd-chart-generator/plan.md`.

---

**Version**: 1.0.0 | **Date**: 2025-11-23 | **Status**: Ready for Development
