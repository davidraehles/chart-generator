# Implementation Plan: Human Design Chart Generator

**Branch**: `001-hd-chart-generator` | **Date**: 2025-11-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-hd-chart-generator/spec.md`

## Summary

Build a minimalist Human Design Chart Generator tool that generates personalized HD profiles from birth data (date, time, location). The MVP delivers core chart display (Type, Authority, Profile, Centers, Channels, Gates, Bodygraph) with decision authority guidance in German. Backend uses external HD calculation API with normalization layer for frontend independence. Frontend is Next.js deployed on Vercel; backend is Node.js/Python deployed on Railway. Mobile-first responsive design (375px+), no data persistence, German language throughout. MVP includes basic email lead capture for Business Reading interest. Hybrid approach: external API for MVP, explore internal HD calculation in Phase 2.

## Technical Context

**Frontend Language/Version**: Next.js 14+ (React 18+, Node.js 18+)
**Frontend Dependencies**: Next.js, React, TypeScript, Tailwind CSS, SVG for Bodygraph rendering
**Backend Language/Version**: Node.js 18+ OR Python 3.11+ (NEEDS CLARIFICATION: final choice deferred to Phase 1 research)
**Backend Dependencies**: Express/FastAPI, HD calculation API client library, normalization/mapping layer
**Storage**: PostgreSQL (Railway hosted) for email lead capture; no user chart/birth data persistence
**Testing**: Jest/Vitest (frontend), pytest/jest (backend), integration tests for API contracts, visual regression tests for Bodygraph
**Target Platform**: Web (desktop/mobile browsers), modern browsers (Chrome, Firefox, Safari, Edge), SVG rendering required
**Project Type**: Web application (separated frontend/backend)
**Performance Goals**: Chart generation 3 seconds end-to-end, form-to-display 30 seconds, Bodygraph renders without layout shift
**Constraints**: No technical errors shown to users (German language only), mobile-first 375px width minimum, graceful fallback for Bodygraph render failures
**Scale/Scope**: MVP: ~50 screens/components (form, chart display, error states), 30 HD profiles + 35 impulse combinations, email storage table, no multi-tenancy, single-language German

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Alignment with Constitution Principles**:

✅ **I. Specification-First Design**: Comprehensive specification complete with 9 user stories, 30 FRs, 12 success criteria, 5 clarifications. Specification quality checklist passed. No code written before clear requirements.

✅ **II. Minimalist User Interface**: MVP limited to essential HD elements (Type, Authority, Profile, Centers, Bodygraph). No esoteric features (Variables, Arrows, Motivation, Perspectives excluded). German language enforced throughout. Design system file created for color consistency.

✅ **III. Quality Output, Not Feature Completeness**: External API + normalization layer ensures accurate calculations. Email capture basic validation MVP-ready; comprehensive compliance deferred Phase 2. No half-finished features shipped.

✅ **IV. API-Agnostic Backend**: Normalization layer abstracts HD calculation source. Frontend expects consistent JSON regardless of API provider. Hybrid approach: external API MVP, internal calculation Phase 2 option. Vendor lock-in prevented.

✅ **V. Error-First Experience Design**: All error cases documented with German messages. No technical details shown to users. Graceful degradation for Bodygraph render failures. Retry paths without re-entering data.

✅ **MVP Scope Boundaries**: Birth form, chart generation, visual display, authority guidance, email lead capture. Explicitly excluded: data persistence (charts/profiles), user accounts, PDF exports, relationship charts, planetary interpretation, multi-language, full GDPR compliance.

✅ **Development Workflow**: Specification review gates passed. Testing discipline defined (unit, integration, acceptance, visual regression). Code review standards reference spec requirements. Performance gates specified (3s chart load, 30s form-to-display, 375px mobile, no layout shifts).

✅ **Deployment Infrastructure**: Vercel (frontend), Railway (backend) defined. Preview and production deployments documented. Environment variables in platform dashboards. New projects to be created before development.

**GATE RESULT**: ✅ **PASS** - All constitution principles aligned. Plan adheres to specification and governance rules. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Selected Structure**: Web application (Option 2) — Frontend (Next.js on Vercel) and Backend (Node.js/Python on Railway) separated.

```text
frontend/
├── public/
│   ├── fonts/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home page with form and chart display
│   │   ├── api/                        # Next.js API routes (client-side proxies)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChartForm.tsx               # Birth data input form
│   │   ├── ChartDisplay.tsx            # Main chart results display container
│   │   ├── Bodygraph.tsx               # SVG Bodygraph visualization
│   │   ├── TypeSection.tsx             # Type + short description
│   │   ├── AuthoritySection.tsx        # Authority + decision hint
│   │   ├── ProfileSection.tsx          # Profile code + description
│   │   ├── CentersSection.tsx          # Defined/Open centers lists
│   │   ├── ChannelsSection.tsx         # Active channels
│   │   ├── GatesSection.tsx            # Conscious/unconscious gates
│   │   ├── IncarnationCrossSection.tsx # Incarnation cross + gates
│   │   ├── ImpulseSection.tsx          # Personalized impulse message
│   │   ├── EmailCaptureSection.tsx     # Lead capture form
│   │   └── ErrorBoundary.tsx           # Error handling
│   ├── services/
│   │   ├── api.ts                      # Backend API client
│   │   └── validation.ts               # Form validation helpers
│   ├── styles/
│   │   └── globals.css                 # Global styles + Tailwind
│   ├── types/
│   │   └── chart.ts                    # TypeScript types for chart data
│   └── utils/
│       └── constants.ts                # German labels, messages, etc.
├── tests/
│   ├── unit/
│   │   ├── ChartForm.test.tsx
│   │   ├── Bodygraph.test.tsx
│   │   └── validation.test.ts
│   ├── integration/
│   │   └── chart-generation-flow.test.tsx
│   └── visual/
│       └── bodygraph-regression.test.ts
├── design/
│   └── color-system.md                 # Bodygraph colors, accent colors
├── package.json
├── tsconfig.json
└── tailwind.config.js

