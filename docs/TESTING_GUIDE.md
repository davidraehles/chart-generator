# Testing Guide

This document describes the test infrastructure for the Human Design Chart Generator.

## Test Structure

```
backend/tests/          # Python unit tests for FastAPI backend
├── test_chart_endpoint.py    # /api/hd-chart endpoint tests
├── test_health.py            # Health check endpoint tests
├── test_email_capture.py      # Email capture endpoint tests
├── test_models.py            # Model validation tests
└── conftest.py               # Pytest configuration

frontend/e2e/           # Playwright E2E tests for frontend
├── chart-form.spec.ts        # Form submission & validation tests
└── api-integration.spec.ts    # API integration tests (both endpoints)
```

## Test Data Schema

### ChartRequest (Form Input)
```typescript
{
  firstName: string;          // 2-50 characters
  birthDate: string;          // Format: DD.MM.YYYY (e.g., "23.11.1985")
  birthTime?: string;         // Format: HH:MM (e.g., "14:30")
  birthPlace: string;         // 2-200 characters
  birthTimeApproximate: bool; // If true, birthTime is optional (uses 12:00)
}
```

### ChartResponse (API Response)
```typescript
{
  firstName: string;
  type: {
    code: string;
    label: string;
    shortDescription: string;
  };
  authority: {
    code: string;
    label: string;
    decisionHint: string;
  };
  profile: {
    code: string;
    shortDescription: string;
  };
  centers: Array<{
    name: string;
    code: string;
    defined: boolean;
  }>;
  channels: Array<{
    code: string; // e.g., "34-20"
  }>;
  gates: {
    conscious: string[];   // e.g., ["46.2", "25.2"]
    unconscious: string[]; // e.g., ["15.4", "10.4"]
  };
  incarnationCross: {
    code: string;
    name: string;
    gates: string[];       // e.g., ["15", "10", "5", "35"]
  };
  shortImpulse: string;
  calculationSource: string; // e.g., "SwissEphemeris"
}
```

## Running Tests Locally

### Backend Unit Tests

Install dependencies:
```bash
cd backend
pip install -r requirements.txt
pip install pytest pytest-asyncio pytest-timeout
```

Run all tests:
```bash
pytest tests/ -v
```

Run specific test file:
```bash
pytest tests/test_chart_endpoint.py -v
```

Run with timeout protection:
```bash
pytest tests/ -v --timeout=30
```

Generate XML report:
```bash
pytest tests/ -v --junit-xml=test-results.xml
```

### Frontend E2E Tests

Install dependencies:
```bash
cd frontend
npm ci
npx playwright install chromium --with-deps
```

Run E2E tests:
```bash
npm run test:e2e
```

Run with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Run with headed browser:
```bash
npm run test:e2e:headed
```

View test report:
```bash
npx playwright show-report
```

### Testing Against Production API

Set the `API_URL` environment variable to test against production Railway backend:

```bash
# Test against production
export API_URL=https://chart-generator-production-64fd.up.railway.app
npm run test:e2e
```

