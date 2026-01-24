#!/usr/bin/env node
/**
 * Strata Noble Content System 30D - Production Deployment
 * Direct deployment using Notion API
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '../../apps/website/.env.local' });

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

const PARENT_PAGE_ID = process.env.NOTION_SOCIAL_MEDIA_HQ_PAGE_ID;

// Database schema
const SCHEMA = {
  'Name': { title: {} },
  'Status': {
    select: {
      options: [
        { name: 'Not Started', color: 'gray' },
        { name: 'In Progress', color: 'yellow' },
        { name: 'Complete', color: 'green' },
        { name: 'On Hold', color: 'red' },
        { name: 'Blocked', color: 'orange' }
      ]
    }
  },
  'Priority': {
    select: {
      options: [
        { name: 'Critical', color: 'red' },
        { name: 'High', color: 'orange' },
        { name: 'Medium', color: 'yellow' },
        { name: 'Low', color: 'gray' }
      ]
    }
  },
  'Due Date': { date: {} },
  'Week': {
    select: {
      options: [
        { name: 'Week 1', color: 'blue' },
        { name: 'Week 2', color: 'green' },
        { name: 'Week 3', color: 'purple' },
        { name: 'Week 4', color: 'orange' },
        { name: 'Ongoing', color: 'gray' }
      ]
    }
  },
  'Tags': {
    multi_select: {
      options: [
        { name: 'Social Media', color: 'blue' },
        { name: 'Content Creation', color: 'green' },
        { name: 'Strategy', color: 'purple' },
        { name: 'Analytics', color: 'orange' },
        { name: 'Community', color: 'pink' },
        { name: 'Automation', color: 'yellow' },
        { name: 'Research', color: 'gray' }
      ]
    }
  },
  'Assigned Team': {
    select: {
      options: [
        { name: 'Content Team', color: 'green' },
        { name: 'Social Team', color: 'blue' },
        { name: 'Analytics Team', color: 'orange' },
        { name: 'Strategy Team', color: 'purple' },
        { name: 'External', color: 'gray' }
      ]
    }
  },
  'Effort Hours': { number: { format: 'number' } },
  'Dependencies': { rich_text: {} },
  'Success Metrics': { rich_text: {} },
  'Platform Focus': {
    multi_select: {
      options: [
        { name: 'LinkedIn', color: 'blue' },
        { name: 'Twitter/X', color: 'default' },
        { name: 'Instagram', color: 'pink' },
        { name: 'Facebook', color: 'blue' },
        { name: 'TikTok', color: 'red' },
        { name: 'YouTube', color: 'red' },
        { name: 'Blog', color: 'green' }
      ]
    }
  },
  'Content Type': {
    select: {
      options: [
        { name: 'Post', color: 'blue' },
        { name: 'Story', color: 'green' },
        { name: 'Video', color: 'red' },
        { name: 'Article', color: 'purple' },
        { name: 'Carousel', color: 'orange' },
        { name: 'Poll', color: 'yellow' },
        { name: 'Live', color: 'pink' }
      ]
    }
  },
  'Automation Level': {
    select: {
      options: [
        { name: 'Manual', color: 'gray' },
        { name: 'Semi-Automated', color: 'yellow' },
        { name: 'Fully Automated', color: 'green' }
      ]
    }
  },
  'ROI Tracking': { checkbox: {} },
  'Notes': { rich_text: {} }
};

// Sample tasks for initial deployment
const INITIAL_TASKS = [
  {
    name: 'Week 1: Audit Current Social Presence',
    status: 'In Progress',
    priority: 'Critical',
    dueDate: '2026-01-24',
    week: 'Week 1',
    tags: ['Social Media', 'Analytics', 'Research'],
    team: 'Analytics Team',
    hours: 8,
    dependencies: 'Access to all social accounts',
    metrics: 'Complete audit document with recommendations',
    platforms: ['LinkedIn', 'Twitter/X', 'Instagram', 'Facebook']
  },
  {
    name: 'Week 1: Define Target Audience Personas',
    status: 'Not Started',
    priority: 'High',
    dueDate: '2026-01-25',
    week: 'Week 1',
    tags: ['Strategy', 'Research'],
    team: 'Strategy Team',
    hours: 6,
    dependencies: 'Market research completion',
    metrics: '3-5 detailed persona documents',
    platforms: ['LinkedIn', 'Twitter/X', 'Instagram']
  },
  {
    name: 'Week 1: Brand Voice & Tone Documentation',
    status: 'Not Started',
    priority: 'Critical',
    dueDate: '2026-01-27',
    week: 'Week 1',
    tags: ['Strategy', 'Content Creation'],
    team: 'Content Team',
    hours: 8,
    dependencies: 'Brand guidelines from leadership',
    metrics: 'Brand voice guide document',
    platforms: ['LinkedIn', 'Twitter/X', 'Instagram', 'Blog']
  }
];

async function createDatabase() {
  log('\n🏗️  Creating Strata Noble 30-Day Tracker Database...', 'cyan');

  try {
    const database = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: PARENT_PAGE_ID
      },
      title: [
        {
          type: 'text',
          text: {
            content: '🚀 Strata Noble 30-Day Social Media Tracker'
          }
        }
      ],
      properties: SCHEMA
    });

    log(`✅ Database created successfully!`, 'green');
    log(`   ID: ${database.id}`, 'cyan');
    log(`   URL: https://notion.so/${database.id.replace(/-/g, '')}`, 'blue');

    return database.id;
  } catch (error) {
    log(`❌ Database creation failed: ${error.message}`, 'red');
    throw error;
  }
}

async function createTasks(databaseId) {
  log('\n📝 Creating initial tasks...', 'cyan');

  let created = 0;
  for (const task of INITIAL_TASKS) {
    try {
      const page = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Name': {
            title: [{
              type: 'text',
              text: { content: task.name }
            }]
          },
          'Status': {
            select: { name: task.status }
          },
          'Priority': {
            select: { name: task.priority }
          },
          'Due Date': {
            date: { start: task.dueDate }
          },
          'Week': {
            select: { name: task.week }
          },
          'Tags': {
            multi_select: task.tags.map(tag => ({ name: tag }))
          },
          'Assigned Team': {
            select: { name: task.team }
          },
          'Effort Hours': {
            number: task.hours
          },
          'Dependencies': {
            rich_text: [{
              type: 'text',
              text: { content: task.dependencies }
            }]
          },
          'Success Metrics': {
            rich_text: [{
              type: 'text',
              text: { content: task.metrics }
            }]
          },
          'Platform Focus': {
            multi_select: task.platforms.map(p => ({ name: p }))
          }
        }
      });

      created++;
      log(`   ✅ Created: ${task.name}`, 'green');

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      log(`   ❌ Failed: ${task.name} - ${error.message}`, 'red');
    }
  }

  log(`\n✅ Created ${created}/${INITIAL_TASKS.length} tasks`, 'green');
  return created;
}

async function deploy() {
  log('\n🚀 STRATA NOBLE CONTENT SYSTEM 30D - PRODUCTION DEPLOYMENT', 'cyan');
  log('═'.repeat(70), 'cyan');

  const startTime = Date.now();

  try {
    // Test connection
    log('\n🔐 Testing API connection...', 'blue');
    const user = await notion.users.me();
    log(`✅ Connected as: ${user.name || user.type}`, 'green');

    // Create database
    const databaseId = await createDatabase();

    // Create initial tasks
    const tasksCreated = await createTasks(databaseId);

    // Success summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    log('\n' + '═'.repeat(70), 'cyan');
    log('🎉 DEPLOYMENT COMPLETE!', 'green');
    log('═'.repeat(70), 'cyan');

    log('\n📊 SUMMARY:', 'cyan');
    log(`   Database: Strata Noble 30-Day Tracker`, 'green');
    log(`   Properties: 15 comprehensive fields`, 'green');
    log(`   Tasks Created: ${tasksCreated} initial tasks`, 'green');
    log(`   Deployment Time: ${duration}s`, 'green');

    log('\n🔗 ACCESS YOUR DATABASE:', 'cyan');
    log(`   https://notion.so/${databaseId.replace(/-/g, '')}`, 'blue');

    log('\n📋 NEXT STEPS:', 'yellow');
    log('   1. Open database in Notion', 'reset');
    log('   2. Add remaining 28 tasks from CSV if needed', 'reset');
    log('   3. Configure views (Board, Timeline, Calendar)', 'reset');
    log('   4. Share with team members', 'reset');
    log('   5. Begin Week 1 execution', 'reset');

    // Save proof pack
    const proofPack = {
      timestamp: new Date().toISOString(),
      databaseId,
      databaseUrl: `https://notion.so/${databaseId.replace(/-/g, '')}`,
      tasksCreated,
      deploymentTime: duration,
      status: 'SUCCESS'
    };

    await fs.writeFile(
      join(__dirname, '../../.claude/proof-packs/strata-noble-content-system-30d/deployment-result.json'),
      JSON.stringify(proofPack, null, 2)
    );

    log('\n✅ Proof pack saved: deployment-result.json', 'green');

  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run deployment
deploy().catch(console.error);