backend/
├── src/
│   ├── index.ts (or main.py)           # Express/FastAPI app entry
│   ├── api/
│   │   └── routes.ts (or routes.py)    # POST /api/hd-chart endpoint
│   ├── handlers/
│   │   ├── chartHandler.ts             # Chart generation orchestration
│   │   └── emailHandler.ts             # Email validation + storage
│   ├── services/
│   │   ├── hdCalculationService.ts     # External HD API client
│   │   ├── normalizationService.ts     # Map HD API response to internal JSON
│   │   ├── locationService.ts          # Location → coordinates/timezone
│   │   └── profileService.ts           # Load 49+ profile descriptions
│   ├── models/
│   │   └── email.ts (or email.py)      # Email entity, validation
│   ├── db/
│   │   ├── migrations/                 # Database schema for emails
│   │   └── connection.ts (or db.py)    # PostgreSQL connection + queries
│   ├── config/
│   │   ├── constants.ts                # German error messages
│   │   └── data/
│   │       ├── profiles.json           # 49+ profile descriptions
│   │       └── impulses.json           # Type + Authority impulse mapping
│   ├── middleware/
│   │   ├── errorHandler.ts             # Global error handling (German messages)
│   │   └── validation.ts               # Request validation
│   ├── types/
│   │   └── chart.ts                    # TypeScript interfaces
│   └── utils/
│       └── logger.ts                   # Server-side logging (no user exposure)
├── tests/
│   ├── unit/
│   │   ├── normalizationService.test.ts
│   │   ├── locationService.test.ts
│   │   └── validation.test.ts
│   ├── integration/
│   │   ├── hdCalculationAPI.test.ts    # Mock HD API calls
│   │   └── emailStorage.test.ts        # Database operations
│   └── contract/
│       └── api-contract.test.ts        # OpenAPI schema validation
├── .env.example
├── package.json (or requirements.txt)
├── tsconfig.json (or pyproject.toml)
└── Dockerfile

