"""Email capture handler for business reading interest"""

import os
import logging
from typing import Optional, Type
from sqlalchemy.orm import Session
from email_validator import validate_email, EmailNotValidError
from src.models.lead_email_db import LeadEmailDB

logger = logging.getLogger(__name__)

# MailerLite group IDs per HD type code
MAILERLITE_GROUP_IDS: dict[str, str] = {
    "1": "195057127262258187",   # Generator
    "2": "195057166300742929",   # Manifestierender Generator
    "3": "195057188779066949",   # Projektor
    "4": "195057197972981263",   # Manifestor
    "5": "195057210740442336",   # Reflektor
}


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
        first_name: Optional[str] = None,
        hd_type: Optional[str] = None,
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
                email=email,
                first_name=first_name,
                hd_type=hd_type,
                ip_address=ip_address,
                user_agent=user_agent,
                consent_given=True,
            )
            db_session.add(email_capture)
            db_session.commit()
            db_session.refresh(email_capture)

            # Non-blocking: add to MailerLite
            self._add_to_mailerlite(email, first_name, hd_type)

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

    def _add_to_mailerlite(
        self,
        email: str,
        first_name: Optional[str],
        hd_type: Optional[str],
    ) -> None:
        """
        Add subscriber to MailerLite and assign to the correct HD-type group.
        Errors are logged but never bubble up to the caller.
        """
        api_key = os.getenv("MAILERLITE_API_KEY", "")
        if not api_key:
            logger.debug("MAILERLITE_API_KEY not set — skipping MailerLite sync")
            return

        group_id = MAILERLITE_GROUP_IDS.get(hd_type or "")
        if not group_id:
            logger.warning("No MailerLite group for hd_type=%s", hd_type)
            return

        try:
            import requests  # stdlib-friendly, already in requirements

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            payload: dict = {
                "email": email,
                "groups": [group_id],
                "status": "unconfirmed",
                "resubscribe": True,
            }
            if first_name:
                payload["fields"] = {"name": first_name}

            resp = requests.post(
                "https://connect.mailerlite.com/api/subscribers",
                json=payload,
                headers=headers,
                timeout=5,
            )
            if resp.status_code in (200, 201):
                logger.info("MailerLite: subscriber %s added to group %s", email, group_id)
            else:
                logger.warning(
                    "MailerLite returned %s for %s: %s",
                    resp.status_code, email, resp.text[:200],
                )
        except Exception as exc:
            logger.warning("MailerLite sync failed for %s: %s", email, exc)
