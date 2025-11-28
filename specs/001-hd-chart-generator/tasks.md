# Implementation Tasks: Human Design Chart Generator

**Feature**: Human Design Chart Generator | **Branch**: `001-hd-chart-generator` | **Date**: 2025-11-23

**Status**: 🚀 Ready for Execution | **Total Tasks**: 78 | **Phases**: 6 (Setup + Foundations + 4 User Stories + Polish)

---

## Overview & Task Organization

This document defines 78 actionable tasks organized in 6 execution phases:

1. **Phase 1: Setup & Infrastructure** (7 tasks) - Project initialization
2. **Phase 2: Foundational Services** (12 tasks) - Shared backend/frontend infrastructure
3. **Phase 3: US1-3 (P1 Features)** (29 tasks) - Core chart generation and display
4. **Phase 4: US4-6 (P2 Features)** (18 tasks) - Profile, channels, gates, incarnation cross
5. **Phase 5: US7-9 (P3 Features)** (10 tasks) - Personalized impulse, approximate time, email capture
6. **Phase 6: Polish & Testing** (2 tasks) - Final quality assurance

**MVP Scope**: Complete Phases 1-3 (38 tasks) delivers core value (Type, Authority, Bodygraph, full chart generation)

**Implementation Strategy**:

- Tasks are independently testable within each phase
- Frontend and backend can proceed in parallel (marked [P])
- User stories 1-3 (P1) deliver complete MVP
- User stories 4-6 (P2) add completeness
- User stories 7-9 (P3) add polish and lead generation

---

## Phase 1: Setup & Infrastructure (7 tasks)

**Goal**: Initialize project structure, install dependencies, create configuration files.

**Independent Test Criteria**:

- ✅ Frontend runs locally at `http://localhost:3000` with Next.js dev server
- ✅ Backend runs locally at `http://localhost:5000` with FastAPI dev server
- ✅ PostgreSQL database accessible and migrated
- ✅ Environment variables configured in `.env.local` files
- ✅ Git branch `001-hd-chart-generator` created and set up

### Tasks

- [ ] T001 Create Next.js frontend project structure in `frontend/` directory with `npx create-next-app@latest --typescript --tailwind`

- [ ] T002 Create Python FastAPI backend project structure in `backend/` directory with `pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic python-dotenv httpx`

- [ ] T003 [P] Initialize PostgreSQL database: Create database `chart_generator`, user `chart_user`, and verify connection

- [ ] T004 [P] Create `frontend/.env.local` with NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GA_ID (optional)

- [ ] T005 [P] Create `backend/.env.local` with DATABASE_URL, HD_API_KEY (placeholder), FRONTEND_URL, DEBUG=true

- [ ] T006 [P] Initialize Alembic migrations in `backend/alembic/` directory with `alembic init backend/alembic`

- [ ] T007 Create initial database migration for `lead_emails` table in `backend/alembic/versions/001_create_lead_emails_table.py` (soft-delete pattern, 11 columns including Phase 2+ GDPR)

---

## Phase 2: Foundational Services (12 tasks)

**Goal**: Build backend services and frontend infrastructure required by all user stories.

**Independent Test Criteria**:

- ✅ FastAPI app runs without errors and serves `/health` endpoint
- ✅ Database connection pool works and migrations apply cleanly
- ✅ Frontend TypeScript types compile without errors
- ✅ Normalization service converts sample HD API response to internal JSON
- ✅ Email validation service correctly validates RFC 5322 format
- ✅ API client service in frontend successfully calls backend mock endpoints

### Backend Tasks

- [ ] T008 Create FastAPI application skeleton in `backend/src/main.py` with health check endpoint, CORS configuration, error handlers

- [ ] T009 [P] Create database connection module in `backend/src/db/connection.py` using SQLAlchemy 2.0 with connection pooling

