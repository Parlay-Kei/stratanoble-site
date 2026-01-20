/**
 * Configure View Filters Script
 *
 * This script adds filters to the database views that were created.
 * Run after browser-setup-notion.ts if filters weren't applied.
 */

import { chromium, Page, BrowserContext } from 'playwright';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Client Tickets database URL
const DATABASE_URL = 'https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7';

// View filter configurations
const VIEW_FILTERS: Record<string, { property: string; operator: string; value: string | string[] }[]> = {
  'Inbox': [
    { property: 'Status', operator: 'is', value: 'New' }
  ],
  'Triage Queue': [
    { property: 'Status', operator: 'is any of', value: ['New', 'Triaged'] }
  ],
  'This Week': [
    { property: 'Release Window', operator: 'is', value: 'This Week' }
  ],
  'Waiting on Client': [
    { property: 'Status', operator: 'is', value: 'Waiting on Client' }
  ],
  'Blocked': [
    { property: 'Status', operator: 'is', value: 'Blocked' }
  ],
  'Ready for Release': [
    { property: 'Status', operator: 'is', value: 'Ready for Release' }
  ],
  'Released': [
    { property: 'Status', operator: 'is', value: 'Released' }
  ],
  'Backlog': [
    { property: 'Release Window', operator: 'is', value: 'Backlog' }
  ]
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dismissPopups(page: Page): Promise<void> {
  try {
    await page.keyboard.press('Escape');
    await delay(300);
    await page.keyboard.press('Escape');
    await delay(300);
  } catch {
    // Ignore
  }
}

async function clickViewTab(page: Page, viewName: string): Promise<boolean> {
  try {
    // Find and click the view tab
    const viewTab = page.locator(`div[role="button"]:has-text("${viewName}")`).first();
    if (await viewTab.isVisible({ timeout: 3000 })) {
      await viewTab.click();
      await delay(1500);
      return true;
    }

    // Try alternative selector
    const altTab = page.locator(`text="${viewName}"`).first();
    if (await altTab.isVisible({ timeout: 2000 })) {
      await altTab.click();
      await delay(1500);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function addFilter(page: Page, property: string, operator: string, value: string | string[]): Promise<boolean> {
  try {
    await dismissPopups(page);

    // Click the Filter button in the view toolbar
    const filterButton = page.locator('div[role="button"]:has-text("Filter")').first();
    if (await filterButton.isVisible({ timeout: 3000 })) {
      await filterButton.click({ force: true });
      await delay(1000);
    } else {
      console.log('      Filter button not found');
      return false;
    }

    // Click "Add a filter" or "+ Add filter"
    const addFilterSelectors = [
      'div:has-text("Add a filter")',
      'div:has-text("Add filter")',
      'text=Add a filter',
      'text=Add filter'
    ];

    let addClicked = false;
    for (const selector of addFilterSelectors) {
      try {
        const addBtn = page.locator(selector).first();
        if (await addBtn.isVisible({ timeout: 1000 })) {
          await addBtn.click({ force: true });
          addClicked = true;
          await delay(800);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!addClicked) {
      console.log('      Could not find "Add filter" button');
      await page.keyboard.press('Escape');
      return false;
    }

    // Select the property from dropdown
    const propertyOption = page.locator(`div[role="menuitem"]:has-text("${property}"), div[role="option"]:has-text("${property}")`).first();
    if (await propertyOption.isVisible({ timeout: 2000 })) {
      await propertyOption.click();
      await delay(800);
    } else {
      // Try clicking directly on text
      const propText = page.locator(`text="${property}"`).first();
      if (await propText.isVisible({ timeout: 1000 })) {
        await propText.click();
        await delay(800);
      }
    }

    // For multi-value filters
    if (Array.isArray(value)) {
      // Click to open value selector
      for (const val of value) {
        const valueOption = page.locator(`div[role="menuitem"]:has-text("${val}"), div[role="option"]:has-text("${val}"), text="${val}"`).first();
        if (await valueOption.isVisible({ timeout: 2000 })) {
          await valueOption.click();
          await delay(500);
        }
      }
    } else {
      // Single value filter
      const valueOption = page.locator(`div[role="menuitem"]:has-text("${value}"), div[role="option"]:has-text("${value}")`).first();
      if (await valueOption.isVisible({ timeout: 2000 })) {
        await valueOption.click();
        await delay(500);
      } else {
        // Try direct text click
        const valText = page.locator(`text="${value}"`).first();
        if (await valText.isVisible({ timeout: 1000 })) {
          await valText.click();
          await delay(500);
        }
      }
    }

    // Close the filter panel
    await page.keyboard.press('Escape');
    await delay(500);
    await page.keyboard.press('Escape');
    await delay(500);

    return true;
  } catch (error) {
    console.log(`      Error adding filter:`, error);
    await page.keyboard.press('Escape');
    return false;
  }
}

async function configureViewFilter(page: Page, viewName: string, filters: { property: string; operator: string; value: string | string[] }[]): Promise<boolean> {
  console.log(`\n  Configuring filter for view: ${viewName}`);

  // Click on the view tab
  if (!await clickViewTab(page, viewName)) {
    console.log(`    Could not find view tab: ${viewName}`);
    return false;
  }

  console.log(`    Clicked on view tab`);
  await delay(1000);

  // Add each filter
  for (const filter of filters) {
    console.log(`    Adding filter: ${filter.property} ${filter.operator} ${Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}`);
    const success = await addFilter(page, filter.property, filter.operator, filter.value);
    if (success) {
      console.log(`    Filter added successfully`);
    } else {
      console.log(`    Filter may not have been applied`);
    }
  }

  return true;
}

async function run(): Promise<void> {
  console.log('='.repeat(60));
  console.log('CONFIGURE VIEW FILTERS');
  console.log('='.repeat(60));
  console.log('\nThis will add filters to each database view.\n');

  const automationDataDir = path.join(__dirname, '..', '.playwright-profile');

  console.log('Launching browser...\n');

  const context = await chromium.launchPersistentContext(automationDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1920, height: 1080 }
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    // Navigate to the database
    console.log('Navigating to Client Tickets database...');
    await page.goto(DATABASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(5000);

    // Dismiss any popups
    await dismissPopups(page);
    await delay(1000);

    // Configure each view
    const viewNames = Object.keys(VIEW_FILTERS);
    const results: Record<string, boolean> = {};

    for (const viewName of viewNames) {
      const filters = VIEW_FILTERS[viewName];
      results[viewName] = await configureViewFilter(page, viewName, filters);
      await delay(1000);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('FILTER CONFIGURATION RESULTS');
    console.log('='.repeat(60));

    for (const [viewName, success] of Object.entries(results)) {
      console.log(`  ${success ? '[OK]' : '[--]'} ${viewName}`);
    }

    console.log('\nBrowser will remain open for 30 seconds for verification...');
    await delay(30000);

  } catch (error) {
    console.log('\n[ERROR]', error);
  } finally {
    await context.close();
  }
}

run().catch(console.error);
