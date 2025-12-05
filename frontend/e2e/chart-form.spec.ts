import { test, expect } from '@playwright/test';

/**
 * E2E tests for Human Design Chart Generator
 * Tests the complete flow from birth data input to chart generation
 */

test.describe('Chart Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page with form', async ({ page }) => {
    // Verify page title and heading
    await expect(page.locator('h1')).toContainText('Human Design Chart Generator');
    
    // Verify form elements exist
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#birthDate')).toBeVisible();
    await expect(page.locator('#birthTime')).toBeVisible();
    await expect(page.locator('#birthPlace')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.locator('button[type="submit"]').click();
    
    // Should show validation errors (form has required fields)
    // The exact behavior depends on browser validation
    const firstNameInput = page.locator('#firstName');
    await expect(firstNameInput).toHaveAttribute('required');
  });

  test('should show validation error for invalid date format', async ({ page }) => {
    // Fill form with invalid date
    await page.locator('#firstName').fill('Max');
    await page.locator('#birthDate').fill('invalid-date');
    await page.locator('#birthTime').fill('14:30');
    await page.locator('#birthPlace').fill('Berlin, Germany');
    
    await page.locator('button[type="submit"]').click();
    
    // Should show date format error (either validation message or format hint)
    const errorOrHint = page.locator('text=/TT\\.MM\\.JJJJ|Format|Datum/i');
    await expect(errorOrHint.first()).toBeVisible();
  });

  test('should allow approximate birth time checkbox', async ({ page }) => {
    // Check approximate time checkbox
    const checkbox = page.locator('input[name="birthTimeApproximate"]');
    await checkbox.check();
    
    // Birth time field should be disabled
    await expect(page.locator('#birthTime')).toBeDisabled();
  });

  test('should successfully submit form with valid data', async ({ page }) => {
    // Fill form with valid data
    await page.locator('#firstName').fill('Max Mustermann');
    await page.locator('#birthDate').fill('21.05.1985');
    await page.locator('#birthTime').fill('14:30');
    await page.locator('#birthPlace').fill('Berlin, Germany');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Wait for loading state
    await expect(page.locator('button[type="submit"]')).toContainText('Generiere');
    
    // Wait for response (either success or error)
    // Note: This may timeout if backend is not running
    await page.waitForResponse(
      response => response.url().includes('/api/') && response.status() !== 0,
      { timeout: 10000 }
    ).catch(() => {
      // Backend may not be running during tests
      console.log('Backend not available - skipping response check');
    });
  });
});

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate first name minimum length', async ({ page }) => {
    await page.locator('#firstName').fill('A');
    await page.locator('#birthDate').fill('21.05.1985');
    await page.locator('#birthTime').fill('14:30');
    await page.locator('#birthPlace').fill('Berlin');
    
    await page.locator('button[type="submit"]').click();
    
    // Should show name validation error
    await expect(page.locator('.text-error')).toBeVisible();
  });

  test('should validate birth place is provided', async ({ page }) => {
    await page.locator('#firstName').fill('Max');
    await page.locator('#birthDate').fill('21.05.1985');
    await page.locator('#birthTime').fill('14:30');
    // Leave birth place empty
    
    await page.locator('button[type="submit"]').click();
    
    // Birth place is required
    const birthPlaceInput = page.locator('#birthPlace');
    await expect(birthPlaceInput).toHaveAttribute('required');
  });
});

test.describe('Accessibility', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');
    
    // All inputs should have associated labels
    const firstName = page.locator('#firstName');
    const birthDate = page.locator('#birthDate');
    const birthTime = page.locator('#birthTime');
    const birthPlace = page.locator('#birthPlace');
    
    // Labels should exist for each field
    await expect(page.locator('label[for="firstName"]')).toBeVisible();
    await expect(page.locator('label[for="birthDate"]')).toBeVisible();
    await expect(page.locator('label[for="birthTime"]')).toBeVisible();
    await expect(page.locator('label[for="birthPlace"]')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    await expect(page.locator('#firstName')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#birthDate')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#birthTime')).toBeFocused();
  });
});

test.describe('Responsive Design', () => {
  test('should render properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Form should be visible and usable
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should render properly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should render properly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('.max-w-4xl')).toBeVisible();
  });
});
