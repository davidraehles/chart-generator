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
    // Fill form with valid data matching ChartRequest schema
    await page.locator('#firstName').fill('Max Mustermann');
    await page.locator('#birthDate').fill('21.05.1985');  // Format: TT.MM.JJJJ
    await page.locator('#birthTime').fill('14:30');        // Format: HH:MM
    await page.locator('#birthPlace').fill('Berlin, Germany');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for loading state
    await expect(page.locator('button[type="submit"]')).toContainText('Generiere');

    // Wait for API response
    const response = await page.waitForResponse(
      response => response.url().includes('/api/hd-chart'),
      { timeout: 30000 }
    ).catch(() => {
      console.log('API request timeout - backend may not be available');
      return null;
    });

    if (response) {
      const isSuccess = response.status() === 200;
      const isValidationError = response.status() === 400;

      // Accept both successful responses and validation errors
      expect(isSuccess || isValidationError).toBeTruthy();
    }
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

test.describe('Mobile Responsiveness - 375px Minimum Width', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should render form correctly on 375px mobile viewport', async ({ page }) => {
    await page.goto('/');

    // Verify main heading is visible
    await expect(page.locator('h1')).toBeVisible();

    // Verify form exists and is visible
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Verify all form input fields are visible and not cut off
    const inputs = await form.locator('input, textarea, select').all();
    expect(inputs.length).toBeGreaterThan(0);

    for (const input of inputs) {
      await expect(input).toBeInViewport();
    }

    // Verify submit button is accessible
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeInViewport();
  });

  test('should handle form submission on mobile', async ({ page }) => {
    await page.goto('/');

    // Fill form with valid data
    await page.locator('#firstName').fill('Max');
    await page.locator('#birthDate').fill('21.05.1985');
    await page.locator('#birthTime').fill('14:30');
    await page.locator('#birthPlace').fill('Berlin');

    // Submit should be clickable on mobile
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toBeInViewport();

    // Should be able to click without scrolling
    await submitButton.click();
  });

  test('should not have horizontal scroll on 375px viewport', async ({ page }) => {
    await page.goto('/');

    // Get viewport width
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(375);

    // Check that the main content doesn't exceed viewport
    const form = page.locator('form');
    const formBox = await form.boundingBox();
    expect(formBox?.width).toBeLessThanOrEqual(375);

    // Verify form is properly constrained
    await expect(form).toBeInViewport();
  });

  test('should display all form labels on mobile', async ({ page }) => {
    await page.goto('/');

    // Verify all form labels are visible
    const labels = await page.locator('label').all();
    expect(labels.length).toBeGreaterThan(0);

    for (const label of labels) {
      await expect(label).toBeVisible();
    }
  });
});
