# Phase 0 Research: Human Design Chart Generator

**Branch**: `001-hd-chart-generator` | **Date**: 2025-11-23 | **Status**: Template (Ready for execution)

**Purpose**: Resolve all technical unknowns before Phase 1 design. This document captures research findings, decisions, alternatives evaluated, and rationale for each technical choice.

---

## 1. Backend Language Selection (Node.js vs Python)

**Research Question**: Which backend runtime provides fastest MVP implementation while maintaining type safety and maintainability on Railway?

### Decision: [TBD - TO BE COMPLETED IN PHASE 0 EXECUTION]

**Candidate Options**:
- **Node.js + Express**: Fast setup, strong TypeScript support, excellent Railway integration, familiar to frontend team
- **Python + FastAPI**: Modern async framework, strong HD community libraries, Railway support, excellent documentation

**Evaluation Criteria**:
- Setup speed for MVP (scaffolding, initial project)
- Type safety (TypeScript vs Pydantic)
- Railway deployment experience and documentation
- Available HD calculation API client libraries
- Team expertise and onboarding speed
- Database ORM options (Prisma vs SQLAlchemy/Tortoise)

**Research Tasks**:
- [ ] Compare project scaffold time (Node vs Python)
- [ ] Evaluate HD API client library availability in both languages
- [ ] Test Railway deployment process for both stacks
- [ ] Review existing NOIO backend technology choices (if any)
- [ ] Assess team Python vs Node.js expertise

**Rationale** (will be filled after research):
[Decision and reasoning goes here]

**Alternatives Considered**:
[Other technologies evaluated but not selected]

---

## 2. HD Calculation API Provider Selection

**Research Question**: Which external Human Design calculation API provides best accuracy, documentation, and cost for MVP?

### Decision: [TBD - TO BE COMPLETED IN PHASE 0 EXECUTION]

**Candidate Providers**:
- **PyxtalAI** (if available): HD calculations with API access
- **Human Design Data Center**: Official HD calculations
- **Custom Open Source**: Build from HD algorithm specifications
- **Other Third-party APIs**: Evaluate market options

**Evaluation Criteria**:
- Calculation accuracy and consistency with HD standards
- API documentation quality and completeness
- Response time for chart generation (<3 seconds total)
- Pricing model (free tier for MVP development?)
- Geographic coverage (works for international birth locations)
- Response format and mapping to our normalized JSON structure
- SLA and uptime guarantees
- Support for all 5 Types and 7 Authorities

**Research Tasks**:
- [ ] Inventory available HD calculation APIs in market
- [ ] Test each API with sample birth data (verify accuracy)
- [ ] Compare API response structures and field coverage
- [ ] Evaluate pricing models and free tier limitations
- [ ] Check API documentation depth and developer support
- [ ] Test integration effort (create sample normalization mapping)

**Rationale** (will be filled after research):
[Decision and reasoning goes here]

**Alternatives Considered**:
[Other providers evaluated but not selected]

**Integration Approach**:
[Technical approach for calling HD API from backend service]

---

## 3. Location Geocoding Service Selection

**Research Question**: Which geocoding service provides best balance of cost, accuracy, and fallback simplicity for MVP?

### Decision: [TBD - TO BE COMPLETED IN PHASE 0 EXECUTION]

**Candidate Services**:
- **Google Maps API (Geocoding)**: Accurate, well-documented, paid with free tier
- **OpenStreetMap Nominatim**: Free, open-source, community-maintained
- **No geocoding (free-text only)**: Simplest MVP approach, external HD API accepts location names

**Evaluation Criteria**:
- Setup cost and free tier limitations
- Geocoding accuracy for German cities
- Response latency (<500ms)
- Rate limiting and daily request quota
- Fallback strategy if service unavailable
- Whether external HD API requires coordinates or accepts location text

**Research Tasks**:
- [ ] Test Google Maps Geocoding API with German city samples
- [ ] Test OpenStreetMap Nominatim with same samples
- [ ] Verify if HD calculation API requires coordinates or accepts text location
- [ ] Compare response times and error handling
- [ ] Evaluate cost for MVP user volume (estimated users/day)
- [ ] Design fallback strategy for service failures

**Rationale** (will be filled after research):
[Decision and reasoning goes here]

**Fallback Approach**:
[How system behaves if geocoding unavailable]

**Alternatives Considered**:
[Other services evaluated but not selected]

---

## 4. Design System & Bodygraph Color Palette

**Research Question**: Which NOIO brand colors should be used for Bodygraph defined centers, open centers, accents, and text to ensure WCAG AA compliance and mobile readability?

### Decision: [TBD - TO BE COMPLETED IN PHASE 0 EXECUTION]

**Bodygraph Color Requirements**:
- Defined centers (filled/colored): Primary brand color
- Open centers (white/empty): Light background or transparent
- Center labels/text: Dark text (sufficient contrast)
- Channel lines: Medium gray or brand secondary color
- Gates (points on channels): Subtle accent color
- Error states: Red or brand warning color
- Accessibility: WCAG AA contrast ratios (4.5:1 minimum)

**Research Tasks**:
- [ ] Source NOIO brand guidelines (primary, secondary, accent colors)
- [ ] Extract hex codes and RGB values for all brand colors
- [ ] Test contrast ratios (defined centers vs. white background)
- [ ] Test contrast ratios (text on defined center backgrounds)
- [ ] Verify readability on mobile screens (small viewports)
- [ ] Test on different displays (bright sunlight, poor lighting)
- [ ] Create color accessibility matrix (WCAG AA/AAA compliance)

