import { defineConfig, devices } from '@playwright/test';

/**
 * Fixed Playwright Configuration for MCP Server Integration
 * Addresses disconnect issues and improves stability
 */
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/results',
  
  /* Run tests in files in parallel - reduced for stability */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Increased retries for MCP server stability */
  retries: process.env.CI ? 3 : 1,
  
  /* Single worker for MCP server compatibility */
  workers: 1,
  
  /* Reporter configuration - simplified for MCP */
  reporter: [
    ['html', { outputFolder: './tests/reports/html', open: 'never' }],
    ['json', { outputFile: './tests/reports/results.json' }],
    ['line']
  ],
  
  /* Shared settings for all projects - optimized for MCP */
  use: {
    /* Base URL with fallback */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || process.env.MCP_BASE_URL || 'http://localhost:3000',
    
    /* Enhanced tracing for debugging disconnects */
    trace: 'on',
    
    /* Always take screenshots for MCP debugging */
    screenshot: 'on',
    
    /* Record video for all tests when using MCP */
    video: 'on',
    
    /* Increased timeouts for MCP server communication */
    actionTimeout: 60000,
    navigationTimeout: 60000,
    
    /* MCP-specific headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'StrataNoble-MCP-Tester/1.0',
      'X-MCP-Client': 'playwright',
      'Connection': 'keep-alive'
    },
    
    /* Browser launch options for stability */
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      timeout: 120000
    }
  },
  
  /* Extended test timeout for MCP operations */
  timeout: 120000,
  expect: {
    timeout: 30000
  },
  
  /* Single browser project for MCP stability */
  projects: [
    {
      name: 'mcp-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      testMatch: '**/*.spec.ts'
    }
  ],
  
  /* Global setup and teardown with MCP error handling */
  globalSetup: './tests/mcp-global-setup.ts',
  globalTeardown: './tests/mcp-global-teardown.ts',
  
  /* Configure local dev server with MCP compatibility */
  webServer: process.env.SKIP_WEBSERVER ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Use existing server if available
    timeout: 180 * 1000, // 3 minutes for MCP
    env: {
      NODE_ENV: 'test',
      MCP_MODE: 'true'
    }
  },
  
  /* Global test configuration for MCP */
  globalTimeout: 600000, // 10 minutes total
  
  /* Prevent test isolation issues with MCP */
  preserveOutput: 'always'
});
