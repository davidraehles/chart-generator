"""
Ephemeris configuration models.

Defines configuration for ephemeris calculation sources and settings.
"""

from typing import Literal, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class EphemerisConfig(BaseSettings):
    """
    Ephemeris source configuration.
    Loaded from environment variables with EPHEMERIS_ prefix.
    """

    source: Literal["swiss_ephemeris", "openastro_api", "nasa_jpl"] = Field(
        default="swiss_ephemeris",
        description="Primary ephemeris source to use for calculations",
    )
    ephemeris_path: str = Field(
        default="/app/data/ephemeris",
        description="Path to Swiss Ephemeris data files (if using swiss_ephemeris source)",
    )
    openastro_api_url: Optional[str] = Field(
        default=None,
        description="OpenAstro API endpoint (if using openastro_api source)",
    )

    class Config:
        env_prefix = "EPHEMERIS_"
        case_sensitive = False
