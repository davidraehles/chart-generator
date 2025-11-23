<!--
SYNC IMPACT REPORT
Version Change: N/A → 1.0.0 (Initial Constitution)
Modified Principles: N/A
Added Sections: Core Principles (5), Scope & Simplicity, Development Workflow
Removed Sections: N/A
Templates Updated: ✅ spec-template.md ✅ plan-template.md ✅ tasks-template.md
Follow-up TODOs: None
-->

# Human Design Chart Generator Constitution

## Core Principles

### I. Specification-First Design

Every feature must start with a clear, testable specification before any code is written.
The specification defines user value, acceptance criteria, and scope boundaries—not implementation
details. Specifications are written for non-technical stakeholders and must answer: What problem
does this solve? Who benefits? How do we measure success? No feature branches merge without a
passing specification quality review.

**Rationale**: Clear requirements prevent scope creep and rework. Written specifications create
accountability and enable independent work across frontend/backend teams.

### II. Minimalist User Interface

The chart generator must be deliberately simple and elegant—showing only what matters to the
visitor's decision-making and self-understanding. Visual hierarchy, whitespace, and typography
communicate more than explanatory text. No esoteric jargon; every label and description must be
immediately understandable to a non-HD practitioner in German.

**Rationale**: Simplicity builds credibility and encourages sharing. Complexity overwhelms visitors
and reduces conversion to Business Readings. The minimalist approach is a brand differentiator
matching NOIO's aesthetic.

### III. Quality Output, Not Feature Completeness

A chart that shows Type, Authority, and visual Bodygraph correctly is more valuable than a chart
that shows 20 esoteric elements most visitors don't understand. Better to exclude something than
include it poorly. Every element displayed must have clear user value and be tested for accuracy.

**Rationale**: Visitors judge the tool by depth and clarity, not breadth. Accuracy builds trust in
deeper services (Business Readings). Incomplete features should be marked Phase 2+, not shipped
half-finished.

### IV. API-Agnostic Backend

The backend must abstract the Human Design calculation source (external API or internal function)
behind a normalized JSON interface. This allows swapping calculation providers without frontend
changes and ensures consistent data structure regardless of source. Mapping and normalization logic
is non-negotiable infrastructure.

**Rationale**: HD calculation sources may change or improve. Decoupling prevents vendor lock-in
and allows testing with mock data. Stable contracts between frontend/backend enable parallel work.

### V. Error-First Experience Design

Every error case (invalid input, API failure, network issue) must have a friendly, actionable
German message. No technical error details shown to visitors—only server-side logging. The system
should gracefully degrade (e.g., text fallback if Bodygraph fails to render) and always offer a
retry path without re-entering data.

**Rationale**: User trust depends on feeling safe during errors. Clear error messages reduce
support burden. Graceful degradation keeps the tool functional when infrastructure fails.

## Scope & Simplicity

### What's Included in MVP

- Birth date/time/location input form with validation
- Generation of core HD chart (Type, Authority, Profile, Centers, Gates, Channels, Incarnation Cross)
- Visual Bodygraph displaying defined vs. open centers
- Personalized decision authority guidance
- Mobile-first responsive design (375px+)
- All content and errors in German language

### What's Explicitly NOT Included (Phase 2+)

- User accounts or data persistence
- Chart export (PDF, image download)
- Relationship, Business, or Composite charts
- Detailed profile readings or planetary interpretation
- Variables, Arrows, Motivation, Perspectives, Shadow themes
- Multi-language support beyond German
- Lead capture / email collection (optional, add if project plan includes)

### Why This Scope Boundary

The MVP focuses on the "aha moment"—visitors see their Type and Authority within 30 seconds,
understand how to make decisions, and want to learn more. Anything beyond this either:
- Dilutes the focus with esoteric detail most visitors don't need
- Requires data persistence and legal compliance (email, accounts)
- Depends on clarification around HD calculation source and accuracy

Clearer boundaries prevent scope creep and allow faster, higher-quality initial release.

## Development Workflow

### Specification Review Gate

Every feature spec must pass the quality checklist before planning:
- No [NEEDS CLARIFICATION] markers remain (or justified in Assumptions)
- All functional requirements are testable
- Success criteria are measurable and technology-agnostic
- User scenarios are independent and prioritized
- Scope is clearly bounded

### Testing Discipline

- Unit tests cover validation (input formats, date ranges, error conditions)
- Integration tests verify backend ↔ HD calculation mapping
- Acceptance tests confirm chart display matches spec scenarios
- Visual regression tests confirm Bodygraph renders correctly across viewports
- No feature merged without passing related tests

### Code Review Standards

- Changes must reference which spec requirement(s) they implement
- Design decisions must justify deviation from spec (documented in commit/PR)
- No "just in case" features or speculative refactoring
- Simplicity and clarity prioritized over sophistication
- German language verified for all user-facing text (labels, messages, descriptions)

### Performance & Quality Gates

- Chart generation completes within 3 seconds end-to-end
- Bodygraph renders without layout shift on first load
- Form validation displays errors inline (no page reload)
- Mobile viewport (375px) tested and usable without scrolling for initial form
- All success criteria from spec must be demonstrable in QA

## Governance

This constitution defines non-negotiable principles for the Human Design Chart Generator project.
All design, development, and review decisions must align with these principles. Amendments require
documentation of rationale, affected features, and migration plan.

**Version Bumping**:
- MAJOR: Principle removal/redefinition affecting multiple features
- MINOR: New principle or substantial guidance expansion
- PATCH: Clarifications, wording refinements, typo fixes

**Amendment Process**:
1. Proposal with rationale (why change, what problem does it solve)
2. Impact assessment (which features, specifications, or workflows affected)
3. Documentation update in constitution
4. Propagation to affected spec/plan/task templates
5. Commit with clear amendment message

**Compliance Verification**:
- Pull request reviews check alignment with applicable principles
- Specification quality review gates enforce scope/simplicity boundaries
- Planning phase confirms technical decisions don't contradict principles

Use this document as the source of truth for project governance. When principles conflict with
convenience, principles win. When project context changes (e.g., new HD API becomes available,
team capacity shifts), amendment and discussion are required—not silent divergence.

---

**Version**: 1.0.0 | **Ratified**: 2025-11-23 | **Last Amended**: 2025-11-23