- [ ] T010 [P] Create Pydantic models in `backend/src/models/chart.py` for ChartRequest, ChartResponse, TypeInfo, AuthorityInfo, ProfileInfo, Center, Channel, Gates, IncarnationCross

- [ ] T011 [P] Create Pydantic models in `backend/src/models/email.py` for LeadEmail with all 11 columns (6 MVP + 5 Phase 2)

- [ ] T012 [P] Create normalization service in `backend/src/services/normalization_service.py` that maps external HD API response to internal ChartResponse schema

- [ ] T013 [P] Create validation service in `backend/src/services/validation_service.py` with:
  - Birth date validation (TT.MM.JJJJ format, no future dates, valid day/month)
  - Birth time validation (HH:MM format, 00:00–23:59 range)
  - Email validation (RFC 5322 format)
  - Name validation (5-50 chars, no special symbols)

- [ ] T014 [P] Create HD API client in `backend/src/services/hd_api_client.py` with method to call HumanDesign.ai endpoint, handle timeouts/errors

- [ ] T015 [P] Create email storage service in `backend/src/services/email_service.py` with methods:
  - `save_email(email: str) -> LeadEmail` (insert or return error)
  - `check_duplicate(email: str) -> bool` (case-insensitive, excluding soft-deleted)

### Frontend Tasks

- [ ] T016 Create TypeScript types in `frontend/src/types/chart.ts` matching backend Pydantic models (ChartRequest, ChartResponse, TypeInfo, etc.)

- [ ] T017 [P] Create API client service in `frontend/src/services/api.ts` with:
  - `fetchChart(request: ChartRequest): Promise<ChartResponse>`
  - `submitEmail(email: string): Promise<{success: bool, id: string}>`
  - Error handling with German error messages

- [ ] T018 [P] Create form validation utilities in `frontend/src/services/validation.ts` for client-side validation (matching backend validation)

- [ ] T019 [P] Create German language constants in `frontend/src/utils/constants.ts` with:
  - Form labels (Vorname, Geburtsdatum, etc.)
  - Section titles (Dein Typ, Deine Zentren, etc.)
  - Error messages (all in German)
  - Type/Authority labels in German

---

## Phase 3: US1-3 (P1 Features) - Core Chart Generation & Display (29 tasks)

**User Stories**:

- US1: Generate Personal HD Chart
- US2: Understand Decision Authority
- US3: View Defined/Open Centers Visually (Bodygraph)

**Goal**: Implement complete chart generation workflow from form input through display.

**Independent Test Criteria**:

- ✅ Form accepts valid birth data, submits to backend, receives ChartResponse
- ✅ Chart displays all required sections (Type, Authority, Profile, Centers, Channels, Gates, Bodygraph, Incarnation Cross)
- ✅ Form validation rejects invalid dates, times, and names with German error messages
- ✅ Bodygraph renders as SVG with 9 centers, defined/open visual distinction, channels connecting centers
- ✅ Authority section displays with decision hint (non-jargon German text)
- ✅ API failure (HD calculation unavailable) shows friendly error message with retry option

### Backend - Chart Generation

- [ ] T020 [US1] Create chart generation route in `backend/src/api/routes.py` as `POST /api/hd-chart` with request validation, error handling, response normalization

- [ ] T021 [P] [US1] Create chart handler in `backend/src/handlers/chart_handler.py` with method:
  - `generate_chart(request: ChartRequest) -> ChartResponse`
  - Validates input using validation service
  - Calls HD API client
  - Normalizes response using normalization service
  - Handles API errors gracefully

- [ ] T022 [P] [US1] Create location resolution service in `backend/src/services/location_service.py` that:
  - Accepts free-text location (e.g., "Berlin, Germany")
  - Attempts to parse timezone if needed
  - Returns location data for HD API (text-only per Phase 0 research)

- [ ] T023 [P] [US1] Create profiles data file `backend/src/config/data/profiles.json` with 49+ profile descriptions in German (code → description mapping)

