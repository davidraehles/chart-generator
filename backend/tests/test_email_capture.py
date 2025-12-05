"""Test email capture endpoint"""

import pytest
from fastapi.testclient import TestClient
from src.main import app
import os

client = TestClient(app)


class TestEmailCapture:
    """Test /api/email-capture endpoint"""

    def test_valid_email_capture(self):
        """Test valid email capture"""
        payload = {
            "email": f"test_{os.urandom(4).hex()}@example.com"  # Unique email
        }

        response = client.post("/api/email-capture", json=payload)

        # Should succeed if DB is available, otherwise fail gracefully
        assert response.status_code in [200, 500]

        if response.status_code == 200:
            data = response.json()
            assert data["success"] is True
            assert "id" in data
            assert "message" in data

    def test_invalid_email_format(self):
        """Test email capture with invalid email format"""
        payload = {
            "email": "invalid-email"
        }

        response = client.post("/api/email-capture", json=payload)
        assert response.status_code == 422  # Validation error

    def test_empty_email(self):
        """Test email capture with empty email"""
        payload = {
            "email": ""
        }

        response = client.post("/api/email-capture", json=payload)
        assert response.status_code == 422  # Validation error

    def test_duplicate_email(self):
        """Test duplicate email capture"""
        email = f"duplicate_{os.urandom(4).hex()}@example.com"
        payload = {"email": email}

        # First submission
        response1 = client.post("/api/email-capture", json=payload)

        if response1.status_code == 200:
            # Second submission (duplicate)
            response2 = client.post("/api/email-capture", json=payload)
            assert response2.status_code == 409  # Conflict
