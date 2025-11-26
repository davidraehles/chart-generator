# Tasks: Ephemeris Data Integration for Human Design Calculations

**Input**: Design documents from `/specs/002-add-ephemeris-sources/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT requested in the specification. Test tasks are included for validation but are optional based on development approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with backend/frontend separation per plan.md:
- **Backend**: `backend/src/` for source, `backend/tests/` for tests, `backend/data/` for ephemeris files
- **Frontend**: `frontend/src/services/` for API client updates

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and ephemeris file preparation

- [x] T001 Install pyswisseph dependency in backend/requirements.txt (add pyswisseph==2.10.3.2)
- [x] T002 Create ephemeris data directory at backend/data/ephemeris/
- [x] T003 [P] Download Swiss Ephemeris files (seas_18.se1, semo_18.se1, sepl_18.se1) to backend/data/ephemeris/
- [x] T004 [P] Configure ephemeris environment variables in backend/.env.example (EPHEMERIS_SOURCE, EPHEMERIS_PATH)
- [x] T005 [P] Create backend/src/services/ephemeris/ directory structure
- [x] T006 [P] Create backend/src/services/calculation/ directory structure
- [x] T007 [P] Create backend/src/services/mapping/ directory structure
- [x] T008 [P] Create backend/src/api/routes/ directory (if not exists)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create base Pydantic models in backend/src/models/ephemeris.py (EphemerisConfig from data-model.md)
- [x] T010 [P] Create error models in backend/src/models/error.py (CalculationError from data-model.md)
- [x] T011 [P] Create celestial body enum in backend/src/models/celestial.py (CelestialBody enum from data-model.md)
- [x] T012 Implement ephemeris configuration loader in backend/src/services/ephemeris/__init__.py (load from environment)
- [x] T013 Create abstract ephemeris source base class in backend/src/services/ephemeris/base.py (define calculate_position interface)
- [x] T014 Implement Swiss Ephemeris source in backend/src/services/ephemeris/swiss_ephemeris.py (primary source using pyswisseph)
- [x] T015 Verify Swiss Ephemeris installation with test script backend/verify_ephemeris.py (from quickstart.md example)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Calculate Birth Chart Planetary Positions (Priority: P1) 🎯 MVP

**Goal**: Calculate accurate ecliptic positions for all 13 celestial bodies at birth moment

**Independent Test**: Provide birth datetime and verify all 13 planetary positions are returned with valid ecliptic longitudes (0-360°)

**Acceptance Criteria** (from spec.md):
1. Returns Sun's ecliptic longitude for given birth date/time/location
2. Returns positions for all 13 celestial bodies (Sun, Moon, 8 planets, North/South Node, Chiron)
3. Supports dates between 3000 BCE and 3000 CE

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create ChartRequest model in backend/src/models/chart.py (from data-model.md)
- [ ] T017 [P] [US1] Create PlanetaryPosition model in backend/src/models/chart.py (from data-model.md)
- [ ] T018 [US1] Implement Julian Day conversion in backend/src/services/calculation/julian_day.py (datetime to JD)
- [ ] T019 [US1] Implement planetary position calculator in backend/src/services/calculation/position_calculator.py (uses Swiss Ephemeris, iterates 13 bodies)
- [ ] T020 [US1] Create ChartResponse model stub in backend/src/models/chart.py (personality_activations placeholder)
- [ ] T021 [US1] Implement calculate-chart endpoint in backend/src/api/routes/chart.py (POST /api/calculate-chart)
- [ ] T022 [US1] Add request validation and error handling in backend/src/api/routes/chart.py (date range, coordinates, timezone)
- [ ] T023 [US1] Register chart routes in backend/src/main.py FastAPI app
- [ ] T024 [US1] Test endpoint manually with curl (use example from quickstart.md)

**Checkpoint**: At this point, User Story 1 should return planetary positions for birth moment

---

## Phase 4: User Story 2 - Calculate Design Chart Positions (Priority: P1)

**Goal**: Calculate planetary positions for Design chart (88° solar arc before birth)

**Independent Test**: Provide birth datetime and verify Design chart positions are calculated ~88 days before birth with all 13 bodies

**Acceptance Criteria** (from spec.md):
1. Determines point 88° of solar arc before birth
2. Calculates accurate planetary positions for that earlier moment
3. Returns both Personality (birth) and Design (88° before) positions

### Implementation for User Story 2

- [ ] T025 [US2] Implement 88° solar arc calculation in backend/src/services/calculation/design_chart.py (calculate sun position 88° before birth)
- [ ] T026 [US2] Create ChartCalculation model in backend/src/models/chart.py (combines personality + design positions)
- [ ] T027 [US2] Extend position calculator to support design chart in backend/src/services/calculation/position_calculator.py
- [ ] T028 [US2] Create chart orchestration service in backend/src/services/calculation/chart_calculator.py (calculates both personality + design)
- [ ] T029 [US2] Update calculate-chart endpoint to return both charts in backend/src/api/routes/chart.py
- [ ] T030 [US2] Update ChartResponse model in backend/src/models/chart.py (add design_activations, personality_datetime, design_datetime)
- [ ] T031 [US2] Verify both charts are returned correctly with test data

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - full planetary positions for birth + design

---

## Phase 5: User Story 4 - Map Planetary Positions to Human Design Gates and Lines (Priority: P2)

**Goal**: Translate ecliptic degrees to Human Design gates (1-64) and lines (1-6)

**Independent Test**: Provide known ecliptic longitude and verify it maps to correct gate and line according to HD wheel

**Acceptance Criteria** (from spec.md):
1. Returns correct gate number (1-64) for any ecliptic position
2. Returns correct line number (1-6) within the gate
3. Handles edge cases at gate boundaries correctly

### Implementation for User Story 4

- [ ] T032 [P] [US4] Create HDActivation model in backend/src/models/human_design.py (from data-model.md)
- [ ] T033 [P] [US4] Create gate order table in backend/src/services/mapping/mapping_tables.py (64 gates starting with Gate 41 at 0°)
- [ ] T034 [US4] Implement degree-to-gate converter in backend/src/services/mapping/gate_mapper.py (ecliptic → gate number)
- [ ] T035 [US4] Implement degree-to-line converter in backend/src/services/mapping/gate_mapper.py (position in gate → line 1-6)
- [ ] T036 [US4] Create mapping service in backend/src/services/mapping/hd_mapper.py (PlanetaryPosition → HDActivation)
- [ ] T037 [US4] Update chart calculator to apply mapping in backend/src/services/calculation/chart_calculator.py
- [ ] T038 [US4] Update ChartResponse to include gate/line activations in backend/src/models/chart.py
- [ ] T039 [US4] Verify mapping accuracy with test cases from quickstart.md (test known positions → expected gates/lines)

**Checkpoint**: At this point, charts should include gate and line activations, not just raw degrees

---

## Phase 6: User Story 3 - Support Multiple Ephemeris Source Options (Priority: P2)

**Goal**: Enable configuration and switching between different ephemeris calculation sources

**Independent Test**: Switch ephemeris source via configuration and verify calculations still produce valid results within tolerance

**Acceptance Criteria** (from spec.md):
1. System uses configured primary ephemeris source for calculations
2. Administrator can switch sources without code changes (via environment config)
3. Different sources provide positions accurate within acceptable tolerances

### Implementation for User Story 3

- [ ] T040 [P] [US3] Create OpenAstro API client in backend/src/services/ephemeris/openastro_api.py (HTTP client using httpx)
- [ ] T041 [P] [US3] Create NASA JPL client stub in backend/src/services/ephemeris/nasa_jpl.py (placeholder for future implementation)
- [ ] T042 [US3] Implement ephemeris source factory in backend/src/services/ephemeris/source_factory.py (selects source based on config)
- [ ] T043 [US3] Update chart calculator to use factory in backend/src/services/calculation/chart_calculator.py
- [ ] T044 [US3] Add source metadata to ChartResponse in backend/src/models/chart.py (calculation_source field)
- [ ] T045 [US3] Test source switching by changing EPHEMERIS_SOURCE environment variable

**Checkpoint**: All user stories should now be independently functional with source flexibility

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T046 [P] Implement structured error responses for all failure cases in backend/src/api/routes/chart.py (use CalculationError model)
- [ ] T047 [P] Add German error messages to error responses in backend/src/api/routes/chart.py (per contracts/calculation-error-response.json)
- [ ] T048 [P] Implement optional Redis caching in backend/src/services/caching/chart_cache.py (24hr TTL, graceful degradation)
- [ ] T049 [P] Add caching to chart endpoint in backend/src/api/routes/chart.py (check cache before calculation)
- [ ] T050 [P] Update frontend API client in frontend/src/services/chartApi.ts (call /api/calculate-chart endpoint)
- [ ] T051 [P] Add API request/response logging in backend/src/api/routes/chart.py
- [ ] T052 [P] Create Dockerfile with bundled ephemeris files in backend/Dockerfile (COPY data/ephemeris/)
- [ ] T053 Run full quickstart.md validation (verify setup, calculations, reference chart comparison)
- [ ] T054 [P] Document API endpoint in backend/src/api/routes/chart.py docstrings (OpenAPI schema)
- [ ] T055 Performance testing: Verify <2s calculation time for full chart

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T008) - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion (T009-T015)
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 completion (extends position calculation with design chart)
- **User Story 4 (P2)**: Can start after Foundational - Independent of US1/US2 (just adds mapping layer)
- **User Story 3 (P2)**: Depends on US1 (extends with multiple sources)

### Within Each User Story

- Models before services
- Services before API endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase** (all can run in parallel):
- T002-T008: Directory creation, file downloads, configuration

**Foundational Phase** (these can run in parallel):
- T010: Error models
- T011: Celestial body enum

**User Story 1** (these can run in parallel):
- T016: ChartRequest model
- T017: PlanetaryPosition model

**User Story 4** (these can run in parallel):
- T032: HDActivation model
- T033: Gate order table

**User Story 3** (these can run in parallel):
- T040: OpenAstro API client
- T041: NASA JPL client stub

**Polish Phase** (most can run in parallel):
- T046-T047: Error handling
- T048-T049: Caching
- T050: Frontend update
- T051: Logging
- T052: Docker
- T054: Documentation

---

## Parallel Example: User Story 1

```bash
# Launch models together:
Task: "[US1] Create ChartRequest model in backend/src/models/chart.py"
Task: "[US1] Create PlanetaryPosition model in backend/src/models/chart.py"

