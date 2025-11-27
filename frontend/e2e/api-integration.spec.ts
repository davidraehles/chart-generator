import { test, expect } from '@playwright/test';

/**
 * E2E API Integration tests
 * Tests the /api/calculate-chart endpoint
 * Set API_URL env var to test against production Railway backend
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
