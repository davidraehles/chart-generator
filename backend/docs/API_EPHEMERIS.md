# Ephemeris Chart Calculation API

Complete API documentation for the `/api/calculate-chart` endpoint.

## Endpoint

```
POST /api/calculate-chart
```

Calculates complete Human Design chart with personality (birth) and design (~88 days before birth) planetary positions, including gate/line mappings.

## Request

### Headers

```
Content-Type: application/json
```

### Body Schema

```json
{
  "birth_datetime": "string (ISO 8601)",
  "birth_timezone": "string (IANA timezone)",
  "birth_latitude": "number (-90 to 90)",
  "birth_longitude": "number (-180 to 180)",
  "name": "string (optional, max 100 chars)"
}
```

### Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `birth_datetime` | datetime | Yes | Birth date and time in local timezone | `"1990-05-15T14:30:00"` |
| `birth_timezone` | string | Yes | IANA timezone identifier | `"Europe/Berlin"` |
| `birth_latitude` | float | Yes | Birth location latitude in decimal degrees | `52.5200` |
| `birth_longitude` | float | Yes | Birth location longitude in decimal degrees | `13.4050` |
| `name` | string | No | Optional name for personalization | `"John Doe"` |

### Validation Rules

- **birth_datetime**: Must be between year 1 and 3000 (ephemeris coverage)
- **birth_timezone**: Must be valid IANA timezone (e.g., "America/New_York", not "EST")
- **birth_latitude**: -90 ≤ lat ≤ 90 (South Pole to North Pole)
- **birth_longitude**: -180 ≤ lon ≤ 180 (International Date Line)
- **name**: Maximum 100 characters if provided

## Response

### Success Response (200 OK)

```json
{
  "name": "John Doe",
  "personality_activations": [
    {
      "body": "Sun",
      "ecliptic_longitude": 54.123,
      "gate": 41,
      "line": 3,
      "gate_line": "41.3",
      "calculation_timestamp": "2025-11-24T21:00:00.000Z",
      "julian_day": 2450000.0,
      "source": "SwissEphemeris"
    },
    // ... 12 more bodies (Moon, Mercury, Venus, Mars, Jupiter, Saturn,
    //     Uranus, Neptune, Pluto, North Node, South Node, Chiron)
  ],
  "design_activations": [
    {
      "body": "Sun",
      "ecliptic_longitude": 280.456,
      "gate": 12,
      "line": 5,
      "gate_line": "12.5",
      "calculation_timestamp": "2025-11-24T21:00:00.000Z",
      "julian_day": 2449912.0,
      "source": "SwissEphemeris"
    },
    // ... 12 more design positions
  ],
  "design_datetime": "1990-02-16T12:15:30.000Z",
  "calculation_source": "SwissEphemeris",
  "calculated_at": "2025-11-24T21:00:00.000Z"
}
```

### Response Fields

#### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Provided name or null |
| `personality_activations` | array | 13 planetary positions at birth moment |
| `design_activations` | array | 13 planetary positions at design moment |
| `design_datetime` | datetime | Calculated design moment (when Sun was 88° earlier) |
| `calculation_source` | string | Ephemeris source used ("SwissEphemeris") |
| `calculated_at` | datetime | UTC timestamp when calculation was performed |

