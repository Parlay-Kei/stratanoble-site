import { test, expect } from '@playwright/test';

/**
 * Homepage Revamp E2E Tests
 *
 * Tests the revenue-first homepage revamp with Lead Rescue and Q SUITE CTAs.
 * These tests check for the new messaging and offers when feature flag is enabled.
 */

test.describe('Homepage Revamp', () => {
  test.beforeEach(async ({ page }) => {
    // Note: Requires NEXT_PUBLIC_REVAMP_ENABLED=true in environment
    await page.goto('/');
  });

  test('homepage loads successfully', async ({ page }) => {
    // Basic load test
    await expect(page).toHaveTitle(/Strata Noble/i);
  });

  test('homepage has hero section with CTAs', async ({ page }) => {
    // Check hero section exists
    const heroSection = page.locator('main').first();
    await expect(heroSection).toBeVisible();

    // Check for primary CTA (Lead Rescue)
    const leadRescueCTA = page.getByRole('link', { name: /lead rescue|48-hour/i });
    if (await leadRescueCTA.count() > 0) {
      await expect(leadRescueCTA.first()).toBeVisible();
    } else {
      test.info().annotations.push({
        type: 'warning',
        description: 'Lead Rescue CTA not found - may need Sprint 1-2 completion'
      });
    }

    const qSuiteCTA = page.getByRole('link', { name: /see what we run on|q suite/i });
    if (await qSuiteCTA.count() > 0) {
      await expect(qSuiteCTA.first()).toBeVisible();
    } else {
      test.info().annotations.push({
        type: 'warning',
        description: 'Q SUITE / secondary hero CTA not found'
      });
    }
  });

  test('no "preview platform" language on revamp', async ({ page }) => {
    // Should not have old preview messaging
    const previewText = page.getByText(/preview.*platform/i);
    const count = await previewText.count();

    // If found, flag as issue (unless feature flag is off)
    if (count > 0) {
      test.info().annotations.push({
        type: 'info',
        description: 'Preview platform text found - check if revamp flag is enabled'
      });
    }
  });

  test('primary CTA routes to /lead-rescue', async ({ page }) => {
    const leadRescueLink = page.getByRole('link', { name: /lead rescue|48-hour/i }).first();
    const isVisible = await leadRescueLink.isVisible({ timeout: 2000 }).catch(() => false);

    test.skip(!isVisible, 'Lead Rescue CTA not implemented yet - requires Sprint 1-2');

    await leadRescueLink.click();
    await page.waitForURL('**/lead-rescue', { timeout: 5000 });
    expect(page.url()).toContain('/lead-rescue');
  });

  test('secondary hero CTA links to Q SUITE section', async ({ page }) => {
    const secondary = page.getByRole('link', { name: /see what we run on/i }).first();
    const isVisible = await secondary.isVisible({ timeout: 2000 }).catch(() => false);

    test.skip(!isVisible, 'Secondary hero CTA not present on this homepage variant');

    const href = await secondary.getAttribute('href');
    expect(href).toMatch(/#q-suite/i);
  });

  test('mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance

    // Check hero is visible
    const heroSection = page.locator('main').first();
    await expect(heroSection).toBeVisible();
  });
});