**Rationale** (will be filled after research):
[Decision and reasoning goes here]

**Output**: Create `frontend/design/color-system.md` with:
```yaml
primary:
  defined: "#XXXXXX"    # Bodygraph defined centers
  text: "#XXXXXX"       # Text on defined centers
secondary:
  open: "#XXXXXX"       # Open/empty centers
  lines: "#XXXXXX"      # Channel lines
accents:
  gates: "#XXXXXX"      # Gate points
  error: "#XXXXXX"      # Error messages
backgrounds:
  light: "#XXXXXX"      # Page background
  chart: "#XXXXXX"      # Chart container background
wcag_compliance:
  primary_text: "AA"    # Contrast ratio compliance level
  secondary_text: "AA"
```

---

## 5. Bodygraph Visualization Technology: SVG vs Canvas

**Research Question**: Should Bodygraph be rendered as SVG or Canvas for optimal mobile experience, maintainability, and design flexibility?

### Decision: [TBD - TO BE COMPLETED IN PHASE 0 EXECUTION]

**Candidate Approaches**:
- **SVG**: Vector graphics, CSS styling, responsive scaling, animated potential
- **Canvas**: Raster graphics, performant for complex visuals, less accessible
- **React SVG Library** (e.g., `react-svg`, custom SVG components): Maintainable React integration
- **D3.js**: Powerful data visualization library with steep learning curve
- **Recharts or similar**: High-level React charting library (may be overkill for single Bodygraph)

**Evaluation Criteria**:
- Mobile responsiveness and scaling without quality loss
- CSS styling and dark mode support
- Animation potential (Phase 2+)
- Accessibility (SVG better for screen readers)
- Performance (SVG lightweight, no redraw overhead)
- Developer maintenance and readability
- Design polish and customization
- Browser support (including older browsers)

**Research Tasks**:
- [ ] Benchmark SVG vs Canvas rendering performance
- [ ] Test SVG responsiveness across mobile viewport sizes
- [ ] Evaluate React SVG component libraries
- [ ] Prototype basic Bodygraph in SVG (simple PoC)
- [ ] Test accessibility (screen reader compatibility)
- [ ] Evaluate animation capabilities for Phase 2+
- [ ] Compare code maintainability in React (SVG vs Canvas)
- [ ] Check CSS styling capabilities for both approaches

**Rationale** (will be filled after research):
[Decision and reasoning goes here]

**Recommended Approach**:
[SVG + React component, or Canvas + library, with specific library recommendation]

**Alternatives Considered**:
[Other visualization approaches evaluated but not selected]

---

## 6. PostgreSQL Schema Design for Email Lead Capture

**Research Question**: How should email lead capture table be designed to support MVP basic storage while allowing Phase 2 GDPR compliance expansion?

### Decision: [TBD - TO BE COMPLETED IN PHASE 0 EXECUTION]

**Schema Requirements (MVP)**:
- Unique email storage (prevent duplicates)
- Timestamp tracking (createdAt)
- Source tracking (future campaigns)
- Simple status enum (pending, for Phase 2)

**Phase 2 Expansion Fields** (not created in MVP, but schema designed to support):
- Consent timestamp
- Double opt-in status
- Marketing preferences
- Unsubscribe status
- Last engagement date

**Research Tasks**:
- [ ] Design table schema (columns, types, constraints)
- [ ] Implement email uniqueness constraint (unique index)
- [ ] Design migration scripts (Knex, Prisma, Alembic)
- [ ] Create sample queries (insert, read, update)
- [ ] Plan Phase 2 expansion (new columns without migration risk)
- [ ] Implement soft-delete pattern (for GDPR deletion requests Phase 2+)
- [ ] Design backup and recovery strategy

**Rationale** (will be filled after research):
[Decision and reasoning goes here]

**Output**: Migration script + data model definition

**Example Schema** (will be refined):
```sql
CREATE TABLE lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(50) DEFAULT 'hd-chart-generator',
  status ENUM('pending', 'opted-in', 'unsubscribed') DEFAULT 'pending',
  deleted_at TIMESTAMP NULL -- for soft deletes (Phase 2+)
);
```

---

## Summary Table

| Research Topic | Decision | Rationale | Impact |
|---|---|---|---|
| Backend Language | [TBD] | [TBD] | Architecture, deployment, team productivity |
| HD Calculation API | [TBD] | [TBD] | Chart accuracy, response time, cost |
| Geocoding Service | [TBD] | [TBD] | Location handling, cost, fallback strategy |
| Color Palette | [TBD] | [TBD] | Brand consistency, accessibility, UX |
| Bodygraph Tech | [TBD] | [TBD] | Performance, maintainability, design flexibility |
| Email Schema | [TBD] | [TBD] | Data storage, Phase 2 expansion, GDPR readiness |

---

## Next Steps

1. **Execute all research tasks** listed under each topic
2. **Document findings** in each Decision section (with links to external research if applicable)
3. **Finalize decisions** with clear rationale and alternatives considered
4. **Update Phase 1 planning** with research outputs (backend language choice, API details, color hex codes, etc.)
5. **Proceed to Phase 1** (Design & Contracts) once all decisions documented