- [ ] T024 [P] [US1] Create impulses data file `backend/src/config/data/impulses.json` with Type+Authority combinations → personalized impulse message (5 types × 7 authorities = 35 combinations)

- [ ] T025 [P] [US2] Implement authority decision hints in impulses mapping or separate service, ensuring all 7 authority types have clear, actionable German guidance

- [ ] T026 [US1] Test chart generation endpoint with sample birth data, verify complete ChartResponse with all required fields

### Backend - Database Integration

- [ ] T027 [US1] Create SQLAlchemy ORM model in `backend/src/models/database.py` for LeadEmail table with all 11 columns and soft-delete query helper

- [ ] T028 [P] [US1] Implement database session management in `backend/src/db/session.py` using SQLAlchemy async context managers

- [ ] T029 [P] [US1] Create database migration verification - run `alembic upgrade head` and confirm lead_emails table created with correct schema

### Frontend - Form Component

- [ ] T030 [US1] Create ChartForm component in `frontend/src/components/ChartForm.tsx` with:
  - Input fields: firstName, birthDate (TT.MM.JJJJ), birthTime (HH:MM), birthPlace, birthTimeApproximate checkbox
  - Client-side validation (matches backend validation rules)
  - Inline error messages in German
  - Submit button that sends POST request to `/api/hd-chart`
  - Loading state (disabled button, spinner)
  - Accessible form (ARIA labels, semantic HTML)

- [ ] T031 [P] [US1] Create ChartDisplay container component in `frontend/src/components/ChartDisplay.tsx` that:
  - Receives ChartResponse from form submission
  - Renders child section components (Type, Authority, Profile, etc.)
  - Manages display state (loading, error, success)
  - Provides error handling with retry option

- [ ] T032 [P] [US1] Create TypeSection component in `frontend/src/components/TypeSection.tsx` displaying:
  - type.label (e.g., "Generator")
  - type.shortDescription (1-2 sentences in German)
  - Styled header with section title "Dein Human Design Typ"

- [ ] T033 [P] [US2] Create AuthoritySection component in `frontend/src/components/AuthoritySection.tsx` displaying:
  - authority.label (e.g., "Emotionale Autorität")
  - authority.decisionHint (clear, actionable German guidance)
  - Styled section with title "Deine innere Autorität"

- [ ] T034 [P] [US1] Create ProfileSection component in `frontend/src/components/ProfileSection.tsx` displaying:
  - profile.code (e.g., "4/1")
  - profile.shortDescription (one clear sentence in German)
  - Styled section with title "Dein Profil"

- [ ] T035 [P] [US3] Create CentersSection component in `frontend/src/components/CentersSection.tsx` displaying:
  - Two-column layout: "Definiert" and "Offen"
  - List of center names grouped by defined/open status
  - German center names

- [ ] T036 [P] [US1] Create ChannelsSection component in `frontend/src/components/ChannelsSection.tsx` displaying:
  - List of active channels in format "XX–YY" (hyphen, not dash)
  - Tag-style or bullet-point layout
  - Title "Aktive Kanäle"

- [ ] T037 [P] [US1] Create GatesSection component in `frontend/src/components/GatesSection.tsx` displaying:
  - Two separate lists: "Bewusst" (conscious) and "Unbewusst" (unconscious)
  - Gate codes in format "XX.Y"
  - Title "Aktive Tore"

- [ ] T038 [P] [US1] Create IncarnationCrossSection component in `frontend/src/components/IncarnationCrossSection.tsx` displaying:
  - incarnationCross.name (e.g., "Right Angle Cross of Consciousness")
  - Gates in format "(15/10/5/35)"
  - Title "Dein Inkarnationskreuz"

### Frontend - Bodygraph Visualization

