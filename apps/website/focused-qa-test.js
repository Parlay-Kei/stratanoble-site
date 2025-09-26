const { chromium } = require('playwright');
const fs = require('fs').promises;

// Focused QA test to investigate critical issues
const runFocusedTest = async () => {
  console.log('🔍 Running Focused QA Investigation...\n');

  const browser = await chromium.launch({ headless: false, devtools: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Monitor console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Monitor network failures
  const networkFailures = [];
  page.on('response', response => {
    if (!response.ok()) {
      networkFailures.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    // Test 1: Homepage Logo Investigation
    console.log('1. Investigating Homepage Logo...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Look for various logo selectors
    const logoSelectors = [
      'img[alt*="StrataNoble"], img[alt*="Strata Noble"]',
      'img[alt*="logo"], img[alt*="Logo"]',
      'svg[data-testid="logo"]',
      '[class*="logo"] img',
      '[class*="Logo"] img',
      'header img',
      'nav img'
    ];

    let logoFound = false;
    for (const selector of logoSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`✓ Logo found with selector: ${selector} (${elements} elements)`);
        logoFound = true;

        // Get logo details
        const logoElement = page.locator(selector).first();
        const src = await logoElement.getAttribute('src');
        const alt = await logoElement.getAttribute('alt');
        console.log(`  Source: ${src}`);
        console.log(`  Alt text: ${alt}`);
        break;
      }
    }

    if (!logoFound) {
      console.log('❌ No logo found with standard selectors');

      // Look for any images in header/nav
      const headerImages = await page.locator('header img, nav img').count();
      console.log(`Header images found: ${headerImages}`);

      if (headerImages > 0) {
        for (let i = 0; i < headerImages; i++) {
          const img = page.locator('header img, nav img').nth(i);
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          console.log(`  Image ${i + 1}: ${src} (alt: ${alt})`);
        }
      }
    }

    // Test 2: Preview Platform Button Investigation
    console.log('\n2. Investigating Preview Platform Buttons...');
    await page.goto('http://localhost:3000/achievery-preview', { waitUntil: 'networkidle' });

    const previewButtons = await page.locator('a[href*="app.achievery.com"]').count();
    console.log(`Preview Platform buttons found: ${previewButtons}`);

    for (let i = 0; i < previewButtons; i++) {
      const button = page.locator('a[href*="app.achievery.com"]').nth(i);
      const href = await button.getAttribute('href');
      const text = await button.textContent();
      console.log(`  Button ${i + 1}: "${text.trim()}" -> ${href}`);
    }

    // Test 3: Form Investigation
    console.log('\n3. Investigating Form Issues...');

    const formPages = [
      { url: 'http://localhost:3000/contact', name: 'Contact Form' },
      { url: 'http://localhost:3000/achievery-early-access', name: 'Early Access Form' }
    ];

    for (const formPage of formPages) {
      console.log(`\nTesting ${formPage.name}:`);
      await page.goto(formPage.url, { waitUntil: 'networkidle' });

      const forms = await page.locator('form').count();
      console.log(`  Forms found: ${forms}`);

      if (forms > 0) {
        const form = page.locator('form').first();
        const inputs = await form.locator('input, textarea, select').count();
        console.log(`  Form inputs found: ${inputs}`);

        // Check each input
        for (let i = 0; i < inputs; i++) {
          const input = form.locator('input, textarea, select').nth(i);
          const type = await input.getAttribute('type');
          const name = await input.getAttribute('name');
          const placeholder = await input.getAttribute('placeholder');
          const required = await input.isRequired();

          console.log(`    Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}", required=${required}`);

          // Special handling for problematic fields
          if (name === 'topic' || name === 'role') {
            const tagName = await input.evaluate(el => el.tagName.toLowerCase());
            console.log(`      Tag: ${tagName}`);

            if (tagName === 'select') {
              const options = await input.locator('option').count();
              console.log(`      Select options: ${options}`);

              if (options > 1) {
                await input.selectOption({ index: 1 });
                console.log(`      ✓ Selected option 1`);
              }
            }
          }
        }

        // Check submit button
        const submitBtn = await form.locator('button[type="submit"], input[type="submit"]').count();
        console.log(`  Submit buttons found: ${submitBtn}`);

        if (submitBtn > 0) {
          const button = form.locator('button[type="submit"], input[type="submit"]').first();
          const isEnabled = await button.isEnabled();
          const text = await button.textContent();
          console.log(`    Submit button: "${text?.trim()}" (enabled: ${isEnabled})`);
        }
      }
    }

    // Test 4: Performance Investigation
    console.log('\n4. Investigating Performance...');

    const startTime = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'load' });
    const loadTime = (Date.now() - startTime) / 1000;
    console.log(`Homepage load time (to 'load' event): ${loadTime.toFixed(2)}s`);

    const startTimeNetworkIdle = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const networkIdleTime = (Date.now() - startTimeNetworkIdle) / 1000;
    console.log(`Homepage load time (to network idle): ${networkIdleTime.toFixed(2)}s`);

    // Check for slow resources
    console.log('\nChecking for slow loading resources...');
    const navigation = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation')[0]);
    });
    const navTiming = JSON.parse(navigation);
    console.log(`DOM Content Loaded: ${navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart}ms`);
    console.log(`Load Event: ${navTiming.loadEventEnd - navTiming.loadEventStart}ms`);

    // Test 5: Console Errors Summary
    console.log('\n5. Console Messages Summary:');
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');

    console.log(`Errors: ${errors.length}`);
    errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error.text}`);
    });

    console.log(`Warnings: ${warnings.length}`);
    warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning.text}`);
    });

    // Test 6: Network Failures
    console.log('\n6. Network Failures:');
    console.log(`Failed requests: ${networkFailures.length}`);
    networkFailures.forEach((failure, i) => {
      console.log(`  ${i + 1}. ${failure.status} ${failure.statusText}: ${failure.url}`);
    });

    // Take screenshot for verification
    await page.screenshot({
      path: 'test-results/focused-qa-homepage.png',
      fullPage: true
    });
    console.log('\n📸 Screenshot saved: test-results/focused-qa-homepage.png');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('\n✅ Focused QA Investigation Complete');
};

// Run if called directly
if (require.main === module) {
  runFocusedTest().catch(console.error);
}