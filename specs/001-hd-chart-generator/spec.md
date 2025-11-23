# Feature Specification: Human Design Chart Generator

**Feature Branch**: `001-hd-chart-generator`
**Created**: 2025-11-23
**Status**: Draft
**Input**: User description: "Ein einfacher, klarer Human Design Chart Generator auf der Website, der Besucherinnen auf Basis ihrer Geburtsdaten einen reduzierten, hochwertigen Chart-Output liefert und Lust auf ein Business Reading macht."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Generate Personal HD Chart (Priority: P1)

A visitor comes to the website and wants to discover their Human Design Type and how it might help them make better decisions. They enter their birth information (date, time, location) and receive an instantly generated, personalized chart that shows their core HD profile without overwhelming complexity.

**Why this priority**: This is the core value proposition of the tool. Without this functionality, there is no tool at all. It's the primary user journey that converts visitors into engaged users who then become interested in deeper readings.

**Independent Test**: Can be fully tested by entering birth data via the form and verifying that a complete chart with all required elements (Type, Authority, Profile, Centers, Channels, Gates, Bodygraph) is displayed. This delivers the core MVP value.

**Acceptance Scenarios**:

1. **Given** a visitor on the HD Chart Generator page, **When** they fill in valid birth date (TT.MM.JJJJ), birth time (HH:MM), birth location, and click "Generate Chart", **Then** the form disappears and a personalized chart is displayed within 3 seconds with their name, Type, Authority, Profile, and visual Bodygraph.

2. **Given** the chart is displayed, **When** the visitor looks at the page, **Then** they see exactly 9 centered sections displayed (Kopf, Ajna, Kehlzentrum, G-Zentrum, Herz/Ego, Sakral, Wurzel, Milz, Solarplexus) with appropriate defined/open states.

3. **Given** a visitor with known birth time, **When** they fill in the exact time and submit, **Then** their chart includes all 64 gates distributed between conscious and unconscious.

---

### User Story 2 - Understand Decision Authority (Priority: P1)

A visitor with a generated chart wants to understand how they should make decisions based on their Human Design. The chart clearly shows their Authority type with concrete, non-esoteric guidance in German so they can immediately apply it.

**Why this priority**: Authority is one of the most practically useful aspects of HD for business/life decisions. Visitors specifically seek this tool to understand better decision-making. Without this, the tool is incomplete as a decision-support instrument.

**Independent Test**: Can be fully tested by generating a chart and verifying that the Authority section displays the correct authority type with a clear, actionable decision hint in German (no jargon). A visitor should understand what the authority means and how to apply it without needing additional explanation.

**Acceptance Scenarios**:

1. **Given** a chart is displayed, **When** a visitor reads the "Deine innere Autoritaet" section, **Then** they see an authority type (z.B. Emotional, Sacral, Self, etc.) with a 1-2 sentence decision hint that is clear, jargon-free, and actionable.

2. **Given** a visitor with Emotional Authority, **When** they read the decision hint, **Then** it explains they should wait for emotional clarity before deciding (or similar non-jargon guidance).

---

### User Story 3 - View Defined/Open Centers Visually (Priority: P1)

A visitor wants to quickly understand which life areas they navigate with certainty (defined centers) versus which areas require them to be open and learn from others (open centers). The visual Bodygraph makes this immediately apparent.

**Why this priority**: The visual bodygraph is the most distinctive aspect of Human Design and provides immediate, non-verbal understanding. It's a key differentiator of this tool and builds credibility. Many visitors are visual learners who grasp concepts faster through graphics than text.

**Independent Test**: Can be fully tested by generating a chart and verifying that the Bodygraph displays 9 centers with visual distinction (color/fill for defined, white/empty for open). The visual should be minimalist and professional, matching NOIO branding.

**Acceptance Scenarios**:

1. **Given** a chart with defined and open centers, **When** the visitor looks at the Bodygraph section, **Then** they immediately see which centers are colored (defined) and which are white/empty (open) without needing to read text.

