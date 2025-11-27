"""
Chart calculation API routes.

Endpoints for calculating Human Design charts from birth data.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from src.models.chart import EphemerisChartRequest, EphemerisChartResponse
from src.models.error import (
    CalculationError,
    ERROR_INVALID_DATE,
    ERROR_DATE_OUT_OF_RANGE,
    ERROR_INVALID_LOCATION,
    ERROR_EPHEMERIS_UNAVAILABLE,
    ERROR_CALCULATION_FAILED,
)
from src.services.ephemeris.source_factory import get_ephemeris_source
from src.services.calculation.position_calculator import PositionCalculator
from src.services.calculation.design_time import calculate_design_datetime
import pytz
from typing import Dict, Any


router = APIRouter(prefix="/api", tags=["charts"])


@router.post(
    "/calculate-chart",
    response_model=EphemerisChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Human Design chart",
    description="Calculate planetary positions for Human Design chart based on birth data. "
    "Returns both personality (birth time) and design (88° solar arc) planetary positions "
    "with I'Ching gate and line mappings.",
    responses={
        200: {
            "description": "Chart calculation successful",
            "model": EphemerisChartResponse,
        },
        400: {
            "description": "Invalid input data (validation error)",
            "model": CalculationError,
            "content": {
                "application/json": {
                    "examples": {
                        "invalid_date": {
                            "value": {
                                "code": ERROR_DATE_OUT_OF_RANGE,
                                "message": "Birth date must be between year 1 and 3000",
                                "message_de": "Geburtsdatum muss zwischen den Jahren 1 und 3000 liegen",
                                "field": "birth_datetime",
                                "retry_after": None,
                            }
                        },
                        "invalid_timezone": {
                            "value": {
                                "code": ERROR_INVALID_DATE,
                                "message": "Timezone 'Invalid/Zone' is not a valid IANA timezone identifier",
                                "message_de": "Zeitzone 'Invalid/Zone' ist kein gültiger IANA-Zeitzonenbezeichner",
                                "field": "birth_timezone",
                                "retry_after": None,
                            }
                        },
                        "invalid_location": {
                            "value": {
                                "code": ERROR_INVALID_LOCATION,
                                "message": "Latitude must be between -90 and 90 degrees",
                                "message_de": "Breitengrad muss zwischen -90 und 90 Grad liegen",
                                "field": "birth_latitude",
                                "retry_after": None,
                            }
                        },
                    }
                }
            },
        },
        500: {
            "description": "Calculation error (ephemeris unavailable or internal failure)",
            "model": CalculationError,
            "content": {
                "application/json": {
                    "examples": {
                        "ephemeris_unavailable": {
                            "value": {
                                "code": ERROR_EPHEMERIS_UNAVAILABLE,
                                "message": "Ephemeris data source is unavailable",
                                "message_de": "Keine Ephemeris-Datenquelle verfügbar",
                                "field": None,
                                "retry_after": 60,
                            }
                        },
                        "calculation_failed": {
                            "value": {
                                "code": ERROR_CALCULATION_FAILED,
                                "message": "Error calculating planetary positions",
                                "message_de": "Fehler bei der Berechnung der Planetenpositionen",
                                "field": None,
                                "retry_after": 5,
                            }
                        },
                    }
                }
            },
        },
    },
)
async def calculate_chart(request: EphemerisChartRequest):
    """
    Calculate Human Design chart from birth data.

    **Calculation Process:**
    1. Validates input parameters (datetime, timezone, coordinates)
    2. Converts local birth time to UTC using specified timezone
    3. Calculates 13 planetary positions at birth moment (personality/conscious)
    4. Calculates design moment as 88° solar arc before birth
    5. Calculates 13 planetary positions at design moment (design/unconscious)
    6. Maps each position to I'Ching gate and line (1-6 within gate)

    **Phase 4 (US1+US2) Implementation:**
    - Returns both personality (birth) and design planetary positions
    - Includes ecliptic longitude, gate/line mapping, and source metadata
    - Gate/line interpretations will be added in Phase 5

    **Input Requirements:**
    - birth_datetime: ISO 8601 format datetime (will be treated as local time)
    - birth_timezone: Valid IANA timezone identifier (e.g., 'Europe/Berlin', 'America/New_York')
    - birth_latitude: -90 to 90 degrees (negative for South)
    - birth_longitude: -180 to 180 degrees (negative for West)
    - name: Optional, for personalization (max 100 characters)

    **Output Fields (per position):**
    - body: Celestial body identifier (Sun, Moon, Mercury, etc.)
    - ecliptic_longitude: Position 0-360 degrees along ecliptic
    - gate: I'Ching gate number (1-64)
    - line: Line within gate (1-6)
    - gate_line: Formatted string (e.g., '41.3')
    - calculation_timestamp: UTC timestamp of calculation
    - julian_day: Internal ephemeris calculation reference
    - source: Ephemeris source used (e.g., 'SwissEphemeris')

    **Error Handling:**
    - 400: Invalid input (date out of range, invalid timezone, coordinates out of range)
    - 500: Calculation failure (ephemeris unavailable, internal error)
    - Errors include retry_after hint for transient failures (500 only)
    - All errors bilingual (English + German per specification)

    Args:
        request: EphemerisChartRequest with birth data

    Returns:
        EphemerisChartResponse with 26 planetary positions (13 personality + 13 design)

    Raises:
        HTTPException 400: Invalid input data
        HTTPException 500: Calculation failure or ephemeris unavailable
    """
    try:
        # Validate timezone
        try:
            tz = pytz.timezone(request.birth_timezone)
        except pytz.exceptions.UnknownTimeZoneError:
            error = CalculationError(
                code=ERROR_INVALID_DATE,
                message=f"Timezone '{request.birth_timezone}' is not a valid IANA timezone identifier",
                message_de=f"Zeitzone '{request.birth_timezone}' ist kein gültiger IANA-Zeitzonenbezeichner",
                field="birth_timezone",
                retry_after=None,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error.dict(),
            )

        # Validate date and location ranges
        if not (1 <= request.birth_datetime.year <= 3000):
            error = CalculationError(
                code=ERROR_DATE_OUT_OF_RANGE,
                message=f"Birth date must be between year 1 and 3000",
                message_de="Geburtsdatum muss zwischen den Jahren 1 und 3000 liegen",
                field="birth_datetime",
                retry_after=None,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error.dict(),
            )
        
        if not (-90 <= request.birth_latitude <= 90):
            error = CalculationError(
                code=ERROR_INVALID_LOCATION,
                message="Latitude must be between -90 and 90 degrees",
                message_de="Breitengrad muss zwischen -90 und 90 Grad liegen",
                field="birth_latitude",
                retry_after=None,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error.dict(),
            )
        
        if not (-180 <= request.birth_longitude <= 180):
            error = CalculationError(
                code=ERROR_INVALID_LOCATION,
                message="Longitude must be between -180 and 180 degrees",
                message_de="Längengrad muss zwischen -180 und 180 Grad liegen",
                field="birth_longitude",
                retry_after=None,
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error.dict(),
            )

        # Convert birth datetime to UTC for calculation
        # Assume birth_datetime is naive (local time) and localize it
        if request.birth_datetime.tzinfo is None:
            localized_dt = tz.localize(request.birth_datetime)
        else:
            localized_dt = request.birth_datetime

        birth_utc = localized_dt.astimezone(pytz.UTC)

        # Initialize ephemeris source using factory for dynamic source selection
        try:
            ephemeris_source = get_ephemeris_source()
        except RuntimeError as e:
            error = CalculationError(
                code=ERROR_EPHEMERIS_UNAVAILABLE,
                message=str(e),
                message_de="Keine Ephemeris-Datenquelle verfügbar",
                field=None,
                retry_after=60,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error.dict(),
            )

        # Initialize position calculator
        calculator = PositionCalculator(ephemeris_source)

        # Calculate planetary positions for birth moment (personality)
        personality_positions = calculator.calculate_positions(birth_utc)

        # Calculate design datetime (88° solar arc before birth)
        design_datetime_utc = calculate_design_datetime(
            birth_utc, ephemeris_source, target_arc=88.0
        )

        # Calculate planetary positions for design moment
        design_positions = calculator.calculate_positions(design_datetime_utc)

        # Build response
        response = EphemerisChartResponse(
            name=request.name,
            personality_activations=personality_positions,
            design_activations=design_positions,
            design_datetime=design_datetime_utc,
            calculation_source=ephemeris_source.get_source_name(),
            calculated_at=datetime.utcnow(),
        )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise

    except ValueError as e:
        # Handle validation errors from Pydantic or custom validators
        error_str = str(e)
        
        # Parse error code if included in error message (format: "CODE:message")
        if ":" in error_str:
            error_code, error_msg = error_str.split(":", 1)
            if error_code in (ERROR_DATE_OUT_OF_RANGE, ERROR_INVALID_LOCATION):
                error = CalculationError(
                    code=error_code,
                    message=error_msg,
                    message_de=error_msg,
                    field=None,
                    retry_after=None,
                )
            else:
                error = CalculationError(
                    code=ERROR_INVALID_DATE,
                    message=error_str,
                    message_de=f"Ungültige Eingabedaten: {error_str}",
                    field=None,
                    retry_after=None,
                )
        else:
            error = CalculationError(
                code=ERROR_INVALID_DATE,
                message=error_str,
                message_de=f"Ungültige Eingabedaten: {error_str}",
                field=None,
                retry_after=None,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error.dict(),
        )

    except RuntimeError as e:
        # Handle calculation errors from ephemeris source
        error_message = str(e)

        if ERROR_EPHEMERIS_UNAVAILABLE in error_message:
            error = CalculationError(
                code=ERROR_EPHEMERIS_UNAVAILABLE,
                message=error_message,
                message_de="Ephemeris-Dateien sind nicht verfügbar",
                field=None,
                retry_after=60,
            )
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        else:
            error = CalculationError(
                code=ERROR_CALCULATION_FAILED,
                message=error_message,
                message_de="Fehler bei der Berechnung der Planetenpositionen",
                field=None,
                retry_after=5,
            )
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        raise HTTPException(status_code=status_code, detail=error.dict())

    except Exception as e:
        # Catch-all for unexpected errors
        error = CalculationError(
            code=ERROR_CALCULATION_FAILED,
            message=f"Unexpected error: {str(e)}",
            message_de="Ein unerwarteter Fehler ist aufgetreten",
            field=None,
            retry_after=None,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error.dict(),
        )
