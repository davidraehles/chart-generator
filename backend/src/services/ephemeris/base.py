"""
Abstract base class for ephemeris calculation sources.

Defines the interface that all ephemeris sources must implement.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from src.models.celestial import CelestialBody


class EphemerisSource(ABC):
    """
    Abstract base class for ephemeris calculation sources.

    All ephemeris implementations (Swiss Ephemeris, OpenAstro API, NASA JPL)
    must implement this interface to enable source switching.
    """

    @abstractmethod
    def calculate_position(
        self, body: CelestialBody, julian_day: float
    ) -> float:
        """
        Calculate ecliptic longitude for a celestial body at a given Julian Day.

        Args:
            body: The celestial body to calculate position for
            julian_day: Julian Day Number (JD) for the calculation

        Returns:
            Ecliptic longitude in degrees (0-360)

        Raises:
            CalculationError: If calculation fails
        """
        pass

    @abstractmethod
    def get_source_name(self) -> str:
        """
        Get the name of this ephemeris source for metadata.

        Returns:
            Source identifier (e.g., "SwissEphemeris", "OpenAstroAPI")
        """
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if this ephemeris source is available and ready to use.

        Returns:
            True if source can perform calculations, False otherwise
        """
        pass