2. **Given** the Bodygraph is displayed, **When** the page is viewed on a smartphone, **Then** the bodygraph is still clearly readable and takes up appropriate space (not too large, not too small).

---

### User Story 4 - Learn About Profile and Life Dynamics (Priority: P2)

A visitor wants to understand their personality pattern and life dynamics through their Profile number (e.g., 4/1). They see a short, relatable description of how this profile typically operates in life and relationships.

**Why this priority**: Profile adds important nuance to Type and Authority but is secondary to understanding the core Type first. Most visitors will read Type first, then want to understand the nuances.

**Independent Test**: Can be fully tested by verifying that the Profile section displays the correct code (two numbers, e.g., "4/1") with a one-sentence description of the life dynamic (e.g., "Du bist eine Netzwerkerin mit stabilem inneren Fundament"). No additional complexity required.

**Acceptance Scenarios**:

1. **Given** a chart with a 4/1 profile, **When** the visitor reads the Profile section, **Then** they see "4/1" and a description relating to their networking and foundational nature.

2. **Given** any profile code, **When** displayed, **Then** the description is one clear sentence that describes life dynamics, not astrological or technical details.

---

### User Story 5 - See Active Channels and Gates (Priority: P2)

A visitor wants to see which specific energy channels and gates are activated in their chart. These are presented as simple lists without interpretation or line meanings.

**Why this priority**: Channels and gates are important structural information for anyone interested in deeper exploration or working with an HD coach. Secondary to core Type/Authority but important for completeness and for visitors considering a Business Reading.

**Independent Test**: Can be fully tested by verifying that activated channels are displayed as a list (e.g., "34–20", "5–15") and conscious/unconscious gates are shown in two separate lists. No interpretation needed, just accurate data.

**Acceptance Scenarios**:

1. **Given** a generated chart, **When** the visitor scrolls to the Channels section, **Then** they see a list of activated channels in format "XX–YY" (hyphen, not dash).

2. **Given** the Gates section, **When** displayed, **Then** conscious gates and unconscious gates are in separate clearly labeled lists showing codes like "34.2", "20.5".

---

### User Story 6 - See Incarnation Cross (Priority: P2)

A visitor wants to know their Incarnation Cross, which represents their life purpose theme. They see the cross name and the associated gates but no additional esoteric interpretation.

**Why this priority**: Incarnation Cross is meaningful for many HD practitioners but less essential than Type/Authority/Profile for first-time visitors. It adds perceived completeness without overwhelming.

**Independent Test**: Can be fully tested by verifying that the Incarnation Cross name is displayed (e.g., "Right Angle Cross of Consciousness") with gates in parentheses below it.

**Acceptance Scenarios**:

1. **Given** a chart with an Incarnation Cross, **When** viewed, **Then** the section shows the cross name in clear font with gates listed as "(15/10/5/35)" below.

---

### User Story 7 - See Personalized Impulse/Message (Priority: P3)

A visitor reads a single, warm, personalized sentence that resonates with their specific Type and Authority combination. This message is motivational but not overpromising, serving as an invitation to deeper exploration.

**Why this priority**: This is an engagement/delight feature that makes the chart feel more personal. It's valuable for user experience but not essential for the core function. Can be deprioritized if time is limited.

**Independent Test**: Can be fully tested by verifying that a single sentence appears in the "Ein Satz fuer dich" section that is appropriate for the specific Type + Authority combination (e.g., MG + Emotional).

**Acceptance Scenarios**:

1. **Given** a chart for a Manifestante Generator with Emotional Authority, **When** the visitor reads the impulse section, **Then** they see a single sentence combining both aspects, e.g., "Wenn du deiner emotionalen Klarheit vertraust, kann deine Energie Wunder bewegen."

2. **Given** any valid Type + Authority combination, **When** a chart is generated, **Then** an appropriate impulse sentence appears (from predefined mapping in backend).

---

### User Story 8 - Try Chart with Approximate Birth Time (Priority: P3)