# Then sequentially:
Task: "[US1] Implement Julian Day conversion"
Task: "[US1] Implement planetary position calculator"
Task: "[US1] Create calculate-chart endpoint"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only - Core Calculations)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T015) ← CRITICAL BLOCKING PHASE
3. Complete Phase 3: User Story 1 (T016-T024) ← Birth chart positions
4. Complete Phase 4: User Story 2 (T025-T031) ← Design chart positions
5. Complete Phase 5: User Story 4 (T032-T039) ← Gate/line mapping
6. **STOP and VALIDATE**: Test complete charts with gate/line activations
7. Deploy/demo if ready

**MVP Scope**:
- Calculates accurate planetary positions for birth and design moments
- Maps positions to HD gates and lines
- Returns complete chart via API
- Uses Swiss Ephemeris (primary source)

**NOT in MVP** (Phase 2+):
- Multiple ephemeris sources (US3)
- Caching optimization
- Relationship/composite charts

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Birth chart positions → Test independently
3. Add User Story 2 → Design chart positions → Test both charts
4. Add User Story 4 → Gate/line mapping → Test complete HD chart → **Deploy/Demo (MVP!)**
5. Add User Story 3 → Multiple sources → Test source switching → Deploy/Demo
6. Add Polish → Caching, errors, Docker → Deploy/Demo

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T015)
2. Once Foundational is done:
   - Developer A: User Story 1 (T016-T024) ← Birth positions
   - Developer B: User Story 4 (T032-T039) ← Mapping (independent)
