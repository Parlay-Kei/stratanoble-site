const { chromium } = require('playwright');

const runManualVerification = async () => {
  console.log('🔍 Manual Verification Test - Production Readiness Check\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const results = {
    tests: [],
    passed: 0,
    failed: 0,
    critical_issues: [],
    recommendations: []
  };

  const test = async (name, testFn) => {
    console.log(`Testing: ${name}`);
    try {
      const result = await testFn();
      if (result.success) {
        results.passed++;
        console.log(`✅ PASS: ${result.message}`);
      } else {
        results.failed++;
        console.log(`❌ FAIL: ${result.message}`);
        if (result.critical) {
          results.critical_issues.push(`${name}: ${result.message}`);
        }
      }
      results.tests.push({ name, success: result.success, message: result.message });
    } catch (error) {
      results.failed++;
      console.log(`❌ ERROR: ${name} - ${error.message}`);
      results.tests.push({ name, success: false, message: error.message });
    }
  };

  // Test 1: Homepage loads and displays correctly
  await test('Homepage Basic Load', async () => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const loadTime = (Date.now() - startTime) / 1000;

    const title = await page.title();
    const h1Count = await page.locator('h1').count();

    if (loadTime > 5) {
      return { success: false, message: `Homepage load time too slow: ${loadTime.toFixed(2)}s`, critical: true };
    }

    if (!title || title.includes('404') || title.includes('Error')) {
      return { success: false, message: `Invalid page title: ${title}`, critical: true };
    }

    if (h1Count === 0) {
      return { success: false, message: 'No H1 heading found on homepage' };
    }

    return { success: true, message: `Homepage loads in ${loadTime.toFixed(2)}s with title: ${title}` };
  });

  // Test 2: Logo presence and loading
  await test('Logo Display', async () => {
    const logos = await page.locator('img[alt*="Logo"], img[alt*="StrataNoble"], img[alt*="Strata Noble"]').count();

    if (logos === 0) {
      return { success: false, message: 'No logo found on homepage' };
    }

    // Check if logo actually loads (not broken)
    const logoSrc = await page.locator('img[alt*="Logo"], img[alt*="StrataNoble"], img[alt*="Strata Noble"]').first().getAttribute('src');
    const logoLoaded = await page.locator('img[alt*="Logo"], img[alt*="StrataNoble"], img[alt*="Strata Noble"]').first().evaluate(img => img.complete && img.naturalHeight !== 0);

    if (!logoLoaded) {
      return { success: false, message: `Logo image failed to load: ${logoSrc}` };
    }

    return { success: true, message: `Logo found and loaded successfully: ${logoSrc}` };
  });

  // Test 3: ACHIEVERY Preview Page
  await test('ACHIEVERY Preview Page', async () => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/achievery-preview', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const loadTime = (Date.now() - startTime) / 1000;

    const title = await page.title();
    if (title.includes('404') || title.includes('Error')) {
      return { success: false, message: `ACHIEVERY preview page not found: ${title}`, critical: true };
    }

    // Check for preview buttons
    const previewButtons = await page.locator('a[href*="app.achievery.com"]').count();
    if (previewButtons === 0) {
      return { success: false, message: 'No Preview Platform buttons found', critical: true };
    }

    return { success: true, message: `Preview page loads in ${loadTime.toFixed(2)}s with ${previewButtons} platform buttons` };
  });

  // Test 4: Preview Platform Button URLs
  await test('Preview Platform Button URLs', async () => {
    await page.goto('http://localhost:3000/achievery-preview');

    const buttons = await page.locator('a[href*="app.achievery.com"]').all();
    let correctUrls = 0;
    let totalButtons = buttons.length;

    for (let i = 0; i < buttons.length; i++) {
      const href = await buttons[i].getAttribute('href');
      if (href && href.includes('https://app.achievery.com')) {
        correctUrls++;
      }
    }

    if (correctUrls !== totalButtons) {
      return { success: false, message: `${totalButtons - correctUrls} buttons have incorrect URLs`, critical: true };
    }

    return { success: true, message: `All ${totalButtons} Preview Platform buttons link correctly to https://app.achievery.com` };
  });

  // Test 5: Navigation Links
  await test('Main Navigation', async () => {
    await page.goto('http://localhost:3000');

    const navLinks = await page.locator('nav a, header a').all();
    let workingLinks = 0;
    let totalLinks = navLinks.length;

    if (totalLinks === 0) {
      return { success: false, message: 'No navigation links found' };
    }

    // Test first 5 navigation links
    for (let i = 0; i < Math.min(5, totalLinks); i++) {
      const href = await navLinks[i].getAttribute('href');
      if (href && href.startsWith('/')) {
        try {
          const response = await page.request.get(`http://localhost:3000${href}`);
          if (response.status() === 200) {
            workingLinks++;
          }
        } catch (error) {
          // Link test failed
        }
      }
    }

    const testedLinks = Math.min(5, totalLinks);
    if (workingLinks === 0) {
      return { success: false, message: 'No working navigation links found', critical: true };
    }

    return { success: true, message: `${workingLinks}/${testedLinks} navigation links working correctly` };
  });

  // Test 6: Contact Form Basic Function
  await test('Contact Form Presence', async () => {
    await page.goto('http://localhost:3000/contact', { timeout: 10000 });

    const forms = await page.locator('form').count();
    if (forms === 0) {
      return { success: false, message: 'No forms found on contact page', critical: true };
    }

    const inputs = await page.locator('form input, form textarea, form select').count();
    if (inputs === 0) {
      return { success: false, message: 'Contact form has no input fields', critical: true };
    }

    return { success: true, message: `Contact page has ${forms} form(s) with ${inputs} input fields` };
  });

  // Test 7: Early Access Form
  await test('Early Access Form', async () => {
    await page.goto('http://localhost:3000/achievery-early-access', { timeout: 10000 });

    const forms = await page.locator('form').count();
    if (forms === 0) {
      return { success: false, message: 'No early access form found', critical: true };
    }

    const emailInputs = await page.locator('form input[type="email"], form input[name*="email"]').count();
    if (emailInputs === 0) {
      return { success: false, message: 'Early access form missing email input' };
    }

    return { success: true, message: `Early access form found with ${forms} form(s) and email input` };
  });

  // Test 8: Mobile Responsiveness Check
  await test('Mobile Responsiveness', async () => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:3000');

    const navigation = await page.locator('nav, [role="navigation"], button[aria-label*="menu"]').count();
    if (navigation === 0) {
      return { success: false, message: 'Navigation not accessible on mobile viewport' };
    }

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    return { success: true, message: 'Navigation accessible on mobile viewport' };
  });

  // Test 9: Console Error Check
  await test('Console Errors', async () => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000); // Wait for any async errors

    if (errors.length > 0) {
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('AdBlocker') &&
        !e.includes('extension')
      );

      if (criticalErrors.length > 0) {
        return { success: false, message: `${criticalErrors.length} console errors: ${criticalErrors[0]}` };
      }
    }

    return { success: true, message: errors.length > 0 ? `${errors.length} non-critical errors` : 'No console errors' };
  });

  // Take final screenshot
  await page.screenshot({ path: 'test-results/manual-verification-final.png', fullPage: true });

  await context.close();
  await browser.close();

  // Generate Summary
  console.log('\n' + '='.repeat(60));
  console.log('PRODUCTION READINESS ASSESSMENT');
  console.log('='.repeat(60));
  console.log(`Tests Passed: ${results.passed}`);
  console.log(`Tests Failed: ${results.failed}`);
  console.log(`Critical Issues: ${results.critical_issues.length}`);

  if (results.critical_issues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    results.critical_issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
  }

  // Production Readiness Determination
  let readinessStatus = 'READY';
  if (results.critical_issues.length > 0) {
    readinessStatus = 'NOT READY - CRITICAL ISSUES';
    results.recommendations.push('Resolve all critical issues before production deployment');
  } else if (results.failed > results.passed / 2) {
    readinessStatus = 'NEEDS ATTENTION - MULTIPLE ISSUES';
    results.recommendations.push('Fix failed tests before production deployment');
  } else if (results.failed > 0) {
    readinessStatus = 'READY WITH MINOR ISSUES';
    results.recommendations.push('Consider fixing minor issues for optimal user experience');
  } else {
    readinessStatus = 'FULLY READY';
    results.recommendations.push('Platform ready for production deployment');
  }

  console.log(`\n🎯 PRODUCTION STATUS: ${readinessStatus}`);

  if (results.recommendations.length > 0) {
    console.log('\n📝 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  console.log('\n📸 Final screenshot saved: test-results/manual-verification-final.png');

  return {
    status: readinessStatus.includes('READY') && !readinessStatus.includes('NOT') ? 'ready' : 'needs_work',
    tests_passed: results.passed,
    tests_failed: results.failed,
    critical_issues: results.critical_issues,
    recommendations: results.recommendations
  };
};

if (require.main === module) {
  runManualVerification().catch(console.error);
}

module.exports = { runManualVerification };