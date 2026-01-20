/**
 * Finalize Setup Script
 *
 * This script completes the remaining setup tasks:
 * 1. Updates Notion database Status property with all required options
 * 2. Verifies/Updates Client property options
 * 3. Creates a test ticket in Notion
 * 4. Posts test messages to Slack channels
 *
 * Run with: npx tsx scripts/finalize-setup.ts
 */

import { config } from 'dotenv';
import { Client } from '@notionhq/client';
import { WebClient } from '@slack/web-api';

config();

// Configuration from environment
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '2e613b42-8aa7-813d-81d6-cd4e0f8377a7';
const SLACK_SUPPORT_DSLV_CHANNEL_ID = process.env.SLACK_SUPPORT_DSLV_CHANNEL_ID || 'C0A833HKC5T';
const SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID = process.env.SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID || 'C0A80521RGT';

// Required Status options
const REQUIRED_STATUS_OPTIONS = [
  'New',
  'Triaged',
  'In Progress',
  'Blocked',
  'Waiting on Client',
  'Ready for Release',
  'Released',
  "Won't Do"
];

// Required Client options
const REQUIRED_CLIENT_OPTIONS = [
  'DSLV',
  'MsAudreysHouse',
  'Strata Noble',
  'Other'
];

interface SetupResult {
  statusPropertyUpdated: boolean;
  clientPropertyUpdated: boolean;
  testTicketCreated: boolean;
  testTicketUrl?: string;
  slackMessagesDslv: boolean;
  slackMessagesMsAudreys: boolean;
  errors: string[];
}

const result: SetupResult = {
  statusPropertyUpdated: false,
  clientPropertyUpdated: false,
  testTicketCreated: false,
  slackMessagesDslv: false,
  slackMessagesMsAudreys: false,
  errors: []
};

function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error('NOTION_TOKEN environment variable is required');
  }
  return new Client({ auth: token });
}

function getSlackClient(): WebClient {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error('SLACK_BOT_TOKEN environment variable is required');
  }
  return new WebClient(token);
}

async function getDatabaseSchema(notion: Client): Promise<any> {
  console.log('\n--- Retrieving Current Database Schema ---');
  const database = await notion.databases.retrieve({
    database_id: NOTION_DATABASE_ID
  });
  return database;
}

