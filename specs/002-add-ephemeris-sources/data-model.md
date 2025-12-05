# Data Model: Ephemeris Data Integration

**Feature**: 002-add-ephemeris-sources
**Date**: 2025-11-24
**Phase**: Phase 1 - Design

## Purpose

Define data structures for ephemeris calculations, planetary positions, Human Design activations, and chart responses. Models represent the domain entities required to calculate and return HD charts based on astronomical data.

---

## Core Models

### 1. ChartRequest

**Purpose**: Input data for chart calculation endpoint

**Source**: Frontend form submission (birth data from user)

```python
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class ChartRequest(BaseModel):
    """
    Request to calculate a Human Design chart.
    All fields required for astronomical calculation.
    """
    birth_datetime: datetime = Field(
        ...,
        description="Birth date and time in local timezone",
        example="1985-05-21T14:30:00"
    )
    birth_timezone: str = Field(
        ...,
        description="IANA timezone identifier",
        example="Europe/Berlin"
    )
    birth_latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Birth location latitude in decimal degrees",
        example=52.5200
    )
    birth_longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Birth location longitude in decimal degrees",
        example=13.4050
    )
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional name for personalization"
    )

    @validator('birth_datetime')
    def validate_date_range(cls, v):
        """Ensure birth date is within ephemeris coverage (3000 BCE - 3000 CE)"""
        min_date = datetime(year=-3000, month=1, day=1)
        max_date = datetime(year=3000, month=12, day=31)
        if not (min_date <= v <= max_date):
            raise ValueError("Birth date must be between 3000 BCE and 3000 CE")
        return v
```

**Validation Rules**:
- Birth datetime required and within ephemeris range
- Timezone must be valid IANA identifier
- Latitude/longitude must be valid coordinates
- Name optional (for UI personalization only)

---

### 2. PlanetaryPosition

**Purpose**: Single celestial body position at a moment in time

**Source**: Ephemeris calculation result

```python
from enum import Enum
from pydantic import BaseModel, Field

class CelestialBody(str, Enum):
    """Celestial bodies used in Human Design"""
    SUN = "Sun"
    MOON = "Moon"
    MERCURY = "Mercury"
    VENUS = "Venus"
    MARS = "Mars"
    JUPITER = "Jupiter"
    SATURN = "Saturn"
    URANUS = "Uranus"
    NEPTUNE = "Neptune"
    PLUTO = "Pluto"
    NORTH_NODE = "North Node"
    SOUTH_NODE = "South Node"
    CHIRON = "Chiron"

class PlanetaryPosition(BaseModel):
    """
    Position of a celestial body in ecliptic coordinates.
    Raw astronomical data before HD mapping.
    """
    body: CelestialBody
    ecliptic_longitude: float = Field(
        ...,
        ge=0,
        lt=360,
        description="Position in degrees along the ecliptic (0-360)"
    )
    calculation_timestamp: datetime = Field(
        ...,
        description="UTC timestamp when position was calculated"
    )
    julian_day: float = Field(
        ...,
        description="Julian Day number used for calculation"
    )
    source: str = Field(
        ...,
        description="Ephemeris source used (e.g., 'SwissEphemeris')"
    )
```

**Relationships**:
- 13 PlanetaryPosition objects per chart calculation
- Each position maps to one HDActivation (see below)

---

### 3. HDActivation

**Purpose**: Human Design gate/line activation for a celestial body

**Source**: Mapping of PlanetaryPosition to HD wheel

```python
from pydantic import BaseModel, Field
from typing import Literal

class HDActivation(BaseModel):
    """
    Human Design activation: planetary position mapped to gate and line.
    Represents one "activation" in the chart.
    """
    body: CelestialBody
    gate: int = Field(
        ...,
        ge=1,
        le=64,
        description="HD Gate number (1-64, corresponds to I'Ching hexagram)"
    )
    line: int = Field(
        ...,
        ge=1,
        le=6,
        description="Line number within the gate (1-6)"
    )
    ecliptic_degree: float = Field(
        ...,
        ge=0,
        lt=360,
        description="Source ecliptic longitude"
    )
    chart_type: Literal["personality", "design"] = Field(
        ...,
        description="Whether this activation is from Personality (birth) or Design (88° before)"
    )

    def __str__(self) -> str:
        """Human-readable activation: e.g., 'Sun in Gate 27 Line 3 (Personality)'"""
        return f"{self.body.value} in Gate {self.gate} Line {self.line} ({self.chart_type.title()})"
```

