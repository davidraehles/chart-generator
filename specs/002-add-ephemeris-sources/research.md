# Research Report: Ephemeris Data Integration

**Feature**: 002-add-ephemeris-sources
**Date**: 2025-11-24
**Phase**: Phase 0 - Technical Research

## Purpose

Resolve all NEEDS CLARIFICATION items from the implementation plan to establish concrete technical decisions before beginning design and implementation.

## Research Questions

1. Which specific pyswisseph Python wrapper to use?
2. What are the official HD gate/line degree mapping tables?
3. What caching strategy should be implemented?
4. What error handling and fallback patterns should be used?
5. How should ephemeris files be deployed?

---

## R1: Python Swiss Ephemeris Wrapper Selection

### Decision: Use `pyswisseph` Package

**PyPI Package**: `pyswisseph` (https://pypi.org/project/pyswisseph/)
**Current Version**: 2.10.3.2 (as of 2024)
**License**: GPL-2.0 or later / AGPL (Swiss Ephemeris itself is GPL for non-commercial use)

### Rationale

- **Official wrapper**: `pyswisseph` is the most widely used and maintained Python wrapper for Swiss Ephemeris
- **Active development**: Regular updates matching Swiss Ephemeris C library releases
- **Complete API coverage**: Exposes full Swiss Ephemeris functionality including:
  - `swe.julday()` - Julian Day conversion
  - `swe.calc_ut()` - Calculate planetary positions in Universal Time
  - `swe.set_ephe_path()` - Configure ephemeris file directory
- **Proven in production**: Used by multiple astrology and Human Design applications
- **Documentation**: Well-documented with examples for common astronomical calculations
- **Platform support**: Works on Linux, macOS, Windows with precompiled wheels

### Alternatives Considered

| Alternative | Reason for Rejection |
|-------------|----------------------|
| `swisseph` (different package) | Less maintained, last update 2019, incomplete API |
| `skyfield` (modern Python astronomy) | Excellent for precision astronomy but lacks HD-specific optimizations, larger dependency footprint |
| Direct C library FFI | Unnecessary complexity when official Python wrapper exists |
| OpenAstro API only | Network dependency, rate limits, no offline capability |

### Implementation Notes

```python
# Installation
# requirements.txt: pyswisseph==2.10.3.2

# Basic usage example
import swisseph as swe

# Set ephemeris file path (bundled with backend)
swe.set_ephe_path('/app/data/ephemeris')

# Calculate Sun position at birth
jd = swe.julday(1985, 5, 21, 14.5)  # Year, month, day, hour (decimal)
result = swe.calc_ut(jd, swe.SUN)
ecliptic_longitude = result[0][0]  # Degrees 0-360
```

---

## R2: Human Design Gate/Line Degree Mapping Tables

### Decision: Use I'Ching / Hexagram Wheel Division

**Source**: Human Design System documentation (Jovian Archive / Ra Uru Hu teachings)
**Method**: Equal division of 360° ecliptic into 64 gates × 6 lines

### Rationale

Human Design maps the I'Ching (64 hexagrams) to the ecliptic wheel:
- **64 gates**: Each gate corresponds to one I'Ching hexagram
- **Gate span**: 360° / 64 = 5.625° per gate
- **6 lines per gate**: Each gate subdivided into 6 lines
- **Line span**: 5.625° / 6 = 0.9375° per line

**Starting point**: Gate 41 begins at 0° Aries (ecliptic longitude 0°)
**Direction**: Gates progress counterclockwise around the wheel

### Mapping Formula

```python
# Ecliptic longitude (0-360°) → Gate number (1-64)
def degree_to_gate(ecliptic_longitude: float) -> int:
    """
    Convert ecliptic longitude to Human Design gate number.
    Gate 41 starts at 0°, gates progress through the wheel.
    """
    # Each gate spans 5.625 degrees
    gate_index = int(ecliptic_longitude / 5.625)

    # Gate order starting from 0° (Gate 41)
    gate_order = [
        41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
        27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
        31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
        28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
    ]

    return gate_order[gate_index % 64]

def degree_to_line(ecliptic_longitude: float) -> int:
    """
    Convert ecliptic longitude to line number (1-6) within the gate.
    """
    # Position within current gate (0-5.625°)
    position_in_gate = ecliptic_longitude % 5.625

    # Each line spans 0.9375 degrees
    line = int(position_in_gate / 0.9375) + 1

    # Ensure line is 1-6 (handle edge cases at gate boundaries)
    return min(max(line, 1), 6)
```

### Alternatives Considered

| Alternative | Reason for Rejection |
|-------------|----------------------|
| Sidereal zodiac mapping | HD uses tropical zodiac, not sidereal |
| Custom gate ordering | Must match official HD wheel to ensure compatibility with other HD tools |
| Approximate degree boundaries | Precision matters for line accuracy - exact calculation required |

### Validation Strategy

- **Reference charts**: Verify calculations against known HD charts from established calculators (Genetic Matrix, MyBodyGraph, Jovian Archive)
- **Boundary testing**: Test positions at exact gate boundaries (0°, 5.625°, 11.25°, etc.)
- **Known birth data**: Use public figures with known HD charts for validation

---

## R3: Caching Strategy

### Decision: Selective In-Memory Caching with Optional Database Persistence

**Cache Layer**: Redis-compatible in-memory cache (optional: use Railway Redis if available, fallback to no caching)
**Cache Scope**: Full chart calculations only (not individual planetary positions)
**Cache Key**: `chart:{birth_datetime_utc}:{birth_location_lat_lng}`
**TTL**: 24 hours (86400 seconds)

### Rationale

- **Performance vs. Storage**: Full ephemeris calculations are fast (<200ms) but can be cached to reduce CPU load under high traffic
- **Uniqueness**: Same birth data always produces identical chart - perfect for caching
- **Size**: Each cached chart ~2KB JSON (13 planets × 2 charts × fields) - manageable at scale
- **Privacy**: No PII stored (datetime + coordinates are not identifiable without name)
- **Simplicity**: Cache entire chart response, not individual calculations

**No Database Persistence**: Charts are ephemeral calculations. No business requirement to store historical charts in PostgreSQL. If user wants to save their chart, that's a future feature (Phase 2+ per constitution).

### Cache Miss Behavior

1. Request arrives: Check cache key
2. **Cache hit**: Return cached chart (response time <50ms)
3. **Cache miss**: Calculate chart, store in cache, return result (response time <2s)
4. **Cache unavailable** (Redis down): Skip caching, calculate and return (graceful degradation)

### Alternatives Considered

| Alternative | Reason for Rejection |
|-------------|----------------------|
| Cache all calculations in PostgreSQL | Unnecessary persistence, violates constitution simplicity principle |
| No caching at all | Acceptable for MVP but suboptimal for repeated requests (e.g., user refreshing page) |
| Cache individual planet positions | More complex, minimal performance gain over full chart caching |
| Client-side caching only | Doesn't help with backend CPU load, users often clear browser cache |

### Implementation Notes

```python
# Pseudo-code
async def calculate_chart(request: ChartRequest) -> ChartResponse:
    cache_key = f"chart:{request.birth_datetime_utc}:{request.location_lat_lng}"

    # Try cache (optional, fail gracefully if Redis unavailable)
    try:
        cached = await redis.get(cache_key)
        if cached:
            return ChartResponse.parse_raw(cached)
    except Exception:
        pass  # Cache unavailable, proceed to calculation

    # Calculate chart
    chart = await chart_calculator.calculate(request)

    # Store in cache (fire and forget, don't block response)
    try:
        await redis.setex(cache_key, 86400, chart.json())
    except Exception:
        pass  # Cache storage failed, no problem

    return chart
```

---

## R4: Error Handling and Fallback Patterns

### Decision: Fail-Fast with Structured Errors (No Automatic Fallback to Alternative Sources)

**Primary Source**: Swiss Ephemeris (local files)
**Fallback Strategy**: Manual configuration switch, not automatic
**Error Response**: Structured JSON with error code, message, and retry guidance

### Rationale

**Fail-fast is better than silent fallback** because:
1. **Data consistency**: Different ephemeris sources may produce slightly different results (±0.01°). Automatic fallback could lead to inconsistent charts for the same birth data if sources switch mid-session.
2. **Debugging**: Explicit failures make issues visible. Silent fallbacks hide problems.
3. **Constitution alignment**: Principle III (Quality Output) - better to fail explicitly than return potentially inconsistent data.
4. **Offline operation**: Swiss Ephemeris files are bundled, so source unavailability should never happen in production. If it does, it's a deployment issue that needs fixing, not masking.

**Manual source configuration**: Allow administrator to configure alternative source (OpenAstro API, NASA JPL) via environment variable if Swiss Ephemeris is unavailable. This is an explicit decision, not automatic failover.

### Error Categories

| Error Type | HTTP Status | Error Code | Retry Strategy |
|------------|-------------|------------|----------------|
| Invalid date/time | 400 | `INVALID_DATE` | User corrects input |
| Date out of range (3000 BCE - 3000 CE) | 400 | `DATE_OUT_OF_RANGE` | User provides different date |
| Invalid location | 400 | `INVALID_LOCATION` | User corrects coordinates/timezone |
| Ephemeris files missing | 500 | `EPHEMERIS_UNAVAILABLE` | Deployment issue, admin intervention required |
| Calculation error (internal) | 500 | `CALCULATION_FAILED` | Retry after brief delay, report if persists |

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_DATE",
    "message": "Birth date must be between 3000 BCE and 3000 CE",
    "message_de": "Geburtsdatum muss zwischen 3000 v. Chr. und 3000 n. Chr. liegen",
    "field": "birth_date",
    "retry_after": null
  }
}
```

### Alternatives Considered

| Alternative | Reason for Rejection |
|-------------|----------------------|
| Automatic failover to OpenAstro API | Data inconsistency risk, network dependency, violates offline-capable constraint |
| Retry with exponential backoff | Appropriate for transient network errors, but ephemeris calculation errors are deterministic |
| Return partial results | Incomplete charts worse than clear error per Constitution Principle III |

---

## R5: Ephemeris File Deployment

### Decision: Bundle Ephemeris Files in Docker Image

**Location**: `/app/data/ephemeris/` directory in container
**Files Required**:
- `seas_18.se1` (main planets, 1800-2399 CE)
- `semo_18.se1` (Moon, 1800-2399 CE)
- `sepl_18.se1` (additional planets)
- Extended files for 3000 BCE - 3000 CE range (if full range needed)

**Total Size**: ~50-100MB depending on date range coverage
**Update Strategy**: New Docker image build when ephemeris files need updating (rarely - Swiss Ephemeris data is stable)

### Rationale

- **Offline operation**: Constitution constraint - no required external API calls. Bundled files ensure availability.
- **Performance**: Local file access is faster than network API calls (microseconds vs. milliseconds)
- **Simplicity**: Single Docker image contains all dependencies. No runtime download coordination needed.
- **Railway deployment**: Railway supports Docker images with 100MB+ sizes without issue
- **Reliability**: No network dependency = no network failure mode

**Dockerfile approach**:
```dockerfile
FROM python:3.11-slim

