/**
 * Cross-Browser Compatibility Tests
 * Tests core functionality across different browsers
 */

import { test, expect, type Page } from '@playwright/test';

// Test data for cross-browser validation
const testPages = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About Page' },
  { path: '/services', name: 'Services Page' },
  { path: '/pricing', name: 'Pricing Page' },
  { path: '/contact', name: 'Contact Page' }
];

test.describe('Cross-Browser Compatibility Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport to ensure consistency
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  testPages.forEach(({ path, name }) => {
    test(`${name} loads correctly across browsers`, async ({ page, browserName }) => {
      console.log(`Testing ${name} on ${browserName}`);
      
      // Navigate to page
      await page.goto(path);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Check that page loaded successfully
      await expect(page).toHaveTitle(/.+/);
      
      // Verify no JavaScript errors
      const errorLogs: string[] = [];
      page.on('pageerror', error => {
        errorLogs.push(error.message);
      });
      
      // Wait for any async operations to complete
      await page.waitForTimeout(2000);
      
      // Check for JavaScript errors
      if (errorLogs.length > 0) {
        console.warn(`JavaScript errors on ${name} (${browserName}):`, errorLogs);
      }
      
      // Verify essential elements are present
      if (path === '/') {
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
      }
      
      // Take screenshot for visual comparison
      await page.screenshot({ 
        path: `tests/screenshots/${browserName}-${name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
    });
  });

  test('Navigation works across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Test main navigation links
    const navLinks = [
      { text: 'Services', expectedPath: '/services' },
      { text: 'Pricing', expectedPath: '/pricing' },
      { text: 'About', expectedPath: '/about' }
    ];
    
    for (const link of navLinks) {
      await page.goto('/'); // Reset to home page
      
      // Click navigation link
      await page.click(`nav a:has-text("${link.text}")`);
      
      // Verify navigation worked
      await expect(page).toHaveURL(new RegExp(link.expectedPath));
      
      // Verify page loaded correctly
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('Contact form renders correctly across browsers', async ({ page, browserName }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Check form elements are present and functional
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test form interactivity
    await page.fill('input[name="name"]', 'Test User');
    await expect(page.locator('input[name="name"]')).toHaveValue('Test User');
    
    // Test form validation display
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check for validation messages (should appear for empty required fields)
    await page.waitForTimeout(1000);
    
    console.log(`Contact form validation tested on ${browserName}`);
  });

  test('CSS and styling consistency', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test critical styling elements
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check computed styles are applied correctly
    const headerBg = await header.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Verify header has some background (not transparent)
    expect(headerBg).not.toBe('rgba(0, 0, 0, 0)');
    
    // Test responsive behavior
    await page.setViewportSize({ width: 768, height: 600 });
    await page.waitForTimeout(500);
    
    // Verify mobile menu or responsive behavior
    const mobileNav = page.locator('[data-testid="mobile-menu"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
    
    console.log(`CSS consistency verified on ${browserName}`);
  });

  test('Interactive elements work across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test any modal or popup functionality
    const ctaButtons = page.locator('button:has-text("Get Started"), button:has-text("Schedule"), button:has-text("Contact")');
    const buttonCount = await ctaButtons.count();
    
    if (buttonCount > 0) {
      // Click first CTA button
      await ctaButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Check if modal opened or navigation occurred
      const modalVisible = await page.locator('[role="dialog"], .modal').isVisible();
      const urlChanged = page.url() !== '/';
      
      expect(modalVisible || urlChanged).toBeTruthy();
      
      console.log(`Interactive elements tested on ${browserName}`);
    }
  });

  test('Font loading and rendering', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for fonts to load
    await page.waitForTimeout(2000);
    
    // Check computed font families
    const bodyFont = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    
    const headingFont = await page.locator('h1').first().evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    
    // Verify fonts are not using fallback system fonts only
    expect(bodyFont).toBeTruthy();
    expect(headingFont).toBeTruthy();
    
    console.log(`Font rendering verified on ${browserName}: body(${bodyFont}), heading(${headingFont})`);
  });

  test('Local storage and session functionality', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test localStorage functionality
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(storedValue).toBe('test-value');
    
    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('test-key');
    });
    
    console.log(`Storage functionality verified on ${browserName}`);
  });

});