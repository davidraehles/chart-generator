"""Validation service for user input"""
import re
from datetime import datetime
from typing import Tuple


class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(message)


class ValidationService:
    """Service for validating user input"""

    @staticmethod
    def validate_birth_date(date_str: str) -> Tuple[bool, str]:
        """
        Validate birth date in TT.MM.JJJJ format
        Returns: (is_valid, error_message)
        """
        if not re.match(r'^\d{2}\.\d{2}\.\d{4}$', date_str):
            return False, "Ungültiges Datumsformat. Bitte verwenden Sie TT.MM.JJJJ."

        try:
            day, month, year = map(int, date_str.split('.'))
            birth_date = datetime(year, month, day)

            # Check if date is in the future
            if birth_date > datetime.now():
                return False, "Das Geburtsdatum liegt in der Zukunft. Bitte prüfen Sie Ihre Eingabe."

            # Check if date is too far in the past (more than 150 years)
            if birth_date.year < datetime.now().year - 150:
                return False, "Das Geburtsdatum ist zu weit in der Vergangenheit."

            return True, ""
        except ValueError:
            return False, "Ungültiges Datum. Bitte prüfen Sie Tag und Monat."

    @staticmethod
    def validate_birth_time(time_str: str) -> Tuple[bool, str]:
        """
        Validate birth time in HH:MM format (00:00-23:59)
        Returns: (is_valid, error_message)
        """
        if not re.match(r'^\d{2}:\d{2}$', time_str):
            return False, "Ungültiges Zeitformat. Bitte verwenden Sie HH:MM."

        try:
            hour, minute = map(int, time_str.split(':'))
            if hour < 0 or hour > 23:
                return False, "Ungültige Zeit. Bitte nutzen Sie 24-Stunden-Format (00:00–23:59)."
            if minute < 0 or minute > 59:
                return False, "Ungültige Minuten. Bitte verwenden Sie 00-59."
            return True, ""
        except ValueError:
            return False, "Ungültige Zeit. Bitte prüfen Sie Ihre Eingabe."

    @staticmethod
    def validate_name(name: str) -> Tuple[bool, str]:
        """
        Validate name (2-50 chars, no special symbols)
        Returns: (is_valid, error_message)
        """
        if len(name) < 2:
            return False, "Der Name ist zu kurz. Bitte geben Sie mindestens 2 Zeichen ein."
        if len(name) > 50:
            return False, "Der Name ist zu lang. Bitte verwenden Sie maximal 50 Zeichen."

        # Allow letters, spaces, hyphens, apostrophes
        if not re.match(r"^[a-zA-ZäöüÄÖÜß\s\-']+$", name):
            return False, "Bitte geben Sie einen gültigen Namen ein (keine Sonderzeichen)."

        return True, ""

    @staticmethod
    def validate_email(email: str) -> Tuple[bool, str]:
        """
        Validate email format (RFC 5322 basic)
        Returns: (is_valid, error_message)
        """
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, "Ungültige E-Mail-Adresse. Bitte prüfen Sie Ihre Eingabe."
        return True, ""
