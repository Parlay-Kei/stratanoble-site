const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// QA Audit Configuration
const BASE_URL = 'http://localhost:3000';
const EXPECTED_ACHIEVERY_URL = 'https://app.achievery.com';
const BROWSERS = ['chromium', 'firefox', 'webkit'];

// Test Results Storage
const results = {
  status: 'running',
  timestamp: new Date().toISOString(),
  tests_passed: 0,
  tests_failed: 0,
  screenshots: {},
  issues_found: [],
  performance_metrics: {
    homepage_load_time: 0,
    average_page_load_time: 0,
    slowest_page: { url: '', load_time: 0 }
  },
  pages_tested: [],
  forms_tested: 0,
  interactive_elements_tested: 0,
  security_checks_passed: 0,
  recommendations: []
};

// Utility Functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const measureLoadTime = async (page, url) => {
  const startTime = Date.now();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = (Date.now() - startTime) / 1000;
    return { success: true, loadTime, url };
  } catch (error) {
    const loadTime = (Date.now() - startTime) / 1000;
    return { success: false, loadTime, url, error: error.message };
  }
};

const captureScreenshot = async (page, name) => {
  try {
    const screenshotPath = path.join(__dirname, 'test-results', `${name}-screenshot.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  } catch (error) {
    console.error(`Failed to capture screenshot for ${name}:`, error);
    return null;
  }
};

const logIssue = (severity, category, description, location, reproductionSteps = '') => {
  results.issues_found.push({
    severity,
    category,
    description,
    location,
    reproduction_steps: reproductionSteps
  });
  results.tests_failed++;
};

const logSuccess = () => {
  results.tests_passed++;
};

// Main Testing Functions
const testHomepage = async (browser, page) => {
  console.log(`\n=== TESTING HOMEPAGE (${browser.constructor.name}) ===`);

  const loadResult = await measureLoadTime(page, BASE_URL);
  results.performance_metrics.homepage_load_time = loadResult.loadTime;

  if (!loadResult.success) {
    logIssue('critical', 'functionality', `Homepage failed to load: ${loadResult.error}`, BASE_URL);
    return false;
  }

  // Capture homepage screenshot
  await captureScreenshot(page, 'homepage');

  // Check for critical elements
  try {
    // Test logo presence
    const logo = await page.locator('img[alt*="StrataNoble"], svg[data-testid="logo"]').first();
    if (await logo.count() === 0) {
      logIssue('high', 'ui', 'Logo not found on homepage', BASE_URL);
    } else {
      logSuccess();
    }

    // Test navigation elements
    const navigation = await page.locator('nav, [role="navigation"]').first();
    if (await navigation.count() === 0) {
      logIssue('high', 'functionality', 'Main navigation not found', BASE_URL);
    } else {
      logSuccess();
    }

    // Test hero section
    const heroSection = await page.locator('h1').first();
    if (await heroSection.count() === 0) {
      logIssue('medium', 'ui', 'Hero section H1 not found', BASE_URL);
    } else {
      logSuccess();
    }

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await delay(2000); // Wait for any async errors

    if (consoleErrors.length > 0) {
      logIssue('medium', 'functionality', `Console errors on homepage: ${consoleErrors.join(', ')}`, BASE_URL);
    } else {
      logSuccess();
    }

  } catch (error) {
    logIssue('high', 'functionality', `Homepage testing error: ${error.message}`, BASE_URL);
  }

  results.pages_tested.push({
    url: BASE_URL,
    title: await page.title(),
    status: loadResult.success ? 'passed' : 'failed',
    load_time: loadResult.loadTime
  });

  return loadResult.success;
};

const testAchieveryPreview = async (browser, page) => {
  console.log(`\n=== TESTING ACHIEVERY PREVIEW PAGE (${browser.constructor.name}) ===`);

  const previewUrl = `${BASE_URL}/achievery-preview`;
  const loadResult = await measureLoadTime(page, previewUrl);

  if (!loadResult.success) {
    logIssue('critical', 'functionality', `ACHIEVERY preview page failed to load: ${loadResult.error}`, previewUrl);
    return false;
  }

  await captureScreenshot(page, 'achievery-preview');

  try {
    // Test Preview Platform buttons
    const previewButtons = await page.locator('a[href*="app.achievery.com"], button:has-text("Preview Platform")');
    const buttonCount = await previewButtons.count();

    if (buttonCount === 0) {
      logIssue('critical', 'functionality', 'No Preview Platform buttons found on preview page', previewUrl);
    } else {
      logSuccess();

      // Verify button URLs
      for (let i = 0; i < buttonCount; i++) {
        const button = previewButtons.nth(i);
        const href = await button.getAttribute('href');

        if (href && href.includes('app.achievery.com')) {
          logSuccess();
          console.log(`✓ Preview Platform button ${i + 1} correctly links to: ${href}`);
        } else {
          logIssue('critical', 'functionality', `Preview Platform button ${i + 1} has incorrect URL: ${href}`, previewUrl, 'Click Preview Platform button');
        }
      }
    }

    // Test visual mockups presence
    const mockupImages = await page.locator('img[src*="mockup"], img[src*="dashboard"], img[src*="preview"]');
    const mockupCount = await mockupImages.count();

    if (mockupCount === 0) {
      logIssue('medium', 'ui', 'No mockup images found on preview page', previewUrl);
    } else {
      logSuccess();
      console.log(`✓ Found ${mockupCount} mockup images on preview page`);
    }

    // Test page-specific content
    const previewContent = await page.locator('h1, h2').first();
    if (await previewContent.count() === 0) {
      logIssue('medium', 'ui', 'No main heading found on preview page', previewUrl);
    } else {
      logSuccess();
    }

  } catch (error) {
    logIssue('high', 'functionality', `ACHIEVERY preview testing error: ${error.message}`, previewUrl);
  }

  results.pages_tested.push({
    url: previewUrl,
    title: await page.title(),
    status: loadResult.success ? 'passed' : 'failed',
    load_time: loadResult.loadTime
  });

  return loadResult.success;
};

const testNavigation = async (browser, page) => {
  console.log(`\n=== TESTING SITE NAVIGATION (${browser.constructor.name}) ===`);

  await page.goto(BASE_URL);

  // Discover navigation links
  const navLinks = await page.locator('nav a, header a, [role="navigation"] a').all();
  const internalLinks = [];

  for (const link of navLinks) {
    const href = await link.getAttribute('href');
    if (href && (href.startsWith('/') || href.startsWith(BASE_URL))) {
      const text = await link.textContent();
      internalLinks.push({ href, text: text?.trim() || 'No text' });
    }
  }

  console.log(`Found ${internalLinks.length} internal navigation links`);

  // Test each navigation link
  for (const link of internalLinks.slice(0, 10)) { // Limit to first 10 links
    const fullUrl = link.href.startsWith('/') ? `${BASE_URL}${link.href}` : link.href;

    try {
      const loadResult = await measureLoadTime(page, fullUrl);

      if (loadResult.success) {
        logSuccess();
        console.log(`✓ ${link.text}: ${fullUrl} (${loadResult.loadTime}s)`);

        results.pages_tested.push({
          url: fullUrl,
          title: await page.title(),
          status: 'passed',
          load_time: loadResult.loadTime
        });
      } else {
        logIssue('high', 'functionality', `Navigation link failed to load: ${link.text}`, fullUrl, `Click navigation link: ${link.text}`);
      }
    } catch (error) {
      logIssue('high', 'functionality', `Navigation testing error for ${link.text}: ${error.message}`, fullUrl);
    }
  }
};

const testForms = async (browser, page) => {
  console.log(`\n=== TESTING FORMS (${browser.constructor.name}) ===`);

  const formPages = [
    { url: `${BASE_URL}/contact`, name: 'Contact Form' },
    { url: `${BASE_URL}/discovery`, name: 'Discovery Form' },
    { url: `${BASE_URL}/achievery-early-access`, name: 'Early Access Form' }
  ];

  for (const formPage of formPages) {
    try {
      const loadResult = await measureLoadTime(page, formPage.url);

      if (!loadResult.success) {
        logIssue('high', 'functionality', `${formPage.name} page failed to load`, formPage.url);
        continue;
      }

      await captureScreenshot(page, `form-${formPage.name.toLowerCase().replace(/\s+/g, '-')}`);

      // Find forms on the page
      const forms = await page.locator('form').all();

      if (forms.length === 0) {
        logIssue('high', 'functionality', `No forms found on ${formPage.name} page`, formPage.url);
        continue;
      }

      logSuccess();
      results.forms_tested++;

      // Test first form found
      const form = forms[0];

      // Find input fields
      const inputs = await form.locator('input, textarea, select').all();

      for (const input of inputs) {
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const required = await input.getAttribute('required');

        try {
          // Fill with appropriate test data
          if (type === 'email' || name?.includes('email')) {
            await input.fill('test@stratanoble.com');
          } else if (type === 'tel' || name?.includes('phone')) {
            await input.fill('555-123-4567');
          } else if (type === 'text' || type === null) {
            await input.fill('Test Data');
          } else if (input.tagName().toLowerCase() === 'textarea') {
            await input.fill('This is a test message for QA purposes.');
          }

          logSuccess();
          results.interactive_elements_tested++;
        } catch (error) {
          logIssue('medium', 'functionality', `Failed to fill form field: ${name}`, formPage.url, `Fill form field: ${name}`);
        }
      }

      // Test form submission (but don't actually submit to avoid spam)
      const submitButton = await form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        // Just test that the button is clickable
        const isEnabled = await submitButton.isEnabled();
        if (isEnabled) {
          logSuccess();
          console.log(`✓ Submit button found and enabled on ${formPage.name}`);
        } else {
          logIssue('medium', 'functionality', `Submit button disabled on ${formPage.name}`, formPage.url);
        }
      } else {
        logIssue('medium', 'functionality', `No submit button found on ${formPage.name}`, formPage.url);
      }

    } catch (error) {
      logIssue('high', 'functionality', `Form testing error on ${formPage.name}: ${error.message}`, formPage.url);
    }
  }
};

const testMobileResponsiveness = async (browser, page) => {
  console.log(`\n=== TESTING MOBILE RESPONSIVENESS (${browser.constructor.name}) ===`);

  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    try {
      await page.goto(BASE_URL);
      await delay(1000); // Wait for responsive adjustments

      await captureScreenshot(page, `responsive-${viewport.name.toLowerCase().replace(' ', '-')}`);

      // Test that navigation is still accessible
      const navigation = await page.locator('nav, [role="navigation"], button[aria-label*="menu"]').first();
      if (await navigation.count() > 0) {
        logSuccess();
        console.log(`✓ Navigation accessible on ${viewport.name} (${viewport.width}x${viewport.height})`);
      } else {
        logIssue('medium', 'ui', `Navigation not found on ${viewport.name} viewport`, BASE_URL);
      }

      // Test that main content is visible
      const mainContent = await page.locator('main, [role="main"], h1').first();
      if (await mainContent.count() > 0) {
        logSuccess();
      } else {
        logIssue('medium', 'ui', `Main content not found on ${viewport.name} viewport`, BASE_URL);
      }

    } catch (error) {
      logIssue('medium', 'ui', `Mobile responsiveness test failed for ${viewport.name}: ${error.message}`, BASE_URL);
    }
  }

  // Reset to desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
};

const testSecurity = async (browser, page) => {
  console.log(`\n=== TESTING SECURITY (${browser.constructor.name}) ===`);

  try {
    // Test HTTPS headers (even on localhost, check security headers are set)
    const response = await page.goto(BASE_URL);
    const headers = response.headers();

    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy'
    ];

    for (const header of securityHeaders) {
      if (headers[header]) {
        logSuccess();
        results.security_checks_passed++;
        console.log(`✓ Security header found: ${header}: ${headers[header]}`);
      } else {
        logIssue('medium', 'security', `Missing security header: ${header}`, BASE_URL);
      }
    }

    // Test for mixed content warnings
    const mixedContentWarnings = [];
    page.on('console', msg => {
      if (msg.text().includes('Mixed Content') || msg.text().includes('insecure content')) {
        mixedContentWarnings.push(msg.text());
      }
    });

    await delay(2000);

    if (mixedContentWarnings.length === 0) {
      logSuccess();
      results.security_checks_passed++;
    } else {
      logIssue('medium', 'security', `Mixed content warnings: ${mixedContentWarnings.join(', ')}`, BASE_URL);
    }

  } catch (error) {
    logIssue('medium', 'security', `Security testing error: ${error.message}`, BASE_URL);
  }
};

// Main Test Runner
const runQAAudit = async () => {
  console.log('🚀 Starting Production QA Audit for StrataNoble Platform');
  console.log('============================================================');

  // Ensure test results directory exists
  await fs.mkdir(path.join(__dirname, 'test-results'), { recursive: true });

  const allLoadTimes = [];

  for (const browserName of BROWSERS) {
    console.log(`\n📱 Testing with ${browserName}...`);

    let browser;
    try {
      if (browserName === 'chromium') {
        browser = await chromium.launch({ headless: true });
      } else if (browserName === 'firefox') {
        browser = await firefox.launch({ headless: true });
      } else if (browserName === 'webkit') {
        browser = await webkit.launch({ headless: true });
      }

      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QA-Audit-Bot/1.0'
      });

      const page = await context.newPage();

      // Run all tests
      await testHomepage(browser, page);
      await testAchieveryPreview(browser, page);
      await testNavigation(browser, page);
      await testForms(browser, page);
      await testMobileResponsiveness(browser, page);
      await testSecurity(browser, page);

      await context.close();
      await browser.close();

    } catch (error) {
      console.error(`Browser ${browserName} testing failed:`, error);
      logIssue('critical', 'functionality', `Browser ${browserName} testing completely failed: ${error.message}`, BASE_URL);
    }
  }

  // Calculate performance metrics
  const loadTimes = results.pages_tested.map(p => p.load_time);
  if (loadTimes.length > 0) {
    results.performance_metrics.average_page_load_time = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;

    const slowestPage = results.pages_tested.reduce((prev, current) =>
      prev.load_time > current.load_time ? prev : current
    );
    results.performance_metrics.slowest_page = {
      url: slowestPage.url,
      load_time: slowestPage.load_time
    };
  }

  // Add recommendations
  if (results.performance_metrics.homepage_load_time > 3) {
    results.recommendations.push('Homepage load time exceeds 3 seconds - consider optimization');
  }

  if (results.issues_found.filter(i => i.severity === 'critical').length > 0) {
    results.recommendations.push('Critical issues found - address before production deployment');
  }

  if (results.forms_tested === 0) {
    results.recommendations.push('No forms were successfully tested - verify form functionality');
  }

  // Determine overall status
  const criticalIssues = results.issues_found.filter(i => i.severity === 'critical').length;
  const highIssues = results.issues_found.filter(i => i.severity === 'high').length;

  if (criticalIssues > 0) {
    results.status = 'failed';
    results.recommendations.push('CRITICAL: Platform not ready for production - critical issues must be resolved');
  } else if (highIssues > 3) {
    results.status = 'partial';
    results.recommendations.push('Multiple high-severity issues found - recommend fixing before production');
  } else {
    results.status = 'completed';
    results.recommendations.push('Platform appears ready for production deployment');
  }

  // Save results
  const reportPath = path.join(__dirname, 'production-qa-audit-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));

  console.log('\n📊 QA AUDIT COMPLETE');
  console.log('=====================');
  console.log(`Status: ${results.status.toUpperCase()}`);
  console.log(`Tests Passed: ${results.tests_passed}`);
  console.log(`Tests Failed: ${results.tests_failed}`);
  console.log(`Critical Issues: ${criticalIssues}`);
  console.log(`High Issues: ${highIssues}`);
  console.log(`Pages Tested: ${results.pages_tested.length}`);
  console.log(`Forms Tested: ${results.forms_tested}`);
  console.log(`Homepage Load Time: ${results.performance_metrics.homepage_load_time.toFixed(2)}s`);
  console.log(`Report saved to: ${reportPath}`);

  return results;
};

// Run the audit
if (require.main === module) {
  runQAAudit().catch(console.error);
}

module.exports = { runQAAudit };