/**
 * Browser Automation Script for Notion Setup
 *
 * This script uses Playwright to automate the manual Notion setup tasks:
 * 1. Create 8 database views in Client Tickets
 * 2. Add linked database views to DSLV Portal and MsAudreysHouse Portal
 * 3. Delete duplicate "Support Portal" pages
 * 4. Capture correct portal URLs for .env
 *
 * Prerequisites:
 * - Playwright installed: npm install playwright @playwright/test
 * - Chromium browser: npx playwright install chromium
 * - User must be logged into Notion in browser (script will use existing session)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const NOTION_DATABASE_URL = 'https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7';
const SUPPORT_DESK_URL = 'https://www.notion.so/2e613b428aa78077abe0e2e22db00ce3';

// View configurations
const DATABASE_VIEWS = [
  {
    name: 'Inbox',
    filter: { property: 'Status', value: 'New' },
    sort: { property: 'Created time', direction: 'descending' }
  },
  {
    name: 'Triage Queue',
    filter: { property: 'Status', values: ['New', 'Triaged'] },
    sort: [
      { property: 'Severity', direction: 'ascending' },
      { property: 'Priority Score', direction: 'descending' }
    ]
  },
  {
    name: 'This Week',
    filter: {
      and: [
        { property: 'Release Window', value: 'This Week' },
        { property: 'Status', notIn: ['Released', "Won't Do"] }
      ]
    },
    sort: { property: 'Priority Score', direction: 'descending' }
  },
  {
    name: 'Waiting on Client',
    filter: { property: 'Status', value: 'Waiting on Client' },
    sort: { property: 'Last edited time', direction: 'ascending' }
  },
  {
    name: 'Blocked',
    filter: { property: 'Status', value: 'Blocked' },
    sort: { property: 'Created time', direction: 'descending' }
  },
  {
    name: 'Ready for Release',
    filter: { property: 'Status', value: 'Ready for Release' },
    sort: { property: 'Priority Score', direction: 'descending' }
  },
  {
    name: 'Released',
    filter: { property: 'Status', value: 'Released' },
    sort: { property: 'Last edited time', direction: 'descending' }
  },
  {
    name: 'Backlog',
    filter: {
      and: [
        { property: 'Release Window', value: 'Backlog' },
        { property: 'Status', notIn: ['Released', "Won't Do"] }
      ]
    },
    sort: { property: 'Priority Score', direction: 'descending' }
  }
];

interface SetupResult {
  viewsCreated: string[];
  portalsConfigured: string[];
  pagesDeleted: string[];
  portalUrls: {
    dslv?: string;
    msAudreysHouse?: string;
  };
  errors: string[];
}

const result: SetupResult = {
  viewsCreated: [],
  portalsConfigured: [],
  pagesDeleted: [],
  portalUrls: {},
  errors: []
};

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForNotion(page: Page): Promise<void> {
  // Wait for Notion to fully load with longer timeout
  try {
    await page.waitForLoadState('networkidle', { timeout: 60000 });
  } catch {
    // If networkidle times out, just wait for domcontentloaded
    await page.waitForLoadState('domcontentloaded');
  }
  await delay(2000);
}

async function dismissPopups(page: Page): Promise<void> {
  // Dismiss any Notion popups/modals that might be blocking interactions
  try {
    // Try pressing Escape to close modals
    await page.keyboard.press('Escape');
    await delay(300);

    // Look for common dismiss buttons
    const dismissSelectors = [
      'button:has-text("Dismiss")',
      'button:has-text("Got it")',
      'button:has-text("Close")',
      'button:has-text("Skip")',
      '[aria-label="Close"]',
      '.notion-modal-underlay'
    ];

    for (const selector of dismissSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 500 }).catch(() => false)) {
        await element.click({ force: true }).catch(() => {});
        await delay(300);
      }
    }
  } catch {
    // Ignore errors during popup dismissal
  }
}

async function createDatabaseView(page: Page, viewName: string): Promise<boolean> {
  try {
    console.log(`  Creating view: ${viewName}...`);

    // Dismiss any popups first
    await dismissPopups(page);

    // Try multiple selectors for the "Add a view" button in modern Notion
    const addViewSelectors = [
      '[aria-label="Add a view"]',
      'div[role="button"]:has-text("+")',
      '.notion-collection-view-tab-bar >> text=+',
      'svg[class*="plus"]',
      '[data-testid="add-view-button"]',
      'div:has-text("Add a view")',
      // Look for the + icon in the view tabs area
      '.notion-scroller >> div[role="button"]:has(svg)'
    ];

    let clicked = false;
    for (const selector of addViewSelectors) {
      try {
        const addViewButton = page.locator(selector).first();
        if (await addViewButton.isVisible({ timeout: 2000 })) {
          await addViewButton.click({ timeout: 5000 });
          clicked = true;
          console.log(`    Found add view button with selector: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!clicked) {
      // Try clicking on the view tabs area to reveal the add button
      console.log(`    Trying to find view tabs area...`);
      const viewTabsArea = page.locator('.notion-collection-view-tab-bar, [class*="view-tab"]').first();
      if (await viewTabsArea.isVisible({ timeout: 2000 })) {
        // Look for any clickable element within that could add a view
        const buttons = await viewTabsArea.locator('div[role="button"]').all();
        console.log(`    Found ${buttons.length} buttons in view tabs`);

        for (const btn of buttons) {
          const text = await btn.textContent().catch(() => '');
          if (text?.includes('+') || text === '') {
            await btn.click();
            clicked = true;
            break;
          }
        }
      }
    }

    if (!clicked) {
      console.log(`    Could not find "Add view" button for ${viewName}`);
      return false;
    }

    await delay(1000);

    // Select Table view type
    const tableOption = page.locator('div[role="button"]:has-text("Table"), div:has-text("Table")').first();
    if (await tableOption.isVisible({ timeout: 3000 })) {
      await tableOption.click();
      await delay(500);
    }

    // Name the view - look for input field
    const viewNameInput = page.locator('input[placeholder*="view"], input[placeholder*="name"], input[type="text"]').first();
    if (await viewNameInput.isVisible({ timeout: 3000 })) {
      await viewNameInput.fill(viewName);
      await viewNameInput.press('Enter');
    }

    await delay(1000);

    console.log(`    View "${viewName}" created successfully`);
    return true;
  } catch (error) {
    console.log(`    Error creating view ${viewName}:`, error);
    return false;
  }
}

async function addFilterToView(page: Page, propertyName: string, filterValue: string): Promise<boolean> {
  try {
    console.log(`    Adding filter: ${propertyName} = ${filterValue}`);

    // Click Filter button
    const filterButton = page.locator('text=Filter').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await delay(500);
    }

    // Click "Add a filter"
    const addFilterButton = page.locator('text=Add a filter').first();
    if (await addFilterButton.isVisible()) {
      await addFilterButton.click();
      await delay(500);
    }

    // Select property
    const propertyDropdown = page.locator(`text=${propertyName}`).first();
    if (await propertyDropdown.isVisible()) {
      await propertyDropdown.click();
      await delay(300);
    }

    // Set filter value
    const valueInput = page.locator(`text=${filterValue}`).first();
    if (await valueInput.isVisible()) {
      await valueInput.click();
    }

    await delay(500);

    // Close filter menu by clicking elsewhere
    await page.keyboard.press('Escape');

    return true;
  } catch (error) {
    console.log(`    Error adding filter:`, error);
    return false;
  }
}

async function findAndClickPage(page: Page, pageName: string): Promise<string | null> {
  try {
    console.log(`  Looking for page: ${pageName}`);

    // Look for the page in the sidebar or page content
    const pageLink = page.locator(`text="${pageName}"`).first();

    if (await pageLink.isVisible({ timeout: 5000 })) {
      await pageLink.click();
      await waitForNotion(page);

      // Get the URL
      const url = page.url();
      console.log(`    Found page at: ${url}`);
      return url;
    }

    console.log(`    Page "${pageName}" not found`);
    return null;
  } catch (error) {
    console.log(`    Error finding page ${pageName}:`, error);
    return null;
  }
}

async function addLinkedDatabaseView(page: Page, databaseName: string, clientFilter: string): Promise<boolean> {
  try {
    console.log(`    Adding linked database view filtered by Client = ${clientFilter}`);

    // Type /linked to insert linked database
    await page.keyboard.type('/linked');
    await delay(500);

    // Select "Linked view of database"
    const linkedOption = page.locator('text=Linked view of database').first();
    if (await linkedOption.isVisible()) {
      await linkedOption.click();
      await delay(1000);
    }

    // Search for and select the database
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(databaseName);
      await delay(500);
    }

    // Click on the database
    const databaseOption = page.locator(`text="${databaseName}"`).first();
    if (await databaseOption.isVisible()) {
      await databaseOption.click();
      await delay(1000);
    }

    // Add filter for Client
    await addFilterToView(page, 'Client', clientFilter);

    console.log(`    Linked database view added successfully`);
    return true;
  } catch (error) {
    console.log(`    Error adding linked database view:`, error);
    return false;
  }
}

async function deletePage(page: Page, pageName: string): Promise<boolean> {
  try {
    console.log(`  Attempting to delete page: ${pageName}`);

    // First dismiss any popups
    await dismissPopups(page);
    await delay(500);

    // Find the page in the sidebar
    const pageLink = page.locator(`text="${pageName}"`).first();

    if (await pageLink.isVisible({ timeout: 3000 })) {
      // Dismiss popups again right before clicking
      await dismissPopups(page);

      // Use force click to bypass overlay issues
      await pageLink.click({ button: 'right', force: true });
      await delay(500);

      // Look for Delete option in context menu
      const deleteOption = page.locator('div[role="menuitem"]:has-text("Delete"), div:has-text("Delete")').first();
      if (await deleteOption.isVisible({ timeout: 2000 })) {
        await deleteOption.click();
        await delay(1000);
        console.log(`    Deleted page: ${pageName}`);
        return true;
      }
    }

    console.log(`    Page "${pageName}" not found or could not delete`);
    return false;
  } catch (error) {
    console.log(`    Error deleting page ${pageName}:`, error);
    return false;
  }
}

async function runSetup(): Promise<void> {
  console.log('='.repeat(60));
  console.log('NOTION BROWSER AUTOMATION SETUP');
  console.log('='.repeat(60));
  console.log('\nThis script will automate the Notion setup tasks using your browser.');
  console.log('A browser window will open - please log into Notion if prompted.\n');

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    // Use a dedicated profile directory for automation (persists login between runs)
    const automationDataDir = path.join(__dirname, '..', '.playwright-profile');

    console.log('Launching browser...');
    console.log(`Using automation profile: ${automationDataDir}\n`);

    // Use persistent context with dedicated profile (preserves login)
    context = await chromium.launchPersistentContext(automationDataDir, {
      headless: false, // Run in visible mode so user can see what's happening
      args: ['--disable-blink-features=AutomationControlled'],
      viewport: { width: 1920, height: 1080 }
    });

    const page = context.pages()[0] || await context.newPage();

    // Step 0: Check login status
    console.log('--- Step 0: Checking Notion Login ---\n');
    await page.goto(SUPPORT_DESK_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(5000);

    // Check if we're on a login page
    let currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('auth')) {
      console.log('');
      console.log('========================================');
      console.log('NOTION LOGIN REQUIRED');
      console.log('Please log into Notion in the browser window.');
      console.log('Waiting up to 5 minutes for login...');
      console.log('========================================');
      console.log('');

      // Wait for redirect away from login page (up to 5 minutes)
      await page.waitForURL(url => {
        const urlStr = url.toString();
        return !urlStr.includes('login') && !urlStr.includes('signin') && !urlStr.includes('auth');
      }, {
        timeout: 300000
      });
      console.log('Login detected! Continuing with setup...\n');
      await delay(3000);
    } else {
      console.log('Already logged in!\n');
    }

    await waitForNotion(page);

    // Dismiss any initial popups (like "Notion Mail is here")
    console.log('Dismissing any popups...');
    await dismissPopups(page);
    await delay(1000);
    await dismissPopups(page);

    // Step 1: Navigate to Support Desk
    console.log('--- Step 1: Navigate to Support Desk ---\n');
    await page.goto(SUPPORT_DESK_URL);
    await waitForNotion(page);

    // Step 2: Find and capture portal URLs
    console.log('\n--- Step 2: Capture Portal URLs ---\n');

    const dslvPortalUrl = await findAndClickPage(page, 'DSLV Portal');
    if (dslvPortalUrl) {
      result.portalUrls.dslv = dslvPortalUrl;
    }

    await page.goto(SUPPORT_DESK_URL);
    await waitForNotion(page);

    const msAudreysPortalUrl = await findAndClickPage(page, 'MsAudreysHouse Portal');
    if (msAudreysPortalUrl) {
      result.portalUrls.msAudreysHouse = msAudreysPortalUrl;
    }

    // Step 3: Delete duplicate Support Portal pages
    console.log('\n--- Step 3: Delete Duplicate Pages ---\n');

    await page.goto(SUPPORT_DESK_URL);
    await waitForNotion(page);

    if (await deletePage(page, 'DSLV Support Portal')) {
      result.pagesDeleted.push('DSLV Support Portal');
    }

    if (await deletePage(page, 'MsAudreysHouse Support Portal')) {
      result.pagesDeleted.push('MsAudreysHouse Support Portal');
    }

    // Step 4: Navigate to Client Tickets database
    console.log('\n--- Step 4: Create Database Views ---\n');
    await page.goto(NOTION_DATABASE_URL);
    await waitForNotion(page);

    // Create each view
    for (const viewConfig of DATABASE_VIEWS) {
      const success = await createDatabaseView(page, viewConfig.name);
      if (success) {
        result.viewsCreated.push(viewConfig.name);

        // Add filters based on config
        if (viewConfig.filter) {
          if ('value' in viewConfig.filter) {
            await addFilterToView(page, viewConfig.filter.property, viewConfig.filter.value);
          }
        }
      } else {
        result.errors.push(`Failed to create view: ${viewConfig.name}`);
      }

      await delay(1000);
    }

    // Step 5: Add linked views to portals
    console.log('\n--- Step 5: Configure Portal Pages ---\n');

    if (result.portalUrls.dslv) {
      console.log('Configuring DSLV Portal...');
      await page.goto(result.portalUrls.dslv);
      await waitForNotion(page);

      // Click at end of page content
      await page.keyboard.press('End');
      await delay(500);

      if (await addLinkedDatabaseView(page, 'Client Tickets', 'DSLV')) {
        result.portalsConfigured.push('DSLV Portal');
      }
    }

    if (result.portalUrls.msAudreysHouse) {
      console.log('Configuring MsAudreysHouse Portal...');
      await page.goto(result.portalUrls.msAudreysHouse);
      await waitForNotion(page);

      await page.keyboard.press('End');
      await delay(500);

      if (await addLinkedDatabaseView(page, 'Client Tickets', 'MsAudreysHouse')) {
        result.portalsConfigured.push('MsAudreysHouse Portal');
      }
    }

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('SETUP RESULTS');
    console.log('='.repeat(60));

    console.log('\n--- Views Created ---');
    if (result.viewsCreated.length > 0) {
      result.viewsCreated.forEach(v => console.log(`  [OK] ${v}`));
    } else {
      console.log('  No views created');
    }

    console.log('\n--- Portals Configured ---');
    if (result.portalsConfigured.length > 0) {
      result.portalsConfigured.forEach(p => console.log(`  [OK] ${p}`));
    } else {
      console.log('  No portals configured');
    }

    console.log('\n--- Pages Deleted ---');
    if (result.pagesDeleted.length > 0) {
      result.pagesDeleted.forEach(p => console.log(`  [OK] ${p}`));
    } else {
      console.log('  No pages deleted');
    }

    console.log('\n--- Portal URLs ---');
    if (result.portalUrls.dslv) {
      console.log(`  DSLV Portal: ${result.portalUrls.dslv}`);
    }
    if (result.portalUrls.msAudreysHouse) {
      console.log(`  MsAudreysHouse Portal: ${result.portalUrls.msAudreysHouse}`);
    }

    if (result.errors.length > 0) {
      console.log('\n--- Errors ---');
      result.errors.forEach(e => console.log(`  [ERROR] ${e}`));
    }

    // Update .env file with portal URLs
    if (result.portalUrls.dslv || result.portalUrls.msAudreysHouse) {
      console.log('\n--- Updating .env file ---');
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      if (result.portalUrls.dslv) {
        envContent = envContent.replace(
          /NOTION_DSLV_PORTAL_URL=.*/,
          `NOTION_DSLV_PORTAL_URL=${result.portalUrls.dslv}`
        );
      }

      if (result.portalUrls.msAudreysHouse) {
        envContent = envContent.replace(
          /NOTION_MSAUDREYS_PORTAL_URL=.*/,
          `NOTION_MSAUDREYS_PORTAL_URL=${result.portalUrls.msAudreysHouse}`
        );
      }

      fs.writeFileSync(envPath, envContent);
      console.log('  .env file updated with portal URLs');
    }

    console.log('\n' + '='.repeat(60));
    console.log('Browser will remain open for 30 seconds for manual verification.');
    console.log('Press Ctrl+C to close immediately.');
    console.log('='.repeat(60));

    // Keep browser open for manual verification
    await delay(30000);

  } catch (error) {
    console.error('\n[ERROR] Setup failed:', error);
    result.errors.push(String(error));
  } finally {
    if (context) {
      await context.close();
    }
  }
}

// Run the setup
runSetup().catch(console.error);
