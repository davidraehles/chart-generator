# Feature Specification: Ephemeris Data Integration for Human Design Calculations

**Feature Branch**: `002-add-ephemeris-sources`
**Created**: 2025-11-24
**Status**: Draft
**Input**: User description: "Integration of open-source ephemeris sources for accurate planetary position calculations in Human Design app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calculate Birth Chart Planetary Positions (Priority: P1)

Users need accurate planetary positions calculated for their birth date, time, and location to generate their Human Design chart. The system must calculate the exact ecliptic longitude (0-360 degrees) for all relevant celestial bodies at the moment of birth.

**Why this priority**: This is the core functionality - without accurate planetary positions, no Human Design chart can be generated. This is the foundational calculation that all other features depend on.

**Independent Test**: Can be fully tested by providing a birth date/time/location and verifying that the system returns accurate planetary positions in ecliptic coordinates that match known astronomical data.

**Acceptance Scenarios**:

1. **Given** a user provides their birth date (May 21, 1985), time (14:30), and location, **When** the system calculates planetary positions, **Then** the system returns the Sun's ecliptic longitude in degrees (0-360)
2. **Given** a user requests a chart calculation, **When** the system processes the request, **Then** positions are calculated for all required celestial bodies (Sun, Moon, planets, lunar nodes, Chiron)
3. **Given** a birth time between 3000 BCE and 3000 CE, **When** the user requests calculations, **Then** the system provides accurate positions for that historical or future date

---

### User Story 2 - Calculate Design Chart Positions (Priority: P1)

Users need their Design chart calculated, which requires planetary positions from approximately 88 degrees of solar arc before their birth (roughly 3 months earlier). This represents the imprint moment in Human Design theory.

**Why this priority**: The Design chart is equally critical as the birth chart - Human Design requires both the Personality (birth) and Design (88° before birth) calculations. Without this, only half of a person's chart can be generated.

**Independent Test**: Can be fully tested by calculating the moment 88° of solar arc before a given birth time and verifying accurate planetary positions for that earlier moment.

**Acceptance Scenarios**:

1. **Given** a birth date and time, **When** the system calculates the Design chart moment, **Then** it determines the point approximately 88 degrees of solar arc before birth
2. **Given** the Design chart moment is determined, **When** planetary positions are calculated, **Then** accurate positions are returned for all celestial bodies at that earlier time
3. **Given** both Personality and Design calculations are complete, **When** the user views their chart, **Then** they see both sets of activations mapped to gates and lines

---

### User Story 3 - Support Multiple Ephemeris Source Options (Priority: P2)

Users and administrators need flexibility in choosing ephemeris calculation sources based on their requirements for accuracy, performance, cost, and ease of integration. Different deployment scenarios may favor different sources.

**Why this priority**: While accurate calculations are required (P1), the ability to choose between different ephemeris sources provides flexibility for development, testing, and different production scenarios. This is important but not blocking for MVP.

**Independent Test**: Can be tested by configuring different ephemeris sources and verifying that each produces astronomically accurate results within acceptable precision ranges.

**Acceptance Scenarios**:

1. **Given** the system is configured to use a primary ephemeris source, **When** calculations are requested, **Then** planetary positions are calculated using that source
2. **Given** an administrator wants to switch ephemeris sources, **When** the configuration is updated, **Then** subsequent calculations use the new source without code changes
3. **Given** different ephemeris sources are available, **When** comparing results, **Then** all sources provide positions accurate within acceptable tolerances for Human Design purposes

---

### User Story 4 - Map Planetary Positions to Human Design Gates and Lines (Priority: P2)

Users need planetary positions automatically translated into Human Design gates (1-64) and lines (1-6) based on the position's degree. Each degree range corresponds to a specific gate and line combination.

**Why this priority**: While calculating accurate positions is critical (P1), the mapping to gates and lines is what makes the data useful for Human Design. This is essential for a complete chart but can be developed after position calculation is working.

**Independent Test**: Can be tested by providing known ecliptic longitudes and verifying they map to the correct gate and line according to Human Design degree tables.

