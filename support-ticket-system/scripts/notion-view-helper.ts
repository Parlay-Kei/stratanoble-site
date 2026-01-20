/**
 * Notion View Setup Helper
 *
 * This opens Notion and provides step-by-step instructions
 * for creating the views manually.
 */

import { chromium } from 'playwright';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = 'https://www.notion.so/2e613b428aa7813d81d6cd4e0f8377a7';

const VIEWS = [
  { name: 'Inbox', filter: 'Status is New' },
  { name: 'Triage Queue', filter: 'Status is New OR Triaged' },
  { name: 'This Week', filter: 'Release Window is This Week' },
  { name: 'Waiting on Client', filter: 'Status is Waiting on Client' },
  { name: 'Blocked', filter: 'Status is Blocked' },
  { name: 'Ready for Release', filter: 'Status is Ready for Release' },
  { name: 'Released', filter: 'Status is Released' },
  { name: 'Backlog', filter: 'Release Window is Backlog' }
];

function ask(question: string): Promise<string> {
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

async function run(): Promise<void> {
  console.log('='.repeat(60));
  console.log('NOTION VIEW SETUP HELPER');
  console.log('='.repeat(60));
  console.log('\nThis will open Notion and guide you through creating views.\n');

  const automationDataDir = path.join(__dirname, '..', '.playwright-profile');

  const context = await chromium.launchPersistentContext(automationDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1400, height: 900 }
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    console.log('Opening Notion...');
    console.log('If prompted, please log into Notion in the browser.\n');

    await page.goto(DATABASE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });

    await ask('Press ENTER once you are logged into Notion and can see the Client Tickets database...');

    console.log('\n' + '='.repeat(60));
    console.log('HOW TO CREATE VIEWS');
    console.log('='.repeat(60));
    console.log(`
To create each view:

1. Click the dropdown arrow next to "Default view" (or current view name)
2. Click "Add a view"
3. Select "Table" as the view type
4. Type the view name
5. Press Enter
6. Click "Filter" in the toolbar
7. Click "Add a filter"
8. Select the property and value as specified below
9. Click outside the filter menu to close it

`);

    for (let i = 0; i < VIEWS.length; i++) {
      const view = VIEWS[i];
      console.log('-'.repeat(50));
      console.log(`\nVIEW ${i + 1} of ${VIEWS.length}: ${view.name}`);
      console.log(`Filter: ${view.filter}`);
      console.log('\nSteps:');
      console.log('  1. Click dropdown next to current view name');
      console.log('  2. Click "Add a view"');
      console.log('  3. Select "Table"');
      console.log(`  4. Type: ${view.name}`);
      console.log('  5. Press Enter');
      console.log('  6. Click "Filter" button');
      console.log('  7. Click "Add a filter"');
      console.log(`  8. Set filter: ${view.filter}`);
      console.log('');

      await ask(`Press ENTER when you've created the "${view.name}" view...`);
      console.log(`  [OK] ${view.name} created\n`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('ALL VIEWS CREATED!');
    console.log('='.repeat(60));
    console.log('\nViews you should now have:');
    for (const view of VIEWS) {
      console.log(`  - ${view.name} (${view.filter})`);
    }

    console.log('\nThe browser will close in 30 seconds.');
    console.log('You can close it manually or wait.\n');

    await new Promise(r => setTimeout(r, 30000));

  } catch (error) {
    console.log('\nError:', error);
  } finally {
    await context.close();
  }
}

run().catch(console.error);
