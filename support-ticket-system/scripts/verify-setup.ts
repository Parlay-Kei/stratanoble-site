/**
 * Verify Setup Script
 * Run this to verify Notion and Slack credentials and configuration
 */

import { config } from 'dotenv';
import { Client } from '@notionhq/client';
import { WebClient } from '@slack/web-api';

config();

interface VerificationResult {
  service: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: VerificationResult[] = [];

async function verifyNotionConnection() {
  console.log('\n--- Verifying Notion Connection ---');

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token) {
    results.push({ service: 'Notion', status: 'fail', message: 'NOTION_TOKEN not set' });
    return;
  }

  if (!databaseId) {
    results.push({ service: 'Notion', status: 'fail', message: 'NOTION_DATABASE_ID not set' });
    return;
  }

  try {
    const notion = new Client({ auth: token });

    // Test connection by retrieving the database
    const database = await notion.databases.retrieve({ database_id: databaseId });

    console.log(`  Database found: ${(database as any).title?.[0]?.plain_text || 'Untitled'}`);
    results.push({ service: 'Notion', status: 'pass', message: 'Connected to database' });

    // Verify required properties exist
    const props = (database as any).properties;
    const requiredProps = [
      'Ticket', 'Client', 'Platform', 'Category', 'Severity',
      'Status', 'Impact', 'Urgency', 'Effort', 'Intake Source',
      'Slack Permalink', 'Release Window'
    ];

    const missingProps = requiredProps.filter(p => !props[p]);
    if (missingProps.length > 0) {
      results.push({
        service: 'Notion Schema',
        status: 'warn',
        message: `Missing properties: ${missingProps.join(', ')}`
      });
    } else {
      results.push({ service: 'Notion Schema', status: 'pass', message: 'All required properties present' });
    }

  } catch (error: any) {
    results.push({ service: 'Notion', status: 'fail', message: error.message });
  }
}

async function verifySlackConnection() {
  console.log('\n--- Verifying Slack Connection ---');

  const botToken = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!botToken) {
    results.push({ service: 'Slack', status: 'fail', message: 'SLACK_BOT_TOKEN not set' });
    return;
  }

  if (!signingSecret) {
    results.push({ service: 'Slack', status: 'warn', message: 'SLACK_SIGNING_SECRET not set' });
  }

  try {
    const slack = new WebClient(botToken);

    // Test connection
    const auth = await slack.auth.test();
    console.log(`  Bot user: ${auth.user}`);
    console.log(`  Team: ${auth.team}`);
    results.push({ service: 'Slack', status: 'pass', message: `Connected as ${auth.user}` });

    // Verify channel access
    const channels = [
      { name: 'DSLV Support', id: process.env.SLACK_SUPPORT_DSLV_CHANNEL_ID },
      { name: 'MsAudreys Support', id: process.env.SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID },
      { name: 'Ops Triage', id: process.env.SLACK_OPS_TRIAGE_CHANNEL_ID },
    ];

    for (const channel of channels) {
      if (!channel.id) {
        results.push({ service: `Slack ${channel.name}`, status: 'warn', message: 'Channel ID not set' });
        continue;
      }

      try {
        const info = await slack.conversations.info({ channel: channel.id });
        console.log(`  Channel ${channel.name}: ${(info.channel as any)?.name}`);
        results.push({ service: `Slack ${channel.name}`, status: 'pass', message: 'Channel accessible' });
      } catch (e: any) {
        results.push({ service: `Slack ${channel.name}`, status: 'fail', message: e.message });
      }
    }

  } catch (error: any) {
    results.push({ service: 'Slack', status: 'fail', message: error.message });
  }
}

async function main() {
  console.log('=== Support Ticket System Setup Verification ===\n');

  await verifyNotionConnection();
  await verifySlackConnection();

  // Print summary
  console.log('\n=== Verification Summary ===\n');

  const passed = results.filter(r => r.status === 'pass');
  const warnings = results.filter(r => r.status === 'warn');
  const failed = results.filter(r => r.status === 'fail');

  console.log(`Passed: ${passed.length}`);
  passed.forEach(r => console.log(`  [PASS] ${r.service}: ${r.message}`));

  if (warnings.length > 0) {
    console.log(`\nWarnings: ${warnings.length}`);
    warnings.forEach(r => console.log(`  [WARN] ${r.service}: ${r.message}`));
  }

  if (failed.length > 0) {
    console.log(`\nFailed: ${failed.length}`);
    failed.forEach(r => console.log(`  [FAIL] ${r.service}: ${r.message}`));
  }

  console.log('\n');

  if (failed.length > 0) {
    console.log('Setup verification FAILED. Please fix the issues above.');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('Setup verification completed with WARNINGS.');
    process.exit(0);
  } else {
    console.log('Setup verification PASSED!');
    process.exit(0);
  }
}

main();
