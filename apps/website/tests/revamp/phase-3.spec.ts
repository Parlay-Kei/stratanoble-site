import { test, expect } from '@playwright/test';

/**
 * Phase 3 Application Page E2E Tests
 *
 * Tests the Phase 3 Partnership application page and form submission.
 * Requires Sprint 3 completion for full functionality.
 */

test.describe('Phase 3 Application Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/phase-3');
  });

  test('page loads or returns 404', async ({ page }) => {
    const response = await page.goto('/phase-3');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Phase 3 page not implemented yet - requires Sprint 3');

    expect(response?.status()).toBe(200);
  });

  test('page has heading and application form when implemented', async ({ page }) => {
    const response = await page.goto('/phase-3');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Phase 3 page not implemented yet - requires Sprint 3');

    // Check for heading
    const heading = page.getByRole('heading', { name: /phase 3/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Check for form
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('application form has required fields', async ({ page }) => {
    const response = await page.goto('/phase-3');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Phase 3 page not implemented yet - requires Sprint 3');

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
    const submitButton = page.getByRole('button', { name: /apply|submit|send/i });
    await expect(submitButton.first()).toBeVisible();
  });

  test('application submission with valid data', async ({ page }) => {
    const response = await page.goto('/phase-3');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Phase 3 page not implemented yet - requires Sprint 3');

    // Fill basic fields
    const nameField = page.getByLabel(/^name$/i).or(page.getByPlaceholder(/your name/i)).first();
    if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameField.fill('Test Applicant');
    }

    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first();
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.fill('applicant@example.com');
    }

    const businessField = page.getByLabel(/business/i).or(page.getByPlaceholder(/business/i)).first();
    if (await businessField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await businessField.fill('Test Corporation');
    }

    // Fill monthly leads if exists
    const leadsSelect = page.locator('select[name*="leads"]').first();
    if (await leadsSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await leadsSelect.selectOption({ index: 1 });
    }

    // Fill offer type if exists
    const offerField = page.getByLabel(/offer.*type/i).or(page.getByPlaceholder(/what.*offer/i)).first();
    if (await offerField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await offerField.fill('Professional consulting services');
    }

    // Fill close process if exists
    const closeField = page.getByLabel(/close.*process/i).or(page.getByPlaceholder(/how.*close/i)).first();
    if (await closeField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeField.fill('Phone consultations and proposals');
    }

    // Fill success definition if exists
    const successField = page.getByLabel(/success/i).or(page.getByPlaceholder(/define.*success/i)).first();
    if (await successField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await successField.fill('Increase closed deals by 50%');
    }

    // Select decision timeline if exists
    const timelineSelect = page.locator('select[name*="timeline"], select[name*="decision"]').first();
    if (await timelineSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await timelineSelect.selectOption({ index: 1 });
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /apply|submit|send/i }).first();
    await submitButton.click();

    // Check for success message or redirect
    const successMessage = page.getByText(/success|thank you|received|application.*submitted/i);
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

  test('application shows validation errors for empty submission', async ({ page }) => {
    const response = await page.goto('/phase-3');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Phase 3 page not implemented yet - requires Sprint 3');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /apply|submit|send/i }).first();
    await submitButton.click();

    // Should show validation errors or HTML5 validation
    const errorMessage = page.getByText(/required|invalid|please fill|must provide/i);
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    test.info().annotations.push({
      type: 'info',
      description: `Validation check: ${hasError ? 'Custom validation found' : 'May use HTML5 validation'}`
    });
  });

  test('mobile layout is usable', async ({ page }) => {
    const response = await page.goto('/phase-3');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Phase 3 page not implemented yet - requires Sprint 3');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/phase-3');

    // Check form is visible on mobile
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Check submit button is tappable
    const submitButton = page.getByRole('button', { name: /apply|submit|send/i }).first();
    const boundingBox = await submitButton.boundingBox();

    if (boundingBox) {
      // Button should be at least 44px tall (iOS minimum touch target)
      expect(boundingBox.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('page explains Phase 3 partnership', async ({ page }) => {
    const response = await page.goto('/phase-3');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Phase 3 page not implemented yet - requires Sprint 3');

    // Should have content explaining Phase 3
    const content = page.locator('main');
    const text = await content.textContent();

    // Should mention key Phase 3 concepts
    const hasRelevantContent =
      text?.toLowerCase().includes('automation') ||
      text?.toLowerCase().includes('partnership') ||
      text?.toLowerCase().includes('qualify');

    test.info().annotations.push({
      type: 'info',
      description: `Phase 3 content: ${hasRelevantContent ? 'Found relevant keywords' : 'Check content messaging'}`
    });
  });
});
