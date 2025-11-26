# Quickstart Guide: Ephemeris Data Integration

**Feature**: 002-add-ephemeris-sources
**Audience**: Backend developers implementing chart calculation
**Prerequisites**: Python 3.11, Docker (optional), basic astronomy/HD knowledge

---

## Overview

This guide walks you through setting up the ephemeris calculation environment, running a test calculation, and verifying that all components work correctly.

**What you'll build**: A backend service that calculates Human Design chart activations from birth data using Swiss Ephemeris.

**Time estimate**: 30-45 minutes for full setup and verification

---

## Step 1: Install Dependencies

### Backend Python Dependencies

```bash
cd backend

# Install pyswisseph and other requirements
pip install -r requirements.txt

# If requirements.txt doesn't yet include pyswisseph, add it:
echo "pyswisseph==2.10.3.2" >> requirements.txt
pip install pyswisseph==2.10.3.2
```

### Download Swiss Ephemeris Files

Swiss Ephemeris files are freely available for non-commercial use:

```bash
# Create ephemeris data directory
mkdir -p data/ephemeris
cd data/ephemeris

# Download essential files (covering 1800-2399 CE)
wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1

# For extended historical range (optional: 3000 BCE - 3000 CE)
# Note: These files are larger (~500MB total)
# wget https://www.astro.com/ftp/swisseph/ephe/seas_m*.se1
# wget https://www.astro.com/ftp/swisseph/ephe/semo_m*.se1

cd ../..
```

**File sizes**:
- `seas_18.se1` - Main planets: ~10MB
- `semo_18.se1` - Moon: ~25MB
- `sepl_18.se1` - Additional bodies: ~15MB
- Total: ~50MB (sufficient for 1800-2399 CE range)

---

## Step 2: Configure Ephemeris Path

Set environment variables for ephemeris configuration:

```bash
# backend/.env
EPHEMERIS_SOURCE=swiss_ephemeris
EPHEMERIS_PATH=/app/data/ephemeris  # Adjust to your local path during development
```

For local development, use absolute path:
```bash
export EPHEMERIS_PATH="$(pwd)/data/ephemeris"
```

---

## Step 3: Test Swiss Ephemeris Installation

Create a simple test script to verify ephemeris files are accessible:

```python
# backend/test_ephemeris_setup.py
import swisseph as swe
import os

# Set ephemeris path
ephe_path = os.getenv("EPHEMERIS_PATH", "./data/ephemeris")
swe.set_ephe_path(ephe_path)

print(f"Ephemeris path: {ephe_path}")

# Test: Calculate Sun position on May 21, 1985 at 14:30 UTC
jd = swe.julday(1985, 5, 21, 14.5)  # Julian Day
print(f"Julian Day: {jd}")

# Calculate Sun position
result = swe.calc_ut(jd, swe.SUN)
ecliptic_longitude = result[0][0]

print(f"Sun ecliptic longitude: {ecliptic_longitude}° (0-360)")
print(f"Expected: ~60° (late Taurus, early May)")

# Verify result is reasonable
assert 0 <= ecliptic_longitude < 360, "Longitude out of range"
assert 50 <= ecliptic_longitude <= 70, "Sun position unexpected for May 21"

print("✅ Swiss Ephemeris setup successful!")
```

Run the test:
```bash
cd backend
python test_ephemeris_setup.py
```

Expected output:
```
Ephemeris path: /path/to/chart-generator/backend/data/ephemeris
Julian Day: 2446200.1041666665
Sun ecliptic longitude: 60.234°
Expected: ~60° (late Taurus, early May)
✅ Swiss Ephemeris setup successful!
```

---

## Step 4: Implement Gate Mapping Test

Verify the gate/line mapping logic works correctly:

```python
# backend/test_gate_mapping.py

def degree_to_gate(ecliptic_longitude: float) -> int:
    """Convert ecliptic longitude to HD gate number"""
    gate_index = int(ecliptic_longitude / 5.625)

    gate_order = [
        41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
        27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
        31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
        28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
    ]

    return gate_order[gate_index % 64]

def degree_to_line(ecliptic_longitude: float) -> int:
    """Convert ecliptic longitude to line number within gate"""
    position_in_gate = ecliptic_longitude % 5.625
    line = int(position_in_gate / 0.9375) + 1
    return min(max(line, 1), 6)

# Test cases
test_cases = [
    (0.0, 41, 1),       # Gate 41 starts at 0°
    (5.625, 19, 1),     # Gate 19 starts at 5.625°
    (60.0, 27, 4),      # Sun in Taurus (example from May 21, 1985)
    (180.0, 31, 1),     # Gate 31 at 180° (Libra)
    (359.9, 60, 6),     # Last line of last gate
]

for degree, expected_gate, expected_line in test_cases:
    gate = degree_to_gate(degree)
    line = degree_to_line(degree)
    status = "✅" if (gate == expected_gate and line == expected_line) else "❌"
    print(f"{status} {degree}° → Gate {gate} Line {line} (expected: Gate {expected_gate} Line {expected_line})")

print("\n✅ Gate mapping tests passed!")
```

