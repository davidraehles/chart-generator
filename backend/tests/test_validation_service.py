"""Test validation service"""

import pytest
from src.services.validation_service import ValidationService


@pytest.fixture
def validation_service():
    """Create validation service instance"""
    return ValidationService()


class TestNameValidation:
    """Test name validation"""

    def test_valid_name(self, validation_service):
        """Test valid name passes validation"""
        is_valid, error = validation_service.validate_name("John")
        assert is_valid is True
        assert error == ""

    def test_name_too_short(self, validation_service):
        """Test name that is too short"""
        is_valid, error = validation_service.validate_name("A")
        assert is_valid is False
        assert error is not None

    def test_empty_name(self, validation_service):
        """Test empty name"""
        is_valid, error = validation_service.validate_name("")
        assert is_valid is False
        assert error is not None

    def test_name_with_numbers(self, validation_service):
        """Test name with numbers"""
        is_valid, error = validation_service.validate_name("John123")
        assert is_valid is False
        assert error is not None

    def test_name_with_special_chars(self, validation_service):
        """Test name with special characters"""
        # Hyphens should be allowed in names
        is_valid, error = validation_service.validate_name("Jean-Pierre")
        assert is_valid is True


class TestBirthDateValidation:
    """Test birth date validation"""

    def test_valid_birth_date(self, validation_service):
        """Test valid birth date in German format"""
        is_valid, error = validation_service.validate_birth_date("15.06.1990")
        assert is_valid is True
        assert error == ""

    def test_invalid_format(self, validation_service):
        """Test invalid date format"""
        is_valid, error = validation_service.validate_birth_date("1990-06-15")
        assert is_valid is False
        assert error is not None

    def test_invalid_date(self, validation_service):
        """Test invalid date values"""
        is_valid, error = validation_service.validate_birth_date("32.13.2000")
        assert is_valid is False
        assert error is not None

    def test_future_date(self, validation_service):
        """Test future date"""
        is_valid, error = validation_service.validate_birth_date("01.01.2099")
        assert is_valid is False
        assert error is not None


class TestBirthTimeValidation:
    """Test birth time validation"""

    def test_valid_birth_time(self, validation_service):
        """Test valid birth time"""
        is_valid, error = validation_service.validate_birth_time("14:30")
        assert is_valid is True
        assert error == ""

    def test_midnight(self, validation_service):
        """Test midnight time"""
        is_valid, error = validation_service.validate_birth_time("00:00")
        assert is_valid is True
        assert error == ""

    def test_invalid_hour(self, validation_service):
        """Test invalid hour"""
        is_valid, error = validation_service.validate_birth_time("25:00")
        assert is_valid is False
        assert error is not None

    def test_invalid_minute(self, validation_service):
        """Test invalid minute"""
        is_valid, error = validation_service.validate_birth_time("12:65")
        assert is_valid is False
        assert error is not None

    def test_invalid_format(self, validation_service):
        """Test invalid time format"""
        is_valid, error = validation_service.validate_birth_time("2:30 PM")
        assert is_valid is False
        assert error is not None