**Acceptance Scenarios**:

1. **Given** a planetary position in ecliptic degrees, **When** the system maps it to Human Design, **Then** it returns the correct gate number (1-64) and line number (1-6)
2. **Given** positions for all celestial bodies, **When** mapping is performed, **Then** each body's gate and line are accurately determined
3. **Given** edge cases at gate boundaries, **When** a position falls exactly on a boundary, **Then** the system handles it according to Human Design standards

---

### Edge Cases

- What happens when a birth time falls on a leap second or during a daylight saving time transition?
- How does the system handle dates near the limits of ephemeris data coverage (3000 BCE or 3000 CE)?
- What happens when a user provides an invalid or ambiguous location (e.g., timezone uncertainties)?
- How does the system handle celestial bodies that are in retrograde motion at the time of calculation?
- What happens if the ephemeris data source is temporarily unavailable or returns an error?
- How does the system handle births at extreme latitudes where timezone rules may be unusual?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate ecliptic longitude (0-360 degrees) for the Sun at any given date/time between 3000 BCE and 3000 CE
- **FR-002**: System MUST calculate positions for all celestial bodies used in Human Design (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, South Node, Chiron)
- **FR-003**: System MUST support calculation precision accurate to within acceptable tolerances for Human Design chart generation (positions accurate enough to determine correct gate and line)
- **FR-004**: System MUST calculate the Design chart moment (approximately 88 degrees of solar arc before birth) from any given birth date/time
- **FR-005**: System MUST provide planetary positions in ecliptic coordinate system (longitude in degrees)
- **FR-006**: System MUST support multiple ephemeris calculation sources (Swiss Ephemeris, NASA JPL Horizons, OpenAstro API, or equivalent)
- **FR-007**: System MUST allow configuration of which ephemeris source to use without code changes
- **FR-008**: System MUST convert date/time to Julian Day format for ephemeris calculations
- **FR-009**: System MUST map ecliptic longitude positions to Human Design gates (1-64) based on degree ranges
- **FR-010**: System MUST map positions within gates to lines (1-6) based on sub-degree precision
- **FR-011**: System MUST handle historical dates, including those before the Gregorian calendar transition
- **FR-012**: System MUST provide clear error messages when calculations cannot be performed (invalid dates, out of range, source unavailable)

### Key Entities

- **Planetary Position**: Represents the calculated location of a celestial body at a specific moment, including celestial body identifier, date/time, ecliptic longitude in degrees, and calculation source
- **Human Design Activation**: Represents a mapped position to Human Design format, including celestial body, gate number (1-64), line number (1-6), and whether it's from Personality (birth) or Design (88° before) chart
- **Ephemeris Source Configuration**: Defines which calculation source is active, including source identifier, required data files or API endpoints, precision characteristics, and availability status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate accurate Human Design charts that match results from established Human Design calculators (verified against at least 3 known reference charts)
- **SC-002**: Planetary position calculations complete within 2 seconds for any single chart request (birth + design calculations)
- **SC-003**: System provides astronomical accuracy sufficient for correct gate and line determination in 100% of test cases
- **SC-004**: System successfully calculates charts for dates spanning from 3000 BCE to 3000 CE without errors
- **SC-005**: Calculated positions remain consistent across different ephemeris sources within acceptable tolerance (positions vary by less than 0.01 degrees when comparing sources)
- **SC-006**: System handles at least 100 concurrent chart calculation requests without performance degradation
- **SC-007**: Chart calculations produce identical results for the same input parameters when repeated (deterministic results)

## Assumptions

- Ephemeris data files or API access will be available in the deployment environment
- Users provide birth time in local time with timezone information, or the system can determine timezone from location
- Standard astronomical definitions of celestial body positions are appropriate for Human Design calculations
- The 88-degree solar arc calculation for Design chart is a close approximation; exact calculation method follows Human Design standards
- Human Design gate and line boundaries follow established degree tables from Human Design literature
- Calculation precision to the nearest 0.01 degree is sufficient for accurate gate and line determination
- The system has sufficient computational resources to perform ephemeris calculations in real-time
