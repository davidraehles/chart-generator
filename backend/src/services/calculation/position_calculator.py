"""
Planetary position calculator.

Calculates ecliptic positions for all 13 celestial bodies used in Human Design.
"""

from datetime import datetime
from typing import List
from src.models.celestial import CelestialBody
from src.models.chart import PlanetaryPosition
from src.services.ephemeris.base import EphemerisSource
from src.services.calculation.julian_day import datetime_to_julian_day
from src.services.calculation.gate_line_mapper import (
    ecliptic_to_gate_line,
    format_gate_line,
)


class PositionCalculator:
    """
    Calculates planetary positions for Human Design charts.

    Uses an ephemeris source to calculate ecliptic longitude for
    all 13 celestial bodies at a given moment.
    """

    def __init__(self, ephemeris_source: EphemerisSource):
        """
        Initialize position calculator.

        Args:
            ephemeris_source: Ephemeris calculation source (Swiss Ephemeris, etc.)
        """
        self.ephemeris_source = ephemeris_source

    def calculate_positions(
        self, calculation_datetime: datetime
    ) -> List[PlanetaryPosition]:
        """
        Calculate positions for all 13 celestial bodies.

        Args:
            calculation_datetime: Moment to calculate positions for (UTC or with timezone)

        Returns:
            List of 13 PlanetaryPosition objects, one per celestial body

        Raises:
            RuntimeError: If ephemeris source is unavailable or calculation fails
        """
        # Convert datetime to Julian Day
        julian_day = datetime_to_julian_day(calculation_datetime)

        # Get source name for metadata
        source_name = self.ephemeris_source.get_source_name()

        # Calculate position for each of the 13 celestial bodies
        positions = []
        for body in CelestialBody.all_bodies():
            # Calculate ecliptic longitude using ephemeris source
            longitude = self.ephemeris_source.calculate_position(body, julian_day)

            # Map ecliptic longitude to Human Design gate and line
            gate, line = ecliptic_to_gate_line(longitude)
            gate_line_str = format_gate_line(gate, line)

            # Create position object with gate/line mapping
            position = PlanetaryPosition(
                body=body,
                ecliptic_longitude=longitude,
                gate=gate,
                line=line,
                gate_line=gate_line_str,
                calculation_timestamp=datetime.utcnow(),
                julian_day=julian_day,
                source=source_name,
            )
            positions.append(position)

        return positions

    def is_available(self) -> bool:
        """
        Check if calculator is ready to perform calculations.

        Returns:
            True if ephemeris source is available
        """
        return self.ephemeris_source.is_available()
