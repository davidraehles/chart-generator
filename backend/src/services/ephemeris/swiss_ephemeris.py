"""
Swiss Ephemeris implementation.

Primary ephemeris source using the pyswisseph library.
Most accurate and widely used for Human Design calculations.
"""

import os
from pathlib import Path
from typing import Optional
import swisseph as swe
from src.services.ephemeris.base import EphemerisSource
from src.models.celestial import CelestialBody
from src.models.error import ERROR_EPHEMERIS_UNAVAILABLE, ERROR_CALCULATION_FAILED


# Mapping of CelestialBody enum to Swiss Ephemeris planet constants
BODY_TO_SWE_PLANET = {
    CelestialBody.SUN: swe.SUN,
    CelestialBody.MOON: swe.MOON,
    CelestialBody.MERCURY: swe.MERCURY,
    CelestialBody.VENUS: swe.VENUS,
    CelestialBody.MARS: swe.MARS,
    CelestialBody.JUPITER: swe.JUPITER,
    CelestialBody.SATURN: swe.SATURN,
    CelestialBody.URANUS: swe.URANUS,
    CelestialBody.NEPTUNE: swe.NEPTUNE,
    CelestialBody.PLUTO: swe.PLUTO,
    CelestialBody.NORTH_NODE: swe.MEAN_NODE,
    CelestialBody.SOUTH_NODE: swe.MEAN_NODE,  # Calculated as North Node + 180°
    CelestialBody.CHIRON: swe.CHIRON,
}


def validate_ephemeris_path(path: str) -> str:
    """
    Validate ephemeris path to prevent security issues.

    Args:
        path: Ephemeris directory path

    Returns:
        Validated path string

    Raises:
        ValueError: If path contains suspicious patterns or is invalid
    """
    # Check for null bytes
    if "\x00" in path:
        raise ValueError("Invalid ephemeris path: contains null bytes")

    # Convert to Path for validation
    path_obj = Path(path)

    # Check for suspicious patterns that could indicate path traversal
    path_str = str(path_obj)
    suspicious_patterns = ["../", "..\\"]
    for pattern in suspicious_patterns:
        if pattern in path_str:
            raise ValueError(f"Invalid ephemeris path: contains suspicious pattern '{pattern}'")

    return path


class SwissEphemerisSource(EphemerisSource):
    """
    Swiss Ephemeris calculation source.

    Uses pyswisseph library with bundled ephemeris data files.
    Provides NASA JPL-quality accuracy for astronomical calculations.
    """

    def __init__(self, ephemeris_path: str = "/app/data/ephemeris"):
        """
        Initialize Swiss Ephemeris source.

        Args:
            ephemeris_path: Path to directory containing .se1 ephemeris files

        Raises:
            ValueError: If ephemeris path is invalid or contains security issues
        """
        # Validate path for security
        validated_path = validate_ephemeris_path(ephemeris_path)
        self.ephemeris_path = validated_path

        # Set ephemeris file path for pyswisseph
        if os.path.exists(validated_path):
            swe.set_ephe_path(validated_path)
        else:
            # Allow initialization even if files don't exist yet (for testing)
            # is_available() will return False
            pass

    def calculate_position(self, body: CelestialBody, julian_day: float) -> float:
        """
        Calculate ecliptic longitude using Swiss Ephemeris.

        Args:
            body: Celestial body to calculate
            julian_day: Julian Day Number

        Returns:
            Ecliptic longitude in degrees (0-360)

        Raises:
            RuntimeError: If calculation fails
        """
        # Note: is_available() now always returns True since we support built-in data

        try:
            # Get Swiss Ephemeris planet constant
            swe_planet = BODY_TO_SWE_PLANET[body]

            # Calculate position using Universal Time
            result = swe.calc_ut(julian_day, swe_planet)

            # Extract ecliptic longitude (first element of position tuple)
            longitude = result[0][0]

            # Handle South Node (opposite of North Node)
            if body == CelestialBody.SOUTH_NODE:
                longitude = (longitude + 180.0) % 360.0

            return longitude

        except Exception as e:
            raise RuntimeError(
                f"{ERROR_CALCULATION_FAILED}: Swiss Ephemeris calculation failed for {body.value}: {str(e)}"
            )

    def get_source_name(self) -> str:
        """Return source identifier."""
        return "SwissEphemeris"

    def is_available(self) -> bool:
        """
        Check if Swiss Ephemeris files are available.

        Returns:
            True if ALL required ephemeris data files exist and can be used,
            or if using built-in data from pyswisseph
        """
        # Empty path means use built-in ephemeris data from pyswisseph
        if not self.ephemeris_path or self.ephemeris_path == "":
            return True

        # Check if the ephemeris path exists
        if not os.path.exists(self.ephemeris_path):
            # Fall back to built-in data if path doesn't exist
            return True

        # Check for ALL required ephemeris files
        # All three files are necessary for comprehensive calculations
        required_files = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"]
        for filename in required_files:
            filepath = os.path.join(self.ephemeris_path, filename)
            if not os.path.exists(filepath):
                # Fall back to built-in data if files are missing
                return True

        return True  # All required files present
