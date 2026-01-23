#!/usr/bin/env node
/**
 * LinkedIn Login Helper v1.0
 * Opens browser for manual login, waits for confirmation, then persists session
 *
 * This script:
 * 1. Opens Chrome with persistent session directory
 * 2. Navigates to LinkedIn
 * 3. Waits 2 minutes for you to log in
 * 4. Checks if logged in and captures proof
 * 5. Properly closes browser to save session
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const SESSION_DIR = 'C:\\Dev\\.claude-anx\\browser-sessions\\linkedin';
const PROOF_DIR = 'c:\\Dev\\msaudreys-house\\proof-packs\\linkedin-posts\\session-bootstrap';

async function main() {
  const startTime = new Date();
  const dateStr = startTime.toISOString().split('T')[0];
  const runId = `run-${startTime.toISOString().replace(/[:.]/g, '-')}`;
  const runDir = path.join(PROOF_DIR, dateStr, runId);

  await fs.mkdir(path.join(runDir, 'screenshots'), { recursive: true });
  await fs.mkdir(SESSION_DIR, { recursive: true });

  console.log('\n' + '='.repeat(60));
  console.log('LinkedIn Login Helper v1.0');
  console.log('='.repeat(60));
  console.log(`Session will be saved to: ${SESSION_DIR}`);
  console.log('='.repeat(60) + '\n');

  let context = null;

  try {
    console.log('[*] Launching Chrome browser...\n');

    context = await chromium.launchPersistentContext(SESSION_DIR, {
      headless: false,
      slowMo: 50,
      viewport: { width: 1920, height: 1080 }
    });

    const page = context.pages()[0] || await context.newPage();

    console.log('[*] Navigating to LinkedIn...\n');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

    console.log('='.repeat(60));
    console.log('PLEASE LOG IN TO LINKEDIN IN THE BROWSER WINDOW');
    console.log('='.repeat(60));
    console.log('\nThe script will check every 10 seconds if you\'re logged in.');
    console.log('You have 2 minutes to complete login.\n');

    // Poll for login status
    let loggedIn = false;
    const maxAttempts = 12; // 2 minutes (12 x 10 seconds)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[*] Checking login status... (attempt ${attempt}/${maxAttempts})`);

      // Check current URL and page content
      const url = page.url();

      if (url.includes('/feed') || url.includes('/mynetwork') || url.includes('/in/')) {
        // Looks like we're logged in, verify
        const feedCheck = await page.evaluate(() => {
          return !!(
            document.querySelector('.global-nav__me') ||
            document.querySelector('[data-test-id="feed-nav-item"]') ||
            document.querySelector('button[aria-label*="Start a post"]') ||
            document.querySelector('.share-box-feed-entry__trigger')
          );
        });

        if (feedCheck) {
          loggedIn = true;
          console.log('\n[+] LOGIN DETECTED!\n');
          break;
        }
      }

      // Wait 10 seconds before next check
      await new Promise(r => setTimeout(r, 10000));
    }

    if (!loggedIn) {
      console.log('\n[!] Login not detected within 2 minutes.');
      console.log('[*] Capturing current state...\n');
    }

    // Capture screenshot of current state
    const screenshotName = loggedIn ? 'session-established.png' : 'login-timeout.png';
    const screenshotPath = path.join(runDir, 'screenshots', screenshotName);
    await page.screenshot({ path: screenshotPath });
    console.log(`[*] Screenshot saved: ${screenshotPath}\n`);

    if (loggedIn) {
      // Navigate to feed to ensure we're fully loaded
      console.log('[*] Navigating to feed to verify session...\n');
      await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 3000));

      // Capture feed screenshot
      const feedScreenshot = path.join(runDir, 'screenshots', 'feed-verified.png');
      await page.screenshot({ path: feedScreenshot });
      console.log(`[*] Feed screenshot saved: ${feedScreenshot}\n`);

      // Try to open composer
      console.log('[*] Testing composer access...\n');
      const composerButton = await page.$('button[aria-label*="Start a post"], .share-box-feed-entry__trigger');
      if (composerButton) {
        await composerButton.click();
        await new Promise(r => setTimeout(r, 2000));

        const composerScreenshot = path.join(runDir, 'screenshots', 'composer-verified.png');
        await page.screenshot({ path: composerScreenshot });
        console.log(`[*] Composer screenshot saved: ${composerScreenshot}\n`);

        await page.keyboard.press('Escape');
      }
    }

    // Generate receipt
    const receipt = `# LinkedIn Session Bootstrap Receipt

**Status**: ${loggedIn ? 'SUCCESS' : 'TIMEOUT'}
**Timestamp**: ${new Date().toISOString()}
**Session Directory**: \`${SESSION_DIR}\`
**Proof Pack**: \`${runDir}\`

## Result

${loggedIn ? `
Session successfully established and saved.

The session is now ready for use with:
\`\`\`bash
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Test"
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Your post" --live
\`\`\`
` : `
Login was not detected within the timeout period.
Please run this script again and complete the login.
`}
`;

    await fs.writeFile(path.join(runDir, 'LINKEDIN_SESSION_BOOTSTRAP_RECEIPT.md'), receipt);

    console.log('='.repeat(60));
    console.log(loggedIn ? 'SESSION ESTABLISHED SUCCESSFULLY' : 'LOGIN TIMEOUT');
    console.log('='.repeat(60));
    console.log(`Receipt: ${path.join(runDir, 'LINKEDIN_SESSION_BOOTSTRAP_RECEIPT.md')}`);
    console.log('='.repeat(60) + '\n');

    // IMPORTANT: Close context properly to save session
    console.log('[*] Closing browser and saving session...\n');
    await context.close();
    context = null;

    if (loggedIn) {
      console.log('[+] Session saved! Ready for headless posting.\n');
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n[!] Error:', error.message);
    if (context) await context.close();
    process.exit(2);
  }
}

main();
