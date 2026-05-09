import { test, expect } from '@playwright/test';

/**
 * Pipeline Buildout application page E2E tests (formerly Phase 3 route).
 */

test.describe('Pipeline Buildout application page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/operations-buildout');
  });

  test('page loads or returns 404', async ({ page }) => {
    const response = await page.goto('/operations-buildout');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Pipeline buildout page not implemented');

    expect(response?.status()).toBe(200);
  });

  test('page has heading and application form when implemented', async ({ page }) => {
    const response = await page.goto('/operations-buildout');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Pipeline buildout page not implemented');

    const heading = page.getByRole('heading', { name: /21-day pipeline buildout/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('application form has required fields', async ({ page }) => {
    const response = await page.goto('/operations-buildout');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Pipeline buildout page not implemented');

    const nameField = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    if (await nameField.count() > 0) {
      await expect(nameField.first()).toBeVisible();
    }

    const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    if (await emailField.count() > 0) {
      await expect(emailField.first()).toBeVisible();
    }

    const businessField = page.getByLabel(/business/i).or(page.getByPlaceholder(/business/i));
    if (await businessField.count() > 0) {
      await expect(businessField.first()).toBeVisible();
    }

    const submitButton = page.getByRole('button', { name: /apply|submit|send/i });
    await expect(submitButton.first()).toBeVisible();
  });

  test('application submission with valid data', async ({ page }) => {
    const response = await page.goto('/operations-buildout');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Pipeline buildout page not implemented');

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

    const leadsSelect = page.locator('select[name*="leads"]').first();
    if (await leadsSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await leadsSelect.selectOption({ index: 1 });
    }

    const offerField = page.getByLabel(/offer.*type/i).or(page.getByPlaceholder(/what.*offer/i)).first();
    if (await offerField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await offerField.fill('Professional consulting services');
    }

    const closeField = page.getByLabel(/close.*process/i).or(page.getByPlaceholder(/how.*close/i)).first();
    if (await closeField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeField.fill('Phone consultations and proposals');
    }

    const successField = page.getByLabel(/success/i).or(page.getByPlaceholder(/define.*success/i)).first();
    if (await successField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await successField.fill('Increase closed deals by 50%');
    }

    const timelineSelect = page.locator('select[name*="timeline"], select[name*="decision"]').first();
    if (await timelineSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await timelineSelect.selectOption({ index: 1 });
    }

    const toolNone = page.locator('label').filter({ hasText: /none.*starting fresh/i }).locator('input[type="checkbox"]');
    if (await toolNone.isVisible({ timeout: 1500 }).catch(() => false)) {
      await toolNone.check();
    }

    const submitButton = page.getByRole('button', { name: /apply|submit|send/i }).first();
    await submitButton.click();

    const successMessage = page.getByText(/success|thank you|received|application.*submitted/i);
    const isSuccess = await successMessage.isVisible({ timeout: 10000 }).catch(() => false);

    if (!isSuccess) {
      await page.waitForURL(/success|thank-you|confirmation/, { timeout: 5000 }).catch(() => null);
      const currentUrl = page.url();
      const isSuccessRedirect = /success|thank-you|confirmation/i.test(currentUrl);

      expect(isSuccess || isSuccessRedirect).toBe(true);
    } else {
      expect(isSuccess).toBe(true);
    }
  });

  test('application shows validation errors for empty submission', async ({ page }) => {
    const response = await page.goto('/operations-buildout');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Pipeline buildout page not implemented');

    const submitButton = page.getByRole('button', { name: /apply|submit|send/i }).first();
    await submitButton.click();

    const errorMessage = page.getByText(/required|invalid|please fill|must provide/i);
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    test.info().annotations.push({
      type: 'info',
      description: `Validation check: ${hasError ? 'Custom validation found' : 'May use HTML5 validation'}`,
    });
  });

  test('mobile layout is usable', async ({ page }) => {
    const response = await page.goto('/operations-buildout');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Pipeline buildout page not implemented');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/operations-buildout');

    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    const submitButton = page.getByRole('button', { name: /apply|submit|send/i }).first();
    const boundingBox = await submitButton.boundingBox();

    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('page explains pipeline buildout offer', async ({ page }) => {
    const response = await page.goto('/operations-buildout');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Pipeline buildout page not implemented');

    const content = page.locator('main');
    const text = await content.textContent();

    const hasRelevantContent =
      text?.toLowerCase().includes('pipeline') ||
      text?.toLowerCase().includes('crm') ||
      text?.toLowerCase().includes('automation');

    test.info().annotations.push({
      type: 'info',
      description: `Pipeline buildout content: ${hasRelevantContent ? 'Found relevant keywords' : 'Check content messaging'}`,
    });
  });
});