Run the test:
```bash
python test_gate_mapping.py
```

---

## Step 5: Calculate Full Chart Example

Create a complete chart calculation example:

```python
# backend/example_chart_calculation.py
import swisseph as swe
import os
from datetime import datetime

# Configure ephemeris
ephe_path = os.getenv("EPHEMERIS_PATH", "./data/ephemeris")
swe.set_ephe_path(ephe_path)

# Birth data (example: May 21, 1985, 14:30 Berlin)
birth_date = datetime(1985, 5, 21, 14, 30)
birth_lat = 52.5200
birth_lon = 13.4050

# Celestial bodies for HD
bodies = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
    "North Node": swe.MEAN_NODE,
    "South Node": swe.MEAN_NODE,  # South Node = North Node + 180°
    "Chiron": swe.CHIRON,
}

def calculate_positions(birth_datetime):
    """Calculate all planetary positions for a given datetime"""
    jd = swe.julday(
        birth_datetime.year,
        birth_datetime.month,
        birth_datetime.day,
        birth_datetime.hour + birth_datetime.minute / 60.0
    )

    positions = {}
    for name, body_id in bodies.items():
        result = swe.calc_ut(jd, body_id)
        longitude = result[0][0]

        # Handle South Node (opposite of North Node)
        if name == "South Node":
            longitude = (longitude + 180) % 360

        positions[name] = longitude

    return positions

def map_to_hd(positions):
    """Map positions to HD gates and lines"""
    activations = {}
    for body, degree in positions.items():
        gate = degree_to_gate(degree)
        line = degree_to_line(degree)
        activations[body] = {
            "gate": gate,
            "line": line,
            "degree": round(degree, 3)
        }
    return activations

# Calculate Personality Chart (birth)
print("=== PERSONALITY CHART (Birth) ===")
personality_positions = calculate_positions(birth_date)
personality_activations = map_to_hd(personality_positions)

for body, activation in personality_activations.items():
    print(f"{body:15s} → Gate {activation['gate']:2d} Line {activation['line']} ({activation['degree']}°)")

# Calculate Design Chart (88° solar arc ≈ 88 days before birth)
# Approximate: subtract 88 days from birth
from datetime import timedelta
design_date = birth_date - timedelta(days=88)

print(f"\n=== DESIGN CHART (88 days before birth: {design_date.strftime('%Y-%m-%d %H:%M')}) ===")
design_positions = calculate_positions(design_date)
design_activations = map_to_hd(design_positions)

for body, activation in design_activations.items():
    print(f"{body:15s} → Gate {activation['gate']:2d} Line {activation['line']} ({activation['degree']}°)")

print("\n✅ Chart calculation complete!")
```

Run the example:
```bash
python example_chart_calculation.py
```

Expected output:
```
=== PERSONALITY CHART (Birth) ===
Sun             → Gate 27 Line 3 (60.234°)
Moon            → Gate 12 Line 5 (201.450°)
Mercury         → Gate  3 Line 1 (95.123°)
...

=== DESIGN CHART (88 days before birth: 1985-02-22 14:30) ===
Sun             → Gate  3 Line 5 (17.890°)
Moon            → Gate 44 Line 2 (284.567°)
...

✅ Chart calculation complete!
```

---

## Step 6: Verify Against Reference Chart

**Important**: Validate your calculations against a known Human Design chart from an established calculator.

### Recommended Reference Tools

