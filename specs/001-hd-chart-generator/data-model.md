# Data Model: Human Design Chart Generator

**Phase**: 1 (Design & Contracts) | **Date**: 2025-11-23 | **Plan**: [plan.md](plan.md)

## Overview

This document defines all data structures, entities, and validation rules for the Human Design Chart Generator. The model reflects Phase 0 research decisions: external HD API calculation (HumanDesign.ai), text-only location input, and simple MVP email storage with Phase 2+ GDPR fields pre-added.

---

## Entity Definitions

### 1. ChartRequest (Ephemeral)

**Purpose**: Represents user input from the birth data form. Not persisted; discarded after chart generation.

**Data Model**:

```typescript
interface ChartRequest {
  firstName: string;           // User's first name (5-50 chars, non-empty)
  birthDate: string;           // Format: TT.MM.JJJJ (e.g., "23.11.1992")
  birthTime: string;           // Format: HH:MM, 24-hour (e.g., "14:30")
  birthTimeApproximate: boolean; // true if time unknown/approximate
  birthPlace: string;          // Location text (e.g., "Berlin, Germany")
}
```

**Validation Rules**:

| Field | Rule | Error Message (German) |
|-------|------|------------------------|
| `firstName` | Non-empty, 5-50 chars, no special symbols | "Bitte geben Sie einen gültigen Namen ein (5-50 Zeichen)." |
| `birthDate` | Valid TT.MM.JJJJ format; valid day/month/year; not future date | "Ungültiges Datum. Bitte prüfen Sie Tag und Monat." |
| `birthTime` | Valid HH:MM format; 00:00–23:59 range | "Ungültige Uhrzeit. Bitte nutzen Sie HH:MM Format." |
| `birthPlace` | Non-empty, 2-100 chars | "Bitte geben Sie Ihren Geburtsort an." |
| `birthTimeApproximate` | Boolean only | (automatically validated) |

**Constraints**:

- `birthDate` must not be today or in the future (HD calculation requires past birth date)
- `firstName` rejected if contains numbers or special symbols (@, #, etc.)
- `birthPlace` accepted as plain text (no geocoding required per Phase 0)
- All fields required (no nulls in MVP)

**Example**:

```json
{
  "firstName": "Marie",
  "birthDate": "23.11.1992",
  "birthTime": "14:30",
  "birthTimeApproximate": false,
  "birthPlace": "Berlin, Germany"
}
```

---

### 2. ChartResponse (Computed)

**Purpose**: Complete HD chart data computed from external API (HumanDesign.ai). Not persisted; generated on-demand from ChartRequest. Returned to frontend for display.

**Data Model**:

```typescript
interface ChartResponse {
  // Meta
  firstName: string;
  
  // Type (5 types)
  type: {
    code: string;             // "1", "2", "3", "4", "5"
    label: string;            // "Manifestor", "Generator", etc.
    shortDescription: string; // 1-2 sentence explanation in German
  };
  
  // Authority (7 types)
  authority: {
    code: string;             // "sacral", "emotional", "spleen", etc.
    label: string;            // German label
    decisionHint: string;     // Actionable guidance for decision-making (German)
  };
  
  // Profile (49 combinations)
  profile: {
    code: string;             // "1/3", "4/6", etc.
    shortDescription: string; // Profile meaning in German
  };
  
  // Centers (9 centers)
  centers: Array<{
    name: string;             // German name (e.g., "Kopfzentrum", "Herzenzentrum")
    code: string;             // HD notation (e.g., "Head", "Heart")
    defined: boolean;         // true if colored/defined, false if open/white
  }>;
  
  // Channels (~27 total)
  channels: Array<{
    code: string;             // "1-2", "2-14", etc. (gate-to-gate connection)
  }>;
  
  // Gates (64 total)
  gates: {
    conscious: Array<{
      code: string;           // Gate number "1"-"64"
    }>;
    unconscious: Array<{
      code: string;           // Gate number "1"-"64"
    }>;
  };
  
  // Incarnation Cross
  incarnationCross: {
    code: string;             // "1-4", "16-48", etc.
    name: string;             // German name or description
    gates: Array<string>;     // Array of gate codes ["1", "4", "16", "48"]
  };
  
  // Personalized Message
  shortImpulse: string;       // 2-3 sentences personalized impulse (German)
}
```

**Derivation**:

- All fields computed from external HD API (HumanDesign.ai) response
- Backend normalization layer (NormalizationService) maps API response to this schema
- All text translated/localized to German by backend before returning to frontend

**Example**:

```json
{
  "firstName": "Marie",
  "type": {
    "code": "4",
    "label": "Projector",
    "shortDescription": "Du kannst Systeme und Menschen klar sehen und verbessern - wenn man dich einlädt."
  },
  "authority": {
    "code": "emotional",
    "label": "Emotionale Autorität",
    "decisionHint": "Lass deine Gefühle zur Ruhe kommen, bevor du eine Entscheidung triffst. Vertrau deiner inneren Welle."
  },
  "profile": {
    "code": "3/5",
    "shortDescription": "Der Experimentator und der Helfer. Du lernst durch Erfahrung und kannst anderen helfen."
  },
  "centers": [
    { "name": "Kopfzentrum", "code": "Head", "defined": true },
    { "name": "Kehlenzentrum", "code": "Throat", "defined": false }
  ],
  "channels": [
    { "code": "1-2" },
    { "code": "16-48" }
  ],
  "gates": {
    "conscious": [{ "code": "1" }, { "code": "16" }],
    "unconscious": [{ "code": "2" }, { "code": "48" }]
  },
  "incarnationCross": {
    "code": "1-2-16-48",
    "name": "Kreuz der Initiation",
    "gates": ["1", "2", "16", "48"]
  },
  "shortImpulse": "Deine Reise handelt davon, Menschen zu helfen, ihre wirklichen Fähigkeiten zu sehen. Warte auf die richtige Gelegenheit, und dann zeige deine Klarheit."
}
```

---

### 3. LeadEmail (Persisted)

**Purpose**: Email lead capture for Business Reading interest. Stored in PostgreSQL with MVP columns (6) + Phase 2 GDPR nullable columns (5) pre-added for zero-migration cost.

**MVP Schema (Phase 1)**:

```typescript
interface LeadEmail {
  id: string;                 // UUID, generated by DB
  email: string;              // RFC 5322 validated, unique (case-insensitive)
  createdAt: Date;            // Timestamp when recorded
  updatedAt: Date;            // Timestamp of last update
  source: string;             // Default: "hd-chart-generator"
  status: "pending" | "subscribed" | "unsubscribed"; // Default: "pending"
  
  // Phase 2+ GDPR columns (pre-added, nullable in MVP)
  deletedAt?: Date | null;
  consentedAt?: Date | null;
  doubleOptInStatus?: string | null;
  marketingPreference?: object | null;
  lastEngagementAt?: Date | null;
}
```

**Database DDL** (PostgreSQL with Alembic migration):

```sql
CREATE TABLE lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- MVP Columns
  email VARCHAR(255) NOT NULL UNIQUE COLLATE "C",
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(50) NOT NULL DEFAULT 'hd-chart-generator',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Phase 2+ GDPR Columns (nullable, pre-added)
  deleted_at TIMESTAMP NULL,
  consented_at TIMESTAMP NULL,
  double_opt_in_status VARCHAR(20) NULL,
  marketing_preference JSONB NULL,
  last_engagement_at TIMESTAMP NULL
);

-- Indexes for query performance
CREATE INDEX idx_lead_emails_status_created 
  ON lead_emails(status, created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX idx_lead_emails_email_unique 
  ON lead_emails(LOWER(email)) 
  WHERE deleted_at IS NULL 
  UNIQUE;
```

**Validation Rules** (MVP):

| Field | Rule | Error Message (German) |
|-------|------|------------------------|
| `email` | RFC 5322 format, max 255 chars, unique (case-insensitive) | "Bitte geben Sie eine gültige E-Mail an." |
| `status` | Enum: "pending" \| "subscribed" \| "unsubscribed" | (automatically validated) |
| `source` | Always "hd-chart-generator" for MVP | (automatically set) |

**Constraints**:

- Email must be unique (case-insensitive, soft-deleted emails excluded)
- No duplicate email insertion (query: check LOWER(email) before insert)
- Soft-delete pattern: set `deleted_at = NOW()` (not DELETE row)
- `createdAt` immutable after insert
- `updatedAt` auto-updated on every change

**State Transitions** (MVP):

- Initial: `status = "pending"` → Email recorded, awaiting Phase 2 confirmation
- Phase 2 (conditional): `status = "pending"` → (user confirms) → `status = "subscribed"` + set `consentedAt`
- Phase 2 (conditional): `status = "subscribed"` → (user unsubscribes) → `status = "unsubscribed"`

**Example** (MVP):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "marie@example.de",
  "createdAt": "2025-11-23T10:30:00Z",
  "updatedAt": "2025-11-23T10:30:00Z",
  "source": "hd-chart-generator",
  "status": "pending",
  "deletedAt": null,
  "consentedAt": null,
  "doubleOptInStatus": null,
  "marketingPreference": null,
  "lastEngagementAt": null
}
```

---

## API Request/Response Contracts

### Endpoint: POST /api/hd-chart

**Request Body**:

```typescript
{
  "firstName": string;           // 5-50 chars
  "birthDate": string;           // TT.MM.JJJJ
  "birthTime": string;           // HH:MM
  "birthTimeApproximate": boolean;
  "birthPlace": string;          // Location text
}
```

**Response: 200 OK**

```typescript
ChartResponse // Complete chart data (see above)
```

**Response: 400 Bad Request** (validation error)

```typescript
{
  "error": string;    // German error message
  "field": string;    // Field name causing error
}
```

**Response: 500 Internal Server Error** (HD API unavailable)

```typescript
{
  "error": "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."
}
```

---

### Endpoint: POST /api/email-capture

**Request Body**:

```typescript
{
  "email": string;    // RFC 5322 validated, max 255 chars
}
```

**Response: 201 Created**

```typescript
{
  "success": true,
  "message": "Vielen Dank für dein Interesse an einem Business Reading.",
  "id": string;       // UUID of created email record
}
```

**Response: 400 Bad Request** (invalid email)

```typescript
{
  "error": "Bitte geben Sie eine gültige E-Mail an."
}
```

**Response: 409 Conflict** (duplicate email)

```typescript
{
  "error": "Diese E-Mail ist bereits registriert."
}
```

---

## Backend Integration

### NormalizationService

**Purpose**: Maps HumanDesign.ai API response to ChartResponse schema.

**Input** (from HumanDesign.ai API):

```json
{
  "type": "4",
  "authority": "emotional",
  "profile": "3/5",
  "centers": [...],
  "channels": [...],
  "gates": {...},
  "incarnationCross": {...}
}
```

**Output** (normalized ChartResponse):

```typescript
interface NormalizationService {
  normalize(apiResponse: unknown, firstName: string): ChartResponse
}
```

**Key Responsibilities**:

- Map API gate/center codes to HD notation
- Fetch German descriptions from local data files (profiles.json, impulses.json)
- Generate personalized impulse message based on Type + Authority combination
- Validate completeness (all 9 centers, ~27 channels, 64 gates represented)
- Fall back to English labels if German translation missing (Phase 2 improvement)

---

## Frontend Integration

### Chart Display Component

**Receives**: ChartResponse object

**Renders**:
- Type section with label + description
- Authority section with decision hint
- Profile section with description
- Centers visualization (Bodygraph SVG)
- Channels list
- Gates (conscious/unconscious)
- Incarnation Cross
- Email capture form

---

## Data Files (Backend)

### /backend/src/config/data/profiles.json

Maps profile codes to German descriptions:

```json
{
  "1/3": "Der Erforscher und Exponent. Du lernst durch Versuch und Irrtum...",
  "3/5": "Der Experimentator und Helfer. Du lernst durch Erfahrung...",
  "4/6": "Der Systemanalytiker und Wandler. Du bringst Stabilität und Transformation..."
}
```

### /backend/src/config/data/impulses.json

Maps Type + Authority combinations to personalized impulses:

```json
{
  "4_emotional": "Deine Reise handelt davon, Menschen zu helfen, ihre wirklichen Fähigkeiten zu sehen...",
  "4_splenic": "Deine Intuition ist dein Kompass. Höre auf deine innere Weisheit...",
  "2_sacral": "Du brauchst andere um dich zu entfalten. Warte auf die richtige Zusammenarbeit..."
}
```

---

## State Transitions

### Form State

```
Initial
  ↓
