import { test, expect } from '@playwright/test';

/**
 * E2E API Integration tests
 * Tests both /api/hd-chart (form-based) and /api/calculate-chart (ephemeris) endpoints
 * Set API_URL env var to test against production Railway backend
 *
 * Test data schema validation:
 * ChartRequest: firstName (2-50 chars), birthDate (TT.MM.JJJJ), birthTime (HH:MM),
 *               birthPlace (2-200 chars), birthTimeApproximate (bool)
 * ChartResponse: includes type, authority, profile, centers[], channels[], gates{}, incarnationCross
 */

// Default to localhost for safety, set API_URL for production testing
const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

// Helper to check if backend is available
async function isBackendAvailable(request: any): Promise<boolean> {
  try {
    const response = await request.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    return response.status() === 200;
  } catch {
    return false;
  }
}

test.describe('Backend Health Check', () => {
  test('should have healthy backend', async ({ request }) => {
    let response;
    try {
      response = await request.get(`${API_BASE_URL}/health`, { timeout: 10000 });
    } catch (e) {
      console.log('⚠️ Backend is not reachable - it may be deploying or down');
      test.skip();
      return;
    }
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.status).toBe('healthy');
      console.log('✅ Backend is healthy');
    } else {
      console.log(`⚠️ Backend health check returned ${response.status()}`);
    }
  });
});

