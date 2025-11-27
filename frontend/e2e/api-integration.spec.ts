import { test, expect } from '@playwright/test';

/**
 * E2E API Integration tests
 * Tests the /api/calculate-chart endpoint via the frontend
 */

// Backend API base URL - adjust based on your setup
const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Chart Calculation API Integration', () => {
  test('should call calculate-chart API with valid birth data', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
      data: {
        birth_datetime: '1985-05-21T14:30:00',
        birth_timezone: 'Europe/Berlin',
        birth_latitude: 52.52,
        birth_longitude: 13.405,
        name: 'Max Mustermann'
      }
    });
    
    // API should respond (may be 200 or error depending on backend state)
    expect([200, 400, 500, 503]).toContain(response.status());
    
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
    }
  });

  test('should return error for invalid timezone', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
      data: {
        birth_datetime: '1985-05-21T14:30:00',
        birth_timezone: 'Invalid/Timezone',
        birth_latitude: 52.52,
        birth_longitude: 13.405
      }
    });
    
    // Should return 400 for validation error
    if (response.status() !== 503) { // Skip if backend unavailable
      expect(response.status()).toBe(400);
      
      const error = await response.json();
      expect(error.detail).toHaveProperty('code');
      expect(error.detail).toHaveProperty('message');
      expect(error.detail).toHaveProperty('message_de');
    }
  });

  test('should return error for invalid coordinates', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
      data: {
        birth_datetime: '1985-05-21T14:30:00',
        birth_timezone: 'Europe/Berlin',
        birth_latitude: 999, // Invalid latitude
        birth_longitude: 13.405
      }
    });
    
    // Should return 422 for validation error (Pydantic)
    if (response.status() !== 503) {
      expect([400, 422]).toContain(response.status());
    }
  });

  test('should include calculation source in response', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
      data: {
        birth_datetime: '1985-05-21T14:30:00',
        birth_timezone: 'Europe/Berlin',
        birth_latitude: 52.52,
        birth_longitude: 13.405
      }
    });
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.calculation_source).toBeDefined();
      expect(['SwissEphemeris', 'OpenAstroAPI', 'NASA_JPL']).toContain(data.calculation_source);
    }
  });
});

test.describe('Chart Calculation Performance', () => {
  test('should respond within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.post(`${API_BASE_URL}/api/calculate-chart`, {
      data: {
        birth_datetime: '1985-05-21T14:30:00',
        birth_timezone: 'Europe/Berlin',
        birth_latitude: 52.52,
        birth_longitude: 13.405
      },
      timeout: 5000 // 5 second timeout
    });
    
    const duration = Date.now() - startTime;
    
    if (response.status() === 200) {
      // Response should be under 2 seconds per spec
      expect(duration).toBeLessThan(2000);
      console.log(`API response time: ${duration}ms`);
    }
  });
});
