import { test, expect, Page } from '@playwright/test';

interface UXDiagnosticResults {
  status: 'completed' | 'partial' | 'failed';
  tests_passed: number;
  tests_failed: number;
  screenshots: Record<string, string>;
  issues_found: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'functionality' | 'security' | 'performance' | 'ui' | 'ux';
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
  pages_tested: Array<{
    url: string;
    title: string;
    status: 'passed' | 'failed';
    load_time: number;
    ux_score: number;
  }>;
  forms_tested: number;
  interactive_elements_tested: number;
  security_checks_passed: number;
  mobile_responsiveness_score: number;
  accessibility_score: number;
  ux_assessment: {
    navigation_consistency: number;
    information_architecture: number;
    visual_design: number;
    conversion_funnel: number;
    overall_ux_score: number;
  };
  recommendations: string[];
}

const results: UXDiagnosticResults = {
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
  mobile_responsiveness_score: 0,
  accessibility_score: 0,
  ux_assessment: {
    navigation_consistency: 0,
    information_architecture: 0,
    visual_design: 0,
    conversion_funnel: 0,
    overall_ux_score: 0
  },
  recommendations: []
};

const keyPages = [
  { path: '/', name: 'Homepage', priority: 'critical' },
  { path: '/services', name: 'Services', priority: 'high' },
  { path: '/portfolio', name: 'Portfolio', priority: 'high' },
  { path: '/about', name: 'About', priority: 'medium' },
  { path: '/contact', name: 'Contact', priority: 'critical' },
  { path: '/case-studies', name: 'Case Studies', priority: 'medium' },
  { path: '/methodology', name: 'Methodology', priority: 'medium' },
  { path: '/technology', name: 'Technology', priority: 'medium' },
  { path: '/data-analysis', name: 'Data Analysis', priority: 'medium' }
];

async function measurePageLoad(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  try {
    await page.goto(`http://localhost:8080${url}`, { waitUntil: 'networkidle', timeout: 30000 });
    return (Date.now() - startTime) / 1000;
  } catch (error) {
    console.log(`Failed to load ${url}: ${error}`);
    return -1;
  }
}

async function evaluatePageUX(page: Page): Promise<number> {
  let uxScore = 100;
  
  try {
    // Check for essential UX elements
    const hasNavigation = await page.locator('nav, [role="navigation"]').count() > 0;
    if (!hasNavigation) uxScore -= 15;
    
    const hasLogo = await page.locator('[alt*="logo"], [class*="logo"], img[src*="logo"]').count() > 0;
    if (!hasLogo) uxScore -= 10;
    
    const hasFooter = await page.locator('footer').count() > 0;
    if (!hasFooter) uxScore -= 5;
    
    // Check for professional design elements
    const hasHeadings = await page.locator('h1, h2, h3').count() > 0;
    if (!hasHeadings) uxScore -= 10;
    
    // Check for clear CTAs
    const hasButtons = await page.locator('button, [role="button"], .btn').count() > 0;
    if (!hasButtons) uxScore -= 5;
    
    // Check for responsive indicators
    const hasViewportMeta = await page.locator('meta[name="viewport"]').count() > 0;
    if (!hasViewportMeta) uxScore -= 10;
    
    return Math.max(0, uxScore);
  } catch (error) {
    return 50; // Default score if evaluation fails
  }
}

async function captureScreenshot(page: Page, name: string): Promise<string> {
  try {
    const screenshot = await page.screenshot({ fullPage: true });
    return screenshot.toString('base64');
  } catch (error) {
    return '';
  }
}

async function testFormFunctionality(page: Page): Promise<number> {
  let formsFound = 0;
  try {
    const forms = await page.locator('form').all();
    formsFound = forms.length;
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const submitButton = form.locator('button[type="submit"], input[type="submit"]');
      
      if (await submitButton.count() > 0) {
        // Test basic form interaction
        await submitButton.first().click();
        
        // Check for validation messages
        const validationExists = await page.locator('[role="alert"], .error, .invalid, [aria-invalid="true"]').count() > 0;
        if (!validationExists) {
          results.issues_found.push({
            severity: 'medium',
            category: 'ux',
            description: 'Form lacks proper validation feedback',
            location: page.url(),
            reproduction_steps: 'Submit empty form and check for validation messages'
          });
        }
      }
    }
  } catch (error) {
    console.log('Form testing error:', error);
  }
  
  return formsFound;
}