A visitor doesn't know their exact birth time or it's only approximate. They can check a box indicating this, and the system uses a default time (12:00) or adjusts the chart appropriately. The chart still provides value even if gates/channels are less accurate.

**Why this priority**: This lowers the barrier to entry for visitors who don't have exact birth data, increasing usage. However, accuracy suffers, so it's prioritized after core functionality works perfectly for known data.

**Independent Test**: Can be fully tested by checking the "Geburtszeit ungefaehr / unbekannt" box and verifying that a chart is still generated with a default time assumption, displaying all required sections.

**Acceptance Scenarios**:

1. **Given** a visitor without exact birth time, **When** they check "Geburtszeit ungefaehr / unbekannt" and leave time field blank or enter approximate time, **Then** the system accepts this and generates a chart using 12:00 as default.

2. **Given** an approximate time chart, **When** displayed, **Then** all sections show data but the visitor understands (via subtle messaging) that gates/channels may be less precise.

---

### User Story 9 - Lead Capture for Future Business (Priority: P3)

A visitor is impressed by their chart and wants to explore further. They can optionally enter their email to express interest in a Business Reading, building a lead list for future sales.

**Why this priority**: This is a business goal, not a core user need. Important for monetization but not for MVP delivery of the tool itself. Can be added in phase 2.

**Independent Test**: Can be fully tested by verifying that an optional email field is available, submission is validated, and emails are stored securely for future contact.

**Acceptance Scenarios**:

1. **Given** a completed chart, **When** the visitor sees an optional "Interesse an Business Reading?" section with email field, **Then** they can enter their email without it being required.

### Edge Cases

- What happens when a visitor enters an impossible date like 31.02.2020? → Form rejects with clear error message: "Ungültiges Datum. Bitte prüfen Sie Tag und Monat."
- What happens when the HD calculation backend is unreachable? → User sees friendly error: "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal." with option to retry.
- What happens when birth time is set to 24:00? → Form rejects as invalid (valid range 00:00–23:59): "Ungültige Zeit. Bitte nutze 24-Stunden-Format (00:00–23:59)."
- What happens when a visitor submits without entering required fields? → Form shows inline error for each empty required field without submission.
- What happens if the Bodygraph fails to render (SVG/Canvas issue)? → Text-based fallback shows center list; main chart still displays all data below.
- What happens when a birth location has multiple interpretations (e.g., Berlin exists in Germany and multiple other countries)? → System requests clarification or uses most common match with clear indication.
- What happens if a future date is entered? → Form rejects with error: "Das Geburtsdatum liegt in der Zukunft. Bitte prüfen Sie Ihre Eingabe."

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST accept and validate user input for birth date in format TT.MM.JJJJ with range validation (no future dates, valid day/month/year combinations).

- **FR-002**: System MUST accept and validate birth time in format HH:MM (24-hour format) with range 00:00–23:59.

- **FR-003**: System MUST accept birth location as free text or via location autocomplete (if geocoding service is available), and resolve to coordinates/timezone if needed.

- **FR-004**: System MUST provide checkbox option "Geburtszeit ungefaehr / unbekannt" that allows submission with blank or approximate time, defaulting to 12:00 if checked.

- **FR-005**: System MUST send validated input to backend REST API endpoint (POST /api/hd-chart) with JSON body containing firstName, birthDate, birthTime, birthTimeApproximate, birthPlace.

- **FR-006**: Backend MUST validate all input fields before processing and return validation error if any required field is invalid or missing.

- **FR-007**: Backend MUST convert birth location to coordinates and timezone (if external HD calculation requires this) using geocoding or location database.

- **FR-008**: Backend MUST call HD calculation source (external API or internal calculation function) with properly formatted input.

- **FR-009**: Backend MUST map the HD calculation response to internal normalized JSON structure regardless of the HD provider source.

- **FR-010**: Backend MUST return normalized JSON with structure: firstName, type (code/label/shortDescription), authority (code/label/decisionHint), profile (code/shortDescription), centers (array with name/code/defined), channels (array of codes), gates (conscious/unconscious arrays), incarnationCross (code/name/gates), shortImpulse.

