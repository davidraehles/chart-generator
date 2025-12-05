"""Test email capture endpoint"""
import sys
import traceback
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

try:
    response = client.post(
        "/api/email-capture",
        json={"email": "test@example.com"}
    )
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}")
    traceback.print_exc()
