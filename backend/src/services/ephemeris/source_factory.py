"""Factory for creating ephemeris data sources"""

from src.services.ephemeris.swiss_ephemeris import SwissEphemerisSource


def get_ephemeris_source(source_type: str = "swiss"):
    """
    Get ephemeris data source.

    Args:
        source_type: Type of ephemeris source ("swiss" for Swiss Ephemeris)

    Returns:
        EphemerisSource instance
    """
    if source_type == "swiss":
        return SwissEphemerisSource()
    else:
        raise ValueError(f"Unknown ephemeris source type: {source_type}")
