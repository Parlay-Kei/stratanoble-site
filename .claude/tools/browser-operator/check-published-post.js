#!/usr/bin/env node
/**
 * Check Published Post - Manual Verification
 * Opens LinkedIn to manually verify post publication
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

class LinkedInPostChecker {
  constructor() {
    this.sessionDir = 'C:\\Dev\\.claude-anx\\browser-sessions\\linkedin';
    this.proofDir = 'c:\\Dev\\msaudreys-house\\proof-packs\\linkedin-posts\\2026-01-21\\run-2026-01-21T04-30-24-161Z';
  }

  async checkPost() {
    console.log('🔍 CHECKING PUBLISHED POST STATUS...');

    // Launch browser with existing session
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      storageState: path.join(this.sessionDir, 'state.json')
    });
    const page = await context.newPage();

    try {
      // Navigate to LinkedIn profile activity
      console.log('📄 Navigating to recent activity...');
      await page.goto('https://www.linkedin.com/in/me/recent-activity/all/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      await page.waitForTimeout(5000);

      // Capture screenshot of recent activity
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(this.proofDir, 'screenshots', `${timestamp}_post-verification.png`);

      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`✅ Post verification screenshot: ${screenshotPath}`);

      // Look for the post content
      const postFound = await page.evaluate(() => {
        const posts = document.querySelectorAll('[data-test-id*="post"], .feed-shared-update-v2, .share-update-card');
        const searchText = 'AI agents are showing up inside real business software now';

        for (const post of posts) {
          if (post.textContent && post.textContent.includes(searchText)) {
            return true;
          }
        }
        return false;
      });

      console.log(`📝 Post found in recent activity: ${postFound ? 'YES' : 'NO'}`);

      // Navigate to main feed to double-check
      console.log('📄 Checking main feed...');
      await page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'domcontentloaded'
      });

      await page.waitForTimeout(3000);

      const feedScreenshotPath = path.join(this.proofDir, 'screenshots', `${timestamp}_feed-verification.png`);
      await page.screenshot({
        path: feedScreenshotPath,
        fullPage: false
      });

      console.log(`✅ Feed verification screenshot: ${feedScreenshotPath}`);

      await browser.close();

      return {
        success: true,
        postFoundInActivity: postFound,
        screenshots: [screenshotPath, feedScreenshotPath]
      };

    } catch (error) {
      console.error('❌ Error checking post:', error.message);
      await browser.close();
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const checker = new LinkedInPostChecker();
const result = await checker.checkPost();
console.log('\n🎯 VERIFICATION RESULT:', JSON.stringify(result, null, 2));