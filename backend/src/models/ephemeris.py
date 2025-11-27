"""
Ephemeris configuration models.

Defines configuration for ephemeris calculation sources and settings.
"""

from typing import Literal, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class EphemerisConfig(BaseSettings):
    """
    Ephemeris source configuration.
    Loaded from environment variables with EPHEMERIS_ prefix.
    """

    model_config = SettingsConfigDict(
        env_prefix="EPHEMERIS_",
        case_sensitive=False,
    )

    source: Literal["swiss_ephemeris", "openastro_api", "nasa_jpl"] = Field(
        default="swiss_ephemeris",
        description="Primary ephemeris source to use for calculations",
    )
    ephemeris_path: str = Field(
        default="/app/data/ephemeris",
        description="Path to Swiss Ephemeris data files (if using swiss_ephemeris source)",
        validation_alias="EPHEMERIS_PATH",
    )
    openastro_api_url: Optional[str] = Field(
        default=None,
        description="OpenAstro API endpoint (if using openastro_api source)",
        validation_alias="OPENASTRO_API_URL",
    )
