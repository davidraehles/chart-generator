"""Ephemeris services package initialization"""

from src.models.ephemeris import EphemerisConfig


def load_config() -> EphemerisConfig:
    """
    Load ephemeris configuration from environment variables.

    Returns:
        EphemerisConfig instance with settings from environment

    Raises:
        ValidationError: If invalid configuration is provided
    """
    return EphemerisConfig()


__all__ = ["load_config"]
