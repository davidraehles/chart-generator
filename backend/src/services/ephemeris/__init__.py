"""
Ephemeris service initialization and configuration.

Provides configuration loading and service factory.
"""

from src.models.ephemeris import EphemerisConfig


def load_config() -> EphemerisConfig:
    """
    Load ephemeris configuration from environment variables.

    Returns:
        EphemerisConfig with settings loaded from EPHEMERIS_* env vars

    Raises:
        ValidationError: If configuration is invalid
    """
    return EphemerisConfig()


__all__ = ["load_config", "EphemerisConfig"]
