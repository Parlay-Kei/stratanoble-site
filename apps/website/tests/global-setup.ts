/**
 * Global Playwright Setup
 * Prepares test environment and validates configuration
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  // Create test directories
  const testDirs = [
    'tests/results',
    'tests/reports',
    'tests/reports/html',
    'tests/screenshots',
    'tests/videos',
    'tests/traces'
  ];

  testDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Validate test environment
  console.log('🔍 Setting up test environment...');
  
  // Check required environment variables
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
  }

  // Verify application is responsive
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    const baseURL = config.webServer?.url || 'http://localhost:8080';
    console.log(`🌐 Testing connectivity to ${baseURL}...`);
    
    await page.goto(baseURL, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    
    console.log('✅ Application is responsive');
  } catch (error) {
    console.error('❌ Failed to connect to application:', error);
    throw new Error('Application not accessible for testing');
  } finally {
    await browser.close();
  }

  // Initialize test data
  const testData = {
    timestamp: new Date().toISOString(),
    baseURL: config.webServer?.url || 'http://localhost:8080',
    browsers: config.projects?.map(p => p.name) || [],
    testRunner: 'Playwright',
    environment: process.env.NODE_ENV || 'test'
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'tests/test-session.json'),
    JSON.stringify(testData, null, 2)
  );

  console.log('✅ Global setup completed successfully');
}

export default globalSetup;