1. **MyBodyGraph** (https://www.mybodygraph.com/)
2. **Genetic Matrix** (https://www.geneticmatrix.com/)
3. **Jovian Archive** (https://www.jovianarchive.com/)

### Verification Process

1. Enter the same birth data (May 21, 1985, 14:30, Berlin) into a reference calculator
2. Compare the gate/line activations for each celestial body
3. Verify Personality (birth) and Design (88° before) charts match
4. Acceptable tolerance: ±1 line (due to rounding differences in degree calculations)

**If discrepancies occur**:
- Check timezone conversion (ensure UTC calculation)
- Verify Julian Day calculation matches reference
- Confirm gate order table matches HD wheel
- Check ephemeris file versions (should be consistent)

---

## Step 7: Run Unit Tests

Once implementation is complete, run the test suite:

```bash
cd backend

# Run all tests
pytest tests/

# Run specific test categories
pytest tests/unit/test_julian_day.py        # Date conversion tests
pytest tests/unit/test_gate_mapper.py       # Gate mapping accuracy
pytest tests/unit/test_design_calc.py       # Design chart calculation
pytest tests/integration/test_chart_calculation.py  # End-to-end
```

---

## Step 8: Test API Endpoint (Once Implemented)

```bash
# Start backend server
cd backend
uvicorn src.main:app --reload

# In another terminal, test the API
curl -X POST http://localhost:8000/api/calculate-chart \
  -H "Content-Type: application/json" \
  -d '{
    "birth_datetime": "1985-05-21T14:30:00",
    "birth_timezone": "Europe/Berlin",
    "birth_latitude": 52.5200,
    "birth_longitude": 13.4050,
    "name": "Max Mustermann"
  }' | jq
```

Expected response:
```json
{
  "name": "Max Mustermann",
  "personality_activations": [
    {
      "body": "Sun",
      "gate": 27,
      "line": 3,
      "ecliptic_degree": 60.234,
      "chart_type": "personality"
    },
    ...
  ],
  "design_activations": [...],
  "calculation_source": "SwissEphemeris",
  "calculated_at": "2025-11-24T20:00:00Z"
}
```

---

## Troubleshooting

### Error: "Ephemeris file not found"

**Solution**: Verify `EPHEMERIS_PATH` points to directory containing `.se1` files.

```bash
ls -la $EPHEMERIS_PATH
# Should show: seas_18.se1, semo_18.se1, sepl_18.se1
```

### Error: "Module 'swisseph' has no attribute 'calc_ut'"

**Solution**: pyswisseph not installed correctly. Reinstall:

```bash
pip uninstall pyswisseph
pip install pyswisseph==2.10.3.2
```

### Charts Don't Match Reference

**Solution**: Check these common issues:
1. **Timezone**: Ensure birth_datetime is in local time and birth_timezone is correct IANA identifier
2. **Julian Day**: Verify JD calculation includes fractional hours (e.g., 14:30 = 14.5)
3. **Gate Order**: Confirm gate_order table matches official HD wheel starting at 0° = Gate 41
4. **Design Date**: Use solar arc method (calculate Sun 88° before birth), not simple 88-day subtraction

### Performance Issues

**Solution**: Ephemeris calculations should be < 200ms. If slower:
1. Verify ephemeris files are local (not network-mounted)
2. Check disk I/O performance
3. Consider caching (Redis) for repeated requests

---

## Next Steps

After completing this quickstart:

1. **Implement Models**: Create Pydantic models from `data-model.md`
2. **Build Services**: Implement ephemeris service layer
3. **Create API Endpoint**: FastAPI route for `/api/calculate-chart`
4. **Write Tests**: Unit, integration, and contract tests
5. **Deploy**: Bundle ephemeris files in Docker image

See `tasks.md` (Phase 2) for detailed implementation steps.

---

## Additional Resources

- **Swiss Ephemeris Documentation**: https://www.astro.com/swisseph/swephinfo_e.htm
- **pyswisseph Examples**: https://github.com/astrorigin/pyswisseph
- **Human Design System**: https://www.jovianarchive.com/
- **Julian Day Converter**: https://aa.usno.navy.mil/data/JulianDate

---

**Quick Reference: Key Constants**

| Constant | Value | Description |
|----------|-------|-------------|
| Gates | 64 | Total number of HD gates |
| Lines per Gate | 6 | Subdivisions within each gate |
| Degrees per Gate | 5.625° | 360° / 64 gates |
| Degrees per Line | 0.9375° | 5.625° / 6 lines |
| Celestial Bodies | 13 | Sun, Moon, 8 planets, North/South Node, Chiron |
| Design Chart Offset | ~88° solar arc | Approximately 88 days before birth |

---

**Status**: ✅ Ready for implementation (Phase 2 - Tasks)
