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
async def capture_email(request: EmailCaptureRequest):
    """
    Capture email for Business Reading interest

    Args:
        request: EmailCaptureRequest with email

    Returns:
        EmailCaptureResponse with success status

    Raises:
        HTTPException: 400 for validation errors
    """
    try:
        # Validate email
        is_valid, error_msg = validation_service.validate_email(request.email)
        if not is_valid:
            raise ValidationError("email", error_msg)

        # TODO: Save to database
        # For now, just return success
        import uuid
        return EmailCaptureResponse(
            success=True,
            id=uuid.uuid4(),
            message="Vielen Dank für dein Interesse an einem Business Reading."
        )

    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail={"field": e.field, "error": e.message}
        )


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
