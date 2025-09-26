/**
 * MCP-Specific Global Playwright Setup
 * Handles connection stability and MCP server integration
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function mcpGlobalSetup(config: FullConfig) {
  console.log('🔧 Setting up MCP-compatible test environment...');
  
  // Create test directories with MCP-specific structure
  const testDirs = [
    'tests/results',
    'tests/reports',
    'tests/reports/html',
    'tests/screenshots',
    'tests/videos',
    'tests/traces',
    'tests/mcp-logs'
  ];

  testDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // MCP-specific environment validation
  console.log('🔍 Validating MCP environment...');
  
  // Check for MCP-specific environment variables
  const mcpEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];

  const missingVars = mcpEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing MCP environment variables:', missingVars.join(', '));
    console.log('💡 Consider setting these for full MCP compatibility');
  }

  // Enhanced connectivity check with retry logic for MCP stability
  const browser = await chromium.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  
  const page = await browser.newPage();
  
  try {
    const baseURL = config.webServer?.url || process.env.MCP_BASE_URL || 'http://localhost:3000';
    console.log(`🌐 Testing MCP connectivity to ${baseURL}...`);
    
    // Retry logic for MCP server connection
    let connected = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!connected && attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`🔄 Connection attempt ${attempts}/${maxAttempts}...`);
        
        await page.goto(baseURL, { 
          timeout: 60000,
          waitUntil: 'domcontentloaded'
        });
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        
        // Verify page is responsive
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        connected = true;
        console.log('✅ MCP server connection established');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Connection attempt ${attempts} failed:`, errorMessage);
        
        if (attempts < maxAttempts) {
          console.log('⏳ Waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    if (!connected) {
      throw new Error('Failed to establish MCP server connection after multiple attempts');
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ MCP server connection failed:', errorMessage);
    
    // Log detailed error information for MCP debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: errorMessage,
      stack: errorStack,
      baseURL: config.webServer?.url || process.env.MCP_BASE_URL || 'http://localhost:3000',
      environment: process.env.NODE_ENV || 'test'
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'tests/mcp-logs/connection-error.json'),
      JSON.stringify(errorLog, null, 2)
    );
    
    throw new Error(`MCP server not accessible: ${errorMessage}`);
  } finally {
    await browser.close();
  }

  // Initialize MCP test session data
  const mcpTestData = {
    timestamp: new Date().toISOString(),
    baseURL: config.webServer?.url || process.env.MCP_BASE_URL || 'http://localhost:3000',
    browsers: config.projects?.map(p => p.name) || [],
    testRunner: 'Playwright-MCP',
    environment: process.env.NODE_ENV || 'test',
    mcpMode: true,
    connectionRetries: 0,
    setupVersion: '1.0.0'
  };

  // Save MCP session data
  fs.writeFileSync(
    path.join(process.cwd(), 'tests/test-session.json'),
    JSON.stringify(mcpTestData, null, 2)
  );

  // Create MCP-specific configuration file
  const mcpConfig = {
    serverTimeout: 180000,
    connectionRetries: 5,
    retryDelay: 5000,
    traceEnabled: true,
    videoEnabled: true,
    screenshotEnabled: true,
    preserveOutput: true
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'tests/mcp-config.json'),
    JSON.stringify(mcpConfig, null, 2)
  );

  console.log('✅ MCP global setup completed successfully');
  console.log('📊 MCP configuration saved to tests/mcp-config.json');
}

export default mcpGlobalSetup;