async function testInteractiveElements(page: Page): Promise<number> {
  let elementsCount = 0;
  try {
    const buttons = await page.locator('button, [role="button"]').count();
    const links = await page.locator('a[href]').count();
    elementsCount = buttons + links;
    
    // Test a few key interactive elements
    const menuToggle = page.locator('[aria-label*="menu"], .menu-toggle, .hamburger');
    if (await menuToggle.count() > 0) {
      await menuToggle.first().click();
      // Check if menu appears
      const menuVisible = await page.locator('.menu, [role="menu"]').isVisible();
      if (!menuVisible) {
        results.issues_found.push({
          severity: 'medium',
          category: 'ux',
          description: 'Mobile menu toggle not working properly',
          location: page.url(),
          reproduction_steps: 'Click mobile menu toggle and verify menu appears'
        });
      }
    }
  } catch (error) {
    console.log('Interactive elements test error:', error);
  }
  
  return elementsCount;
}

async function checkMobileResponsiveness(page: Page): Promise<number> {
  let score = 100;
  
  try {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    if (hasHorizontalScroll) {
      score -= 30;
      results.issues_found.push({
        severity: 'high',
        category: 'ux',
        description: 'Horizontal scrolling on mobile viewport',
        location: page.url(),
        reproduction_steps: 'View page on 375px width device'
      });
    }
    
    // Check if text is readable
    const smallText = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        return fontSize < 16 && el.textContent && el.textContent.trim().length > 0;
      }).length;
    });
    
    if (smallText > 5) {
      score -= 20;
      results.issues_found.push({
        severity: 'medium',
        category: 'ux',
        description: 'Text may be too small for mobile viewing',
        location: page.url(),
        reproduction_steps: 'Check font sizes on mobile viewport'
      });
    }
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    
  } catch (error) {
    score = 50;
  }
  
  return Math.max(0, score);
}

