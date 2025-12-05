"""Swiss Ephemeris implementation for planetary calculations"""

import swisseph as swe
from datetime import datetime
from src.models.celestial import CelestialBody


class SwissEphemerisSource:
    """Swiss Ephemeris data source for planetary positions"""

    # Mapping of CelestialBody to Swiss Ephemeris constants
    BODY_MAP = {
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
        CelestialBody.NORTH_NODE: swe.TRUE_NODE,
        # Earth is calculated as Sun + 180°
        # South Node is North Node + 180°
    }

    def __init__(self):
        """Initialize Swiss Ephemeris source"""
        # Set ephemeris path (optional, uses built-in data by default)
        # swe.set_ephe_path('/path/to/ephemeris/data')
        pass

    def get_source_name(self) -> str:
        """Get the name of this ephemeris source"""
        return "SwissEphemeris"

    def datetime_to_julian_day(self, dt: datetime) -> float:
        """
        Convert datetime to Julian Day number.

        Args:
            dt: datetime object (should be in UTC)

        Returns:
            Julian Day number
        """
        return swe.julday(
            dt.year,
            dt.month,
            dt.day,
            dt.hour + dt.minute / 60.0 + dt.second / 3600.0
        )

    def get_ecliptic_longitude(self, body: CelestialBody, jd: float) -> float:
        """
        Get ecliptic longitude for a celestial body.

        Args:
            body: Celestial body
            jd: Julian Day number

        Returns:
            Ecliptic longitude in degrees (0-360)
        """
        if body == CelestialBody.EARTH:
            # Earth is Sun + 180°
            sun_lon = self._calculate_position(CelestialBody.SUN, jd)
            return (sun_lon + 180.0) % 360.0
        elif body == CelestialBody.SOUTH_NODE:
            # South Node is North Node + 180°
            north_node_lon = self._calculate_position(CelestialBody.NORTH_NODE, jd)
            return (north_node_lon + 180.0) % 360.0
        else:
            return self._calculate_position(body, jd)

    def _calculate_position(self, body: CelestialBody, jd: float) -> float:
        """
        Calculate position using Swiss Ephemeris.

        Args:
            body: Celestial body
            jd: Julian Day number

        Returns:
            Ecliptic longitude in degrees
        """
        if body not in self.BODY_MAP:
            raise ValueError(f"Unknown celestial body: {body}")

        swe_body = self.BODY_MAP[body]

        # Calculate position
        # flags: SEFLG_SWIEPH (use Swiss Ephemeris), SEFLG_SPEED (calculate speed)
        result = swe.calc_ut(jd, swe_body, swe.FLG_SWIEPH | swe.FLG_SPEED)

        # result[0] is a tuple: (longitude, latitude, distance, speed_lon, speed_lat, speed_dist)
        longitude = result[0][0]

        return longitude
