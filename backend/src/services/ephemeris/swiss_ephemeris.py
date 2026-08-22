"""Swiss Ephemeris implementation for planetary calculations"""

import os
import swisseph as swe
import multiprocessing
import traceback
from datetime import datetime
from src.models.celestial import CelestialBody

# Ephemeris data is at backend/data/ephemeris/ (locally) or /app/data/ephemeris/ (Docker/Railway)
_EPHE_PATH = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../data/ephemeris")
)


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
        CelestialBody.NORTH_NODE: swe.MEAN_NODE,
        # Earth is calculated as Sun + 180°
        # South Node is calculated as North Node + 180°
    }

    def __init__(self):
        """Initialize Swiss Ephemeris source and set ephemeris data path."""
        # Point pyswisseph at the bundled .se1 data files for accurate calculations.
        # Without this, the library silently falls back to the less accurate Moshier
        # approximation which can produce wrong gate assignments for some dates.
        if os.path.isdir(_EPHE_PATH):
            swe.set_ephe_path(_EPHE_PATH)

    def get_source_name(self) -> str:
        """Get the name of this ephemeris source"""
        return "SwissEphemeris"

    def is_available(self) -> bool:
        """
        Check if Swiss Ephemeris is available and usable.

        Returns:
            True if swisseph can perform calculations, False otherwise
        """
        try:
            # Simple test: calculate Sun position at J2000 epoch
            jd = swe.julday(2000, 1, 1, 12.0)
            swe.calc_ut(jd, swe.SUN)
            return True
        except Exception:
            return False

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

        Tries direct calculation first; if signal/threading errors occur (common in worker threads),
        falls back to subprocess calculation.

        Args:
            body: Celestial body
            jd: Julian Day number

        Returns:
            Ecliptic longitude in degrees
        """
        if body not in self.BODY_MAP:
            raise ValueError(f"Unknown celestial body: {body}")

        swe_body = self.BODY_MAP[body]

        try:
            # Try direct calculation first
            result = swe.calc_ut(jd, swe_body, swe.FLG_SWIEPH | swe.FLG_SPEED)
            longitude = result[0][0]
            # DEBUG: log Sun position to diagnose gate/line errors
            if swe_body == swe.SUN:
                print(f"[DEBUG] Sun lon={longitude:.6f}° jd={jd:.6f} path_exists={os.path.isdir(_EPHE_PATH)} path={_EPHE_PATH}", flush=True)
            return longitude
        except Exception as exc:
            # Check if this is a signal-in-thread error
            exc_str = str(exc).lower()
            if swe_body == swe.SUN:
                print(f"[DEBUG] Sun calc exception: {exc}", flush=True)
            if "signal only works" in exc_str or "signal only works in main thread" in exc_str:
                # Fall back to subprocess calculation
                return self._calc_in_subprocess(swe_body, jd)
            # Re-raise other exceptions
            raise

    def _calc_in_subprocess(self, swe_body: int, jd: float) -> float:
        """
        Run swisseph calculation in a separate process to avoid signal/threading errors.

        Args:
            swe_body: Swiss Ephemeris body constant
            jd: Julian Day number

        Returns:
            Ecliptic longitude in degrees

        Raises:
            RuntimeError: If calculation fails or times out
        """
        def worker(q, swe_body_arg, jd_arg):
            """Worker function to run in subprocess"""
            try:
                import swisseph as swe_local
                res = swe_local.calc_ut(jd_arg, swe_body_arg, swe_local.FLG_SWIEPH | swe_local.FLG_SPEED)
                q.put(("ok", res[0][0]))
            except Exception as e:
                q.put(("err", f"{type(e).__name__}: {e}\n{traceback.format_exc()}"))

        ctx = multiprocessing.get_context("spawn")
        q = ctx.Queue()
        p = ctx.Process(target=worker, args=(q, swe_body, jd))
        p.start()
        p.join(timeout=15)  # 15 second timeout per calculation

        if not q.empty():
            status, payload = q.get()
            if status == "ok":
                return payload
            else:
                raise RuntimeError(f"swisseph subprocess error: {payload}")
        else:
            # Timeout
            p.terminate()
            raise RuntimeError("swisseph calculation timed out in subprocess")
