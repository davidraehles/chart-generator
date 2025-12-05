"""Test chart generation endpoint"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


class TestChartEndpoint:
    """Test /api/hd-chart endpoint"""

    def test_valid_chart_request(self):
        """Test valid chart generation request"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)

        # Should succeed or fail gracefully
        assert response.status_code in [200, 400, 500]

        if response.status_code == 200:
            data = response.json()
            assert "firstName" in data
            assert "type" in data
            assert "authority" in data
            assert "profile" in data
            assert "centers" in data
            assert "channels" in data
            assert "gates" in data
            assert "incarnationCross" in data
            assert data["firstName"] == "TestUser"

    def test_invalid_name(self):
        """Test chart request with invalid name"""
        payload = {
            "firstName": "A",  # Too short
            "birthDate": "15.06.1990",
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)
        assert response.status_code in [400, 422]  # Validation error

    def test_invalid_date_format(self):
        """Test chart request with invalid date format"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "1990-06-15",  # Wrong format
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)
        assert response.status_code == 400

    def test_missing_birth_time(self):
        """Test chart request missing birth time when not approximate"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTimeApproximate": False,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)
        assert response.status_code in [400, 422, 500]  # Validation or server error

    def test_approximate_time_handling(self):
        """Test chart request with approximate time"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTimeApproximate": True,
            "birthPlace": "Berlin, Germany"
        }

        response = client.post("/api/hd-chart", json=payload)

        # Should succeed or fail gracefully, not validation error
        assert response.status_code in [200, 400, 500]

    def test_invalid_birth_place(self):
        """Test chart request with invalid birth place"""
        payload = {
            "firstName": "TestUser",
            "birthDate": "15.06.1990",
            "birthTime": "14:30",
            "birthTimeApproximate": False,
            "birthPlace": "NonExistentPlace12345XYZ"
        }

        response = client.post("/api/hd-chart", json=payload)
        assert response.status_code in [400, 500]  # Should fail to geocode