The api-integration.spec.ts tests will automatically use this URL for API calls while the form tests use localhost:3000 for UI.

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:
- Push to main and feature/* branches
- Pull requests to main

### Pipeline Stages

1. **Backend Lint** - Ruff linter and mypy type checking
2. **Backend Tests** - Pytest unit tests with timeout protection
3. **Frontend Lint** - ESLint and TypeScript strict mode
4. **Frontend Build** - Next.js build (artifacts cached for E2E)
5. **E2E Tests** - Playwright tests on Chromium (ubuntu-latest runner)

### Playwright Configuration

- **Runner**: `ubuntu-latest`
- **Browsers**: Chromium (only, desktop Chrome)
- **Workers**: 1 (for stability on CI)
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 30 seconds per test
- **Screenshots**: Only on failure
- **Traces**: On first retry

See `frontend/playwright.config.ts` for full configuration.

## Test Coverage

### Backend Tests
- ✅ Valid chart generation with proper data
- ✅ Invalid name validation (min 2 characters)
- ✅ Invalid date format (must be DD.MM.YYYY)
- ✅ Missing required fields
- ✅ Approximate birth time handling
- ✅ Invalid/non-existent birth place
- ✅ Complete schema validation of ChartResponse

### Frontend E2E Tests

**Form Tests:**
- ✅ Page loads with all form fields
- ✅ Required field validation
- ✅ Date format validation
- ✅ Approximate time checkbox functionality
- ✅ Form submission with valid data
- ✅ Name length validation
- ✅ Birth place field validation

**API Integration Tests:**
- ✅ Form-based /api/hd-chart endpoint
- ✅ ChartRequest schema compliance
- ✅ ChartResponse schema validation
- ✅ Approximate birth time handling
- ✅ Required field validation
- ✅ Date format validation (DD.MM.YYYY)
- ✅ Time format validation (HH:MM)
- ✅ Invalid location error handling
- ✅ Ephemeris /api/calculate-chart endpoint
- ✅ Calculation source validation
- ✅ Performance benchmarking

**Accessibility Tests:**
- ✅ Proper form labels
- ✅ Keyboard navigation
- ✅ Responsive design (mobile, tablet, desktop)

## Writing New Tests

### Backend Unit Tests

Use this template:
```python
def test_specific_behavior(self):
    """Test description"""
    payload = {
        "firstName": "TestUser",
        "birthDate": "15.06.1990",
        "birthTime": "14:30",
        "birthTimeApproximate": False,
        "birthPlace": "Berlin, Germany"
    }

    response = client.post("/api/hd-chart", json=payload)

    # Assert response status
    assert response.status_code in [200, 400], f"Got {response.status_code}"

    # Assert response data
    if response.status_code == 200:
        data = response.json()
        assert data["firstName"] == "TestUser"
        assert "type" in data
```

### Frontend E2E Tests

Use this template:
```typescript
test('should do something', async ({ page }) => {
  await page.goto('/');

  // Fill form with proper format
  await page.locator('#firstName').fill('Test Name');
  await page.locator('#birthDate').fill('15.06.1990'); // DD.MM.YYYY
  await page.locator('#birthTime').fill('14:30');      // HH:MM
  await page.locator('#birthPlace').fill('Berlin, Germany');

  // Submit and wait for response
  const response = await page.waitForResponse(
    response => response.url().includes('/api/hd-chart'),
    { timeout: 30000 }
  );

  // Validate response
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('firstName');
});
```

## Troubleshooting

### Tests timeout on CI
- Ensure E2E tests have `--workers=1` flag
- Check that Playwright browsers are installed
- Verify backend is accessible (not port blocked)

### Validation errors in tests
- Check date format: Must be DD.MM.YYYY (not YYYY-MM-DD)
- Check time format: Must be HH:MM (not HH:MM:SS)
- Check firstName length: Must be 2+ characters
- Check birthPlace: Must be 2+ characters

### Backend tests fail with ephemeris errors
- SwissEphemeris data files may not be available
- Check that `pyswisseph` is installed: `pip install pyswisseph`
- Can set `SKIP_EPHEMERIS_TESTS=1` environment variable

### E2E tests fail to connect to backend
- Check that backend is running on port 5000
- Check CORS configuration allows requests from localhost:3000
- Test API directly: `curl http://localhost:5000/health`

## Best Practices

1. **Test Data Consistency** - Always use correct date/time formats
2. **Schema Validation** - Verify complete response structure, not just happy path
3. **Error Handling** - Test both success (200) and error (400, 500) responses
4. **Timeout Protection** - Use `--timeout=30` for backend tests
5. **Worker Count** - Use `--workers=1` for E2E tests on CI for stability
6. **Fail Fast** - Remove `continue-on-error` flags in CI workflows
7. **Artifact Upload** - Upload test reports for debugging CI failures

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Pytest Documentation](https://docs.pytest.org)
- [FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-websockets/)
- [Pydantic Validation](https://docs.pydantic.dev)
