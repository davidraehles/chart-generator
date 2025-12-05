# Feature Specification: Advanced Calculations (Returns & Composites)

**Feature Branch**: `003-advanced-calculations`
**Created**: 2025-11-28
**Status**: Draft
**Input**: User description: "Implement Planetary Returns (Saturn, Chiron) and Composite Charts (relationship calculations)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Planetary Returns (Priority: P1)

As a user, I want to calculate significant planetary returns (specifically Saturn and Chiron) so that I can understand major life cycles.

**Why this priority**: Returns are key milestones in Human Design and Astrology analysis, often requested by users for life planning.

**Independent Test**: Can be tested by providing a birth date and verifying the calculated return dates against a standard ephemeris.

**Acceptance Scenarios**:

1. **Given** a birth date of 1985-05-21, **When** I request the 1st Saturn Return, **Then** the system returns the date/time when Saturn returns to its natal position (approx. 29.5 years later).
2. **Given** a birth date of 1975-01-01, **When** I request the Chiron Return, **Then** the system returns the date/time when Chiron returns to its natal position (approx. 50 years later).
3. **Given** a request for a return, **When** the calculation is performed, **Then** the result includes the exact date and time of the return.

---

### User Story 2 - Composite Charts (Priority: P2)

As a user, I want to generate a composite chart from two birth data sets so that I can analyze the relationship dynamics between two people.

**Why this priority**: Relationship analysis is a high-value feature for advanced users and professionals.

**Independent Test**: Can be tested by providing two sets of birth data and verifying the resulting chart contains positions that are the midpoints of the input positions.

**Acceptance Scenarios**:

1. **Given** two valid birth data sets (Person A and Person B), **When** I request a composite chart, **Then** the system calculates the midpoint for each planetary position (e.g., Sun A + Sun B / 2).
2. **Given** the calculated midpoints, **When** the chart is generated, **Then** the system maps these midpoints to Human Design Gates and Lines.
3. **Given** a composite chart, **When** displayed, **Then** it shows the combined Type, Authority, and Channels derived from the composite definition.

---

### Edge Cases

- What happens when the midpoint calculation crosses 0°/360° (Aries point)? (Shortest arc must be used).
- What happens when a return happens multiple times due to retrograde motion? (Usually the first crossing or all three are relevant; default to first for MVP).
- How does the system handle "far apart" birth locations for composite charts? (Midpoint of coordinates or relocation? Standard is usually midpoint of positions, location less relevant for bodygraph unless calculating houses which HD doesn't use primarily).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate the date and time of the 1st and 2nd Saturn Return for a given birth chart.
- **FR-002**: System MUST calculate the date and time of the Chiron Return for a given birth chart.
- **FR-003**: System MUST calculate the midpoint position (shortest arc) between two coordinates for all 13 celestial bodies.
- **FR-004**: System MUST generate a full Human Design chart (Gates, Lines, Centers, Channels, Type, Authority) based on composite planetary positions.
- **FR-005**: System MUST accept two full sets of birth data (Date, Time, Location) for composite chart requests.

### Key Entities *(include if feature involves data)*

- **ReturnCalculation**: Represents a calculated return event (Planet, Return Number, Date/Time).
- **CompositeChart**: Represents a chart derived from two source charts, containing midpoint positions and resulting bodygraph.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Return dates calculated by the system match standard Swiss Ephemeris results within +/- 24 hours.
- **SC-002**: Composite chart positions match the mathematical midpoint of the input positions (shortest distance).
- **SC-003**: Users can generate a composite chart in under 3 seconds.
