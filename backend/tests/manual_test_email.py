#!/usr/bin/env python3
"""
Manual test script for email capture functionality.

Tests the complete email capture flow with various scenarios.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.database import get_db_session
from src.handlers.email_handler import EmailHandler, EmailCaptureError


def test_email_capture():
    """Test email capture with various scenarios."""
    handler = EmailHandler()

    test_cases = [
        {
            "name": "Valid email",
            "email": "test@example.com",
            "should_succeed": True,
        },
        {
            "name": "Invalid email format",
            "email": "not-an-email",
            "should_succeed": False,
            "expected_status": 400,
        },
        {
            "name": "Duplicate email",
            "email": "test@example.com",
            "should_succeed": False,
            "expected_status": 409,
        },
        {
            "name": "Valid email with different case",
            "email": "NewUser@Example.COM",
            "should_succeed": True,
        },
        {
            "name": "Duplicate with different case",
            "email": "newuser@example.com",
            "should_succeed": False,
            "expected_status": 409,
        },
        {
            "name": "Empty email",
            "email": "",
            "should_succeed": False,
            "expected_status": 400,
        },
        {
            "name": "Valid international email",
            "email": "user@münchen.de",
            "should_succeed": True,
        },
    ]

    print("=" * 70)
    print("Testing Email Capture Functionality")
    print("=" * 70)
    print()

    passed = 0
    failed = 0

    for test in test_cases:
        print(f"Test: {test['name']}")
        print(f"  Email: {test['email']}")

        db_session = get_db_session()
        try:
            result = handler.capture_email(
                email=test["email"],
                db_session=db_session,
                ip_address="127.0.0.1",
                user_agent="Manual Test Script"
            )

            if test["should_succeed"]:
                print(f"  Result: SUCCESS")
                print(f"  ID: {result['id']}")
                print(f"  Message: {result['message']}")
                passed += 1
            else:
                print(f"  Result: FAIL - Expected error but got success")
                failed += 1

        except EmailCaptureError as e:
            if not test["should_succeed"]:
                expected_status = test.get("expected_status", 400)
                if e.status_code == expected_status:
                    print(f"  Result: SUCCESS (Expected error)")
                    print(f"  Status: {e.status_code}")
                    print(f"  Message: {e.message}")
                    passed += 1
                else:
                    print(f"  Result: FAIL - Wrong status code")
                    print(f"  Expected: {expected_status}, Got: {e.status_code}")
                    failed += 1
            else:
                print(f"  Result: FAIL - Unexpected error")
                print(f"  Status: {e.status_code}")
                print(f"  Message: {e.message}")
                failed += 1

        except Exception as e:
            print(f"  Result: FAIL - Unexpected exception")
            print(f"  Error: {str(e)}")
            failed += 1

        finally:
            db_session.close()

        print()

    print("=" * 70)
    print(f"Test Results: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print("=" * 70)

    return failed == 0


if __name__ == "__main__":
    try:
        success = test_email_capture()
        sys.exit(0 if success else 1)

    except KeyboardInterrupt:
        print("\n\nTest cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