- **FR-011**: Backend MUST generate shortImpulse text by matching type.code + authority.code to predefined mapping table, or return default message if combination not found.

- **FR-012**: Frontend MUST display type.label and type.shortDescription in "Dein Human Design Typ" section.

- **FR-013**: Frontend MUST display authority.label and authority.decisionHint in "Deine innere Autoritaet" section.

- **FR-014**: Frontend MUST display profile.code (e.g., "4/1") and profile.shortDescription in "Dein Profil" section.

- **FR-015**: Frontend MUST display centers in two-column layout: "Definiert" (all centers with defined: true) and "Offen" (all centers with defined: false) in "Deine Zentren" section.

- **FR-016**: Frontend MUST display channels as a simple list (tag-style or bullet points) in "Aktive Kanäle" section with format "XX–YY".

- **FR-017**: Frontend MUST display gates in two separate lists ("Bewusst" and "Unbewusst") in "Aktive Tore" section with format "XX.Y".

- **FR-018**: Frontend MUST display incarnationCross.name and gates in format "(15/10/5/35)" in "Dein Inkarnationskreuz" section.

- **FR-019**: Frontend MUST render visual Bodygraph as SVG or Canvas showing 9 centers in standard HD layout with geometric shapes.

- **FR-020**: Frontend MUST color centers with defined: true according to defined color scheme matching NOIO branding, and leave centers with defined: false white/empty.

- **FR-021**: Frontend MUST display all active channels from channels array as lines in the Bodygraph connecting appropriate centers, with visual emphasis (thicker/darker lines).

- **FR-022**: Frontend MUST display active gates as small points or marks on the Bodygraph channels at appropriate positions.

- **FR-023**: Frontend MUST ensure Bodygraph is minimalist, professional, and visually uncluttered (not technical or overly esoteric appearing).

- **FR-024**: Frontend MUST display shortImpulse as a single sentence in "Ein Satz fuer dich" section with warm, clear tone.

- **FR-025**: Frontend MUST be mobile-first responsive: all chart sections must be readable on smartphones (min 375px width) with appropriate text sizing and Bodygraph scaling.

- **FR-026**: System MUST NOT calculate, process, or display: Variables/Arrows, Motivation, Perspectives, Planetary positions, Line interpretations, Tone/Color/Base, detailed Planetary texts, Shadow themes, complete Profile readings, separate unconscious chart, Relationship/Business charts.

- **FR-027**: System MUST NOT persist user data to database in MVP (no storage of birth dates, charts, or personal information).

- **FR-028**: Frontend MUST display user-friendly error messages in German for: invalid date format, invalid time format, missing required fields, future dates, API unavailability.

- **FR-029**: System MUST NOT display technical error messages or stack traces to users; these must be logged server-side only.

- **FR-030**: Frontend MUST provide "retry" option when HD calculation API is unavailable with friendly message: "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."

### Key Entities

- **User Input**: Represents the visitor's birth information (firstName, birthDate, birthTime, birthLocation, birthTimeApproximate flag). Not persisted in MVP.

- **HD Chart Data**: The complete calculated Human Design profile including Type, Authority, Profile, Centers (9), Channels (variable count), Gates (conscious/unconscious), Incarnation Cross. Calculated externally, not stored.

- **Normalized Chart Response**: Internal system representation ensuring Frontend always receives consistent JSON structure regardless of HD provider source. Includes all display-ready information formatted for presentation.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Visitors can generate a complete chart by filling the form and clicking "Generate Chart" in under 30 seconds from page load to chart display.

- **SC-002**: Chart loads and renders within 3 seconds of form submission (including backend calculation time).

- **SC-003**: Bodygraph renders correctly and is visually clear on both desktop (min 1024px) and mobile (375px–480px) viewports with no layout shifts after load.

- **SC-004**: Form validation provides clear, specific error messages in German for all invalid input scenarios (invalid date, time, future date, missing fields) displayed inline without page reload.

