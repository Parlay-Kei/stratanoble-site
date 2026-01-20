#!/usr/bin/env tsx

/**
 * LinkedIn Session Helper
 *
 * Opens a browser for manual LinkedIn login and auto-saves session when logged in.
 */

import { chromium } from 'playwright';

const SESSION_FILE = './linkedin-session.json';

async function main() {
  console.log(`
============================================================
LinkedIn Session Helper
============================================================

Opening browser - please log in to LinkedIn.
Session will be saved automatically when login is detected.

`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  console.log('Opening LinkedIn login page...\n');
  await page.goto('https://www.linkedin.com/login', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  console.log('Waiting for you to log in...');
  console.log('(Will auto-detect when you reach the feed)\n');

  // Poll for login success - check every 2 seconds for up to 5 minutes
  const maxAttempts = 150;
  let attempts = 0;
  let loggedIn = false;

  while (attempts < maxAttempts && !loggedIn) {
    await new Promise(r => setTimeout(r, 2000));
    attempts++;

    const url = page.url();

    // Check if we're on a logged-in page
    if (url.includes('/feed') ||
        url.includes('/mynetwork') ||
        url.includes('/messaging') ||
        url.includes('/notifications') ||
        (url.includes('/in/') && !url.includes('/login'))) {
      loggedIn = true;
      console.log(`\n✓ Login detected! URL: ${url}`);
    } else if (attempts % 5 === 0) {
      console.log(`  Still waiting... (${attempts * 2}s) - Current: ${url.substring(0, 50)}...`);
    }
  }

  if (loggedIn) {
    // Give it a moment to fully load
    await new Promise(r => setTimeout(r, 2000));

    // Save session
    await context.storageState({ path: SESSION_FILE });
    console.log(`\n✓ Session saved to: ${SESSION_FILE}`);
    console.log('\nYou can now use the LinkedIn Operator Agent!');
    console.log('Run: npm run linkedin:dry-run "https://www.linkedin.com/services/page/..."');
  } else {
    console.log('\n✗ Timeout: Login not detected within 5 minutes.');
    console.log('Please try again.');
  }

  await browser.close();
  console.log('\nBrowser closed.');
}

main().catch(console.error);
