"""FastAPI main application"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from src.models.chart import ChartRequest, ChartResponse
from src.models.email import EmailCaptureRequest, EmailCaptureResponse
from src.services.validation_service import ValidationService, ValidationError
from src.services.hd_api_client import HDAPIClient, HDAPIError
from src.services.normalization_service import NormalizationService
from src.api.routes.chart import router as chart_router
from src.handlers.email_handler import EmailHandler, EmailCaptureError
from src.database import get_db_session

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Human Design Chart Generator API",
    description="Backend API for generating Human Design charts",
    version="1.0.0"
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
validation_service = ValidationService()
hd_client = HDAPIClient()
normalization_service = NormalizationService()
email_handler = EmailHandler()

# Include routers
app.include_router(chart_router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "hd-chart-generator"}


@app.post("/api/hd-chart", response_model=ChartResponse)
async def generate_chart(request: ChartRequest):
    """
    Generate Human Design chart from birth data

    Args:
        request: ChartRequest with birth information

    Returns:
        ChartResponse with complete HD chart data

    Raises:
        HTTPException: 400 for validation errors, 500 for API errors
    """
    try:
        # Validate input
        is_valid, error_msg = validation_service.validate_name(request.firstName)
        if not is_valid:
            raise ValidationError("firstName", error_msg)

        is_valid, error_msg = validation_service.validate_birth_date(request.birthDate)
        if not is_valid:
            raise ValidationError("birthDate", error_msg)

        is_valid, error_msg = validation_service.validate_birth_time(request.birthTime)
        if not is_valid:
            raise ValidationError("birthTime", error_msg)

        # Call HD API
        raw_chart_data = await hd_client.calculate_chart(
            birth_date=request.birthDate,
            birth_time=request.birthTime,
            birth_place=request.birthPlace
        )

        # Normalize response
        chart_response = normalization_service.normalize_chart(
            raw_chart_data,
            request.firstName
        )

        return chart_response

    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail={"field": e.field, "error": e.message}
        )
    except HDAPIError as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Gerade kann dein Chart nicht berechnet werden. Bitte versuche es später noch einmal."
            }
        )
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später noch einmal."
            }
        )


@app.post("/api/email-capture", response_model=EmailCaptureResponse)
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
            user_agent=user_agent
        )

        return EmailCaptureResponse(
            success=result["success"],
            id=result["id"],
            message=result["message"]
        )

    except EmailCaptureError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"field": "email", "error": e.message}
        )
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Unexpected error in email capture: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später noch einmal."
            }
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
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port, reload=True)
