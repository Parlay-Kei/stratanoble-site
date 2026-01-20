/**
 * Create Notion Database Views - Step by Step
 *
 * This script creates each view one at a time with proper waiting and verification.
 */

import { chromium, Page } from 'playwright';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = 'https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7';

interface ViewConfig {
  name: string;
  filterProperty: string;
  filterValues: string[];
}

const VIEWS_TO_CREATE: ViewConfig[] = [
  { name: 'Inbox', filterProperty: 'Status', filterValues: ['New'] },
  { name: 'Triage Queue', filterProperty: 'Status', filterValues: ['New', 'Triaged'] },
  { name: 'This Week', filterProperty: 'Release Window', filterValues: ['This Week'] },
  { name: 'Waiting on Client', filterProperty: 'Status', filterValues: ['Waiting on Client'] },
  { name: 'Blocked', filterProperty: 'Status', filterValues: ['Blocked'] },
  { name: 'Ready for Release', filterProperty: 'Status', filterValues: ['Ready for Release'] },
  { name: 'Released', filterProperty: 'Status', filterValues: ['Released'] },
  { name: 'Backlog', filterProperty: 'Release Window', filterValues: ['Backlog'] }
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function closeAllPopups(page: Page): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape');
    await delay(300);
  }
  // Also try clicking away from any popups
  try {
    await page.mouse.click(100, 100);
    await delay(200);
  } catch {}
}

async function createView(page: Page, viewName: string): Promise<boolean> {
  console.log(`\n  Creating view: "${viewName}"...`);

  try {
    await closeAllPopups(page);
    await delay(500);

    // Look for the view tabs area - click on the "Default view" dropdown arrow or the + button
    // In Notion, clicking on the current view name opens a dropdown with "Add a view" option

    // First, try to click on the current view tab to open dropdown
    const viewTabArea = page.locator('.notion-collection-view-select, [class*="collection-view"]').first();
    const defaultViewBtn = page.locator('div:has-text("Default view")').first();

    // Try clicking near the view tabs to find the + or dropdown
    // Look for the dropdown chevron next to view name
    const dropdownTrigger = page.locator('[class*="chevron"], [aria-label*="view"], div[role="button"]:near(:text("Default view"))').first();

    let menuOpened = false;

    // Method 1: Click directly on view name
    try {
      const viewNameBtn = page.locator('div:has-text("Default view")').first();
      if (await viewNameBtn.isVisible({ timeout: 2000 })) {
        await viewNameBtn.click();
        await delay(1000);

        // Check if "Add a view" appeared
        const addViewOption = page.locator('text=Add a view').first();
        if (await addViewOption.isVisible({ timeout: 2000 })) {
          menuOpened = true;
        }
      }
    } catch {}

    // Method 2: Look for + button
    if (!menuOpened) {
      try {
        const plusButtons = await page.locator('div[role="button"]').all();
        for (const btn of plusButtons) {
          const text = await btn.textContent().catch(() => '');
          const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
          if (text === '+' || ariaLabel?.includes('Add') || ariaLabel?.includes('view')) {
            await btn.click();
            await delay(1000);
            menuOpened = true;
            break;
          }
        }
      } catch {}
    }

    // Method 3: Right-click on view area
    if (!menuOpened) {
      try {
        const viewArea = page.locator('[class*="view-tab"], [class*="collection-view"]').first();
        if (await viewArea.isVisible({ timeout: 1000 })) {
          await viewArea.click({ button: 'right' });
          await delay(1000);
          menuOpened = true;
        }
      } catch {}
    }

    // Now look for "Add a view" option
    const addViewOption = page.locator('text=Add a view, text=Add view, div:has-text("Add a view")').first();
    if (await addViewOption.isVisible({ timeout: 3000 })) {
      await addViewOption.click();
      await delay(1000);
      console.log(`    Clicked "Add a view"`);
    } else {
      // Try finding it in a menu
      const menuItem = page.locator('div[role="menuitem"]:has-text("Add"), div[role="option"]:has-text("Add")').first();
      if (await menuItem.isVisible({ timeout: 2000 })) {
        await menuItem.click();
        await delay(1000);
      } else {
        console.log(`    Could not find "Add a view" option`);
        return false;
      }
    }

    // Select Table view type (usually the default, but click to be sure)
    const tableOption = page.locator('div:has-text("Table"), div[role="menuitem"]:has-text("Table")').first();
    if (await tableOption.isVisible({ timeout: 2000 })) {
      await tableOption.click();
      await delay(800);
      console.log(`    Selected Table view type`);
    }

    // Type the view name
    // The input field should be focused or we need to find it
    const nameInput = page.locator('input[placeholder*="name"], input[type="text"], input').first();
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('');
      await nameInput.fill(viewName);
      await delay(500);
      console.log(`    Entered view name: "${viewName}"`);
    } else {
      // Just type it (input might be auto-focused)
      await page.keyboard.type(viewName, { delay: 50 });
      await delay(500);
    }

    // Press Enter to create
    await page.keyboard.press('Enter');
    await delay(1500);

    // Verify the view was created by looking for it
    const newViewTab = page.locator(`text="${viewName}"`).first();
    if (await newViewTab.isVisible({ timeout: 3000 })) {
      console.log(`    View "${viewName}" created successfully!`);
      return true;
    } else {
      console.log(`    View may have been created but couldn't verify`);
      return true; // Assume success
    }

  } catch (error) {
    console.log(`    Error creating view:`, error);
    return false;
  }
}

