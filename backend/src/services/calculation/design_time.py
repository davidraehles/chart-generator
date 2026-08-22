"""Design time calculation for Human Design charts"""

from datetime import datetime, timedelta


def calculate_design_datetime(
    birth_dt_utc: datetime,
    ephemeris_source,
    target_arc: float = 88.0
) -> datetime:
    """
    Calculate the design moment (approximately 88 degrees of Sun movement before birth).

    In Human Design, the Design calculation is based on the position of the Sun
    approximately 88-89 days before birth (when the Sun was 88° earlier in its orbit).

    Args:
        birth_dt_utc: Birth datetime in UTC
        ephemeris_source: Ephemeris source for Sun position calculations
        target_arc: Target arc in degrees (default 88.0)

    Returns:
        datetime: Design moment in UTC
    """
    # Start with approximate 88 days before birth
    design_dt = birth_dt_utc - timedelta(days=88)

    # Get Sun position at birth
    print(f"[DEBUG] birth_dt_utc={birth_dt_utc} (tzinfo={birth_dt_utc.tzinfo})", flush=True)
    birth_jd = ephemeris_source.datetime_to_julian_day(birth_dt_utc)
    birth_sun_lon = ephemeris_source.get_ecliptic_longitude("Sun", birth_jd)
    print(f"[DEBUG] birth_jd={birth_jd:.6f} birth_sun_lon={birth_sun_lon:.6f}°", flush=True)

    # Iteratively refine to find exact 88° arc
    max_iterations = 10
    tolerance = 0.01  # 0.01 degrees tolerance

    for _ in range(max_iterations):
        design_jd = ephemeris_source.datetime_to_julian_day(design_dt)
        design_sun_lon = ephemeris_source.get_ecliptic_longitude("Sun", design_jd)

        # Calculate arc (handle wrap-around at 360°)
        arc = (birth_sun_lon - design_sun_lon) % 360.0

        # Check if we're close enough
        if abs(arc - target_arc) < tolerance:
            break

        # Adjust design time based on arc difference
        # Sun moves approximately 1° per day
        days_adjustment = (arc - target_arc)
        design_dt = design_dt + timedelta(days=days_adjustment)

    print(f"[DEBUG] design_dt_utc={design_dt} arc_final={arc:.6f}°", flush=True)
    return design_dt
