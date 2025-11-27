"""
Julian Day conversion utilities.

Converts datetime objects to Julian Day Numbers for ephemeris calculations.
"""

from datetime import datetime
import swisseph as swe


def datetime_to_julian_day(dt: datetime) -> float:
    """
    Convert a datetime object to Julian Day Number.

    Julian Day is the continuous count of days since the beginning of
    the Julian period (January 1, 4713 BCE). It's the standard time
    representation for astronomical calculations.

    Args:
        dt: Datetime object (can be any timezone, time component required)

    Returns:
        Julian Day Number (float) including fractional day

    Example:
        >>> from datetime import datetime
        >>> dt = datetime(1985, 5, 21, 14, 30)  # May 21, 1985 at 14:30
        >>> jd = datetime_to_julian_day(dt)
        >>> print(f"JD: {jd:.6f}")
        JD: 2446200.104167

    Note:
        Swiss Ephemeris's julday function expects:
        - year, month, day (integers)
        - hour (float, decimal hours: 14.5 = 14:30)
    """
    # Convert time to decimal hours
    decimal_hour = dt.hour + dt.minute / 60.0 + dt.second / 3600.0

    # Use Swiss Ephemeris julian day calculation
    # This handles Gregorian/Julian calendar transitions correctly
    julian_day = swe.julday(dt.year, dt.month, dt.day, decimal_hour)

    return julian_day


def julian_day_to_datetime(jd: float) -> datetime:
    """
    Convert Julian Day Number back to datetime (UTC).

    Args:
        jd: Julian Day Number

    Returns:
        Datetime object in UTC

    Note:
        This is a utility function for testing/debugging.
        Ephemeris calculations work directly with Julian Days.
    """
    # Swiss Ephemeris revjul returns (year, month, day, hour)
    year, month, day, hour = swe.revjul(jd)

    # Convert decimal hour to hour, minute, second
    hours = int(hour)
    minutes = int((hour - hours) * 60)
    seconds = int(((hour - hours) * 60 - minutes) * 60)

    return datetime(year, month, day, hours, minutes, seconds)
