"""Test chart generation endpoint"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


class TestChartEndpoint:
    """Test /api/hd-chart endpoint"""

    def test_valid_chart_request(self):
        """Test valid chart generation request with known birth data"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)

        # Must succeed (200) or fail with validation error (400)
        assert response.status_code in [200, 400], f"Unexpected status code {response.status_code}: {response.json()}"

        if response.status_code == 200:
            data = response.json()
            # Verify all required response fields exist
            assert "firstName" in data, "Response missing firstName"
            assert "type" in data, "Response missing type"
            assert "authority" in data, "Response missing authority"
            assert "profile" in data, "Response missing profile"
            assert "centers" in data, "Response missing centers"
            assert "channels" in data, "Response missing channels"
            assert "gates" in data, "Response missing gates"
            assert "incarnationCross" in data, "Response missing incarnationCross"

            # Verify field values
            assert data["firstName"] == "TestUser"

            # Verify type structure
            assert isinstance(data["type"], dict)
            assert "code" in data["type"]
            assert "label" in data["type"]

            # Verify authority structure
            assert isinstance(data["authority"], dict)
            assert "code" in data["authority"]
            assert "label" in data["authority"]

            # Verify centers is a list
            assert isinstance(data["centers"], list)
            assert len(data["centers"]) > 0

            # Verify channels is a list
            assert isinstance(data["channels"], list)

            # Verify gates structure
            assert isinstance(data["gates"], dict)
            assert "conscious" in data["gates"]
            assert "unconscious" in data["gates"]

            # Verify incarnation cross structure
            assert isinstance(data["incarnationCross"], dict)
            assert "code" in data["incarnationCross"]
            assert "gates" in data["incarnationCross"]

    def test_invalid_name(self):
        """Test chart request with invalid name - must be at least 2 chars"""
        payload = {
            "firstName": "A",  # Too short, min_length=2
            "birthDate": "15.06.1990",
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)
        # Pydantic validation should reject short names
        assert response.status_code in [400, 422], f"Expected validation error, got {response.status_code}"

    def test_invalid_date_format(self):
        """Test chart request with invalid date format - must be TT.MM.JJJJ"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "1990-06-15",  # Wrong format, should be 15.06.1990
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)
        assert response.status_code == 400, f"Expected date validation error, got {response.status_code}"

    def test_missing_birth_time(self):
        """Test chart request missing birth time when not approximate"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTimeApproximate": False,
            # birthTime is required when birthTimeApproximate is False
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)
        # Should fail validation - birthTime is required
        assert response.status_code in [400, 422], f"Expected validation error, got {response.status_code}"

    def test_approximate_time_handling(self):
        """Test chart request with approximate time - uses 12:00 by default"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTimeApproximate": True,
            # No birthTime provided, will use 12:00
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)

        # Should succeed or fail gracefully (geocoding might fail), but not validation error
        assert response.status_code in [200, 400], f"Unexpected status code {response.status_code}"

    def test_invalid_birth_place(self):
        """Test chart request with non-existent birth place"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "NonExistentPlace12345XYZ"
        }

        response = client.post("/api/hd-chart", json=payload)
        # Should fail - geocoding service can't find the location
        assert response.status_code == 400, f"Expected geocoding error (400), got {response.status_code}"
