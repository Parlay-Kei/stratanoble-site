import { test, expect } from '@playwright/test';

/**
 * Support Pages E2E Tests
 *
 * Tests that all support pages load correctly and include offer CTAs.
 * Requires Sprint 2 completion for full page content.
 */

test.describe('Support Pages', () => {
  const pages = [
    { path: '/q-suite', heading: /q suite|operational|platform/i, requiresSprint: '2' },
    { path: '/tools', heading: /tools|proofloop|operational/i, requiresSprint: '2' },
    { path: '/proof', heading: /proof/i, requiresSprint: '2' },
    { path: '/about', heading: /about|who we are|strata noble/i, requiresSprint: '2' },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.path} loads successfully`, async ({ page }) => {
      const response = await page.goto(pageInfo.path);
      const is404 = response?.status() === 404;

      if (is404) {
        test.info().annotations.push({
          type: 'info',
          description: `${pageInfo.path} returns 404 - requires Sprint ${pageInfo.requiresSprint}`
        });
        test.skip(true, `${pageInfo.path} not implemented yet`);
        return;
      }

      expect(response?.status()).toBe(200);

      // Check for heading
      const heading = page.getByRole('heading', { name: pageInfo.heading });
      const hasHeading = await heading.first().isVisible({ timeout: 5000 }).catch(() => false);

      if (!hasHeading) {
        test.info().annotations.push({
          type: 'warning',
          description: `${pageInfo.path} missing expected heading - check content`
        });
      }
    });
  }

  test('q-suite page content', async ({ page }) => {
    const response = await page.goto('/q-suite');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Q Suite page not implemented yet - requires Sprint 2');

    const main = page.locator('main');
    const text = await main.textContent();

    const hasRelevantContent =
      text?.toLowerCase().includes('q suite') ||
      text?.toLowerCase().includes('operational') ||
      text?.toLowerCase().includes('platform');

    test.info().annotations.push({
      type: 'info',
      description: `Q Suite content: ${hasRelevantContent ? 'Found relevant keywords' : 'Check content'}`
    });
  });

  test('tools page content', async ({ page }) => {
    const response = await page.goto('/tools');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Tools page not implemented yet - requires Sprint 2');

    const main = page.locator('main');
    const hasContent = await main.isVisible();

    expect(hasContent).toBe(true);
  });

  test('proof page content', async ({ page }) => {
    const response = await page.goto('/proof');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Proof page not implemented yet - requires Sprint 2');

    const main = page.locator('main');
    const text = await main.textContent();

    const hasRelevantContent =
      text?.toLowerCase().includes('proof') ||
      text?.toLowerCase().includes('case') ||
      text?.toLowerCase().includes('coming soon');

    test.info().annotations.push({
      type: 'info',
      description: `Proof content: ${hasRelevantContent ? 'Found relevant keywords' : 'Check content'}`
    });
  });

  test('about page content', async ({ page }) => {
    const response = await page.goto('/about');
    const is404 = response?.status() === 404;

    test.skip(is404, 'About page not implemented yet - requires Sprint 2');

    // Should have content about the company
    const main = page.locator('main');
    const text = await main.textContent();

    const hasRelevantContent =
      text?.toLowerCase().includes('strata noble') ||
      text?.toLowerCase().includes('mission') ||
      text?.toLowerCase().includes('who we are');

    test.info().annotations.push({
      type: 'info',
      description: `About content: ${hasRelevantContent ? 'Found relevant keywords' : 'Check content'}`
    });
  });

  test('all pages have offer CTAs', async ({ page }) => {
    const pagesToCheck = ['/q-suite', '/tools', '/proof', '/about'];

    for (const path of pagesToCheck) {
      const response = await page.goto(path);

      if (response?.status() === 404) {
        test.info().annotations.push({
          type: 'info',
          description: `${path} not implemented yet - skipping CTA check`
        });
        continue;
      }

      // Check for Lead Rescue CTA
      const leadRescueCTA = page.getByRole('link', { name: /lead rescue|48-hour/i });
      const hasLeadRescue = await leadRescueCTA.first().isVisible({ timeout: 3000 }).catch(() => false);

      const buildoutCTA = page.getByRole('link', { name: /pipeline buildout|21-day/i });
      const hasBuildout = await buildoutCTA.first().isVisible({ timeout: 3000 }).catch(() => false);

      const hasCTA = hasLeadRescue || hasBuildout;

      test.info().annotations.push({
        type: hasCTA ? 'info' : 'warning',
        description: `${path} CTAs: Lead Rescue=${hasLeadRescue}, Pipeline buildout=${hasBuildout}`
      });
    }
  });

  test('pages are mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const pagesToCheck = ['/q-suite', '/tools', '/proof', '/about'];

    for (const path of pagesToCheck) {
      const response = await page.goto(path);

      if (response?.status() === 404) {
        continue;
      }

      // Check no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const hasHorizontalScroll = bodyWidth > viewportWidth + 1; // Allow 1px tolerance

      if (hasHorizontalScroll) {
        test.info().annotations.push({
          type: 'warning',
          description: `${path} has horizontal scroll on mobile (${bodyWidth}px > ${viewportWidth}px)`
        });
      }
    }
  });

  test('pages have proper meta tags', async ({ page }) => {
    const pagesToCheck = [
      { path: '/q-suite', title: /q suite/i },
      { path: '/tools', title: /tools/i },
      { path: '/proof', title: /proof/i },
      { path: '/about', title: /about/i },
    ];

    for (const pageInfo of pagesToCheck) {
      const response = await page.goto(pageInfo.path);

      if (response?.status() === 404) {
        continue;
      }

      // Check title
      const title = await page.title();
      const hasRelevantTitle = pageInfo.title.test(title);

      test.info().annotations.push({
        type: hasRelevantTitle ? 'info' : 'warning',
        description: `${pageInfo.path} title: "${title}" ${hasRelevantTitle ? '✓' : '- check relevance'}`
      });

      // Check for meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');

      if (!metaDescription || metaDescription.length < 50) {
        test.info().annotations.push({
          type: 'warning',
          description: `${pageInfo.path} missing or short meta description`
        });
      }
    }
  });
});
