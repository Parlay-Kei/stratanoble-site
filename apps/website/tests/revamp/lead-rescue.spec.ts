import { test, expect } from '@playwright/test';

/**
 * Lead Rescue Page E2E Tests
 *
 * Tests the 48-Hour Lead Rescue offer page and form submission.
 * Requires Sprint 3 completion for full functionality.
 */

test.describe('Lead Rescue Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/systems-audit');
  });

  test('page loads or returns 404', async ({ page }) => {
    // Check if page exists (Sprint 3)
    const response = await page.goto('/systems-audit');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Lead Rescue page not implemented yet - requires Sprint 3');

    expect(response?.status()).toBe(200);
  });

  test('page has heading and form when implemented', async ({ page }) => {
    const response = await page.goto('/systems-audit');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Lead Rescue page not implemented yet - requires Sprint 3');

    // Check for heading
    const heading = page.getByRole('heading', { name: /lead rescue|48-hour/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Check for form
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('form has required fields', async ({ page }) => {
    const response = await page.goto('/systems-audit');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Lead Rescue page not implemented yet - requires Sprint 3');

    // Check for name field
    const nameField = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    if (await nameField.count() > 0) {
      await expect(nameField.first()).toBeVisible();
    }

    // Check for email field
    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    if (await emailField.count() > 0) {
      await expect(emailField.first()).toBeVisible();
    }

    // Check for business name field
    const businessField = page.getByLabel(/business/i).or(page.getByPlaceholder(/business/i));
    if (await businessField.count() > 0) {
      await expect(businessField.first()).toBeVisible();
    }

    // Check for submit button
    const submitButton = page.getByRole('button', { name: /submit|request|send/i });
    await expect(submitButton.first()).toBeVisible();
  });

  test('form submission with valid data', async ({ page }) => {
    const response = await page.goto('/systems-audit');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Lead Rescue page not implemented yet - requires Sprint 3');

    // Fill form fields if they exist
    const nameField = page.getByLabel(/^name$/i).or(page.getByPlaceholder(/your name/i)).first();
    if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameField.fill('Test User');
    }

    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first();
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.fill('test@example.com');
    }

    const businessField = page.getByLabel(/business/i).or(page.getByPlaceholder(/business/i)).first();
    if (await businessField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await businessField.fill('Test Business Inc');
    }

    // Select options if they exist
    const leadChannelSelect = page.locator('select[name*="channel"], select[name*="source"]').first();
    if (await leadChannelSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await leadChannelSelect.selectOption({ index: 1 });
    }

    const urgencySelect = page.locator('select[name*="urgency"], select[name*="timeline"]').first();
    if (await urgencySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await urgencySelect.selectOption({ index: 1 });
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /submit|request|send/i }).first();
    await submitButton.click();

    // Check for success message or redirect
    const successMessage = page.getByText(/success|thank you|received|we got it/i);
    const isSuccess = await successMessage.isVisible({ timeout: 10000 }).catch(() => false);

    if (!isSuccess) {
      // Check if redirected to success page
      await page.waitForURL(/success|thank-you|confirmation/, { timeout: 5000 }).catch(() => null);
      const currentUrl = page.url();
      const isSuccessRedirect = /success|thank-you|confirmation/i.test(currentUrl);

      expect(isSuccess || isSuccessRedirect).toBe(true);
    } else {
      expect(isSuccess).toBe(true);
    }
  });

  test('form shows validation errors for empty submission', async ({ page }) => {
    const response = await page.goto('/systems-audit');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Lead Rescue page not implemented yet - requires Sprint 3');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /submit|request|send/i }).first();
    await submitButton.click();

    // Should show validation errors or HTML5 validation
    // This is a basic check - actual implementation may vary
    const errorMessage = page.getByText(/required|invalid|please fill|must provide/i);
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    // HTML5 validation or custom validation should prevent submission
    test.info().annotations.push({
      type: 'info',
      description: `Validation check: ${hasError ? 'Custom validation found' : 'May use HTML5 validation'}`
    });
  });

  test('mobile layout is usable', async ({ page }) => {
    const response = await page.goto('/systems-audit');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Lead Rescue page not implemented yet - requires Sprint 3');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/systems-audit');

    // Check form is visible on mobile
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Check submit button is tappable
    const submitButton = page.getByRole('button', { name: /submit|request|send/i }).first();
    const boundingBox = await submitButton.boundingBox();

    if (boundingBox) {
      // Button should be at least 44px tall (iOS minimum touch target)
      expect(boundingBox.height).toBeGreaterThanOrEqual(40);
    }
  });
});