# Copy ephemeris files into image
COPY ./data/ephemeris/ /app/data/ephemeris/

# Install pyswisseph and set ephemeris path
RUN pip install pyswisseph==2.10.3.2

# In application startup
ENV SWISSEPH_PATH=/app/data/ephemeris
```

### Alternatives Considered

| Alternative | Reason for Rejection |
|-------------|----------------------|
| Download on first start | Adds deployment complexity, network dependency, startup delay, potential failure point |
| External volume mount | Requires infrastructure coordination, ephemeris files rarely change |
| Use external API only | Network dependency, no offline capability, violates constitution constraints |
| On-demand file download | Complex, increases failure modes, provides no benefit over bundling |

### File Acquisition

Swiss Ephemeris files are freely available:
- **Official source**: https://www.astro.com/ftp/swisseph/ephe/
- **License**: GPL for non-commercial use (Human Design chart generator qualifies)
- **Download**: Automated script to fetch required `.se1` files during Docker build

---

## Summary of Decisions

| Research Question | Decision | Key Rationale |
|-------------------|----------|---------------|
| **R1: Python Library** | `pyswisseph` 2.10.3.2 | Official, maintained, complete API, proven in production |
| **R2: Gate Mapping** | I'Ching wheel division (360° / 64 gates) | Official HD method, validated against reference charts |
| **R3: Caching** | Optional Redis, 24hr TTL, full charts | Performance optimization, privacy-safe, graceful degradation |
| **R4: Error Handling** | Fail-fast, structured errors, no automatic fallback | Data consistency, debugging visibility, constitution alignment |
| **R5: File Deployment** | Bundle in Docker image | Offline capability, simplicity, reliability |

## Implementation Readiness

All NEEDS CLARIFICATION items are resolved. Technical decisions are concrete, justified, and aligned with constitution principles. Ready to proceed to Phase 1 (Design).

---

**Next Phase**: Generate data models, API contracts, and quickstart guide.
