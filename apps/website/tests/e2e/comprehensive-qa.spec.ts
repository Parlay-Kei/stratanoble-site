import { test, expect, Page, Browser } from '@playwright/test';

interface TestMetrics {
  loadTime: number;
  url: string;
  title: string;
  status: 'passed' | 'failed';
  issues: string[];
}

interface TestResults {
  status: 'completed' | 'partial' | 'failed';
  tests_passed: number;
  tests_failed: number;
  screenshots: Record<string, string>;
  issues_found: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'functionality' | 'security' | 'performance' | 'ui';
    description: string;
    location: string;
    reproduction_steps: string;
  }>;
  performance_metrics: {
    homepage_load_time: string;
    average_page_load_time: string;
    slowest_page: {
      url: string;
      load_time: string;
    };
  };
  pages_tested: TestMetrics[];
  forms_tested: number;
  interactive_elements_tested: number;
  security_checks_passed: number;
  recommendations: string[];
}

const testResults: TestResults = {
  status: 'completed',
  tests_passed: 0,
  tests_failed: 0,
  screenshots: {},
  issues_found: [],
  performance_metrics: {
    homepage_load_time: '0',
    average_page_load_time: '0',
    slowest_page: { url: '', load_time: '0' }
  },
  pages_tested: [],
  forms_tested: 0,
  interactive_elements_tested: 0,
  security_checks_passed: 0,
  recommendations: []
};

const keyPages = [
  { path: '/', name: 'Homepage' },
  { path: '/portfolio', name: 'Portfolio' },
  { path: '/methodology', name: 'Methodology' },
  { path: '/technology', name: 'Technology' },
  { path: '/services', name: 'Services' },
  { path: '/data-analysis', name: 'Data Analysis' },
  { path: '/about', name: 'About' },
  { path: '/case-studies', name: 'Case Studies' },
  { path: '/contact', name: 'Contact' }
];

async function measurePageLoad(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  return (Date.now() - startTime) / 1000;
}

async function checkSecurityHeaders(page: Page): Promise<number> {
  let securityScore = 0;
  const response = page.context().request;
  
  try {
    const headers = await page.evaluate(() => {
      return {
        csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || '',
        hsts: 'check-programmatically',
        xframe: 'check-programmatically'
      };
    });
    
    if (headers.csp) securityScore++;
    
    // Check for HTTPS
    if (page.url().startsWith('https://')) securityScore++;
    
    return securityScore;
  } catch (error) {
    console.log('Security header check failed:', error);
    return 0;
  }
}

async function testFormValidation(page: Page, formSelector: string): Promise<boolean> {
  try {
    const form = page.locator(formSelector);
    if (!(await form.isVisible())) return false;
    
    // Test required field validation
    const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Check if validation messages appear
      const validationMessages = await page.locator('[role="alert"], .error, .invalid, [aria-invalid="true"]').count();
      return validationMessages > 0;
    }
    
    return true;
  } catch (error) {
    console.log('Form validation test failed:', error);
    return false;
  }
}

async function captureScreenshot(page: Page, name: string): Promise<string> {
  const screenshot = await page.screenshot({ fullPage: true });
  return screenshot.toString('base64');
}

