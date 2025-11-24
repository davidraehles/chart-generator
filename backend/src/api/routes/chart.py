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
    ERROR_INVALID_TIMEZONE,
    ERROR_EPHEMERIS_UNAVAILABLE,
    ERROR_CALCULATION_FAILED,
)
from src.services.ephemeris import load_config
from src.services.ephemeris.swiss_ephemeris import SwissEphemerisSource
from src.services.calculation.position_calculator import PositionCalculator
import pytz


router = APIRouter(prefix="/api", tags=["charts"])


@router.post(
    "/calculate-chart",
    response_model=EphemerisChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Human Design chart",
    description="Calculate planetary positions for Human Design chart based on birth data",
)
async def calculate_chart(request: EphemerisChartRequest):
    """
    Calculate Human Design chart from birth data.

    **Phase 3 (US1)**: Returns personality (birth) planetary positions only.
    Design chart and gate/line mappings will be added in later phases.

    Args:
        request: Birth data (datetime, timezone, location, optional name)

    Returns:
        EphemerisChartResponse with 13 planetary positions

    Raises:
        HTTPException 400: Invalid input data (date range, timezone, coordinates)
        HTTPException 500: Calculation failure (ephemeris unavailable, internal error)
    """
    try:
        # Validate timezone
        try:
            tz = pytz.timezone(request.birth_timezone)
        except pytz.exceptions.UnknownTimeZoneError:
            error = CalculationError(
                code=ERROR_INVALID_TIMEZONE,
                message=f"Timezone '{request.birth_timezone}' is not a valid IANA timezone identifier",
                message_de=f"Zeitzone '{request.birth_timezone}' ist kein gültiger IANA-Zeitzonenbezeichner",
                field="birth_timezone",
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

        # Load ephemeris configuration
        config = load_config()

        # Initialize ephemeris source (Swiss Ephemeris for Phase 3)
        ephemeris_source = SwissEphemerisSource(config.ephemeris_path)

        # Check if ephemeris is available
        if not ephemeris_source.is_available():
            error = CalculationError(
                code=ERROR_EPHEMERIS_UNAVAILABLE,
                message=f"Ephemeris data files not found at {config.ephemeris_path}",
                message_de=f"Ephemeris-Datendateien wurden am Pfad {config.ephemeris_path} nicht gefunden",
                field=None,
                retry_after=60,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error.dict(),
            )

        # Initialize position calculator
        calculator = PositionCalculator(ephemeris_source)

        # Calculate planetary positions for birth moment
        personality_positions = calculator.calculate_positions(birth_utc)

        # Build response
        response = EphemerisChartResponse(
            name=request.name,
            personality_activations=personality_positions,
            calculation_source=ephemeris_source.get_source_name(),
            calculated_at=datetime.utcnow(),
        )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise

    except ValueError as e:
        # Handle validation errors from Pydantic
        error = CalculationError(
            code=ERROR_INVALID_DATE,
            message=str(e),
            message_de=f"Ungültige Eingabedaten: {str(e)}",
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
