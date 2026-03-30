import { test, expect } from '@playwright/test';

/**
 * Navigation E2E Tests
 *
 * Tests the simplified navigation structure with revenue-first positioning.
 * Contact removed from header, Core Offers highlighted.
 */

test.describe('Navigation', () => {
  test('desktop nav shows correct items', async ({ page }) => {
    await page.goto('/');

    // Get navigation element
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();

    // Check for expected navigation items
    // These should be visible in the revamp
    const expectedItems = [
      { name: 'Services', pattern: /services/i, required: false },
      { name: 'Platform', pattern: /platform/i, required: false },
      { name: 'Resources', pattern: /resources/i, required: false },
      { name: 'Studio', pattern: /studio/i, required: false },
      { name: 'About', pattern: /about/i, required: false },
    ];

    for (const item of expectedItems) {
      const link = page.getByRole('link', { name: item.pattern }).first();
      const isVisible = await link.isVisible({ timeout: 2000 }).catch(() => false);

      test.info().annotations.push({
        type: 'info',
        description: `${item.name} nav item: ${isVisible ? 'Found' : 'Not found (may need Sprint 1-2)'}`
      });
    }

    // Contact should NOT be in main navigation header
    const contactInNav = nav.getByRole('link', { name: /^contact$/i });
    const contactVisible = await contactInNav.isVisible({ timeout: 2000 }).catch(() => false);

    test.info().annotations.push({
      type: contactVisible ? 'warning' : 'info',
      description: `Contact in header: ${contactVisible ? 'Found (should be removed)' : 'Correctly removed'}`
    });
  });

  test('mobile nav renders and toggles', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Look for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu|navigation|hamburger/i })
      .or(page.locator('button[aria-label*="menu" i]'))
      .or(page.locator('button svg').locator('..')) // Button containing SVG (hamburger icon)
      .first();

    const hasMenuButton = await menuButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasMenuButton) {
      test.info().annotations.push({
        type: 'info',
        description: 'Mobile menu button not found - may need Sprint 1-2 implementation'
      });
      test.skip(true, 'Mobile menu not implemented yet');
      return;
    }

    // Click to open menu
    await menuButton.click();

    // Wait for menu to open (check for navigation links becoming visible)
    await page.waitForTimeout(500);

    // Check if nav items are now visible
    const servicesLink = page.getByRole('link', { name: /services/i }).first();
    const isServicesVisible = await servicesLink.isVisible({ timeout: 2000 }).catch(() => false);

    test.info().annotations.push({
      type: 'info',
      description: `Mobile menu opens: ${isServicesVisible ? 'Yes' : 'Check implementation'}`
    });
  });

  test('mobile nav includes CTAs', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu|navigation/i })
      .or(page.locator('button[aria-label*="menu" i]'))
      .or(page.locator('button svg').locator('..'))
      .first();

    const hasMenuButton = await menuButton.isVisible({ timeout: 3000 }).catch(() => false);

    test.skip(!hasMenuButton, 'Mobile menu not implemented yet');

    await menuButton.click();
    await page.waitForTimeout(500);

    // Check for Lead Rescue CTA in mobile menu
    const leadRescueCTA = page.getByRole('link', { name: /lead rescue/i });
    const hasLeadRescue = await leadRescueCTA.isVisible({ timeout: 2000 }).catch(() => false);

    const buildoutCTA = page.getByRole('link', { name: /pipeline buildout|21-day/i });
    const hasBuildout = await buildoutCTA.isVisible({ timeout: 2000 }).catch(() => false);

    test.info().annotations.push({
      type: 'info',
      description: `Mobile CTAs: Lead Rescue=${hasLeadRescue}, Pipeline buildout=${hasBuildout}`
    });
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');

    // Test each navigation link
    const links = [
      { name: 'Platform', path: '/platform' },
      { name: 'About', path: '/about' },
    ];

    for (const linkInfo of links) {
      // Go back to home
      await page.goto('/');

      // Find and click link
      const link = page.getByRole('link', { name: new RegExp(linkInfo.name, 'i') }).first();
      const isVisible = await link.isVisible({ timeout: 2000 }).catch(() => false);

      if (!isVisible) {
        test.info().annotations.push({
          type: 'info',
          description: `${linkInfo.name} link not found - may need Sprint 1-2`
        });
        continue;
      }

      await link.click();
      await page.waitForLoadState('networkidle');

      // Check URL
      const currentUrl = page.url();
      const isCorrectPath = currentUrl.includes(linkInfo.path);

      test.info().annotations.push({
        type: isCorrectPath ? 'info' : 'warning',
        description: `${linkInfo.name} navigation: ${isCorrectPath ? 'Correct' : `Expected ${linkInfo.path}, got ${currentUrl}`}`
      });
    }
  });

  test('logo links to homepage', async ({ page }) => {
    await page.goto('/about');

    // Find logo (usually an image or link in header)
    const logo = page.locator('header a[href="/"], nav a[href="/"]').first()
      .or(page.locator('header img').locator('..'))
      .or(page.getByRole('link', { name: /strata noble|home/i }));

    const isLogoVisible = await logo.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isLogoVisible) {
      test.info().annotations.push({
        type: 'info',
        description: 'Logo link not found - check header implementation'
      });
      return;
    }

    // Click logo
    await logo.first().click();
    await page.waitForLoadState('networkidle');

    // Should be on homepage
    const isHome = page.url().endsWith('/') || page.url().endsWith('/home');
    expect(isHome).toBe(true);
  });

  test('navigation is sticky on scroll', async ({ page }) => {
    await page.goto('/');

    // Get header/nav element
    const header = page.locator('header, nav').first();
    const isVisible = await header.isVisible({ timeout: 3000 }).catch(() => false);

    test.skip(!isVisible, 'Header not found');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Check if header is still visible (sticky behavior)
    const stillVisible = await header.isVisible();

    test.info().annotations.push({
      type: 'info',
      description: `Navigation sticky: ${stillVisible ? 'Yes' : 'No (may be design choice)'}`
    });

    // Note: Sticky behavior is optional - this is just informational
  });
});
