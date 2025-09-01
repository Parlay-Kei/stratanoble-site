import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Playwright Configuration
 * For security, performance, and functional testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/results',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: './tests/reports/html', open: 'never' }],
    ['junit', { outputFile: './tests/reports/junit.xml' }],
    ['json', { outputFile: './tests/reports/results.json' }],
    ['line']
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for all tests */
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    /* Security headers validation */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'StrataNoble-SecurityTester/1.0'
    }
  },
  
  /* Test timeout */
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.spec.ts'
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/*.spec.ts'
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/*.spec.ts'
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/mobile.*.spec.ts'
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: '**/mobile.*.spec.ts'
    },
    {
      name: 'security-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/security.*.spec.ts'
    },
    {
      name: 'performance-tests',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-precise-memory-info', '--disable-web-security']
        }
      },
      testMatch: '**/performance.*.spec.ts'
    }
  ],
  
  /* Global setup and teardown */
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  
  /* Configure local dev server */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test'
    }
  }
});