async function updateStatusProperty(notion: Client): Promise<void> {
  console.log('\n--- Task 1: Updating Status Property ---');

  try {
    // Note: Notion API has limitations on updating status properties
    // Status properties cannot be directly modified via API - they must be
    // configured in the Notion UI. However, we can verify the current options.

    const database = await getDatabaseSchema(notion);
    const statusProp = database.properties['Status'];

    if (!statusProp) {
      console.log('  WARNING: Status property not found in database');
      result.errors.push('Status property not found in database');
      return;
    }

    console.log('  Current Status property type:', statusProp.type);

    if (statusProp.type === 'status') {
      const currentOptions = statusProp.status?.options || [];
      const currentNames = currentOptions.map((opt: any) => opt.name);

      console.log('  Current Status options:', currentNames);

      const missingOptions = REQUIRED_STATUS_OPTIONS.filter(
        opt => !currentNames.includes(opt)
      );

      if (missingOptions.length > 0) {
        console.log('  Missing Status options:', missingOptions);
        console.log('\n  NOTE: Status property options cannot be modified via API.');
        console.log('  Please add these options manually in Notion:');
        missingOptions.forEach(opt => console.log(`    - ${opt}`));
        result.errors.push(`Missing Status options (add manually): ${missingOptions.join(', ')}`);
      } else {
        console.log('  All required Status options are present');
        result.statusPropertyUpdated = true;
      }
    } else {
      // If it's a select property, we can try to update it
      console.log('  Status is a select property, attempting to update...');

      try {
        await notion.databases.update({
          database_id: NOTION_DATABASE_ID,
          properties: {
            'Status': {
              select: {
                options: REQUIRED_STATUS_OPTIONS.map((name, index) => ({
                  name,
                  color: ['gray', 'blue', 'yellow', 'red', 'orange', 'green', 'green', 'gray'][index] as any
                }))
              }
            }
          }
        });
        console.log('  Status property updated successfully');
        result.statusPropertyUpdated = true;
      } catch (error: any) {
        console.log('  Could not update Status property:', error.message);
        result.errors.push(`Could not update Status property: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('  Error checking Status property:', error.message);
    result.errors.push(`Status property error: ${error.message}`);
  }
}

async function updateClientProperty(notion: Client): Promise<void> {
  console.log('\n--- Task 2: Verifying/Updating Client Property ---');

  try {
    const database = await getDatabaseSchema(notion);
    const clientProp = database.properties['Client'];

    if (!clientProp) {
      console.log('  WARNING: Client property not found in database');
      result.errors.push('Client property not found in database');
      return;
    }

    console.log('  Current Client property type:', clientProp.type);

    if (clientProp.type === 'select') {
      const currentOptions = clientProp.select?.options || [];
      const currentNames = currentOptions.map((opt: any) => opt.name);

      console.log('  Current Client options:', currentNames);

      const missingOptions = REQUIRED_CLIENT_OPTIONS.filter(
        opt => !currentNames.includes(opt)
      );

      if (missingOptions.length > 0) {
        console.log('  Adding missing Client options:', missingOptions);

        // Merge existing options with new ones
        const allOptions = [
          ...currentOptions.map((opt: any) => ({ name: opt.name, color: opt.color })),
          ...missingOptions.map(name => ({ name, color: 'default' as any }))
        ];

        try {
          await notion.databases.update({
            database_id: NOTION_DATABASE_ID,
            properties: {
              'Client': {
                select: {
                  options: allOptions
                }
              }
            }
          });
          console.log('  Client property updated successfully');
          result.clientPropertyUpdated = true;
        } catch (error: any) {
          console.log('  Could not update Client property:', error.message);
          result.errors.push(`Could not update Client property: ${error.message}`);
        }
      } else {
        console.log('  All required Client options are present');
        result.clientPropertyUpdated = true;
      }
    } else {
      console.log('  Client property is not a select type, skipping update');
      result.errors.push('Client property is not a select type');
    }
  } catch (error: any) {
    console.error('  Error checking Client property:', error.message);
    result.errors.push(`Client property error: ${error.message}`);
  }
}

async function createTestTicket(notion: Client): Promise<void> {
  console.log('\n--- Task 3: Creating Test Ticket ---');

  try {
    const testTicket = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Ticket': {
          title: [{ text: { content: '[TEST] System Verification' } }]
        },
        'Client': {
          select: { name: 'DSLV' }
        },
        'Status': {
          status: { name: 'New' }
        },
        'Severity': {
          select: { name: 'S4 Low' }
        },
        'Category': {
          select: { name: 'Question' }
        },
        'Platform': {
          select: { name: 'DSLV' }
        },
        'Impact': {
          number: 1
        },
        'Urgency': {
          number: 1
        },
        'Effort': {
          number: 1
        },
        'Intake Source': {
          select: { name: 'Slack' }
        },
        'Notes': {
          rich_text: [{
            text: {
              content: `System verification ticket created at ${new Date().toISOString()}. This ticket confirms the Notion integration is working correctly. Safe to delete after verification.`
            }
          }]
        }
      }
    };

    console.log('  Creating ticket with title: "[TEST] System Verification"');
    console.log('  Client: DSLV');
    console.log('  Status: New');
    console.log('  Severity: S4 Low');

    const response = await notion.pages.create(testTicket);

    result.testTicketCreated = true;
    result.testTicketUrl = response.url;

    console.log('  Test ticket created successfully!');
    console.log(`  Ticket URL: ${response.url}`);
    console.log(`  Page ID: ${response.id}`);

  } catch (error: any) {
    console.error('  Error creating test ticket:', error.message);
    result.errors.push(`Test ticket error: ${error.message}`);

    // If status is the issue, try without status
    if (error.message.includes('status')) {
      console.log('\n  Retrying without status property...');
      try {
        const testTicketNoStatus = {
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            'Ticket': {
              title: [{ text: { content: '[TEST] System Verification' } }]
            },
            'Client': {
              select: { name: 'DSLV' }
            },
            'Severity': {
              select: { name: 'S4 Low' }
            },
            'Category': {
              select: { name: 'Question' }
            },
            'Platform': {
              select: { name: 'DSLV' }
            },
            'Impact': {
              number: 1
            },
            'Urgency': {
              number: 1
            },
            'Notes': {
              rich_text: [{
                text: {
                  content: `System verification ticket created at ${new Date().toISOString()}. Safe to delete.`
                }
              }]
            }
          }
        };

        const response = await notion.pages.create(testTicketNoStatus);
        result.testTicketCreated = true;
        result.testTicketUrl = response.url;
        console.log('  Test ticket created (without explicit status)');
        console.log(`  Ticket URL: ${response.url}`);
      } catch (retryError: any) {
        console.error('  Retry also failed:', retryError.message);
      }
    }
  }
}

async function postSlackTestMessages(slack: WebClient): Promise<void> {
  console.log('\n--- Task 4: Posting Slack Test Messages ---');

  // Test message for DSLV channel
  try {
    console.log(`  Posting to #support-dslv (${SLACK_SUPPORT_DSLV_CHANNEL_ID})...`);

    await slack.chat.postMessage({
      channel: SLACK_SUPPORT_DSLV_CHANNEL_ID,
      text: 'System verification complete. Create Ticket shortcut is ready.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*System verification complete.* :white_check_mark:\n\nThe Create Ticket shortcut is ready to use.\n\nTo create a ticket:\n1. Hover over any message\n2. Click the three dots menu (...)\n3. Select "Create Ticket"'
          }
        }
      ]
    });

    result.slackMessagesDslv = true;
    console.log('  Message posted to #support-dslv successfully');
  } catch (error: any) {
    console.error('  Error posting to #support-dslv:', error.message);
    result.errors.push(`Slack DSLV error: ${error.message}`);
  }

  // Test message for MsAudreysHouse channel
  try {
    console.log(`  Posting to #support-msaudreyshouse (${SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID})...`);

    await slack.chat.postMessage({
      channel: SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID,
      text: 'System verification complete. Create Ticket shortcut is ready.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*System verification complete.* :white_check_mark:\n\nThe Create Ticket shortcut is ready to use.\n\nTo create a ticket:\n1. Hover over any message\n2. Click the three dots menu (...)\n3. Select "Create Ticket"'
          }
        }
      ]
    });

    result.slackMessagesMsAudreys = true;
    console.log('  Message posted to #support-msaudreyshouse successfully');
  } catch (error: any) {
    console.error('  Error posting to #support-msaudreyshouse:', error.message);
    result.errors.push(`Slack MsAudreys error: ${error.message}`);
  }
}