Form Filled (all fields valid)
  ↓
Submitting (loading state, button disabled)
  ↓
Chart Received ← OR → Error Received
  ↓                      ↓
Chart Displayed    Error Message (German)
  ↓                      ↓
Email Capture      [Retry Option]
  ↓                      ↓
Email Submitted    Return to Form
  ↓
Success Message
```

---

## MVP vs Phase 2+ Scope

**MVP Includes**:
- ChartRequest validation (form inputs)
- ChartResponse computation (external HD API)
- LeadEmail storage (basic 6 columns)
- API contracts (POST /api/hd-chart, POST /api/email-capture)
- German language throughout

**Phase 2+ Adds**:
- Double opt-in confirmation (email verification)
- Marketing preference JSONB (newsletter signup options)
- Consent tracking (consentedAt, doubleOptInStatus)
- Email engagement metrics (lastEngagementAt)
- Soft-delete audit trail (deletedAt)
- Chart caching (30-day TTL for identical birth data)
- Data export (email lists for marketing automation)

---

## Error Handling

All validation errors returned with German user-friendly messages (no technical details exposed):

```
Form Field Validation → Inline error message (German)
API Validation Error → 400 response with "error" + "field"
HD API Failure → 500 response with friendly message
Email Duplicate → 409 response with message
Email Invalid → 400 response with message
```

---

**Version**: 1.0.0 | **Date**: 2025-11-23 | **Status**: Ready for Frontend/Backend Implementation