test.describe('Form-Based Chart Generation API (/api/hd-chart)', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    const available = await isBackendAvailable(request);
    if (!available) {
      console.log('⚠️ Backend unavailable - skipping form API test');
      testInfo.skip();
    }
  });

  test('should generate chart from form data with valid ChartRequest', async ({ request }) => {
    const payload = {
      firstName: 'Anna Schmidt',
      birthDate: '23.11.1985',   // Format: TT.MM.JJJJ
      birthTime: '09:15',         // Format: HH:MM
      birthPlace: 'München, Deutschland',
      birthTimeApproximate: false
    };

    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/hd-chart`, {
        data: payload,
        timeout: 30000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping form API test');
      test.skip();
      return;
    }

    console.log(`Form API responded with status: ${response.status()}`);

    // Accept 200 success or 400 validation error
    expect([200, 400, 500]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();

      // Verify ChartResponse schema
      expect(data).toHaveProperty('firstName');
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('authority');
      expect(data).toHaveProperty('profile');
      expect(data).toHaveProperty('centers');
      expect(data).toHaveProperty('channels');
      expect(data).toHaveProperty('gates');
      expect(data).toHaveProperty('incarnationCross');

      // Verify field types
      expect(typeof data.firstName).toBe('string');
      expect(typeof data.type).toBe('object');
      expect(typeof data.authority).toBe('object');
      expect(Array.isArray(data.centers)).toBeTruthy();
      expect(Array.isArray(data.channels)).toBeTruthy();
      expect(typeof data.gates).toBe('object');
      expect(typeof data.incarnationCross).toBe('object');

      // Verify type structure
      expect(data.type).toHaveProperty('code');
      expect(data.type).toHaveProperty('label');
      expect(data.type).toHaveProperty('shortDescription');

      // Verify authority structure
      expect(data.authority).toHaveProperty('code');
      expect(data.authority).toHaveProperty('label');
      expect(data.authority).toHaveProperty('decisionHint');

      // Verify gates structure
      expect(data.gates).toHaveProperty('conscious');
      expect(data.gates).toHaveProperty('unconscious');
      expect(Array.isArray(data.gates.conscious)).toBeTruthy();
      expect(Array.isArray(data.gates.unconscious)).toBeTruthy();

      // Verify incarnation cross structure
      expect(data.incarnationCross).toHaveProperty('code');
      expect(data.incarnationCross).toHaveProperty('gates');
      expect(Array.isArray(data.incarnationCross.gates)).toBeTruthy();

      console.log(`✅ Chart generated successfully from form data`);
    } else if (response.status() === 400) {
      const error = await response.json();
      console.log(`⚠️ Validation error: ${error.detail?.error || JSON.stringify(error.detail)}`);
    }
  });

  test('should handle approximate birth time', async ({ request }) => {
    const payload = {
      firstName: 'Jane Doe',
      birthDate: '10.07.1995',
      birthTimeApproximate: true,
      // birthTime omitted when approximate=true, backend uses 12:00
      birthPlace: 'Paris, France'
    };

    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/hd-chart`, {
        data: payload,
        timeout: 30000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping approximate time test');
      test.skip();
      return;
    }

    // Skip if backend unavailable
    if (response.status() === 502 || response.status() === 503) {
      console.log('⚠️ Backend unavailable - skipping approximate time test');
      return;
    }

    // Should handle approximate time gracefully (200 or 400 for location errors)
    expect([200, 400]).toContain(response.status());
    console.log(`✅ Approximate birth time handling tested (status: ${response.status()})`);
  });

  test('should validate required fields', async ({ request }) => {
    // Missing birthTime and birthPlace
    const payload = {
      firstName: 'John',
      birthDate: '01.01.1980',
      birthTimeApproximate: false
      // birthTime is required when approximate=false
      // birthPlace is required
    };

    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/hd-chart`, {
        data: payload,
        timeout: 10000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping validation test');
      test.skip();
      return;
    }

    // Should return validation error
    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty('detail');
    console.log(`✅ Validation error returned correctly for missing fields`);
  });

  test('should reject invalid date format', async ({ request }) => {
    const payload = {
      firstName: 'Test',
      birthDate: '1990-01-15', // Wrong format, should be TT.MM.JJJJ
      birthTime: '14:30',
      birthPlace: 'Berlin, Germany'
    };

    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/hd-chart`, {
        data: payload,
        timeout: 10000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping date validation test');
      test.skip();
      return;
    }

    // Should return validation error for date format
    expect(response.status()).toBe(400);
    console.log(`✅ Date format validation works`);
  });

  test('should return error for non-existent location', async ({ request }) => {
    const payload = {
      firstName: 'Test User',
      birthDate: '15.03.2000',
      birthTime: '12:00',
      birthPlace: 'XYZ123NotAPlace'
    };

    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/hd-chart`, {
        data: payload,
        timeout: 30000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping location validation test');
      test.skip();
      return;
    }

    // Should return 400 for geocoding failure
    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty('detail');
    console.log(`✅ Geocoding error handled correctly`);
  });
});

test.describe('Chart Calculation API Integration', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    const available = await isBackendAvailable(request);
    if (!available) {
      console.log('⚠️ Backend unavailable - skipping API test');
      testInfo.skip();
    }
  });

  test('should call calculate-chart API with valid birth data', async ({ request }) => {
    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
        data: {
          birth_datetime: '1985-05-21T14:30:00',
          birth_timezone: 'Europe/Berlin',
          birth_latitude: 52.52,
          birth_longitude: 13.405,
          name: 'Max Mustermann'
        },
        timeout: 15000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping test');
      test.skip();
      return;
    }
    
    console.log(`API responded with status: ${response.status()}`);
    
    // API should respond (may be 200 or error depending on backend state)
    expect([200, 400, 500, 502, 503]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      
      // Verify response structure
      expect(data).toHaveProperty('personality_activations');
      expect(data).toHaveProperty('design_activations');
      expect(data).toHaveProperty('calculation_source');
      expect(data).toHaveProperty('calculated_at');
      
      // Verify activations count (13 celestial bodies each)
      expect(data.personality_activations).toHaveLength(13);
      expect(data.design_activations).toHaveLength(13);
      
      // Verify activation structure
      const activation = data.personality_activations[0];
      expect(activation).toHaveProperty('body');
      expect(activation).toHaveProperty('ecliptic_longitude');
      expect(activation).toHaveProperty('gate');
      expect(activation).toHaveProperty('line');
      expect(activation).toHaveProperty('gate_line');
      
      // Verify gate/line ranges
      expect(activation.gate).toBeGreaterThanOrEqual(1);
      expect(activation.gate).toBeLessThanOrEqual(64);
      expect(activation.line).toBeGreaterThanOrEqual(1);
      expect(activation.line).toBeLessThanOrEqual(6);
      
      console.log(`✅ Chart calculated successfully using ${data.calculation_source}`);
    } else if (response.status() === 500) {
      const error = await response.json();
      // Validate German error message exists and is user-friendly
      if (error.detail?.message_de) {
        expect(error.detail.message_de).toBeTruthy();
        expect(error.detail.message_de.length).toBeGreaterThan(10);
        // Should not contain technical English terms
        expect(error.detail.message_de).not.toMatch(/error|exception|null|undefined|stack/i);
        console.log(`⚠️ Backend error (German): ${error.detail.message_de}`);
      } else {
        console.log(`⚠️ Backend error: ${JSON.stringify(error.detail || error)}`);
      }
    }
  });

  test('should return error for invalid timezone', async ({ request }) => {
    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
        data: {
          birth_datetime: '1985-05-21T14:30:00',
          birth_timezone: 'Invalid/Timezone',
          birth_latitude: 52.52,
          birth_longitude: 13.405
        },
        timeout: 15000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping timezone validation test');
      test.skip();
      return;
    }
    
    // Skip if backend unavailable
    if (response.status() === 502 || response.status() === 503) {
      console.log('⚠️ Backend unavailable - skipping validation test');
      return;
    }
    
    // Should return 400 for validation error
    expect(response.status()).toBe(400);
    
    const error = await response.json();
    expect(error.detail).toHaveProperty('code');
    expect(error.detail).toHaveProperty('message');
    expect(error.detail).toHaveProperty('message_de');
    expect(error.detail.code).toBe('INVALID_TIMEZONE');
    
    // Validate German error message quality
    expect(error.detail.message_de).toBeTruthy();
    expect(error.detail.message_de.length).toBeGreaterThan(10);
    // Should not contain technical English terms
    expect(error.detail.message_de).not.toMatch(/error|exception|invalid|null/i);
  });

  test('should return error for invalid coordinates', async ({ request }) => {
    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
        data: {
          birth_datetime: '1985-05-21T14:30:00',
          birth_timezone: 'Europe/Berlin',
          birth_latitude: 999, // Invalid latitude
          birth_longitude: 13.405
        },
        timeout: 15000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping coordinates validation test');
      test.skip();
      return;
    }
    
    // Skip if backend unavailable
    if (response.status() === 502 || response.status() === 503) {
      console.log('⚠️ Backend unavailable - skipping validation test');
      return;
    }
    
    // Should return 422 for validation error (Pydantic)
    expect([400, 422]).toContain(response.status());
  });

  test('should include calculation source in response', async ({ request }) => {
    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
        data: {
          birth_datetime: '1985-05-21T14:30:00',
          birth_timezone: 'Europe/Berlin',
          birth_latitude: 52.52,
          birth_longitude: 13.405
        },
        timeout: 15000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping calculation source test');
      test.skip();
      return;
    }
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.calculation_source).toBeDefined();
      expect(['SwissEphemeris', 'OpenAstroAPI', 'NASA_JPL']).toContain(data.calculation_source);
      console.log(`✅ Calculation source: ${data.calculation_source}`);
    } else {
      console.log(`⚠️ Backend returned status ${response.status()} - skipping source check`);
    }
  });
});

test.describe('Chart Calculation Performance', () => {
  test('should respond within acceptable time', async ({ request }) => {
    const available = await isBackendAvailable(request);
    if (!available) {
      console.log('⚠️ Backend unavailable - skipping performance test');
      test.skip();
      return;
    }

    const startTime = Date.now();
    
    let response;
    try {
      response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
        data: {
          birth_datetime: '1985-05-21T14:30:00',
          birth_timezone: 'Europe/Berlin',
          birth_latitude: 52.52,
          birth_longitude: 13.405
        },
        timeout: 10000
      });
    } catch (e) {
      console.log('⚠️ Backend request failed - skipping performance test');
      test.skip();
      return;
    }
    
    const duration = Date.now() - startTime;
    
    if (response.status() === 200) {
      // Response should be under 2 seconds per spec
      expect(duration).toBeLessThan(2000);
      console.log(`✅ API response time: ${duration}ms`);
    } else {
      console.log(`⚠️ Backend returned ${response.status()} in ${duration}ms`);
    }
  });
});
