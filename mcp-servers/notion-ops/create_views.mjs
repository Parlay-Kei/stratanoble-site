#!/usr/bin/env node
/**
 * Create/Update Views for Strata Noble Content System
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = '2f213b42-8aa7-81e3-9558-f0c6accc1c67';

async function updateDatabaseViews() {
  log('\n🔧 Configuring database views...', 'cyan');

  try {
    // Note: Notion API doesn't directly support creating views
    // Views need to be created manually in Notion UI
    // This script provides instructions

    log('\n📋 Views to create in Notion:', 'yellow');

    log('\n1. THIS WEEK VIEW', 'magenta');
    log('   Filter: Publish Date → This Week', 'blue');
    log('   Sort: Publish Date → Ascending', 'blue');
    log('   Group: Platform', 'blue');

    log('\n2. NEEDS RECORDING VIEW', 'magenta');
    log('   Filter: Platform = TikTok AND Status = Script Ready', 'blue');
    log('   Sort: Publish Date → Ascending', 'blue');
    log('   Group: Recording Block', 'blue');

    log('\n3. NEEDS POSTING VIEW', 'magenta');
    log('   Filter: Status = Script Ready OR Status = Recorded', 'blue');
    log('   Sort: Publish Date → Ascending', 'blue');
    log('   Group: Platform', 'blue');

    log('\n4. PAIRS VIEW', 'magenta');
    log('   Group: Pair ID', 'blue');
    log('   Sort: Pair ID → Ascending, then Platform', 'blue');

    log('\n5. CALENDAR VIEW', 'magenta');
    log('   View Type: Calendar', 'blue');
    log('   Date Property: Publish Date', 'blue');
    log('   Show: Platform, Status, Pair ID', 'blue');

    log('\n📝 Manual Setup Instructions:', 'yellow');
    log('1. Open your Notion database: https://notion.so/' + DATABASE_ID, 'cyan');
    log('2. Click "Add a view" button', 'cyan');
    log('3. Create each view with the settings above', 'cyan');
    log('4. Save each view with the specified name', 'cyan');

    // Verify database properties exist
    const database = await notion.databases.retrieve({ database_id: DATABASE_ID });

    const requiredProps = ['Platform', 'Pillar', 'Pair ID', 'Publish Date', 'Status', 'Recording Block'];
    const existingProps = Object.keys(database.properties);

    log('\n✅ Property verification:', 'green');
    for (const prop of requiredProps) {
      if (existingProps.includes(prop)) {
        log(`   ✓ ${prop}`, 'green');
      } else {
        log(`   ✗ ${prop} - MISSING`, 'red');
      }
    }

    return true;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🎯 DATABASE VIEW CONFIGURATION', 'cyan');
  log('=' .repeat(50), 'blue');

  const success = await updateDatabaseViews();

  if (success) {
    log('\n' + '=' .repeat(50), 'green');
    log('✅ View configuration instructions provided!', 'green');
    log('\nNext Steps:', 'yellow');
    log('1. Open Notion and create the views manually', 'cyan');
    log('2. Test each view to ensure filters work correctly', 'cyan');
    log('3. Pin frequently used views for easy access', 'cyan');
  }
}

main();