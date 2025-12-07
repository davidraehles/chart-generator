"""Email capture handler for business reading interest"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, func
from src.database import Base
from email_validator import validate_email, EmailNotValidError


class EmailCaptureError(Exception):
    """Custom exception for email capture errors"""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class EmailCapture(Base):
    """Database model for captured emails"""

    __tablename__ = "email_captures"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)


class EmailHandler:
    """Handler for email capture operations"""

    def __init__(self):
        pass

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
            db_session.query(EmailCapture).filter(EmailCapture.email == email).first()
        )
        if existing:
            raise EmailCaptureError(
                "Diese E-Mail-Adresse wurde bereits registriert.", status_code=409
            )

        # Create new email capture
        try:
            email_capture = EmailCapture(
                email=email, ip_address=ip_address, user_agent=user_agent
            )
            db_session.add(email_capture)
            db_session.commit()
            db_session.refresh(email_capture)

            return {
                "success": True,
                "id": email_capture.id,
                "message": "E-Mail erfolgreich gespeichert.",
            }
        except Exception:
            db_session.rollback()
            raise EmailCaptureError(
                "Fehler beim Speichern der E-Mail. Bitte versuchen Sie es später noch einmal.",
                status_code=500,
            )