- [ ] T039 [US3] Create Bodygraph component in `frontend/src/components/Bodygraph.tsx` as SVG with:
  - 9 centers in standard HD layout with viewBox for responsive scaling
  - Defined centers colored with Deep Navy (#2C3E50), open centers white with border
  - Channels as lines connecting centers (Steel Gray #8B95A5)
  - Gate numbers as small text/marks on channels
  - Mobile-responsive (scales 375px–1200px+ without loss of clarity)
  - No layout shift on load (width/height explicit)
  - Accessible (title tags, semantic HTML5)

- [ ] T040 [P] [US3] Create Bodygraph coordinate system in `frontend/src/utils/bodygraph_coordinates.ts` defining:
  - 9 center positions (x, y coordinates)
  - 27 channel endpoints (from-center, to-center mappings)
  - Gate positions on channels
  - Scaling factors for responsive rendering

- [ ] T041 [P] [US3] Import design system colors in `frontend/src/styles/globals.css` from `frontend/design/color-system.md`:
  - CSS variables for primary (#2C3E50), secondary (#8B95A5), accent (#3498DB), error (#E74C3C)
  - Apply variables to Bodygraph and form elements

### Frontend - Error Handling & Page Integration

- [ ] T042 [US1] Create page component in `frontend/src/app/page.tsx` that:
  - Renders ChartForm initially
  - On successful submission, renders ChartDisplay with returned chart data
  - Manages error state (shows error message with retry)
  - Mobile-responsive layout (single column 375px+)
  - German title and page layout

- [ ] T043 [P] [US1] Create error boundary in `frontend/src/components/ErrorBoundary.tsx` catching chart generation errors and displaying user-friendly messages

- [ ] T044 [P] [US1] Create loading/retry UX component in `frontend/src/components/RetryableError.tsx` displaying:
  - Friendly error message (German): "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."
  - Retry button that re-submits the form without losing user data

---

## Phase 4: US4-6 (P2 Features) - Complete Data Display (18 tasks)

**User Stories**:

- US4: Learn About Profile and Life Dynamics
- US5: See Active Channels and Gates
- US6: See Incarnation Cross

**Goal**: Enhance chart display with all secondary HD elements.

**Independent Test Criteria**:

- ✅ All 9 chart sections display correctly for any valid birth input
- ✅ Channels list shows all active channels in correct format
- ✅ Gates section displays conscious and unconscious gates in separate lists
- ✅ Incarnation Cross displays with gates listed below
- ✅ Page layout is clean and minimalist (no information overload)

### Backend - Data Completeness

- [ ] T045 [US4] Verify profiles.json contains all 49+ profile combinations with German descriptions (research existing mappings or curate)

- [ ] T046 [P] [US5] Verify channels data structure in HD API response maps to internal format (code: "XX-YY")

- [ ] T047 [P] [US5] Verify gates data structure in HD API response separates conscious and unconscious correctly

- [x] T048 [P] [US6] Verify incarnation cross data includes name and 4 gate codes

### Frontend - Data Display

- [ ] T049 [US4] Ensure ProfileSection component displays curated profile descriptions (from Phase 3: T034)

- [ ] T050 [P] [US5] Ensure ChannelsSection component displays all channels from response (from Phase 3: T036)

- [ ] T051 [P] [US5] Ensure GatesSection component displays conscious/unconscious gates correctly (from Phase 3: T037)

- [ ] T052 [P] [US6] Ensure IncarnationCrossSection component displays cross name and gates (from Phase 3: T038)

### Frontend - Layout & Styling

- [ ] T053 [US4] Create ChartDisplay layout with sections in logical order: Type → Authority → Profile → Centers → Channels → Gates → Incarnation Cross → Bodygraph

- [ ] T054 [P] [US4] Apply consistent spacing, typography, and whitespace using Tailwind CSS (spacing: 4px grid, readable line-height)

- [ ] T055 [P] [US4] Test all sections display correctly on mobile (375px) and desktop (1024px+) without overflow

- [ ] T056 [P] [US4] Verify all German text renders correctly without character issues

### Testing

- [ ] T057 [US4] Test chart display with 5+ sample birth data sets covering different Type/Authority/Profile combinations

- [ ] T058 [P] [US4] Verify visual layout on mobile viewport (use DevTools 375px width)

- [ ] T059 [P] [US4] Verify Bodygraph channels and gates render correctly with centered displayed

- [ ] T060 [P] [US4] Test error handling when API returns incomplete data (missing profile, gates, etc.) — graceful fallback

- [ ] T061 [P] [US4] Test form submission with very long names (50+ chars) → rejected with error

---

## Phase 5: US7-9 (P3 Features) - Personalization & Lead Capture (10 tasks)

**User Stories**:

- US7: See Personalized Impulse/Message
- US8: Try Chart with Approximate Birth Time
- US9: Lead Capture for Future Business

**Goal**: Add personalization, approximate time support, and email collection.

**Independent Test Criteria**:

- ✅ Impulse message displays for any Type + Authority combination
- ✅ Approximate time checkbox works; chart generates with default 12:00
- ✅ Email capture form validates email, stores in database, shows success message
- ✅ Duplicate emails show clear error message

### Backend - Impulse & Approximate Time

- [x] T062 [US7] Create impulse service in `backend/src/services/impulse_service.py` with method:
  - `get_impulse(type_code: str, authority_code: str) -> str`
  - Maps 5 types × 7 authorities = 35 combinations to personalized German sentences
  - Returns default if combination not found

- [ ] T063 [P] [US7] Populate impulses.json with all 35 Type+Authority combinations with warm, clear, motivational German messages

- [ ] T064 [P] [US8] Modify chart handler to handle `birthTimeApproximate: true` → use default 12:00 if time field empty

- [ ] T065 [P] [US8] Add subtle messaging to chart display indicating approximate time used (optional note in form if needed)

### Backend - Email Capture

- [ ] T066 [US9] Create email capture route in `backend/src/api/routes.py` as `POST /api/email-capture` with:
  - Email validation (RFC 5322)
  - Duplicate check (case-insensitive, excluding soft-deleted)
  - Insert into lead_emails table with status='pending'
  - Return 201 + success message, or 400/409 error

- [ ] T067 [P] [US9] Create email handler in `backend/src/handlers/email_handler.py` with method:
  - `capture_email(email: str) -> {success: bool, id: str, message: str}`
  - Validates email
  - Checks duplicate (LOWER(email) WHERE deleted_at IS NULL)
  - Inserts with timestamps, returns UUID

### Frontend - Impulse Display

- [ ] T068 [US7] Create ImpulseSection component in `frontend/src/components/ImpulseSection.tsx` displaying:
  - Single warm sentence personalized to Type + Authority
  - Title "Ein Satz fuer dich"
  - Minimalist styling (single paragraph)

- [ ] T069 [P] [US7] Integrate impulse display into ChartDisplay (add as last section before email capture)

### Frontend - Approximate Time Support

- [ ] T070 [US8] Modify ChartForm to include checkbox "Geburtszeit ungefaehr / unbekannt" that:
  - Makes birthTime field optional when checked
  - Uses 12:00 as default if field empty
  - Sends birthTimeApproximate: true to backend

- [ ] T071 [P] [US8] Test form submission with approximate time checkbox checked and empty time field

### Frontend - Email Capture

- [ ] T072 [US9] Create EmailCaptureSection component in `frontend/src/components/EmailCaptureSection.tsx` with:
  - Optional email input field
  - Submit button for email capture
  - Validation: show error if invalid format
  - Success message: "Vielen Dank für dein Interesse an einem Business Reading."
  - Disable input after successful submission

- [ ] T073 [P] [US9] Integrate EmailCaptureSection into ChartDisplay (display below Impulse section)

- [ ] T074 [P] [US9] Test email validation: reject invalid formats, accept valid emails, handle duplicates gracefully

- [ ] T075 [P] [US9] Verify email storage in database: select * from lead_emails; confirm email, created_at, status='pending'

---

## Phase 6: Polish & Testing (2 tasks)

**Goal**: Final quality assurance, performance optimization, documentation.

**Independent Test Criteria**:

- ✅ Complete end-to-end flow works: form → chart generation → display → email capture
- ✅ All success criteria from spec.md verified
- ✅ Performance: chart load < 3 seconds, form-to-display < 30 seconds
- ✅ Mobile responsive: 375px viewports tested
- ✅ No layout shift on Bodygraph render

### Final Integration & Testing

- [ ] T076 Test complete end-to-end flow:
   1. Load form on mobile (375px)
   2. Fill valid birth data
   3. Submit → chart appears within 3 seconds
   4. Verify all 9 sections display
   5. Verify Bodygraph renders without shift
   6. Fill email → submit → success message
   7. Verify email in database with status='pending'

- [ ] T077 [P] Verify success criteria from spec.md:
  - SC-001: Form-to-display < 30 seconds ✅
  - SC-002: Chart load < 3 seconds ✅
  - SC-003: Bodygraph responsive + no shift ✅
  - SC-004: Validation errors inline + German ✅
  - SC-005: Approximate time works ✅
  - SC-006: API error shows friendly message + retry ✅
  - SC-007: All 9 sections complete ✅
  - SC-008: Type labels correct (Italian names in German context) ✅
  - SC-009: Centers distinction clear ✅
  - SC-010: All text German, no jargon ✅
  - SC-011: User delight (impulse message, clean design) ✅
  - SC-012: Page printable ✅

- [ ] T078 [P] Final documentation:
  - README.md updated with setup, deployment, testing instructions
  - All code includes docstrings and comments for unclear logic
  - API contract (OpenAPI.yaml) validated and up-to-date
  - Data model (data-model.md) matches implementation
  - Quickstart guide verified (local setup works)

---

## Dependency Graph & Execution Order

### Sequential Dependencies (must complete before next)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundations)
    ↓
Phase 3 (Core - US1-3)  ← MVP Complete
    ↓
Phase 4 (Complete - US4-6)
    ↓
Phase 5 (Polish - US7-9)
    ↓
Phase 6 (Final Testing)
```

### Parallel Execution Within Phases

**Phase 3 Parallelization** (US1-3):

- Backend tasks (T020-T028) can run in parallel with Frontend tasks (T030-T044)
- Within backend: Profile/impulses data creation (T023-T025) independent of handler implementation (T021-T022)
- Within frontend: TypeSection/AuthoritySection/ProfileSection (T032-T034) independent of Bodygraph (T039-T041)

**Phase 4 Parallelization** (US4-6):

- All data verification (T045-T048) can run in parallel
- All layout tasks (T053-T055) can run in parallel
- All testing tasks (T057-T061) can run in parallel

**Phase 5 Parallelization** (US7-9):

- Backend impulse service (T062-T063) independent of email capture (T066-T067)
- Frontend impulse display (T068-T069) independent of email capture (T072-T075)
- Approximate time support (T064-T065, T070-T071) can run in parallel

---

## Testing & Verification

### Unit Tests (Optional but Recommended)

- Backend validation service tests: `backend/tests/unit/test_validation.py`
- Backend normalization service tests: `backend/tests/unit/test_normalization.py`
- Frontend API client tests: `frontend/tests/unit/api.test.ts`
- Frontend form validation tests: `frontend/tests/unit/validation.test.ts`

### Integration Tests (Recommended)

- Backend chart generation endpoint: `backend/tests/integration/test_chart_endpoint.py`
- Backend email capture endpoint: `backend/tests/integration/test_email_endpoint.py`
- Frontend chart form submission: `frontend/tests/integration/chart-form-flow.test.ts`

### Contract Tests (Optional)

- OpenAPI schema validation: `backend/tests/contract/test_openapi_schema.py`

### Visual Regression Tests (Optional)

- Bodygraph rendering: `frontend/tests/visual/bodygraph-regression.test.ts`

### Acceptance Tests (Manual or Automated)

- Complete end-to-end flow (Form → Chart → Email): Test with 5+ sample birth data sets

---

## Success Metrics

**Phase 3 (MVP Core)**:

- ✅ Chart generates from birth data within 3 seconds
- ✅ All 9 sections display
- ✅ Bodygraph renders with defined/open distinction
- ✅ Form validation provides clear error messages
- ✅ API failures show friendly error with retry

**Phase 4 (Complete Display)**:

- ✅ All secondary data displays (Profile, Channels, Gates, Incarnation Cross)
- ✅ Page layout clean and minimalist (no information overload)
- ✅ Mobile responsive (375px+)

**Phase 5 (Personalization & Lead Gen)**:

- ✅ Impulse message displays for all Type+Authority combinations
- ✅ Approximate time support works
- ✅ Email capture stores leads correctly
- ✅ Duplicate email detection works

**Phase 6 (Final Quality)**:

- ✅ All 12 success criteria from spec.md verified
- ✅ End-to-end flow works flawlessly
- ✅ Performance targets met (< 3s chart load, < 30s form-to-display)

---

## Implementation Notes

### Architecture Principles

- **Separation of Concerns**: Backend handles calculation/validation, frontend handles display/UX
- **Type Safety**: Use TypeScript (frontend) and Python type hints (backend)
- **Minimize Complexity**: Only implement what's in spec (no extra features)
- **German First**: All user-facing text in German; no jargon
- **Graceful Degradation**: Bodygraph fails → show text list; API fails → show retry

### Code Quality

- All components accept props with TypeScript interfaces
- All services have docstrings explaining purpose and return types
- Error messages always user-friendly and in German
- Git commits reference task IDs (e.g., "T020: Create chart generation route")

### Testing Approach

- Recommended: Unit tests for validation and normalization logic
- Recommended: Integration tests for endpoint contracts
- Required: Manual testing of complete end-to-end flow
- Optional: Visual regression tests for Bodygraph

---

## Performance Targets (from spec.md)

- Chart generation: < 3 seconds end-to-end
- Form-to-display: < 30 seconds
- Bodygraph render: No layout shift, < 100ms
- Mobile (375px): All sections readable, Bodygraph clear
- API timeout: 5 seconds (show friendly error)

---

## Resources & References

- **Spec**: `specs/001-hd-chart-generator/spec.md` (9 user stories, 30 FRs, 12 success criteria)
- **Data Model**: `specs/001-hd-chart-generator/data-model.md` (ChartRequest, ChartResponse, LeadEmail)
- **API Contract**: `contracts/openapi.yaml` (OpenAPI 3.0 specification)
- **Design System**: `frontend/design/color-system.md` (Colors, CSS variables, accessibility)
- **Quickstart**: `specs/001-hd-chart-generator/quickstart.md` (Local setup, testing, troubleshooting)
- **Plan**: `specs/001-hd-chart-generator/plan.md` (Tech stack, project structure, phases)
- **Research**: `specs/001-hd-chart-generator/research.md` (Phase 0 decisions: Python+FastAPI, HumanDesign.ai API, soft-delete schema)

---

## Next Steps

1. ✅ Generate tasks.md (this document)
2. Start Phase 1 tasks immediately (project setup takes ~15 minutes)
3. Run Phase 1 completion verification: `./quickstart.md` local setup
4. Begin Phase 2 foundational services (can parallelize frontend + backend)
5. Implement Phase 3 (US1-3) → MVP complete
6. Add Phase 4 (US4-6) → Complete data display
7. Add Phase 5 (US7-9) → Personalization & lead capture
8. Run Phase 6 final testing and verification

---

**Version**: 1.0.0 | **Status**: Ready for Execution | **Generated**: 2025-11-23
