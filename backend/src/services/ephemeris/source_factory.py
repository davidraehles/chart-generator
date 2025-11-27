"""
Ephemeris source factory.

Factory function to create and return the appropriate EphemerisSource
based on configuration, with fallback to Swiss Ephemeris if configured
source is unavailable.
"""

from src.services.ephemeris.base import EphemerisSource
from src.services.ephemeris.swiss_ephemeris import SwissEphemerisSource
from src.services.ephemeris.openastro_api import OpenAstroAPISource
from src.services.ephemeris.nasa_jpl import NASAJPLSource
from src.services.ephemeris import load_config


def get_ephemeris_source() -> EphemerisSource:
    """
    Get the appropriate ephemeris source based on configuration.

    Loads configuration from environment variables and returns the configured
    source. If the configured source is unavailable, falls back to
    Swiss Ephemeris.

    Returns:
        EphemerisSource: An initialized and available ephemeris source

    Raises:
        RuntimeError: If no ephemeris source is available
    """
    config = load_config()

    # Create sources dictionary
    sources = {
        "swiss_ephemeris": SwissEphemerisSource(config.ephemeris_path),
        "openastro_api": OpenAstroAPISource(config.openastro_api_url or "https://api.openastro.org/v1"),
        "nasa_jpl": NASAJPLSource(),
    }

    # Try to use configured source
    configured_source = sources.get(config.source)
    if configured_source and configured_source.is_available():
        return configured_source

    # Fallback to Swiss Ephemeris if configured source unavailable
    swiss_source = sources["swiss_ephemeris"]
    if swiss_source.is_available():
        return swiss_source

    raise RuntimeError(
        f"No ephemeris source available. Configured source '{config.source}' is unavailable, "
        "and fallback Swiss Ephemeris is also unavailable."
    )
