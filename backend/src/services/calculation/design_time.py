"""
Design time calculator for Human Design.

Calculates the design moment approximately 88 days before birth,
when the Sun was 88° earlier in the ecliptic.
"""

from datetime import datetime, timedelta
import swisseph as swe
from src.models.celestial import CelestialBody
from src.services.ephemeris.base import EphemerisSource
from src.services.calculation.julian_day import datetime_to_julian_day


def calculate_design_datetime(
    birth_datetime: datetime,
    ephemeris_source: EphemerisSource,
    target_arc: float = 88.0,
    max_iterations: int = 10
) -> datetime:
    """
    Calculate the design moment when Sun was target_arc degrees earlier.

    Uses iterative approximation starting from ~88 days before birth.

    Args:
        birth_datetime: Birth moment (personality)
        ephemeris_source: Ephemeris source for Sun position calculations
        target_arc: Solar arc in degrees (default 88.0 for Human Design)
        max_iterations: Maximum refinement iterations

    Returns:
        Design datetime when Sun was at target_arc degrees before birth position

    Raises:
        RuntimeError: If design time cannot be calculated
    """
    # Get Sun's position at birth
    birth_jd = datetime_to_julian_day(birth_datetime)
    birth_sun_longitude = ephemeris_source.calculate_position(
        CelestialBody.SUN, birth_jd
    )

    # Calculate target Sun position (88° earlier, wrapping at 0°)
    target_sun_longitude = (birth_sun_longitude - target_arc) % 360.0

    # Initial estimate: approximately 88 days before birth
    # Sun moves roughly 1° per day, so 88° ≈ 88 days
    estimate_days = target_arc  # ~88 days
    design_datetime = birth_datetime - timedelta(days=estimate_days)

    # Iteratively refine the design datetime
    for iteration in range(max_iterations):
        design_jd = datetime_to_julian_day(design_datetime)
        design_sun_longitude = ephemeris_source.calculate_position(
            CelestialBody.SUN, design_jd
        )

        # Calculate the angular difference
        # Handle wraparound at 0°/360°
        diff = (target_sun_longitude - design_sun_longitude + 180) % 360 - 180

        # If we're within 0.01° (about 15 minutes), we're done
        if abs(diff) < 0.01:
            return design_datetime

        # Adjust estimate based on Sun's current velocity (~0.986°/day)
        # Move forward if we're too far back, backward if too far forward
        adjustment_days = diff / 0.986
        design_datetime = design_datetime + timedelta(days=adjustment_days)

    # If we didn't converge, return the best estimate
    return design_datetime