**Validation Rules**:
- Gate must be 1-64
- Line must be 1-6
- Chart type must be "personality" or "design"

---

### 4. ChartCalculation

**Purpose**: Complete chart calculation result (both Personality and Design)

**Source**: Orchestrated calculation combining all activations

```python
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class ChartCalculation(BaseModel):
    """
    Complete Human Design chart calculation.
    Contains both Personality and Design activations.
    """
    personality_activations: List[HDActivation] = Field(
        ...,
        min_items=13,
        max_items=13,
        description="13 activations from birth moment (Personality chart)"
    )
    design_activations: List[HDActivation] = Field(
        ...,
        min_items=13,
        max_items=13,
        description="13 activations from 88° before birth (Design chart)"
    )
    personality_datetime: datetime = Field(
        ...,
        description="Birth datetime (UTC)"
    )
    design_datetime: datetime = Field(
        ...,
        description="Design chart datetime (UTC, ~88 days before birth)"
    )
    calculation_source: str = Field(
        ...,
        description="Ephemeris source used for calculations"
    )
    calculated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When this calculation was performed"
    )
```

**Invariants**:
- Exactly 13 personality activations (one per celestial body)
- Exactly 13 design activations (one per celestial body)
- Design datetime is always before personality datetime

---

### 5. ChartResponse

**Purpose**: API response containing full chart data for frontend

**Source**: ChartCalculation + derived HD elements (type, authority, profile)

```python
from pydantic import BaseModel, Field
from typing import List, Optional

class ChartResponse(BaseModel):
    """
    Complete Human Design chart response.
    Ready for frontend consumption.
    """
    # User context
    name: Optional[str] = None

    # Raw astronomical data
    personality_activations: List[HDActivation]
    design_activations: List[HDActivation]

    # Derived HD elements (calculated from activations)
    # Note: Type, Authority, Profile calculation is Phase 2+ per constitution
    # For now, return activations only; frontend or future service will derive these
    type: Optional[str] = Field(
        None,
        description="HD Type (Generator, Projector, Manifestor, Reflector) - Phase 2+"
    )
    authority: Optional[str] = Field(
        None,
        description="Decision authority - Phase 2+"
    )
    profile: Optional[str] = Field(
        None,
        description="Profile (e.g., '1/3', '6/2') - Phase 2+"
    )

    # Metadata
    calculation_source: str
    calculated_at: datetime

    class Config:
        schema_extra = {
            "example": {
                "name": "Example User",
                "personality_activations": [
                    {
                        "body": "Sun",
                        "gate": 27,
                        "line": 3,
                        "ecliptic_degree": 85.234,
                        "chart_type": "personality"
                    }
                    # ... 12 more activations
                ],
                "design_activations": [
                    # ... 13 activations
                ],
                "type": null,  # Phase 2+
                "authority": null,  # Phase 2+
                "profile": null,  # Phase 2+
                "calculation_source": "SwissEphemeris",
                "calculated_at": "2025-11-24T20:00:00Z"
            }
        }
```

---

## Supporting Models

### 6. EphemerisConfig

**Purpose**: Configuration for ephemeris source selection

**Source**: Environment variables / database configuration

```python
from pydantic import BaseSettings, Field
from typing import Literal

class EphemerisConfig(BaseSettings):
    """
    Ephemeris source configuration.
    Loaded from environment variables.
    """
    source: Literal["swiss_ephemeris", "openastro_api", "nasa_jpl"] = Field(
        default="swiss_ephemeris",
        description="Primary ephemeris source"
    )
    ephemeris_path: str = Field(
        default="/app/data/ephemeris",
        description="Path to Swiss Ephemeris data files"
    )
    openastro_api_url: Optional[str] = Field(
        default=None,
        description="OpenAstro API endpoint (if using API source)"
    )

    class Config:
        env_prefix = "EPHEMERIS_"
```

