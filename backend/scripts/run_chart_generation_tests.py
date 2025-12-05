#!/usr/bin/env python3
"""
Phase 6 Chart Generation Testing Script
Tests all sample birth data from TEST_E2E_SAMPLES.md
"""

import asyncio
import httpx
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# API Configuration
API_BASE_URL = "http://localhost:5000"
API_ENDPOINT = f"{API_BASE_URL}/api/hd-chart"

# Test Samples from TEST_E2E_SAMPLES.md
TEST_SAMPLES = [
    {
        "name": "Test Case 1: Manifestor with Emotional Authority",
        "data": {
            "firstName": "Max",
            "birthDate": "15.03.1990",
            "birthTime": "14:30",
            "birthPlace": "Berlin, Germany",
            "birthTimeApproximate": False
        },
        "expected": {
            # Note: Using mock data, so we validate structure not specific values
            "centers_count": 9,
            "has_channels": True,
            "has_gates": True,
            "has_incarnation_cross": True,
            "has_impulse": True
        }
    },
    {
        "name": "Test Case 2: Generator with Sacral Authority",
        "data": {
            "firstName": "Anna",
            "birthDate": "22.07.1985",
            "birthTime": "09:15",
            "birthPlace": "München, Germany",
            "birthTimeApproximate": False
        },
        "expected": {
            # Mock data - validate structure only
        }
    },
    {
        "name": "Test Case 3: Manifesting Generator with Emotional Authority",
        "data": {
            "firstName": "Sophie",
            "birthDate": "03.11.1992",
            "birthTime": "18:45",
            "birthPlace": "Hamburg, Germany",
            "birthTimeApproximate": False
        },
        "expected": {
            # Mock data - validate structure only
        }
    },
    {
        "name": "Test Case 4: Projector with Splenic Authority",
        "data": {
            "firstName": "Lukas",
            "birthDate": "18.05.1988",
            "birthTime": "06:20",
            "birthPlace": "Köln, Germany",
            "birthTimeApproximate": False
        },
        "expected": {
            # Mock data - validate structure only
        }
    },
    {
        "name": "Test Case 5: Reflector with Lunar Authority",
        "data": {
            "firstName": "Marie",
            "birthDate": "29.12.1995",
            "birthTime": "23:55",
            "birthPlace": "Frankfurt, Germany",
            "birthTimeApproximate": False
        },
        "expected": {
            # Mock data - validate structure only
        }
    },
    {
        "name": "Test Case 6: Generator with Ego Authority",
        "data": {
            "firstName": "Jonas",
            "birthDate": "07.09.1987",
            "birthTime": "12:00",
            "birthPlace": "Stuttgart, Germany",
            "birthTimeApproximate": False
        },
        "expected": {
            # Mock data - validate structure only
        }
    },
    {
        "name": "Test Case 7: Approximate Birth Time",
        "data": {
            "firstName": "Lisa",
            "birthDate": "14.02.1991",
            "birthTime": "12:00",  # Default noon time
            "birthPlace": "Düsseldorf, Germany",
            "birthTimeApproximate": True
        },
        "expected": {
            "chart_generates": True
        }
    },
    {
        "name": "Test Case 8: Early Morning Birth",
        "data": {
            "firstName": "Tom",
            "birthDate": "01.01.2000",
            "birthTime": "00:05",
            "birthPlace": "Leipzig, Germany",
            "birthTimeApproximate": False
        },
        "expected": {
            "chart_generates": True
        }
    }
]

# Error test scenarios
ERROR_TESTS = [
    {
        "name": "Invalid Date Format (future date)",
        "data": {
            "firstName": "Test",
            "birthDate": "01.01.2030",
            "birthTime": "12:00",
            "birthPlace": "Berlin, Germany",
            "birthTimeApproximate": False
        },
        "expect_error": True,
        "expected_status": 400
    },
    {
        "name": "Invalid Time Format",
        "data": {
            "firstName": "Test",
            "birthDate": "15.03.1990",
            "birthTime": "25:00",  # Invalid hour
            "birthPlace": "Berlin, Germany",
            "birthTimeApproximate": False
        },
        "expect_error": True,
        "expected_status": 400
    },
    {
        "name": "Missing Required Field",
        "data": {
            "firstName": "",  # Empty
            "birthDate": "15.03.1990",
            "birthTime": "12:00",
            "birthPlace": "Berlin, Germany",
            "birthTimeApproximate": False
        },
        "expect_error": True,
        "expected_status": [400, 422]  # Accept both validation error codes
    }
]

class TestResults:
    """Container for test results"""
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.errors = []
        self.performance_metrics = []
        self.detailed_results = []

    def add_result(self, test_name: str, passed: bool, duration: float, details: str = ""):
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
            self.errors.append(f"{test_name}: {details}")

        self.performance_metrics.append({
            "test": test_name,
            "duration": duration
        })

        self.detailed_results.append({
            "test": test_name,
            "status": "PASSED" if passed else "FAILED",
            "duration": f"{duration:.3f}s",
            "details": details
        })

