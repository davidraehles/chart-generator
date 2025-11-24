# Implementation Plan: Ephemeris Data Integration for Human Design Calculations

**Branch**: `002-add-ephemeris-sources` | **Date**: 2025-11-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-add-ephemeris-sources/spec.md`

## Summary

Integrate open-source ephemeris calculation sources into the Human Design chart generator backend to enable accurate planetary position calculations. The feature will support multiple ephemeris sources (Swiss Ephemeris as primary, with OpenAstro API and NASA JPL as alternatives), calculate both Personality (birth) and Design (88° solar arc before birth) charts, and map ecliptic coordinates to Human Design gates and lines. This provides the foundational astronomical calculation layer required by feature 001-hd-chart-generator.

## Technical Context

**Language/Version**: Python 3.11.0
**Primary Dependencies**: FastAPI 0.115.0, pyswisseph (Swiss Ephemeris Python wrapper), httpx 0.28.0 (for API fallbacks)
**Storage**: PostgreSQL 2.0.36 via SQLAlchemy (for caching calculated positions, ephemeris source configuration)
**Testing**: pytest (backend unit + integration tests), contract tests for API consistency
**Target Platform**: Linux server (Railway deployment per DEPLOYMENT.md)
**Project Type**: Web application (backend API service)
**Performance Goals**: <2 seconds for full chart calculation (birth + design positions for 13 celestial bodies)
**Constraints**: <200MB memory footprint for ephemeris data files, offline-capable (no required external API calls)
**Scale/Scope**: Support 100 concurrent calculation requests, date range 3000 BCE to 3000 CE

**Key Technical Decisions**:
- **Swiss Ephemeris** as primary source: Most accurate, NASA JPL-based, industry standard for HD calculations
- **Ephemeris files**: Bundled with backend deployment (~50-100MB) for offline operation
- **Julian Day conversion**: Required for ephemeris calculations, handled by pyswisseph library
- **Gate/Line mapping**: Lookup table approach using pre-calculated degree boundaries (360° / 64 gates)
- **Design chart calculation**: Solar arc method - calculate sun position 88° before birth time
- **Source abstraction**: Service layer pattern to enable switching between Swiss Ephemeris, OpenAstro API, NASA JPL

**NEEDS CLARIFICATION**:
- Which specific pyswisseph Python wrapper to use (multiple exist on PyPI)
- Exact degree-to-gate mapping table source (official HD literature reference)
- Caching strategy: Cache all calculations vs. cache only for repeated requests
- Error handling: Fallback to alternative source on primary failure, or fail fast?
- Ephemeris file deployment: Include in Docker image vs. download on first start

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Core Principles

**✅ I. Specification-First Design**: Feature has complete, testable specification with clear acceptance criteria and success metrics. No code will be written before research and design phases complete.

**✅ II. Minimalist User Interface**: This is a backend calculation service with no direct UI. Aligns with constitution by providing accurate, simple data to frontend without exposing complexity.

**✅ III. Quality Output, Not Feature Completeness**: Focus on accurate calculations for core HD elements (13 celestial bodies, 64 gates, 6 lines) rather than adding esoteric elements. Accuracy is prioritized over breadth.

**✅ IV. API-Agnostic Backend**: This feature implements the abstraction layer for ephemeris sources. Backend will expose normalized JSON interface regardless of calculation source, enabling future source changes without frontend impact.

**✅ V. Error-First Experience Design**: All error cases (invalid dates, calculation failures, source unavailability) will return structured errors to frontend with actionable messages. Graceful degradation supported via multiple source fallbacks.

### Scope Boundary Compliance

**✅ Included in MVP**: Planetary position calculations for birth and design charts - core requirement for feature 001
**✅ NOT Included (Phase 2+)**: Relationship/composite charts, historical chart comparison, planetary interpretation text
**✅ No Data Persistence Concerns**: Calculation results are ephemeral (returned to frontend); only configuration and optional caching stored

### Development Workflow Gates

- [x] **Specification quality checklist passed**: Completed in spec phase (see checklists/requirements.md)
- [x] **All NEEDS CLARIFICATION resolved**: Completed in Phase 0 research (see research.md)
- [x] **Testing strategy defined**: Unit tests (calculation accuracy), integration tests (source switching), contract tests (API format)
- [x] **Performance gates identified**: <2s calculation time, <200MB memory, 100 concurrent requests

### Post-Design Constitution Re-Check (Phase 1 Complete)

**✅ All Core Principles Maintained**: After completing research and design phases:
- Specification-first approach followed throughout
- Backend remains agnostic with clear contracts
- Quality prioritized (fail-fast error handling, validated against reference charts)
- No scope creep (MVP boundaries respected)
- Error-first design implemented in all contracts

**✅ Technical Decisions Align**:
- pyswisseph library choice supports offline operation and accuracy
- Fail-fast error handling avoids silent failures
- Optional caching doesn't violate simplicity (Redis graceful degradation)
- Bundled ephemeris files ensure reliability without complexity

**✅ No New Violations Introduced**: Design phase maintained simplicity and constitution alignment.

### Violations / Complexity Justification

*No violations detected.* This feature adds necessary backend infrastructure without introducing unnecessary complexity. The multi-source abstraction is justified by reliability requirements and aligns with principle IV.

## Project Structure

### Documentation (this feature)

```text
specs/002-add-ephemeris-sources/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (library selection, mapping tables, caching strategy)
├── data-model.md        # Phase 1 output (PlanetaryPosition, EphemerisConfig, ChartCalculation models)
├── quickstart.md        # Phase 1 output (dev setup, test calculation, verify sources)
├── contracts/           # Phase 1 output (calculation request/response schemas)
│   ├── calculate-chart-request.json   # POST /api/calculate-chart
│   └── calculate-chart-response.json  # Normalized planetary positions + gate/line mappings
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                      # FastAPI app entry point
│   ├── models/
│   │   ├── chart.py                 # ChartRequest, ChartResponse, PlanetaryPosition
│   │   ├── ephemeris.py             # EphemerisSource configuration model
│   │   └── human_design.py          # Gate, Line, HDActivation models
│   ├── services/
│   │   ├── ephemeris/
│   │   │   ├── __init__.py          # Abstract base class for ephemeris sources
│   │   │   ├── swiss_ephemeris.py   # Primary source implementation
│   │   │   ├── openastro_api.py     # API-based fallback source
│   │   │   └── source_factory.py    # Factory pattern for source selection
│   │   ├── calculation/
│   │   │   ├── julian_day.py        # Date/time to Julian Day conversion
│   │   │   ├── design_chart.py      # 88° solar arc calculation
│   │   │   └── chart_calculator.py  # Main orchestration service
│   │   └── mapping/
│   │       ├── gate_mapper.py       # Ecliptic degree → HD gate/line
│   │       └── mapping_tables.py    # Static lookup tables (64 gates × 6 lines)
│   └── api/
│       └── routes/
│           └── chart.py             # POST /api/calculate-chart endpoint
├── data/
│   └── ephemeris/                   # Swiss Ephemeris data files (bundled)
│       ├── seas_18.se1              # Planet data files
│       └── ...                      # Additional ephemeris files
└── tests/
    ├── unit/
    │   ├── test_julian_day.py       # Date conversion accuracy
    │   ├── test_gate_mapper.py      # Mapping table correctness
    │   └── test_design_calc.py      # 88° solar arc calculation
    ├── integration/
    │   ├── test_ephemeris_sources.py  # Source switching and fallbacks
    │   └── test_chart_calculation.py  # End-to-end chart generation
    └── contract/
        └── test_api_contracts.py    # Request/response schema validation

