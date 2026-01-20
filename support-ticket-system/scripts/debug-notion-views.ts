/**
 * Debug script to see what's actually in Notion
 */

import { chromium } from 'playwright';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = 'https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7';

async function run(): Promise<void> {
  console.log('Opening Notion to inspect views...\n');

  const automationDataDir = path.join(__dirname, '..', '.playwright-profile');

  const context = await chromium.launchPersistentContext(automationDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1920, height: 1080 }
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    await page.goto(DATABASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    // Take a screenshot
    const screenshotPath = path.join(__dirname, '..', 'notion-debug.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Try to find all view tabs
    console.log('\nSearching for view elements...\n');

    // Look for various view-related elements
    const selectors = [
      'div[role="tab"]',
      'div[role="button"]',
      '.notion-collection-view-tab',
      '[class*="view"]'
    ];

    for (const selector of selectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0 && elements.length < 50) {
        console.log(`\n${selector} (${elements.length} found):`);
        for (const el of elements.slice(0, 15)) {
          const text = await el.textContent().catch(() => '');
          if (text && text.length < 50) {
            console.log(`  - "${text.trim()}"`);
          }
        }
      }
    }

    // Look specifically for text that might be view names
    const viewNames = ['Inbox', 'Triage', 'This Week', 'Waiting', 'Blocked', 'Ready', 'Released', 'Backlog', 'Default', 'Table', 'All'];
    console.log('\n\nSearching for specific view names:');
    for (const name of viewNames) {
      const found = await page.locator(`text="${name}"`).count();
      const partial = await page.locator(`text=${name}`).count();
      console.log(`  "${name}": exact=${found}, partial=${partial}`);
    }

    console.log('\n\nBrowser will stay open for 2 minutes for manual inspection...');
    console.log('Look at the view tabs in Notion and note their exact names.');
    await new Promise(r => setTimeout(r, 120000));

  } catch (error) {
    console.log('Error:', error);
  } finally {
    await context.close();
  }
}

run().catch(console.error);
