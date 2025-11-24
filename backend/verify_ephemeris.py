#!/usr/bin/env python3
"""
Swiss Ephemeris installation verification script.

Tests that pyswisseph is installed and ephemeris files are accessible.
Based on quickstart.md example.
"""

import os
import sys

try:
    import swisseph as swe
except ImportError:
    print("❌ FAILED: pyswisseph is not installed")
    print("Run: pip install pyswisseph==2.10.3.2")
    sys.exit(1)

# Set ephemeris path
ephe_path = os.getenv("EPHEMERIS_PATH", "./data/ephemeris")
if not os.path.exists(ephe_path):
    ephe_path = "/app/data/ephemeris"  # Docker path
if not os.path.exists(ephe_path):
    ephe_path = "data/ephemeris"  # Relative path

print(f"Ephemeris path: {ephe_path}")
swe.set_ephe_path(ephe_path)

# Test calculation: Sun position on May 21, 1985 at 14:30 UTC
try:
    jd = swe.julday(1985, 5, 21, 14.5)  # Julian Day
    print(f"Julian Day: {jd}")

    # Calculate Sun position
    result = swe.calc_ut(jd, swe.SUN)
    ecliptic_longitude = result[0][0]

    print(f"Sun ecliptic longitude: {ecliptic_longitude:.3f}° (0-360)")
    print(f"Expected: ~60° (late Taurus, May 21)")

    # Verify result is reasonable
    assert 0 <= ecliptic_longitude < 360, "Longitude out of range"
    assert 50 <= ecliptic_longitude <= 70, f"Sun position unexpected for May 21: {ecliptic_longitude}°"

    print("✅ Swiss Ephemeris setup successful!")
    print("✅ All tests passed")
    sys.exit(0)

except Exception as e:
    print(f"❌ FAILED: {str(e)}")
    print("\nTroubleshooting:")
    print("1. Download ephemeris files to data/ephemeris/")
    print("   wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1")
    print("   wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1")
    print("   wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1")
    print("2. Ensure EPHEMERIS_PATH environment variable is set correctly")
    print(f"   Current path: {ephe_path}")
    sys.exit(1)