function printSummary(): void {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('FINALIZE SETUP - SUMMARY');
  console.log('='.repeat(60));

  console.log('\n--- Results ---');
  console.log(`1. Status Property: ${result.statusPropertyUpdated ? 'VERIFIED/UPDATED' : 'NEEDS MANUAL UPDATE'}`);
  console.log(`2. Client Property: ${result.clientPropertyUpdated ? 'VERIFIED/UPDATED' : 'NEEDS MANUAL UPDATE'}`);
  console.log(`3. Test Ticket: ${result.testTicketCreated ? 'CREATED' : 'FAILED'}`);
  if (result.testTicketUrl) {
    console.log(`   URL: ${result.testTicketUrl}`);
  }
  console.log(`4. Slack #support-dslv: ${result.slackMessagesDslv ? 'MESSAGE POSTED' : 'FAILED'}`);
  console.log(`5. Slack #support-msaudreyshouse: ${result.slackMessagesMsAudreys ? 'MESSAGE POSTED' : 'FAILED'}`);

  if (result.errors.length > 0) {
    console.log('\n--- Errors Encountered ---');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  const allSuccess = result.statusPropertyUpdated &&
                     result.clientPropertyUpdated &&
                     result.testTicketCreated &&
                     result.slackMessagesDslv &&
                     result.slackMessagesMsAudreys;

  console.log('\n--- Overall Status ---');
  if (allSuccess) {
    console.log('ALL TASKS COMPLETED SUCCESSFULLY');
  } else {
    console.log('SOME TASKS REQUIRE ATTENTION');
  }

  console.log('\n' + '='.repeat(60));
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('SUPPORT TICKET SYSTEM - FINALIZE SETUP');
  console.log('='.repeat(60));
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`Database ID: ${NOTION_DATABASE_ID}`);
  console.log(`DSLV Channel: ${SLACK_SUPPORT_DSLV_CHANNEL_ID}`);
  console.log(`MsAudreys Channel: ${SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID}`);

  try {
    const notion = getNotionClient();
    const slack = getSlackClient();

    // Verify connections
    console.log('\n--- Verifying Connections ---');

    const slackAuth = await slack.auth.test();
    console.log(`Slack: Connected as ${slackAuth.user} in workspace ${slackAuth.team}`);

    const notionUser = await notion.users.me({});
    console.log(`Notion: Connected as ${notionUser.name || 'Integration'}`);

    // Execute tasks
    await updateStatusProperty(notion);
    await updateClientProperty(notion);
    await createTestTicket(notion);
    await postSlackTestMessages(slack);

    // Print summary
    printSummary();

  } catch (error: any) {
    console.error('\n[FATAL ERROR]:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