#### Planetary Position Object

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `body` | string | - | Celestial body name |
| `ecliptic_longitude` | float | 0-360 | Position in degrees along ecliptic |
| `gate` | integer | 1-64 | Human Design gate number (I'Ching hexagram) |
| `line` | integer | 1-6 | Line number within the gate |
| `gate_line` | string | - | Formatted notation (e.g., "41.3") |
| `calculation_timestamp` | datetime | - | UTC timestamp of calculation |
| `julian_day` | float | - | Julian Day Number used for calculation |
| `source` | string | - | Ephemeris source identifier |

#### Celestial Bodies (Order)

1. Sun
2. Moon
3. Mercury
4. Venus
5. Mars
6. Jupiter
7. Saturn
8. Uranus
9. Neptune
10. Pluto
11. North Node
12. South Node
13. Chiron

## Error Responses

### 400 Bad Request - Invalid Input

```json
{
  "detail": {
    "code": "INVALID_TIMEZONE",
    "message": "Timezone 'America/Invalid' is not a valid IANA timezone identifier",
    "message_de": "Zeitzone 'America/Invalid' ist kein gültiger IANA-Zeitzonenbezeichner",
    "field": "birth_timezone",
    "retry_after": null
  }
}
```

**Error Codes:**
- `INVALID_DATE`: Birth date outside valid range
- `INVALID_TIMEZONE`: Unknown or invalid timezone identifier
- `INVALID_LOCATION`: Coordinates out of valid range

### 500 Internal Server Error - Calculation Failure

```json
{
  "detail": {
    "code": "EPHEMERIS_UNAVAILABLE",
    "message": "Ephemeris data files not found at /app/data/ephemeris",
    "message_de": "Ephemeris-Datendateien wurden am Pfad /app/data/ephemeris nicht gefunden",
    "field": null,
    "retry_after": 60
  }
}
```

**Error Codes:**
- `EPHEMERIS_UNAVAILABLE`: Ephemeris files not loaded
- `CALCULATION_FAILED`: Swiss Ephemeris calculation error

### Error Response Schema

```json
{
  "detail": {
    "code": "string (error code)",
    "message": "string (English message)",
    "message_de": "string (German message)",
    "field": "string | null (field that caused error)",
    "retry_after": "number | null (seconds to wait before retry)"
  }
}
```

## Examples

### Example 1: Basic Request

```bash
curl -X POST http://localhost:5000/api/calculate-chart \
  -H "Content-Type: application/json" \
  -d '{
    "birth_datetime": "1990-05-15T14:30:00",
    "birth_timezone": "Europe/Berlin",
    "birth_latitude": 52.5200,
    "birth_longitude": 13.4050
  }'
```

### Example 2: With Name

```bash
curl -X POST http://localhost:5000/api/calculate-chart \
  -H "Content-Type: application/json" \
  -d '{
    "birth_datetime": "1985-03-21T08:00:00",
    "birth_timezone": "America/New_York",
    "birth_latitude": 40.7128,
    "birth_longitude": -74.0060,
    "name": "Jane Smith"
  }'
```

### Example 3: Different Timezones

```bash
# Tokyo, Japan
curl -X POST http://localhost:5000/api/calculate-chart \
  -H "Content-Type: application/json" \
  -d '{
    "birth_datetime": "2000-01-01T00:00:00",
    "birth_timezone": "Asia/Tokyo",
    "birth_latitude": 35.6762,
    "birth_longitude": 139.6503
  }'
```

## Technical Details

### Calculation Process

1. **Timezone Validation**: Validates IANA timezone using `pytz`
2. **UTC Conversion**: Converts local birth time to UTC
3. **Julian Day Calculation**: Converts datetime to Julian Day Number
4. **Personality Positions**: Calculates 13 planetary positions at birth
5. **Design Time Calculation**: Finds moment when Sun was 88° earlier (~88 days before birth)
6. **Design Positions**: Calculates 13 planetary positions at design moment
7. **Gate/Line Mapping**: Maps each ecliptic longitude to HD gate (1-64) and line (1-6)

### Precision

- **Time**: ±15 minutes (0.01° solar precision)
- **Ecliptic Longitude**: ±0.001°
- **Gate/Line**: Exact mapping based on I'Ching wheel

### Performance

- **Typical Response Time**: 50-150ms (without ephemeris loading)
- **First Request**: May take 2-5 seconds if extracting files from database
- **Concurrent Requests**: Supports 100+ concurrent calculations

### Caching

Currently, no caching is implemented. Each request performs fresh calculations.

Future enhancement: Consider caching by `(birth_datetime, timezone, lat, lng)` tuple with 24-hour TTL.

## Rate Limiting

No rate limiting currently implemented.

Recommended for production: 60 requests/minute per IP.

## CORS

CORS is enabled for:
- `http://localhost:3000` (development)
- Configured `FRONTEND_URL` environment variable (production)

## Related Endpoints

- `GET /health` - Health check endpoint
- `POST /api/hd-chart` - Legacy chart endpoint (feature 001, external API)

## Changelog

- **2025-11-24**: Initial release with personality, design, and gate/line mapping
- Supports birth dates from year 1 to 3000
- Returns 26 total planetary positions (13 personality + 13 design)
- Bilingual error messages (EN/DE)