async def test_chart_generation(client: httpx.AsyncClient, test_case: Dict) -> Dict[str, Any]:
    """Test a single chart generation request"""
    start_time = time.time()

    try:
        response = await client.post(
            API_ENDPOINT,
            json=test_case["data"],
            timeout=10.0
        )

        duration = time.time() - start_time

        return {
            "success": True,
            "status_code": response.status_code,
            "duration": duration,
            "data": response.json() if response.status_code == 200 else None,
            "error": None
        }

    except Exception as e:
        duration = time.time() - start_time
        return {
            "success": False,
            "status_code": None,
            "duration": duration,
            "data": None,
            "error": str(e)
        }

def validate_chart_response(response_data: Dict, expected: Dict) -> tuple[bool, str]:
    """Validate chart response against expected criteria"""
    if not response_data:
        return False, "No response data"

    errors = []

    # Check required top-level fields
    required_fields = ["type", "authority", "profile", "centers", "channels", "gates", "incarnationCross", "shortImpulse"]
    for field in required_fields:
        if field not in response_data:
            errors.append(f"Missing required field: {field}")

    if errors:
        return False, "; ".join(errors)

    # Validate type structure
    if "code" not in response_data["type"] or "label" not in response_data["type"]:
        errors.append("Type missing code or label")

    # Validate authority structure
    if "code" not in response_data["authority"] or "label" not in response_data["authority"]:
        errors.append("Authority missing code or label")

    # Validate profile structure
    if "code" not in response_data["profile"]:
        errors.append("Profile missing code")

    # Validate centers (should have 9)
    if len(response_data.get("centers", [])) != 9:
        errors.append(f"Expected 9 centers, got {len(response_data.get('centers', []))}")

    # Validate gates structure (conscious and unconscious)
    gates = response_data.get("gates", {})
    if "conscious" not in gates or "unconscious" not in gates:
        errors.append("Gates missing conscious or unconscious lists")

    # Validate incarnation cross
    if "name" not in response_data.get("incarnationCross", {}):
        errors.append("Incarnation cross missing name")

    # Validate impulse
    if not response_data.get("shortImpulse"):
        errors.append("ShortImpulse message is empty")

    # Check expected criteria (only if specified)
    # Note: With mock data, we can't validate specific HD chart rules
    # These validations will be important when real calculation is integrated

    if errors:
        return False, "; ".join(errors)

    return True, "All validations passed"

async def run_tests():
    """Run all test cases"""
    results = TestResults()

    print("=" * 80)
    print("PHASE 6: CHART GENERATION TESTING")
    print("=" * 80)
    print(f"Starting tests at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Endpoint: {API_ENDPOINT}")
    print()

    async with httpx.AsyncClient() as client:
        # Test health endpoint first
        print("Testing API health...")
        try:
            health_response = await client.get(f"{API_BASE_URL}/health", timeout=5.0)
            if health_response.status_code == 200:
                print("✓ API is healthy\n")
            else:
                print(f"✗ API health check failed: {health_response.status_code}\n")
                return results
        except Exception as e:
            print(f"✗ Cannot reach API: {e}\n")
            return results

        # Test successful chart generation
        print("-" * 80)
        print("TESTING SUCCESSFUL CHART GENERATION")
        print("-" * 80)

        for i, test_case in enumerate(TEST_SAMPLES, 1):
            print(f"\n[{i}/{len(TEST_SAMPLES)}] {test_case['name']}")
            print(f"   Data: {test_case['data']['firstName']}, {test_case['data']['birthDate']}, {test_case['data']['birthTime']}")

            result = await test_chart_generation(client, test_case)

            if not result["success"]:
                results.add_result(
                    test_case["name"],
                    False,
                    result["duration"],
                    f"Request failed: {result['error']}"
                )
                print(f"   ✗ FAILED: {result['error']}")
                continue

            if result["status_code"] != 200:
                results.add_result(
                    test_case["name"],
                    False,
                    result["duration"],
                    f"HTTP {result['status_code']}"
                )
                print(f"   ✗ FAILED: HTTP {result['status_code']}")
                continue

            # Validate response
            is_valid, validation_msg = validate_chart_response(
                result["data"],
                test_case.get("expected", {})
            )

            results.add_result(
                test_case["name"],
                is_valid,
                result["duration"],
                validation_msg if not is_valid else ""
            )

            if is_valid:
                print(f"   ✓ PASSED ({result['duration']:.3f}s)")
                if result["duration"] > 3.0:
                    print(f"   ⚠ WARNING: Performance exceeded 3s threshold")
            else:
                print(f"   ✗ FAILED: {validation_msg}")

        # Test error scenarios
        print("\n" + "-" * 80)
        print("TESTING ERROR SCENARIOS")
        print("-" * 80)

        for i, error_test in enumerate(ERROR_TESTS, 1):
            print(f"\n[{i}/{len(ERROR_TESTS)}] {error_test['name']}")

            result = await test_chart_generation(client, error_test)

            expected_error = error_test.get("expect_error", False)
            expected_status = error_test.get("expected_status", 400)

            # Handle both single status code and list of acceptable codes
            if isinstance(expected_status, list):
                acceptable_statuses = expected_status
            else:
                acceptable_statuses = [expected_status]

            if expected_error:
                if result["status_code"] in acceptable_statuses:
                    results.add_result(error_test["name"], True, result["duration"])
                    print(f"   ✓ PASSED: Correctly returned {result['status_code']} error")
                else:
                    results.add_result(
                        error_test["name"],
                        False,
                        result["duration"],
                        f"Expected {acceptable_statuses}, got {result['status_code']}"
                    )
                    print(f"   ✗ FAILED: Expected {acceptable_statuses}, got {result['status_code']}")

    return results

