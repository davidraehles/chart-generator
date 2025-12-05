"""FastAPI main application"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import html
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from src.models.chart import ChartRequest, ChartResponse
from src.models.email import EmailCaptureRequest, EmailCaptureResponse
from src.services.validation_service import ValidationService, ValidationError
from src.services.hd_api_client import HDAPIClient
from src.services.normalization_service import NormalizationService
from src.api.routes.chart import router as chart_router
from src.handlers.email_handler import EmailHandler, EmailCaptureError
from src.database import get_db_session
from datetime import datetime
import pytz
from src.services.geocoding_service import GeocodingService
from src.services.calculation.bodygraph_calculator import BodygraphCalculator
from src.services.ephemeris.source_factory import get_ephemeris_source
from src.services.calculation.position_calculator import PositionCalculator
from src.services.calculation.design_time import calculate_design_datetime

# Load environment variables
load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="Human Design Chart Generator API",
    description="Backend API for generating Human Design charts",
    version="1.0.0",
)

# Add rate limiter to app state
app.state.limiter = limiter

# Configure CORS with hardened settings
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Initialize services
validation_service = ValidationService()
hd_client = HDAPIClient()
normalization_service = NormalizationService()
email_handler = EmailHandler()
geocoding_service = GeocodingService()
bodygraph_calculator = BodygraphCalculator()

# Include routers
app.include_router(chart_router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "hd-chart-generator"}


@app.post("/api/hd-chart", response_model=ChartResponse)
@limiter.limit("10/minute")
async def generate_chart(request: ChartRequest, http_request: Request):
    """
    Generate Human Design chart from birth data

    Args:
        request: ChartRequest with birth information
        http_request: FastAPI Request object for rate limiting

    Returns:
        ChartResponse with complete HD chart data

    Raises:
        HTTPException: 400 for validation errors, 500 for API errors
    """
    try:
        # Sanitize input to prevent XSS
        sanitized_name = html.escape(request.firstName.strip())

        # Validate input
        is_valid, error_msg = validation_service.validate_name(sanitized_name)
        if not is_valid:
            raise ValidationError("firstName", error_msg)

        is_valid, error_msg = validation_service.validate_birth_date(request.birthDate)
        if not is_valid:
            raise ValidationError("birthDate", error_msg)

        # Handle approximate time
        if request.birthTimeApproximate and not request.birthTime:
            request.birthTime = "12:00"

        is_valid, error_msg = validation_service.validate_birth_time(request.birthTime)
        if not is_valid:
            raise ValidationError("birthTime", error_msg)

        # 1. Geocode birth place
        lat, lng, tz_str = geocoding_service.get_location_data(request.birthPlace)
        if not lat or not lng or not tz_str:
            raise HTTPException(
                status_code=400,
                detail={
                    "field": "birthPlace",
                    "error": "Ort nicht gefunden. Bitte prüfen Sie die Eingabe.",
                },
            )

        # 2. Parse datetime
        try:
            birth_dt_str = f"{request.birthDate} {request.birthTime}"
            birth_dt = datetime.strptime(birth_dt_str, "%d.%m.%Y %H:%M")
        except ValueError:
            raise ValidationError("birthDate", "Ungültiges Datumsformat")

        # 3. Localize to timezone
        try:
            tz = pytz.timezone(tz_str)
            birth_dt_local = tz.localize(birth_dt)
            birth_dt_utc = birth_dt_local.astimezone(pytz.UTC)
        except Exception as e:
            print(f"Timezone error: {e}")
            raise HTTPException(
                status_code=500,
                detail={"error": "Fehler bei der Zeitzonenverarbeitung."},
            )

        # 4. Calculate positions with timeout protection
        try:
            import signal

            def timeout_handler(signum, frame):
                raise TimeoutError("Calculation exceeded maximum time limit (30 seconds)")

            # Set timeout for ephemeris calculations (30 seconds)
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(30)

            try:
                ephemeris_source = get_ephemeris_source()
                pos_calculator = PositionCalculator(ephemeris_source)

                personality_positions = pos_calculator.calculate_positions(birth_dt_utc)

                design_dt_utc = calculate_design_datetime(
                    birth_dt_utc, ephemeris_source, target_arc=88.0
                )
                design_positions = pos_calculator.calculate_positions(design_dt_utc)

                # 5. Calculate Bodygraph
                chart_response = bodygraph_calculator.calculate_chart(
                    personality_positions,
                    design_positions,
                    sanitized_name,
                    calculation_source=ephemeris_source.get_source_name(),
                )

                return chart_response
            finally:
                signal.alarm(0)  # Cancel the alarm

        except TimeoutError as e:
            print(f"Calculation timeout: {e}")
            raise HTTPException(
                status_code=504,
                detail={
                    "error": "Die Berechnung hat zu lange gedauert. Bitte versuchen Sie es später noch einmal."
                },
            )
        except Exception as e:
            print(f"Calculation error: {e}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Fehler bei der Chart-Berechnung. Bitte versuchen Sie es später noch einmal."
                },
            )

    except ValidationError as e:
        raise HTTPException(
            status_code=400, detail={"field": e.field, "error": e.message}
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später noch einmal."
            },
        )


@app.post("/api/email-capture", response_model=EmailCaptureResponse)
@limiter.limit("5/minute")
async def capture_email(request: EmailCaptureRequest, http_request: Request):
    """
    Capture email for Business Reading interest

    Args:
        request: EmailCaptureRequest with email
        http_request: FastAPI Request object for metadata

    Returns:
        EmailCaptureResponse with success status

    Raises:
        HTTPException: 400 for validation errors, 409 for duplicates, 500 for server errors
    """
    db_session = None
    try:
        # Get database session
        db_session = get_db_session()

        # Extract client metadata
        ip_address = http_request.client.host if http_request.client else None
        user_agent = http_request.headers.get("user-agent")

        # Capture email using handler
        result = email_handler.capture_email(
            email=request.email,
            db_session=db_session,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return EmailCaptureResponse(
            success=result["success"], id=result["id"], message=result["message"]
        )

    except EmailCaptureError as e:
        raise HTTPException(
            status_code=e.status_code, detail={"field": "email", "error": e.message}
        )
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Unexpected error in email capture: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später noch einmal."
            },
        )
    finally:
        if db_session:
            db_session.close()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unexpected errors"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später noch einmal."
        },
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port, reload=True)