test.describe('Comprehensive QA Testing Suite', () => {
  test.beforeAll(async ({ browser }) => {
    console.log('Starting comprehensive QA testing...');
  });

  test.afterAll(async () => {
    // Calculate final metrics
    if (testResults.pages_tested.length > 0) {
      const totalLoadTime = testResults.pages_tested.reduce((sum, page) => sum + page.loadTime, 0);
      testResults.performance_metrics.average_page_load_time = (totalLoadTime / testResults.pages_tested.length).toFixed(2);
      
      const slowestPage = testResults.pages_tested.reduce((slowest, current) => 
        current.loadTime > slowest.loadTime ? current : slowest
      );
      testResults.performance_metrics.slowest_page = {
        url: slowestPage.url,
        load_time: slowestPage.loadTime.toString()
      };
    }
    
    console.log('=== COMPREHENSIVE QA TEST RESULTS ===');
    console.log(JSON.stringify(testResults, null, 2));
  });

  test('Homepage Load and Performance', async ({ page }) => {
    try {
      const loadTime = await measurePageLoad(page, '/');
      testResults.performance_metrics.homepage_load_time = loadTime.toString();
      
      // Check for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Verify page loads completely
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('nav, header')).toBeVisible();
      
      // Check for branding elements
      const hasLogo = await page.locator('img[alt*="logo"], svg[aria-label*="logo"], [class*="logo"]').count() > 0;
      if (!hasLogo) {
        testResults.issues_found.push({
          severity: 'medium',
          category: 'ui',
          description: 'Logo or branding element not found on homepage',
          location: 'Homepage header',
          reproduction_steps: 'Navigate to homepage and check header area'
        });
      }
      
      // Performance check
      if (loadTime > 2.5) {
        testResults.issues_found.push({
          severity: 'high',
          category: 'performance',
          description: `Homepage load time exceeds 2.5 seconds: ${loadTime}s`,
          location: 'Homepage',
          reproduction_steps: 'Navigate to homepage and measure load time'
        });
        testResults.tests_failed++;
      } else {
        testResults.tests_passed++;
      }
      
      testResults.pages_tested.push({
        loadTime,
        url: page.url(),
        title: await page.title(),
        status: loadTime > 2.5 ? 'failed' : 'passed',
        issues: errors
      });
      
      testResults.screenshots['homepage'] = await captureScreenshot(page, 'homepage');
      
    } catch (error) {
      testResults.tests_failed++;
      testResults.issues_found.push({
        severity: 'critical',
        category: 'functionality',
        description: `Homepage failed to load: ${error}`,
        location: 'Homepage',
        reproduction_steps: 'Navigate to /'
      });
    }
  });

  test('Navigation Testing', async ({ page }) => {
    await page.goto('/');
    let navigationPassed = 0;
    let navigationFailed = 0;
    
    for (const pageDef of keyPages) {
      try {
        const loadTime = await measurePageLoad(page, pageDef.path);
        
        // Verify page loads
        await expect(page.locator('body')).toBeVisible();
        
        const title = await page.title();
        const status = loadTime > 3 ? 'failed' : 'passed';
        
        testResults.pages_tested.push({
          loadTime,
          url: page.url(),
          title,
          status,
          issues: []
        });
        
        if (status === 'passed') {
          navigationPassed++;
        } else {
          navigationFailed++;
          testResults.issues_found.push({
            severity: 'medium',
            category: 'performance',
            description: `Page ${pageDef.name} loads slowly: ${loadTime}s`,
            location: pageDef.path,
            reproduction_steps: `Navigate to ${pageDef.path}`
          });
        }
        
        // Capture screenshot
        testResults.screenshots[pageDef.name.toLowerCase().replace(' ', '_')] = 
          await captureScreenshot(page, pageDef.name);
        
      } catch (error) {
        navigationFailed++;
        testResults.issues_found.push({
          severity: 'high',
          category: 'functionality',
          description: `Page ${pageDef.name} failed to load: ${error}`,
          location: pageDef.path,
          reproduction_steps: `Navigate to ${pageDef.path}`
        });
      }
    }
    
    testResults.tests_passed += navigationPassed;
    testResults.tests_failed += navigationFailed;
  });

  test('Form Functionality Testing', async ({ page }) => {
    let formsTestPassed = 0;
    let formsTestFailed = 0;
    
    for (const pageDef of keyPages) {
      await page.goto(pageDef.path);
      
      // Find all forms on the page
      const forms = await page.locator('form').all();
      
      for (let i = 0; i < forms.length; i++) {
        try {
          testResults.forms_tested++;
          
          // Test form validation
          const hasValidation = await testFormValidation(page, `form >> nth=${i}`);
          
          if (hasValidation) {
            formsTestPassed++;
          } else {
            formsTestFailed++;
            testResults.issues_found.push({
              severity: 'medium',
              category: 'functionality',
              description: `Form validation not working properly`,
              location: `${pageDef.path} - Form ${i + 1}`,
              reproduction_steps: `Go to ${pageDef.path}, find form ${i + 1}, and attempt to submit without filling required fields`
            });
          }
          
        } catch (error) {
          formsTestFailed++;
          testResults.issues_found.push({
            severity: 'high',
            category: 'functionality',
            description: `Form testing failed: ${error}`,
            location: `${pageDef.path} - Form ${i + 1}`,
            reproduction_steps: `Navigate to ${pageDef.path} and interact with form ${i + 1}`
          });
        }
      }
    }
    
    testResults.tests_passed += formsTestPassed;
    testResults.tests_failed += formsTestFailed;
  });

  test('Interactive Elements Testing', async ({ page }) => {
    let interactivePassed = 0;
    let interactiveFailed = 0;
    
    for (const pageDef of keyPages) {
      await page.goto(pageDef.path);
      
      try {
        // Test buttons
        const buttons = await page.locator('button:visible, [role="button"]:visible').all();
        for (const button of buttons) {
          testResults.interactive_elements_tested++;
          
          // Check if button is clickable
          const isEnabled = await button.isEnabled();
          if (isEnabled) {
            interactivePassed++;
          } else {
            interactiveFailed++;
          }
        }
        
        // Test links
        const links = await page.locator('a:visible').all();
        for (const link of links) {
          testResults.interactive_elements_tested++;
          
          const href = await link.getAttribute('href');
          if (href && href !== '#' && href !== 'javascript:void(0)') {
            interactivePassed++;
          } else {
            interactiveFailed++;
          }
        }
        
      } catch (error) {
        interactiveFailed++;
        testResults.issues_found.push({
          severity: 'medium',
          category: 'functionality',
          description: `Interactive elements test failed: ${error}`,
          location: pageDef.path,
          reproduction_steps: `Navigate to ${pageDef.path} and test interactive elements`
        });
      }
    }
    
    testResults.tests_passed += interactivePassed;
    testResults.tests_failed += interactiveFailed;
  });

  test('Security Headers Assessment', async ({ page }) => {
    await page.goto('/');
    
    try {
      const securityScore = await checkSecurityHeaders(page);
      testResults.security_checks_passed = securityScore;
      
      if (securityScore < 2) {
        testResults.issues_found.push({
          severity: 'high',
          category: 'security',
          description: 'Missing security headers (CSP, HSTS, etc.)',
          location: 'All pages',
          reproduction_steps: 'Check response headers for security configurations'
        });
        testResults.tests_failed++;
      } else {
        testResults.tests_passed++;
      }
      
    } catch (error) {
      testResults.tests_failed++;
      testResults.issues_found.push({
        severity: 'high',
        category: 'security',
        description: `Security assessment failed: ${error}`,
        location: 'All pages',
        reproduction_steps: 'Run security header analysis'
      });
    }
  });

  test('Mobile Responsiveness', async ({ page }) => {
    await page.goto('/');
    
    try {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForLoadState('networkidle');
      
      // Check if content is visible and properly sized
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        testResults.issues_found.push({
          severity: 'medium',
          category: 'ui',
          description: 'Horizontal scrolling detected on mobile viewport',
          location: 'Mobile view',
          reproduction_steps: 'Set viewport to 375x667 and check for horizontal overflow'
        });
        testResults.tests_failed++;
      } else {
        testResults.tests_passed++;
      }
      
      testResults.screenshots['mobile_homepage'] = await captureScreenshot(page, 'mobile_homepage');
      
    } catch (error) {
      testResults.tests_failed++;
      testResults.issues_found.push({
        severity: 'high',
        category: 'ui',
        description: `Mobile responsiveness test failed: ${error}`,
        location: 'Mobile viewport',
        reproduction_steps: 'Test with mobile viewport dimensions'
      });
    }
  });

  test('Error Handling', async ({ page }) => {
    try {
      // Test 404 page
      await page.goto('/non-existent-page');
      
      // Check if custom 404 page exists
      const pageContent = await page.textContent('body');
      const has404Content = pageContent?.includes('404') || 
                           pageContent?.includes('Not Found') || 
                           pageContent?.includes('Page not found');
      
      if (has404Content) {
        testResults.tests_passed++;
      } else {
        testResults.tests_failed++;
        testResults.issues_found.push({
          severity: 'medium',
          category: 'functionality',
          description: 'Custom 404 page not properly configured',
          location: '404 handler',
          reproduction_steps: 'Navigate to a non-existent URL'
        });
      }
      
      testResults.screenshots['404_page'] = await captureScreenshot(page, '404_page');
      
    } catch (error) {
      testResults.tests_failed++;
      testResults.issues_found.push({
        severity: 'medium',
        category: 'functionality',
        description: `Error handling test failed: ${error}`,
        location: 'Error pages',
        reproduction_steps: 'Navigate to non-existent URLs'
      });
    }
  });
});