contracts/
├── openapi.yaml                        # POST /api/hd-chart endpoint spec
└── README.md                           # Contract documentation

shared/
├── types.ts (optional)                 # Shared TypeScript types if monorepo
└── constants.ts (optional)             # Shared constants (usually duplicated)
```

**Structure Rationale**:
- Separated frontend/backend allows independent deployment (Vercel vs Railway)
- Frontend is Next.js App Router with modern React patterns
- Backend abstracts HD calculation via normalization service
- Database migrations managed separately from application code
- Test structure mirrors source structure (unit/integration/contract/visual)
- Contracts folder documents API boundaries for frontend/backend teams
- design/ folder contains centralized color system for consistency

## Complexity Tracking

No constitution violations detected. All complexity is justified by specification requirements and deployment platform constraints (Vercel frontend / Railway backend separation). No complexity tracking table needed.

---

## Phase 0: Research & Unknowns Resolution

**Status**: Ready to execute

**Research Tasks**:

1. **Backend Language Selection**: Node.js (Express) vs. Python (FastAPI)
   - Evaluate: setup speed, Railway support, type safety, team expertise
   - Decision criteria: Fastest MVP path, maintainability, HD API client library availability
   - Output: Language choice + initial project template

2. **HD Calculation API Evaluation**: Identify external API provider for MVP
   - Research available HD calculation APIs (e.g., PyxtalAI, Human Design Data Center, custom providers)
   - Evaluate: Accuracy, API documentation, pricing, geographic support, response formats
   - Decision criteria: Data accuracy, API stability, documentation quality
   - Output: Selected API + integration approach, example response structure

3. **Location Geocoding Service**: Autocomplete + coordinates service
   - Research: Google Maps API, OpenStreetMap Nominatim, other providers
   - Evaluate: Cost, accuracy, free tier limits, response latency
   - Decision criteria: Cost for MVP scale, developer experience, fallback strategy
   - Output: Selected service + integration plan (or text-only fallback)

4. **Design System & Color Palette**: NOIO branding colors for Bodygraph
   - Research: NOIO existing brand colors, design guidelines, accessibility standards
   - Evaluate: Contrast ratios for defined/open centers, accent colors, mobile readability
   - Decision criteria: Brand alignment, WCAG AA compliance, mobile visibility
   - Output: `design/color-system.md` with hex codes, usage rules, accessibility notes

5. **SVG vs Canvas for Bodygraph**: Technology choice for visualization
   - Research: Performance characteristics, responsive scaling, browser support
   - Evaluate: SVG (vector scaling, CSS styling), Canvas (performance, animation), React libraries
   - Decision criteria: Mobile rendering, maintainability, design polish
   - Output: Selected approach + React library recommendation (e.g., `react-svg`, D3.js, custom SVG)

6. **Database Schema Design**: PostgreSQL for email lead capture
   - Research: Email storage best practices, validation, indexing
   - Evaluate: Nullable fields, timestamps, GDPR-ready structure
   - Decision criteria: Simple MVP design, future Phase 2 expansion (consent, opt-in)
   - Output: Migration scripts + data model definition

**Deliverable**: `research.md` with all decisions documented, including alternatives considered and rationale.

---

## Phase 1: Design & Contracts

**Prerequisites**: Phase 0 research completed

**Deliverables**:

### 1. Data Model (`data-model.md`)

**Entities**:

- **ChartRequest** (ephemeral, not persisted)
  - firstName: string (5-50 chars)
  - birthDate: string (TT.MM.JJJJ format)
  - birthTime: string (HH:MM format, 24-hour)
  - birthTimeApproximate: boolean (default: false)
  - birthLocation: string (free text, e.g., "Berlin, Germany")

- **ChartResponse** (ephemeral, computed from HD API)
  - firstName: string
  - type: { code: string, label: string, shortDescription: string }
  - authority: { code: string, label: string, decisionHint: string }
  - profile: { code: string, shortDescription: string }
  - centers: [{ name: string, code: string, defined: boolean }]
  - channels: [{ code: string }]
  - gates: { conscious: [{ code: string }], unconscious: [{ code: string }] }
  - incarnationCross: { code: string, name: string, gates: [string] }
  - shortImpulse: string

- **LeadEmail** (persisted in PostgreSQL)
  - id: UUID (primary key)
  - email: string (RFC 5322 validated)
  - createdAt: timestamp
  - source: string (default: "hd-chart-generator")
  - status: enum (default: "pending") — for Phase 2 consent tracking

**Validation Rules**:
- birthDate: Must not be in future, valid day/month/year combinations
- birthTime: Range 00:00–23:59
- email: RFC 5322 standard validation

**State Transitions**:
- Form empty → (user fills) → Form filled → (user submits) → Loading → Chart displayed OR Error message

### 2. API Contracts (`contracts/openapi.yaml`)

**Endpoint**: `POST /api/hd-chart`

**Request**:
```json
{
  "firstName": "string (5-50)",
  "birthDate": "string (TT.MM.JJJJ)",
  "birthTime": "string (HH:MM)",
  "birthTimeApproximate": "boolean",
  "birthPlace": "string"
}
```

**Response (200)**:
```json
{
  "firstName": "string",
  "type": { "code": "string", "label": "string", "shortDescription": "string" },
  "authority": { "code": "string", "label": "string", "decisionHint": "string" },
  "profile": { "code": "string", "shortDescription": "string" },
  "centers": [...],
  "channels": [...],
  "gates": {...},
  "incarnationCross": {...},
  "shortImpulse": "string"
}
```

**Response (400 - Validation Error)**:
```json
{
  "error": "Ungültiges Datum. Bitte prüfen Sie Tag und Monat.",
  "field": "birthDate"
}
```

**Response (500 - HD API Unavailable)**:
```json
{
  "error": "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."
}
```

**Endpoint**: `POST /api/email-capture` (optional, basic MVP)

**Request**:
```json
{
  "email": "string (RFC 5322 validated)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Vielen Dank für dein Interesse an einem Business Reading."
}
```

### 3. Quickstart (`quickstart.md`)

**Local Development Setup**:
1. Clone repository
2. Frontend: `cd frontend && npm install && npm run dev`
3. Backend: `cd backend && npm install && npm run dev`
4. Environment variables: `.env.example` → `.env.local`
5. Database: Run migrations (`npm run migrate`)
6. Access http://localhost:3000 (frontend) and http://localhost:5000 (backend)

**Test Verification**:
```bash
# Frontend tests
npm run test --prefix frontend

# Backend tests
npm run test --prefix backend

# Integration tests
npm run test:integration

# Visual regression (Bodygraph)
npm run test:visual --prefix frontend
```

### 4. Agent Context Update

Run: `.specify/scripts/bash/update-agent-context.sh claude`

This script updates appropriate agent-specific context files with new technology choices from Phase 0 research (backend language, HD API, database schema, etc.).

---

## Constitution Check (Post-Phase-1)

*GATE: Re-evaluate after Phase 1 design.*

- ✅ Specification-First Design: Phase 0 research validates all unknowns before code starts
- ✅ Minimalist UI: Data model and API design eliminate non-essential fields
- ✅ Quality Output: Normalization service ensures HD data accuracy; email storage simple MVP
- ✅ API-Agnostic: Normalization layer fully decouples frontend from HD provider
- ✅ Error-First: All error responses defined in OpenAPI contracts with German messages

**GATE RESULT**: ✅ **PASS** - Phase 1 design maintains constitution alignment.
