# chart-generator Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-27

## Trunk-Based Development Workflow

This project follows **trunk-based development**:

1. **Main branch (`main`)** is the single source of truth
2. **Short-lived feature branches** for all changes (max 1-2 days)
3. **Small, frequent commits** directly to main or via short PRs
4. **Feature flags** for incomplete features in production
5. **CI/CD** runs on every push to main

### Workflow Steps:
```bash
# 1. Start from latest main
git checkout main && git pull

# 2. Create short-lived feature branch
git checkout -b feature/short-description

# 3. Make changes, commit frequently
git add -A && git commit -m "feat: description"

# 4. Push and create PR
git push -u origin feature/short-description
gh pr create --title "feat: description" --body "Summary of changes"

# 5. Merge to main (squash or rebase preferred)
gh pr merge --squash

# 6. Clean up
git checkout main && git pull && git branch -d feature/short-description
```

### Branch Naming:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

## Active Technologies

- Python 3.11.0 + FastAPI 0.115.0, pyswisseph (Swiss Ephemeris Python wrapper), httpx 0.28.0 (for API fallbacks) (002-add-ephemeris-sources)
- Next.js 16+ with TypeScript, React 19, Tailwind CSS (frontend)
- Playwright for E2E testing

## Project Structure

```text
backend/
  src/           # FastAPI application
  tests/         # Python tests
  data/ephemeris/ # Swiss Ephemeris data files
frontend/
  app/           # Next.js App Router pages
  components/    # React components
  e2e/           # Playwright E2E tests
  services/      # API clients
specs/           # Feature specifications
contracts/       # API contracts
```

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload        # Run dev server
pytest                                # Run tests
ruff check .                          # Lint Python
```

### Frontend
```bash
cd frontend
npm install
npm run dev                           # Run dev server
npm run build                         # Build for production
npm run test:e2e                      # Run Playwright E2E tests
npm run lint                          # Lint TypeScript
```

## Code Style

- Python: Follow PEP 8, use type hints, ruff for linting
- TypeScript: Strict mode, ESLint + Prettier
- Commits: Conventional commits (feat:, fix:, docs:, etc.)

## Deployment

- **Frontend**: Vercel (auto-deploy on main)
- **Backend**: Railway (https://chart-generator-production-64fd.up.railway.app)

## Recent Changes

- 002-add-ephemeris-sources: Added ephemeris calculation with Swiss Ephemeris, multiple source support, E2E tests