from pydantic import BaseModel, Field
from typing import List, Optional


class ChartRequest(BaseModel):
    """Birth data input from user"""
    firstName: str = Field(..., min_length=2, max_length=50)
    birthDate: str = Field(..., description="Format: TT.MM.JJJJ")
    birthTime: str = Field(..., description="Format: HH:MM")
    birthTimeApproximate: bool = Field(default=False)
    birthPlace: str = Field(..., min_length=2, max_length=200)


class TypeInfo(BaseModel):
    """Human Design Type information"""
    code: str
    label: str
    shortDescription: str


class AuthorityInfo(BaseModel):
    """Decision Authority information"""
    code: str
    label: str
    decisionHint: str


class ProfileInfo(BaseModel):
    """Profile information"""
    code: str  # e.g., "4/1"
    shortDescription: str


class Center(BaseModel):
    """Energy Center information"""
    name: str
    code: str
    defined: bool


class Channel(BaseModel):
    """Channel information"""
    code: str  # e.g., "34-20"


class Gate(BaseModel):
    """Gate information"""
    code: str  # e.g., "34.2"


class IncarnationCross(BaseModel):
    """Incarnation Cross information"""
    code: str
    name: str
    gates: List[str]  # e.g., ["15", "10", "5", "35"]


class ChartResponse(BaseModel):
    """Complete HD chart data response"""
    firstName: str
    type: TypeInfo
    authority: AuthorityInfo
    profile: ProfileInfo
    centers: List[Center]
    channels: List[Channel]
    gates: dict  # {"conscious": [...], "unconscious": [...]}
    incarnationCross: IncarnationCross
    shortImpulse: str


# ============================================================================
# Ephemeris Calculation Models (Feature 002)
# For internal planetary position calculations
# ============================================================================

from datetime import datetime
from pydantic import validator
from src.models.celestial import CelestialBody


class EphemerisChartRequest(BaseModel):
    """
    Request for ephemeris-based chart calculation.
    Used by /api/calculate-chart endpoint for planetary positions.
    """

    birth_datetime: datetime = Field(
        ...,
        description="Birth date and time in local timezone",
        example="1985-05-21T14:30:00",
    )
    birth_timezone: str = Field(
        ...,
        description="IANA timezone identifier (e.g., 'Europe/Berlin')",
        example="Europe/Berlin",
    )
    birth_latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Birth location latitude in decimal degrees",
        example=52.5200,
    )
    birth_longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Birth location longitude in decimal degrees",
        example=13.4050,
    )
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional name for personalization",
    )

    @validator("birth_datetime")
    def validate_datetime_format(cls, v):
        """Ensure birth_datetime is a valid datetime object."""
        if not isinstance(v, datetime):
            raise ValueError("birth_datetime must be a valid datetime")
        return v


class PlanetaryPosition(BaseModel):
    """
    Position of a celestial body in ecliptic coordinates with HD gate/line mapping.
    Combines raw astronomical data with Human Design system mapping.
    """

    body: CelestialBody = Field(..., description="Celestial body")
    ecliptic_longitude: float = Field(
        ...,
        ge=0,
        lt=360,
        description="Position in degrees along the ecliptic (0-360)",
    )
    gate: int = Field(
        ...,
        ge=1,
        le=64,
        description="Human Design gate number (1-64, I'Ching hexagram)",
    )
    line: int = Field(
        ...,
        ge=1,
        le=6,
        description="Line number within the gate (1-6)",
    )
    gate_line: str = Field(
        ...,
        description="Formatted gate.line notation (e.g., '41.3')",
    )
    calculation_timestamp: datetime = Field(
        ...,
        description="UTC timestamp when position was calculated",
    )
    julian_day: float = Field(
        ...,
        description="Julian Day number used for calculation",
    )
    source: str = Field(
        ...,
        description="Ephemeris source used (e.g., 'SwissEphemeris')",
    )


class EphemerisChartResponse(BaseModel):
    """
    Ephemeris calculation response with planetary positions.
    Phase 4 (US1+US2): Returns both personality (birth) and design positions.
    """

    name: Optional[str] = None
    personality_activations: List[PlanetaryPosition] = Field(
        ...,
        min_items=13,
        max_items=13,
        description="13 planetary positions from birth moment",
    )
    design_activations: List[PlanetaryPosition] = Field(
        ...,
        min_items=13,
        max_items=13,
        description="13 planetary positions from design moment (~88 days before birth)",
    )
    design_datetime: datetime = Field(
        ...,
        description="Calculated design moment (when Sun was 88° earlier)",
    )
    calculation_source: str = Field(
        ..., description="Ephemeris source used"
    )
    calculated_at: datetime = Field(
        ..., description="When calculation was performed"
    )