test.describe('StrataNoble UX Diagnostic Suite', () => {
  test.beforeAll(async () => {
    console.log('🚀 Starting StrataNoble UX Diagnostic Assessment...');
  });

  test.afterAll(async () => {
    // Calculate final metrics
    if (results.pages_tested.length > 0) {
      const totalLoadTime = results.pages_tested
        .filter(p => p.load_time > 0)
        .reduce((sum, page) => sum + page.load_time, 0);
      const validPages = results.pages_tested.filter(p => p.load_time > 0);
      
      if (validPages.length > 0) {
        results.performance_metrics.average_page_load_time = (totalLoadTime / validPages.length).toFixed(2);
        
        const slowestPage = validPages.reduce((slowest, current) => 
          current.load_time > slowest.load_time ? current : slowest
        );
        results.performance_metrics.slowest_page = {
          url: slowestPage.url,
          load_time: slowestPage.load_time.toString()
        };
      }
      
      // Calculate UX assessment scores
      const avgUXScore = results.pages_tested.reduce((sum, p) => sum + p.ux_score, 0) / results.pages_tested.length;
      results.ux_assessment.overall_ux_score = Math.round(avgUXScore);
    }
    
    // Generate recommendations
    if (results.issues_found.some(i => i.category === 'performance')) {
      results.recommendations.push('Optimize page load times - consider image compression and code splitting');
    }
    if (results.mobile_responsiveness_score < 80) {
      results.recommendations.push('Improve mobile responsiveness - ensure proper viewport settings and responsive design');
    }
    if (results.issues_found.some(i => i.category === 'ux')) {
      results.recommendations.push('Enhance user experience - improve form validation and interactive feedback');
    }
    
    console.log('=== STRATANODE UX DIAGNOSTIC RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
  });

  test('Comprehensive Page Testing and UX Assessment', async ({ page }) => {
    for (const pageDef of keyPages) {
      try {
        console.log(`Testing ${pageDef.name} (${pageDef.path})...`);
        
        const loadTime = await measurePageLoad(page, pageDef.path);
        
        if (loadTime > 0) {
          const title = await page.title();
          const uxScore = await evaluatePageUX(page);
          
          // Performance assessment
          const status = loadTime > 3 ? 'failed' : 'passed';
          if (loadTime > 3) {
            results.issues_found.push({
              severity: 'high',
              category: 'performance',
              description: `Page load time exceeds 3 seconds: ${loadTime.toFixed(2)}s`,
              location: pageDef.path,
              reproduction_steps: `Navigate to ${pageDef.path} and measure load time`
            });
            results.tests_failed++;
          } else {
            results.tests_passed++;
          }
          
          // Store page results
          results.pages_tested.push({
            url: page.url(),
            title,
            status,
            load_time: loadTime,
            ux_score: uxScore
          });
          
          // Homepage specific tests
          if (pageDef.path === '/') {
            results.performance_metrics.homepage_load_time = loadTime.toString();
            results.screenshots['homepage'] = await captureScreenshot(page, 'homepage');
            
            // Mobile responsiveness test
            results.mobile_responsiveness_score = await checkMobileResponsiveness(page);
          }
          
          // Test forms on this page
          const formsCount = await testFormFunctionality(page);
          results.forms_tested += formsCount;
          
          // Test interactive elements
          const interactiveCount = await testInteractiveElements(page);
          results.interactive_elements_tested += interactiveCount;
          
          // Capture screenshots for key pages
          if (pageDef.priority === 'critical' || pageDef.priority === 'high') {
            results.screenshots[pageDef.name.toLowerCase().replace(/\s+/g, '_')] = 
              await captureScreenshot(page, pageDef.name);
          }
          
        } else {
          // Page failed to load
          results.tests_failed++;
          results.issues_found.push({
            severity: 'critical',
            category: 'functionality',
            description: `Page failed to load: ${pageDef.path}`,
            location: pageDef.path,
            reproduction_steps: `Navigate to ${pageDef.path}`
          });
        }
      } catch (error) {
        results.tests_failed++;
        results.issues_found.push({
          severity: 'critical',
          category: 'functionality',
          description: `Testing failed for ${pageDef.name}: ${error}`,
          location: pageDef.path,
          reproduction_steps: `Navigate to ${pageDef.path} and check console`
        });
      }
    }
    
    // Overall assessment
    expect(results.pages_tested.length).toBeGreaterThan(0);
  });

  test('Security and Accessibility Check', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    
    try {
      // Security headers check
      const response = await page.goto('http://localhost:8080/');
      const headers = response?.headers() || {};
      
      let securityScore = 0;
      if (headers['content-security-policy']) securityScore++;
      if (headers['strict-transport-security']) securityScore++;
      if (headers['x-frame-options']) securityScore++;
      if (headers['x-content-type-options']) securityScore++;
      
      results.security_checks_passed = securityScore;
      
      if (securityScore < 2) {
        results.issues_found.push({
          severity: 'high',
          category: 'security',
          description: 'Missing critical security headers',
          location: 'Server configuration',
          reproduction_steps: 'Check HTTP response headers'
        });
      }
      
      // Basic accessibility check
      const hasAltTags = await page.locator('img:not([alt])').count() === 0;
      const hasHeadingStructure = await page.locator('h1').count() > 0;
      const hasSkipLinks = await page.locator('a[href*="#"], .skip-link').count() > 0;
      
      let accessibilityScore = 0;
      if (hasAltTags) accessibilityScore += 33;
      if (hasHeadingStructure) accessibilityScore += 33;
      if (hasSkipLinks) accessibilityScore += 34;
      
      results.accessibility_score = accessibilityScore;
      
      if (accessibilityScore < 70) {
        results.issues_found.push({
          severity: 'medium',
          category: 'ux',
          description: 'Accessibility improvements needed',
          location: 'Site-wide',
          reproduction_steps: 'Check for alt tags, heading structure, and skip links'
        });
      }
      
    } catch (error) {
      results.issues_found.push({
        severity: 'medium',
        category: 'functionality',
        description: `Security/accessibility check failed: ${error}`,
        location: 'Site-wide',
        reproduction_steps: 'Run automated accessibility and security tests'
      });
    }
  });
});