def generate_markdown_report(results: TestResults) -> str:
    """Generate markdown test results report"""
    report = []

    report.append("# Phase 6: Chart Generation Test Results\n")
    report.append(f"**Test Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append(f"**API Endpoint**: {API_ENDPOINT}\n")
    report.append("")

    # Summary
    report.append("## Test Summary\n")
    report.append(f"- **Total Tests**: {results.total_tests}")
    report.append(f"- **Passed**: {results.passed_tests}")
    report.append(f"- **Failed**: {results.failed_tests}")
    report.append(f"- **Success Rate**: {(results.passed_tests/results.total_tests*100) if results.total_tests > 0 else 0:.1f}%")
    report.append("")

    # Performance metrics
    if results.performance_metrics:
        avg_duration = sum(m["duration"] for m in results.performance_metrics) / len(results.performance_metrics)
        max_duration = max(m["duration"] for m in results.performance_metrics)
        min_duration = min(m["duration"] for m in results.performance_metrics)

        report.append("## Performance Metrics\n")
        report.append(f"- **Average Response Time**: {avg_duration:.3f}s")
        report.append(f"- **Fastest Response**: {min_duration:.3f}s")
        report.append(f"- **Slowest Response**: {max_duration:.3f}s")
        report.append(f"- **Performance Target**: <3.000s")

        over_threshold = [m for m in results.performance_metrics if m["duration"] > 3.0]
        if over_threshold:
            report.append(f"- **⚠ Tests Over Threshold**: {len(over_threshold)}")
        else:
            report.append("- **✓ All tests within performance target**")
        report.append("")

    # Detailed results
    report.append("## Detailed Test Results\n")
    report.append("| Test Case | Status | Duration | Details |")
    report.append("|-----------|--------|----------|---------|")

    for result in results.detailed_results:
        status_icon = "✓" if result["status"] == "PASSED" else "✗"
        report.append(
            f"| {result['test']} | {status_icon} {result['status']} | {result['duration']} | {result['details'] or '-'} |"
        )

    report.append("")

    # Errors
    if results.errors:
        report.append("## Failed Tests Details\n")
        for i, error in enumerate(results.errors, 1):
            report.append(f"{i}. {error}")
        report.append("")

    # Conclusion
    report.append("## Conclusion\n")
    if results.failed_tests == 0:
        report.append("✅ **All tests passed successfully!**")
    else:
        report.append(f"⚠ **{results.failed_tests} test(s) failed. Review details above.**")

    report.append("")
    report.append("---")
    report.append("*Generated by Phase 6 Chart Generation Test Suite*")

    return "\n".join(report)

async def main():
    """Main test execution"""
    results = await run_tests()

    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests:  {results.total_tests}")
    print(f"Passed:       {results.passed_tests}")
    print(f"Failed:       {results.failed_tests}")
    print(f"Success Rate: {(results.passed_tests/results.total_tests*100) if results.total_tests > 0 else 0:.1f}%")

    if results.performance_metrics:
        avg_duration = sum(m["duration"] for m in results.performance_metrics) / len(results.performance_metrics)
        print(f"\nAverage Response Time: {avg_duration:.3f}s")
        print(f"Performance Target: <3.000s")

    print("\n" + "=" * 80)

    # Generate markdown report
    report = generate_markdown_report(results)

    # Save to file
    report_path = "/home/darae/chart-generator/PHASE6_CHART_GENERATION_TEST_RESULTS.md"
    with open(report_path, "w") as f:
        f.write(report)

    print(f"\nDetailed report saved to: {report_path}")

    if results.failed_tests == 0:
        print("\n✅ Chart generation testing complete - see PHASE6_CHART_GENERATION_TEST_RESULTS.md")
    else:
        print(f"\n⚠ Testing complete with {results.failed_tests} failure(s) - see PHASE6_CHART_GENERATION_TEST_RESULTS.md")

if __name__ == "__main__":
    asyncio.run(main())