- **SC-005**: Visitors with approximate birth time can successfully generate a chart using the "Geburtszeit ungefaehr / unbekannt" checkbox, with all chart sections displaying complete data.

- **SC-006**: When HD calculation API is unavailable, users see a friendly error message within 2 seconds and have the ability to retry without re-entering data.

- **SC-007**: 100% of the required chart sections (Type, Authority, Profile, Centers, Channels, Gates, Incarnation Cross, Bodygraph, Impulse) display complete and accurate data for any valid birth input.

- **SC-008**: Type and Authority labels display correctly in Italian naming convention (Generatore, Generatore Manifestante, Proiettore, Manifestatore, Riflettore) with German descriptions and decision hints.

- **SC-009**: Bodygraph visually distinguishes between defined centers (colored) and open centers (white/empty) with clear visual contrast readable at mobile sizes.

- **SC-010**: All text content (labels, descriptions, hints, error messages) is in German language with no technical jargon or esoteric terminology.

- **SC-011**: Visitors who complete chart generation report (via future feedback mechanism) that the information is clear, relatable, and increases their interest in a Business Reading by at least 60%.

- **SC-012**: Chart output is printable or shareable (page-friendly rendering) without losing visual quality or important data.

## Assumptions

- **External HD Calculation Source**: An external Human Design calculation API or internal calculation function is available (either existing or to be built). Specification assumes it returns complete HD data; if using external API, an integration layer maps its response to internal format.

- **Location Services**: Birth location to coordinates/timezone conversion assumes availability of a geocoding service (Google Maps API, OpenStreetMap, or similar). If not available in MVP, location can be stored as text-only and passed to HD provider.

- **Chart Styling**: Visual appearance (fonts, color scheme) aligns with existing NOIO branding. Specific colors for defined centers and accent colors are available in the design system.

- **Browser Support**: Frontend must support modern browsers (Chrome, Firefox, Safari, Edge) with SVG rendering support. IE11 or older browsers not supported.

- **Data Accuracy**: HD calculation from external source or backend function is accurate and complete. Specification assumes input data (birth date/time/location) is sufficient for calculation.

- **Type Labels**: Italian type names (Generatore, Manifestante, etc.) are authoritative and consistently spelled across all system documentation and HD calculation sources.

- **Gateway/Channel Mapping**: The internal system correctly maps gateway numbers to centers and channel codes; test data confirms this mapping is consistent with Human Design standards.

- **Profile Descriptions**: Short descriptions for each profile combination (4/1, 3/5, etc.) are provided or written as part of specification implementation; 49+ profile combinations exist.

- **Authority Decision Hints**: Prewritten decision hints for each authority type are accurate, clear, and non-jargon. These are curated during specification phase or implementation.

- **Short Impulse Mapping**: The type.code + authority.code mapping for short impulses has at least one entry for each combination, or a sensible default exists (max ~35 combinations to cover: 5 types × 7 authority types).

- **Mobile Responsiveness**: Bodygraph SVG/Canvas can be scaled responsively without loss of clarity. If not feasible with SVG, alternative implementation (Canvas or responsive image) is acceptable.

- **Error Handling**: API timeouts, server errors, and network issues are handled gracefully with retry logic and user-friendly messages. No silent failures.

## Out of Scope (Explicitly Not Included)

The following features and data are explicitly excluded from this specification and may be considered for future iterations:

- Persistence of user charts or birth data in database
- User accounts or authentication
- Chart comparisons or relationship charts
- Advanced filtering, export to PDF, or download functionality
- Multi-language support beyond German
- Detailed profile readings or full chart interpretations
- Variables, Arrows, Motivation, Perspectives (conditioning factors)
- Planetary position data or planetary aspect interpretations
- Shadow themes, psychological depth readings, or trauma-informed content
- Business or Composite charts
- Separate unconscious chart display
- Historical chart tracking or progress monitoring
- Integration with astrology, tarot, or other divination systems
