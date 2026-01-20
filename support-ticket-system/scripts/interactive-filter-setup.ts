/**
 * Interactive Filter Setup Script
 *
 * This script opens Notion and waits for you to click on each view,
 * then attempts to add the appropriate filter.
 */

import { chromium, Page } from 'playwright';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = 'https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7';

interface ViewFilter {
  name: string;
  property: string;
  values: string[];
}

const VIEWS: ViewFilter[] = [
  { name: 'Inbox', property: 'Status', values: ['New'] },
  { name: 'Triage Queue', property: 'Status', values: ['New', 'Triaged'] },
  { name: 'This Week', property: 'Release Window', values: ['This Week'] },
  { name: 'Waiting on Client', property: 'Status', values: ['Waiting on Client'] },
  { name: 'Blocked', property: 'Status', values: ['Blocked'] },
  { name: 'Ready for Release', property: 'Status', values: ['Ready for Release'] },
  { name: 'Released', property: 'Status', values: ['Released'] },
  { name: 'Backlog', property: 'Release Window', values: ['Backlog'] }
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function tryAddFilter(page: Page, property: string, values: string[]): Promise<void> {
  console.log(`\n    Attempting to add filter: ${property} = ${values.join(' or ')}`);

  try {
    // Try to click the Filter button
    await page.keyboard.press('Escape');
    await delay(500);

    // Look for filter button with various selectors
    const filterSelectors = [
      'div[role="button"]:has-text("Filter")',
      '[aria-label="Filter"]',
      'text=Filter'
    ];

    for (const selector of filterSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click({ force: true });
          console.log('    Clicked Filter button');
          await delay(1000);
          break;
        }
      } catch {
        continue;
      }
    }

    // Try to add a filter rule
    const addSelectors = [
      'text=Add a filter',
      'text=Add filter',
      'div:has-text("Add a filter")'
    ];

    for (const selector of addSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 1500 })) {
          await btn.click({ force: true });
          console.log('    Clicked Add filter');
          await delay(800);
          break;
        }
      } catch {
        continue;
      }
    }

    // Try to select the property
    try {
      const propOption = page.locator(`text="${property}"`).first();
      if (await propOption.isVisible({ timeout: 2000 })) {
        await propOption.click();
        console.log(`    Selected property: ${property}`);
        await delay(800);
      }
    } catch {
      console.log(`    Could not select property`);
    }

    // Try to select each value
    for (const value of values) {
      try {
        const valOption = page.locator(`text="${value}"`).first();
        if (await valOption.isVisible({ timeout: 2000 })) {
          await valOption.click();
          console.log(`    Selected value: ${value}`);
          await delay(500);
        }
      } catch {
        console.log(`    Could not select value: ${value}`);
      }
    }

    // Close popups
    await page.keyboard.press('Escape');
    await delay(300);
    await page.keyboard.press('Escape');

  } catch (error) {
    console.log('    Automation failed, you may need to set this filter manually');
  }
}

async function run(): Promise<void> {
  console.log('='.repeat(60));
  console.log('INTERACTIVE FILTER SETUP');
  console.log('='.repeat(60));
  console.log('\nThis script will help you configure filters for each view.');
  console.log('A browser will open with Notion.\n');

  const automationDataDir = path.join(__dirname, '..', '.playwright-profile');

  const context = await chromium.launchPersistentContext(automationDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1920, height: 1080 }
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    console.log('Opening Notion database...\n');
    await page.goto(DATABASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(5000);

    // Dismiss popups
    await page.keyboard.press('Escape');
    await delay(500);

    console.log('='.repeat(60));
    console.log('FILTER CONFIGURATION');
    console.log('='.repeat(60));
    console.log('\nFor each view, please:');
    console.log('1. Click on the view tab in Notion');
    console.log('2. Press ENTER in this terminal');
    console.log('3. The script will try to add the filter\n');

    for (const view of VIEWS) {
      console.log('-'.repeat(50));
      console.log(`\nView: ${view.name}`);
      console.log(`Filter needed: ${view.property} = ${view.values.join(' or ')}`);

      await prompt('\n>>> Click on the view tab in Notion, then press ENTER here... ');

      await tryAddFilter(page, view.property, view.values);

      console.log('\n    Check if the filter was applied correctly.');
      await prompt('    Press ENTER to continue to the next view... ');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log('\nAll views have been processed.');
    console.log('Please verify each view has the correct filter in Notion.\n');

    await prompt('Press ENTER to close the browser... ');

  } catch (error) {
    console.log('\n[ERROR]', error);
  } finally {
    await context.close();
  }
}

run().catch(console.error);
