/**
 * Setup View Filters Using Keyboard Navigation
 *
 * This script uses keyboard shortcuts which are more reliable than clicking
 * in Notion's complex UI.
 */

import { chromium, Page } from 'playwright';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = 'https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dismissAllPopups(page: Page): Promise<void> {
  // Press Escape multiple times to close any open popups/menus
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Escape');
    await delay(200);
  }
}

async function openFilterMenu(page: Page): Promise<boolean> {
  try {
    // Use Cmd/Ctrl + Shift + F to open filter
    // Or try clicking the filter button
    await dismissAllPopups(page);
    await delay(500);

    // Try keyboard shortcut first (Ctrl+Shift+F doesn't work in Notion)
    // So click the Filter button directly
    const filterBtn = page.locator('div:has-text("Filter")').filter({ hasText: /^Filter$/ }).first();
    if (await filterBtn.isVisible({ timeout: 3000 })) {
      await filterBtn.click({ force: true });
      await delay(800);
      return true;
    }

    // Try alternative
    const altBtn = page.locator('[role="button"]:has-text("Filter")').first();
    if (await altBtn.isVisible({ timeout: 2000 })) {
      await altBtn.click({ force: true });
      await delay(800);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function addFilterRule(page: Page, property: string, values: string[]): Promise<boolean> {
  try {
    console.log(`      Adding filter: ${property} = ${values.join(' or ')}`);

    // Click "Add a filter" button
    const addBtn = page.locator('text=Add a filter').first();
    if (await addBtn.isVisible({ timeout: 3000 })) {
      await addBtn.click({ force: true });
      await delay(800);
    } else {
      // Try alternative
      const altBtn = page.locator('div:has-text("Add filter")').first();
      if (await altBtn.isVisible({ timeout: 2000 })) {
        await altBtn.click({ force: true });
        await delay(800);
      } else {
        console.log('      Could not find Add filter button');
        return false;
      }
    }

    // Select property from the dropdown
    // Type to search for it
    await page.keyboard.type(property, { delay: 50 });
    await delay(500);

    // Press Enter to select
    await page.keyboard.press('Enter');
    await delay(800);

    // Now select the value(s)
    for (const value of values) {
      // Type to search for the value
      await page.keyboard.type(value, { delay: 50 });
      await delay(500);
      await page.keyboard.press('Enter');
      await delay(500);
    }

    // Close the filter menu
    await page.keyboard.press('Escape');
    await delay(300);

    return true;
  } catch (error) {
    console.log(`      Error:`, error);
    return false;
  }
}

async function setupViewFilter(page: Page, viewName: string, property: string, values: string[]): Promise<boolean> {
  console.log(`\n  Setting up filter for: ${viewName}`);

  try {
    // Find and click on the view tab
    // Views are typically shown as tabs at the top of the database
    const viewTab = page.locator(`div[role="tab"]:has-text("${viewName}"), div[role="button"]:has-text("${viewName}")`).first();

    if (await viewTab.isVisible({ timeout: 3000 })) {
      await viewTab.click();
      await delay(1500);
      console.log(`    Clicked on view: ${viewName}`);
    } else {
      // Try finding it in dropdown if too many views
      console.log(`    View tab "${viewName}" not directly visible, trying dropdown...`);

      // Look for "..." or more views button
      const moreBtn = page.locator('div[role="button"]:has-text("..."), div[role="button"]:has-text("more")').first();
      if (await moreBtn.isVisible({ timeout: 2000 })) {
        await moreBtn.click();
        await delay(800);

        const viewInDropdown = page.locator(`text="${viewName}"`).first();
        if (await viewInDropdown.isVisible({ timeout: 2000 })) {
          await viewInDropdown.click();
          await delay(1500);
          console.log(`    Clicked on view from dropdown: ${viewName}`);
        } else {
          console.log(`    Could not find view: ${viewName}`);
          return false;
        }
      } else {
        console.log(`    Could not find view: ${viewName}`);
        return false;
      }
    }

    // Open filter menu
    if (!await openFilterMenu(page)) {
      console.log(`    Could not open filter menu`);
      return false;
    }

    // Add the filter
    const success = await addFilterRule(page, property, values);

    // Close everything
    await dismissAllPopups(page);

    return success;
  } catch (error) {
    console.log(`    Error:`, error);
    return false;
  }
}

async function run(): Promise<void> {
  console.log('='.repeat(60));
  console.log('NOTION VIEW FILTER SETUP');
  console.log('='.repeat(60));

  const automationDataDir = path.join(__dirname, '..', '.playwright-profile');

  console.log('\nLaunching browser...');

  const context = await chromium.launchPersistentContext(automationDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1920, height: 1080 }
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    console.log('Opening database...\n');
    await page.goto(DATABASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(5000);

    await dismissAllPopups(page);
    await delay(1000);

    // Define all views and their filters
    const viewFilters = [
      { name: 'Inbox', property: 'Status', values: ['New'] },
      { name: 'Triage Queue', property: 'Status', values: ['New', 'Triaged'] },
      { name: 'This Week', property: 'Release Window', values: ['This Week'] },
      { name: 'Waiting on Client', property: 'Status', values: ['Waiting on Client'] },
      { name: 'Blocked', property: 'Status', values: ['Blocked'] },
      { name: 'Ready for Release', property: 'Status', values: ['Ready for Release'] },
      { name: 'Released', property: 'Status', values: ['Released'] },
      { name: 'Backlog', property: 'Release Window', values: ['Backlog'] }
    ];

    const results: Record<string, boolean> = {};

    for (const view of viewFilters) {
      results[view.name] = await setupViewFilter(page, view.name, view.property, view.values);
      await delay(1000);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));

    for (const [name, success] of Object.entries(results)) {
      console.log(`  ${success ? '[OK]' : '[--]'} ${name}`);
    }

    console.log('\nBrowser will stay open for 60 seconds for manual verification...');
    console.log('Check each view to confirm filters are applied correctly.');
    await delay(60000);

  } catch (error) {
    console.log('\n[ERROR]', error);
  } finally {
    await context.close();
  }
}

run().catch(console.error);