---

### 7. CalculationError

**Purpose**: Structured error response for calculation failures

**Source**: Exception handling in calculation services

```python
from pydantic import BaseModel
from typing import Optional

class CalculationError(BaseModel):
    """
    Structured error response for chart calculation failures.
    Returned as JSON with appropriate HTTP status code.
    """
    code: str = Field(
        ...,
        description="Machine-readable error code"
    )
    message: str = Field(
        ...,
        description="English error message for logging"
    )
    message_de: str = Field(
        ...,
        description="German error message for user display"
    )
    field: Optional[str] = Field(
        None,
        description="Which input field caused the error (for validation errors)"
    )
    retry_after: Optional[int] = Field(
        None,
        description="Seconds to wait before retrying (for rate limit/transient errors)"
    )
```

**Error Codes** (from research.md R4):
- `INVALID_DATE`: Birth date/time validation failed
- `DATE_OUT_OF_RANGE`: Date outside 3000 BCE - 3000 CE
- `INVALID_LOCATION`: Coordinates or timezone invalid
- `EPHEMERIS_UNAVAILABLE`: Ephemeris files not found (deployment issue)
- `CALCULATION_FAILED`: Internal calculation error

---

## Data Flow

### Chart Calculation Flow

```text
1. ChartRequest (frontend input)
   ↓
2. Validate request (date range, coordinates, timezone)
   ↓
3. Convert to Julian Day (julian_day.py)
   ↓
4. Calculate Personality positions (13 × PlanetaryPosition)
   ↓
5. Calculate Design datetime (88° solar arc before birth)
   ↓
6. Calculate Design positions (13 × PlanetaryPosition)
   ↓
7. Map each position to HDActivation (gate/line via gate_mapper.py)
   ↓
8. Build ChartCalculation (26 total activations)
   ↓
9. Return ChartResponse (with optional caching)
```

---

## Database Schema (Optional Caching)

**Table**: `chart_cache` (PostgreSQL, optional)

```sql
CREATE TABLE chart_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,  -- Hash of birth data
    chart_data JSONB NOT NULL,               -- Serialized ChartResponse
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_cache_key (cache_key),
    INDEX idx_expires_at (expires_at)
);
```

**Rationale**: Optional. Research decision R3 prefers Redis caching (24hr TTL). If PostgreSQL used instead, this schema enables persistence with automatic expiration cleanup.

**Cleanup Job**: Periodic task to delete expired entries:
```sql
DELETE FROM chart_cache WHERE expires_at < NOW();
```

---

## Model Validation Summary

| Model | Key Validation Rules |
|-------|---------------------|
| ChartRequest | Date range 3000 BCE - 3000 CE, valid coordinates, valid timezone |
| PlanetaryPosition | Ecliptic longitude 0-360°, valid celestial body enum |
| HDActivation | Gate 1-64, Line 1-6, chart_type "personality"/"design" |
| ChartCalculation | Exactly 13 activations per chart type |
| ChartResponse | Contains all required activation data, metadata present |
| EphemerisConfig | Valid source enum, ephemeris path exists |
| CalculationError | Valid error code from defined set |

---

## Implementation Notes

**Pydantic Usage**: All models use Pydantic for:
- Automatic JSON serialization/deserialization
- Runtime validation
- OpenAPI schema generation (for FastAPI)
- Type safety

**Immutability**: All models should be treated as immutable after creation (no in-place modifications).

**Testing**: Each model should have unit tests for:
- Valid data acceptance
- Invalid data rejection
- Edge cases (boundary values, empty fields)
- Serialization round-trips (JSON → Model → JSON)

---

**Next**: Generate API contracts in `contracts/` directory.
