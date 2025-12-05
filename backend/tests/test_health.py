"""Test health check endpoint"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_health_check():
    """Test that health endpoint returns 200 OK"""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "hd-chart-generator"
    assert "status" in data
    assert "service" in data
