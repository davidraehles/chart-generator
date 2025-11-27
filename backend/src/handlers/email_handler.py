"""
Email capture handler.

Coordinates validation, duplicate checking, and email storage.
"""

from typing import Tuple, Optional
from sqlalchemy.orm import Session

from src.services.email_service import EmailService
from src.services.validation_service import ValidationService


class EmailCaptureError(Exception):
    """Custom exception for email capture errors."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class EmailHandler:
    """Handler for email capture operations."""

    def __init__(self):
        self.email_service = EmailService()
        self.validation_service = ValidationService()

    def capture_email(
        self,
        email: str,
        db_session: Session,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """
        Capture and store email address.

        Validates email format, checks for duplicates, and saves to database.

        Args:
            email: Email address to capture
            db_session: SQLAlchemy database session
            ip_address: Client IP address (optional)
            user_agent: Client user agent (optional)

        Returns:
            dict: Result with id, email, message, and success status

        Raises:
            EmailCaptureError: For validation or duplicate errors
        """
        # Validate email format
        is_valid, error_msg = self.validation_service.validate_email(email)
        if not is_valid:
            raise EmailCaptureError(error_msg, status_code=400)

        # Check for duplicates
        if self.email_service.check_duplicate(email, db_session):
            raise EmailCaptureError(
                "Diese E-Mail-Adresse wurde bereits registriert.",
                status_code=409
            )

        # Save to database
        try:
            result = self.email_service.save_email(
                email=email,
                db_session=db_session,
                source="business_reading_interest",
                ip_address=ip_address,
                user_agent=user_agent
            )

            return {
                "success": True,
                "id": result["id"],
                "message": "Vielen Dank für dein Interesse an einem Business Reading."
            }

        except Exception as e:
            raise EmailCaptureError(
                f"Fehler beim Speichern der E-Mail: {str(e)}",
                status_code=500
            )