frontend/
└── services/
    └── chartApi.ts                  # Updated to call new /api/calculate-chart endpoint
```

**Structure Decision**: Standard web application structure with backend API services. The ephemeris integration extends the existing backend with new services under `src/services/ephemeris/` and `src/services/calculation/`. This maintains separation of concerns and allows independent testing of each component. Ephemeris data files are deployed with the backend in `data/ephemeris/` directory.

## Complexity Tracking

*No constitution violations requiring justification.*

The feature introduces necessary technical complexity (multiple ephemeris sources, Julian Day conversion, gate mapping) that is inherent to astronomical calculations. This complexity is:
- **Isolated**: Contained within backend services, not exposed to frontend or users
- **Justified**: Required for accuracy and reliability (multiple sources prevent single point of failure)
- **Testable**: Each component (source, calculation, mapping) is independently testable
- **Aligned**: Supports Constitution Principle IV (API-agnostic backend with source abstraction)

## Next Steps

**Phase 0 - Research**: Resolve NEEDS CLARIFICATION items by researching:
1. Optimal pyswisseph wrapper (evaluate pyswisseph vs. swisseph packages)
2. Official HD gate/line degree mapping tables (from HD literature)
3. Caching strategy analysis (performance vs. storage tradeoffs)
4. Error handling and fallback patterns (fail-fast vs. graceful degradation)
5. Ephemeris file deployment approach (Docker bundling vs. runtime download)

**Phase 1 - Design**: Generate data models, API contracts, and quickstart guide after research complete.

**Phase 2 - Tasks**: Use `/speckit.tasks` to generate implementation task list.