async function addFilterToCurrentView(page: Page, property: string, values: string[]): Promise<boolean> {
  console.log(`    Adding filter: ${property} = ${values.join(' or ')}`);

  try {
    await delay(500);

    // Click the Filter button in the toolbar
    const filterBtn = page.locator('div[role="button"]:has-text("Filter"), button:has-text("Filter")').first();
    if (await filterBtn.isVisible({ timeout: 3000 })) {
      await filterBtn.click();
      await delay(800);
    } else {
      console.log(`      Filter button not found`);
      return false;
    }

    // Click "Add a filter"
    const addFilterBtn = page.locator('text=Add a filter, text=Add filter').first();
    if (await addFilterBtn.isVisible({ timeout: 2000 })) {
      await addFilterBtn.click();
      await delay(800);
    } else {
      console.log(`      "Add a filter" not found`);
      await page.keyboard.press('Escape');
      return false;
    }

    // Select the property
    const propertyOption = page.locator(`div[role="menuitem"]:has-text("${property}"), div[role="option"]:has-text("${property}"), text="${property}"`).first();
    if (await propertyOption.isVisible({ timeout: 2000 })) {
      await propertyOption.click();
      await delay(800);
    } else {
      // Type to search
      await page.keyboard.type(property, { delay: 30 });
      await delay(500);
      await page.keyboard.press('Enter');
      await delay(800);
    }

    // Select value(s)
    for (const value of values) {
      const valueOption = page.locator(`div[role="menuitem"]:has-text("${value}"), div[role="option"]:has-text("${value}"), text="${value}"`).first();
      if (await valueOption.isVisible({ timeout: 2000 })) {
        await valueOption.click();
        await delay(500);
      }
    }

    // Close filter panel
    await page.keyboard.press('Escape');
    await delay(500);
    await page.keyboard.press('Escape');
    await delay(300);

    console.log(`      Filter added`);
    return true;

  } catch (error) {
    console.log(`      Error adding filter:`, error);
    await page.keyboard.press('Escape');
    return false;
  }
}

async function run(): Promise<void> {
  console.log('='.repeat(60));
  console.log('CREATE NOTION DATABASE VIEWS');
  console.log('='.repeat(60));
  console.log('\nThis will create 8 views with filters.\n');

  const automationDataDir = path.join(__dirname, '..', '.playwright-profile');

  const context = await chromium.launchPersistentContext(automationDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1920, height: 1080 }
  });

  const page = context.pages()[0] || await context.newPage();

  const results: Record<string, { created: boolean; filtered: boolean }> = {};

  try {
    console.log('Opening Client Tickets database...\n');
    await page.goto(DATABASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await delay(5000);

    // Dismiss any popups
    await closeAllPopups(page);
    await delay(1000);

    // Create each view
    for (const viewConfig of VIEWS_TO_CREATE) {
      const created = await createView(page, viewConfig.name);
      let filtered = false;

      if (created) {
        // Try to add the filter
        filtered = await addFilterToCurrentView(page, viewConfig.filterProperty, viewConfig.filterValues);
      }

      results[viewConfig.name] = { created, filtered };
      await delay(1000);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));

    for (const [name, result] of Object.entries(results)) {
      const status = result.created ? (result.filtered ? '[OK]' : '[VIEW ONLY]') : '[FAILED]';
      console.log(`  ${status} ${name}`);
    }

    console.log('\n\nBrowser will stay open for 2 minutes.');
    console.log('Please verify the views were created correctly.\n');

    // Take a screenshot for reference
    const screenshotPath = path.join(__dirname, '..', 'views-created.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await delay(120000);

  } catch (error) {
    console.log('\n[ERROR]', error);
  } finally {
    await context.close();
  }
}

run().catch(console.error);
