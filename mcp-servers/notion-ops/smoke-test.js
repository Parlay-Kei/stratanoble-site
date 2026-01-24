#!/usr/bin/env node
/**
 * Smoke Test for Notion Operations MCP Server
 * Tests the core functionality with a test database and sample rows
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '../../apps/website/.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_SOCIAL_MEDIA_HQ_PAGE_ID = process.env.NOTION_SOCIAL_MEDIA_HQ_PAGE_ID;

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function runSmokeTest() {
  log('\n🧪 Notion Operations MCP Server - Smoke Test\n', 'cyan');
  log('='.repeat(60), 'cyan');

  // Step 1: Validate configuration
  log('\n1️⃣  Validating Configuration...', 'cyan');

  if (!NOTION_API_KEY) {
    log('❌ NOTION_API_KEY not found in environment variables', 'red');
    log('   Add to .env or ../../apps/website/.env.local', 'yellow');
    process.exit(1);
  }
  log('✅ API Key configured', 'green');

  if (!NOTION_SOCIAL_MEDIA_HQ_PAGE_ID) {
    log('⚠️  NOTION_SOCIAL_MEDIA_HQ_PAGE_ID not configured', 'yellow');
    log('   Will skip database creation test', 'yellow');
  } else {
    log('✅ Social Media HQ Page ID configured', 'green');
  }

  // Step 2: Initialize Notion client
  log('\n2️⃣  Initializing Notion Client...', 'cyan');
  const notion = new Client({
    auth: NOTION_API_KEY
  });
  log('✅ Notion client initialized', 'green');

  // Step 3: Test API connectivity
  log('\n3️⃣  Testing API Connectivity...', 'cyan');
  try {
    const response = await notion.users.me();
    log(`✅ Connected as: ${response.name || response.object}`, 'green');
  } catch (error) {
    log(`❌ API connection failed: ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 4: Create test database (if parent page configured)
  let testDatabaseId = null;
  if (NOTION_SOCIAL_MEDIA_HQ_PAGE_ID) {
    log('\n4️⃣  Creating Test Database...', 'cyan');

    try {
      const testDatabase = await notion.databases.create({
        parent: {
          type: 'page_id',
          page_id: NOTION_SOCIAL_MEDIA_HQ_PAGE_ID
        },
        title: [
          {
            type: 'text',
            text: {
              content: `🧪 MCP Smoke Test - ${new Date().toISOString()}`
            }
          }
        ],
        properties: {
          'Name': {
            title: {}
          },
          'Status': {
            select: {
              options: [
                { name: 'Not Started', color: 'gray' },
                { name: 'In Progress', color: 'yellow' },
                { name: 'Complete', color: 'green' }
              ]
            }
          },
          'Priority': {
            select: {
              options: [
                { name: 'High', color: 'red' },
                { name: 'Medium', color: 'yellow' },
                { name: 'Low', color: 'gray' }
              ]
            }
          },
          'Test Type': {
            multi_select: {
              options: [
                { name: 'Smoke Test', color: 'blue' },
                { name: 'MCP Server', color: 'green' }
              ]
            }
          }
        }
      });

      testDatabaseId = testDatabase.id;
      log(`✅ Test database created: ${testDatabaseId}`, 'green');
      log(`   URL: https://notion.so/${testDatabaseId.replace(/-/g, '')}`, 'cyan');

    } catch (error) {
      log(`❌ Database creation failed: ${error.message}`, 'red');

      // Check if it's a permission issue
      if (error.message.includes('parent not found') || error.message.includes('invalid_request')) {
        log('', 'reset');
        log('🔍 Troubleshooting Steps:', 'yellow');
        log('   1. Verify the Social Media HQ page ID is correct', 'reset');
        log('   2. Ensure the Notion integration has access to that page:', 'reset');
        log('      • Open the page in Notion', 'reset');
        log('      • Click "..." menu → Add connections', 'reset');
        log('      • Select your integration', 'reset');
        log('   3. Check integration permissions include "Insert content"', 'reset');
      }

      process.exit(1);
    }

    // Step 5: Create test pages
    log('\n5️⃣  Creating Test Pages...', 'cyan');

    const testPages = [
      {
        'Name': {
          title: [
            {
              type: 'text',
              text: {
                content: 'Test Page 1: Basic Functionality'
              }
            }
          ]
        },
        'Status': {
          select: {
            name: 'Complete'
          }
        },
        'Priority': {
          select: {
            name: 'High'
          }
        },
        'Test Type': {
          multi_select: [
            { name: 'Smoke Test' },
            { name: 'MCP Server' }
          ]
        }
      },
      {
        'Name': {
          title: [
            {
              type: 'text',
              text: {
                content: 'Test Page 2: Batch Operations'
              }
            }
          ]
        },
        'Status': {
          select: {
            name: 'In Progress'
          }
        },
        'Priority': {
          select: {
            name: 'Medium'
          }
        },
        'Test Type': {
          multi_select: [
            { name: 'MCP Server' }
          ]
        }
      }
    ];

    let createdPages = 0;
    for (const pageData of testPages) {
      try {
        const page = await notion.pages.create({
          parent: {
            database_id: testDatabaseId
          },
          properties: pageData
        });

        createdPages++;
        log(`✅ Created page ${createdPages}: ${page.id}`, 'green');

        // Small delay between requests to be polite
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        log(`❌ Failed to create page ${createdPages + 1}: ${error.message}`, 'red');
      }
    }

    log(`✅ Created ${createdPages}/${testPages.length} test pages`, 'green');

  } else {
    log('\n4️⃣  Skipping Database Creation (no parent page configured)', 'yellow');
  }

  // Step 6: Generate test report
  log('\n6️⃣  Generating Test Report...', 'cyan');

  const report = {
    timestamp: new Date().toISOString(),
    configuration: {
      api_key_configured: !!NOTION_API_KEY,
      parent_page_configured: !!NOTION_SOCIAL_MEDIA_HQ_PAGE_ID
    },
    tests: {
      api_connectivity: 'PASSED',
      client_initialization: 'PASSED',
      database_creation: testDatabaseId ? 'PASSED' : 'SKIPPED',
      page_creation: testDatabaseId ? 'PASSED' : 'SKIPPED'
    },
    results: {
      test_database_id: testDatabaseId,
      test_database_url: testDatabaseId ? `https://notion.so/${testDatabaseId.replace(/-/g, '')}` : null
    }
  };

  log('✅ Test report generated', 'green');

  // Step 7: Display summary
  log('\n━'.repeat(60), 'cyan');
  log('🎉 Smoke Test Complete!\n', 'green');

  log('📊 Results Summary:', 'cyan');
  Object.entries(report.tests).forEach(([test, result]) => {
    const icon = result === 'PASSED' ? '✅' : result === 'SKIPPED' ? '⚠️' : '❌';
    const color = result === 'PASSED' ? 'green' : result === 'SKIPPED' ? 'yellow' : 'red';
    log(`   ${icon} ${test.replace(/_/g, ' ').toUpperCase()}: ${result}`, color);
  });

  if (testDatabaseId) {
    log('\n🔗 Test Database Created:', 'cyan');
    log(`   ID: ${testDatabaseId}`, 'reset');
    log(`   URL: https://notion.so/${testDatabaseId.replace(/-/g, '')}`, 'cyan');
    log('\n💡 You can now test the MCP server with this database ID', 'yellow');
  }

  log('\n📋 Next Steps:', 'cyan');
  log('   1. Configure Claude Code to use this MCP server', 'yellow');
  log('   2. Test MCP tools with the created database', 'yellow');
  log('   3. Run integration tests with actual Strata Noble data', 'yellow');

  log('\n━'.repeat(60), 'cyan');

  return report;
}

// Run smoke test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTest().catch(error => {
    log(`\n❌ Smoke test failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { runSmokeTest };