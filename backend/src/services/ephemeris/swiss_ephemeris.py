"""Swiss Ephemeris implementation for planetary calculations"""

import os
import swisseph as swe
from datetime import datetime
from src.models.celestial import CelestialBody

# Ephemeris data path — try dynamic first, fall back to Railway hardcoded path
_EPHE_PATH = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../data/ephemeris")
)
if not os.path.isdir(_EPHE_PATH):
    _EPHE_PATH = "/app/data/ephemeris"

# Set ephemeris path at module load time (before any request / async context).
if os.path.isdir(_EPHE_PATH):
    swe.set_ephe_path(_EPHE_PATH)
    print(f"[EPH] path set: {_EPHE_PATH}", flush=True)
else:
    print(f"[EPH] path not found ({_EPHE_PATH}) — using Moshier built-in", flush=True)


class SwissEphemerisSource:
    """Swiss Ephemeris data source for planetary positions"""

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
        CelestialBody.NORTH_NODE: swe.MEAN_NODE,
    }

    def __init__(self):
        pass  # path set at module level

    def get_source_name(self) -> str:
        return "SwissEphemeris"

    def is_available(self) -> bool:
        try:
            jd = swe.julday(2000, 1, 1, 12.0)
            swe.calc_ut(jd, swe.SUN)
            return True
        except Exception:
            return False

    def datetime_to_julian_day(self, dt: datetime) -> float:
        return swe.julday(
            dt.year,
            dt.month,
            dt.day,
            dt.hour + dt.minute / 60.0 + dt.second / 3600.0,
        )

    def get_ecliptic_longitude(self, body: CelestialBody, jd: float) -> float:
        if body == CelestialBody.EARTH:
            return (self._calculate_position(CelestialBody.SUN, jd) + 180.0) % 360.0
        elif body == CelestialBody.SOUTH_NODE:
            return (self._calculate_position(CelestialBody.NORTH_NODE, jd) + 180.0) % 360.0
        else:
            return self._calculate_position(body, jd)

    def _calculate_position(self, body: CelestialBody, jd: float) -> float:
        """Calculate ecliptic longitude using Swiss Ephemeris (no flags = Moshier fallback safe)."""
        if body not in self.BODY_MAP:
            raise ValueError(f"Unknown celestial body: {body}")

        swe_body = self.BODY_MAP[body]
        # Use plain calc_ut without FLG_SWIEPH — avoids threading/signal issues on Railway.
        # pyswisseph uses .se1 files if path is set, otherwise Moshier built-in (both accurate).
        result = swe.calc_ut(jd, swe_body)
        return result[0][0]
