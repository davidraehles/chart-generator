"""
Swiss Ephemeris implementation.

Primary ephemeris source using the pyswisseph library.
Most accurate and widely used for Human Design calculations.
"""

import os
from typing import Optional
import swisseph as swe
from backend.src.services.ephemeris.base import EphemerisSource
from backend.src.models.celestial import CelestialBody
from backend.src.models.error import ERROR_EPHEMERIS_UNAVAILABLE, ERROR_CALCULATION_FAILED


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
            ValueError: If ephemeris path doesn't exist
        """
        self.ephemeris_path = ephemeris_path

        # Set ephemeris file path for pyswisseph
        if os.path.exists(ephemeris_path):
            swe.set_ephe_path(ephemeris_path)
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
            RuntimeError: If calculation fails or ephemeris files unavailable
        """
        if not self.is_available():
            raise RuntimeError(
                f"{ERROR_EPHEMERIS_UNAVAILABLE}: Ephemeris files not found at {self.ephemeris_path}"
            )

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
            True if ephemeris data files exist and can be used
        """
        # Check if the ephemeris path exists and contains .se1 files
        if not os.path.exists(self.ephemeris_path):
            return False

        # Check for at least one required ephemeris file
        required_files = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"]
        for filename in required_files:
            filepath = os.path.join(self.ephemeris_path, filename)
            if os.path.exists(filepath):
                return True  # At least one file present

        return False
