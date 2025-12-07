"""Email capture handler for business reading interest"""

from typing import Optional, Type
from sqlalchemy.orm import Session
from email_validator import validate_email, EmailNotValidError
from src.models.lead_email_db import LeadEmailDB


class EmailCaptureError(Exception):
    """Custom exception for email capture errors"""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class EmailHandler:
    """Handler for email capture operations"""

    def __init__(self, model_cls: Optional[Type] = None):
        """
        Initialize email handler with optional model dependency injection.

        Args:
            model_cls: SQLAlchemy model class for email storage. Defaults to LeadEmailDB.
        """
        self.Model = model_cls or LeadEmailDB

    def capture_email(
        self,
        email: str,
        db_session: Session,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> dict:
        """
        Capture email for Business Reading interest.

        Args:
            email: Email address to capture
            db_session: Database session
            ip_address: Client IP address
            user_agent: Client user agent

        Returns:
            dict with success, id, and message

        Raises:
            EmailCaptureError: If validation fails or email exists
        """
        # Validate email
        try:
            validated = validate_email(email, check_deliverability=False)
            email = validated.normalized
        except EmailNotValidError:
            raise EmailCaptureError(
                "Ungültige E-Mail-Adresse. Bitte überprüfen Sie Ihre Eingabe.",
                status_code=400,
            )

        # Check if email already exists
        existing = (
            db_session.query(self.Model).filter(self.Model.email == email).first()
        )
        if existing:
            raise EmailCaptureError(
                "Diese E-Mail-Adresse wurde bereits registriert.", status_code=409
            )

        # Create new email capture
        try:
            email_capture = self.Model(
                email=email, ip_address=ip_address, user_agent=user_agent, consent_given=True
            )
            db_session.add(email_capture)
            db_session.commit()
            db_session.refresh(email_capture)

            return {
                "success": True,
                "id": str(email_capture.id),
                "message": "E-Mail erfolgreich gespeichert.",
            }
        except Exception:
            db_session.rollback()
            raise EmailCaptureError(
                "Fehler beim Speichern der E-Mail. Bitte versuchen Sie es später noch einmal.",
                status_code=500,
            )
