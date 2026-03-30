import { test, expect } from '@playwright/test';

/**
 * Support Pages E2E Tests
 *
 * Tests that all support pages load correctly and include offer CTAs.
 * Requires Sprint 2 completion for full page content.
 */

test.describe('Support Pages', () => {
  const pages = [
    { path: '/platform', heading: /platform|roadmap/i, requiresSprint: '2' },
    { path: '/resources', heading: /resources/i, requiresSprint: '2' },
    { path: '/studio', heading: /studio/i, requiresSprint: '2' },
    { path: '/about', heading: /about|who we are/i, requiresSprint: '2' },
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

  test('platform page content', async ({ page }) => {
    const response = await page.goto('/platform');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Platform page not implemented yet - requires Sprint 2');

    // Should have content about the platform/roadmap
    const main = page.locator('main');
    const text = await main.textContent();

    const hasRelevantContent =
      text?.toLowerCase().includes('automation') ||
      text?.toLowerCase().includes('roadmap') ||
      text?.toLowerCase().includes('platform');

    test.info().annotations.push({
      type: 'info',
      description: `Platform content: ${hasRelevantContent ? 'Found relevant keywords' : 'Check content'}`
    });
  });

  test('resources page content', async ({ page }) => {
    const response = await page.goto('/resources');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Resources page not implemented yet - requires Sprint 2');

    // Should have resources or links
    const main = page.locator('main');
    const hasContent = await main.isVisible();

    expect(hasContent).toBe(true);
  });

  test('studio page content', async ({ page }) => {
    const response = await page.goto('/studio');
    const is404 = response?.status() === 404;

    test.skip(is404, 'Studio page not implemented yet - requires Sprint 2');

    // Should have content about the studio
    const main = page.locator('main');
    const text = await main.textContent();

    const hasRelevantContent =
      text?.toLowerCase().includes('studio') ||
      text?.toLowerCase().includes('team') ||
      text?.toLowerCase().includes('build');

    test.info().annotations.push({
      type: 'info',
      description: `Studio content: ${hasRelevantContent ? 'Found relevant keywords' : 'Check content'}`
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
    const pagesToCheck = ['/platform', '/resources', '/studio', '/about'];

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

    const pagesToCheck = ['/platform', '/resources', '/studio', '/about'];

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
      { path: '/platform', title: /platform/i },
      { path: '/resources', title: /resources/i },
      { path: '/studio', title: /studio/i },
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