3. After US1 completes:
   - Developer A: User Story 2 (T025-T031) ← Design positions (depends on US1)
4. After US1+US2 complete:
   - Developer A or B: User Story 3 (T040-T045) ← Multiple sources
5. Polish phase can be split among team

---

## Validation Checkpoints

### After Foundational Phase (T015)
✓ Swiss Ephemeris loads correctly
✓ Can calculate single planetary position
✓ Environment configuration works

### After User Story 1 (T024)
✓ API endpoint returns 13 planetary positions for birth moment
✓ All ecliptic longitudes are valid (0-360°)
✓ Dates within 3000 BCE - 3000 CE work correctly

### After User Story 2 (T031)
✓ Design chart positions calculated ~88 days before birth
✓ Both personality and design charts returned together
✓ All 26 positions present (13 per chart)

### After User Story 4 (T039)
✓ Every position maps to valid gate (1-64) and line (1-6)
✓ Test cases from quickstart.md pass
✓ Compare against reference HD charts for accuracy

### After User Story 3 (T045)
✓ Can switch between Swiss Ephemeris and OpenAstro API
✓ Results from different sources within acceptable tolerance
✓ Source metadata included in response

### After Polish (T055)
✓ All error cases return structured German messages
✓ Caching improves repeat request performance
✓ Quickstart guide validation passes
✓ Performance goal met (<2s per chart)
✓ Docker image builds with bundled ephemeris files

---

## Task Summary

**Total Tasks**: 55 tasks
- **Setup**: 8 tasks (T001-T008)
- **Foundational**: 7 tasks (T009-T015)
- **User Story 1** (P1): 9 tasks (T016-T024)
- **User Story 2** (P1): 7 tasks (T025-T031)
- **User Story 4** (P2): 8 tasks (T032-T039)
- **User Story 3** (P2): 6 tasks (T040-T045)
- **Polish**: 10 tasks (T046-T055)

**Parallel Opportunities**: 20 tasks marked [P] can run in parallel

**MVP Scope**: 31 tasks (Setup + Foundational + US1 + US2 + US4)

**Independent Test Criteria**:
- US1: Returns 13 planetary positions for birth
- US2: Returns 26 positions (birth + design)
- US4: All positions mapped to gates/lines
- US3: Source switching works without errors

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US2 depends on US1 (extends calculation)
- US3 depends on US1 (extends with sources)
- US4 is independent (just adds mapping layer)
- Tests are optional - focus on manual validation per checkpoints
- Verify against reference HD charts (MyBodyGraph, Genetic Matrix) per quickstart.md
