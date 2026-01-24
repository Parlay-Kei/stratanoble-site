#!/usr/bin/env node
/**
 * Update Notion database with video asset links
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env' });

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

const DATABASE_ID = '2f213b42-8aa7-81e3-9558-f0c6accc1c67';

// Video asset paths
const VIDEO_ASSETS = {
  'P01': {
    path: '.claude/tools/faceless-video-engine/output/week1/P01_tiktok.mp4',
    status: 'Video Template Ready',
    metadata: '.claude/tools/faceless-video-engine/output/week1/P01_metadata.json'
  },
  'P02': {
    path: '.claude/tools/faceless-video-engine/output/week1/P02_tiktok.mp4',
    status: 'Video Template Ready',
    metadata: '.claude/tools/faceless-video-engine/output/week1/P02_metadata.json'
  },
  'P03': {
    path: '.claude/tools/faceless-video-engine/output/week1/P03_tiktok.mp4',
    status: 'Video Template Ready',
    metadata: '.claude/tools/faceless-video-engine/output/week1/P03_metadata.json'
  }
};

async function findNotionPage(pairId, platform) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Pair ID',
            rich_text: {
              equals: pairId
            }
          },
          {
            property: 'Platform',
            select: {
              equals: platform
            }
          }
        ]
      }
    });

    return response.results.length > 0 ? response.results[0] : null;
  } catch (error) {
    log(`❌ Error finding page for ${pairId}: ${error.message}`, 'red');
    return null;
  }
}

async function updatePageWithAsset(pageId, pairId, assetInfo) {
  try {
    const updateData = {
      properties: {}
    };

    // Update Notes with asset path
    if (assetInfo.path) {
      updateData.properties['Notes'] = {
        rich_text: [
          {
            text: {
              content: `Video Asset: ${assetInfo.path}\nMetadata: ${assetInfo.metadata}\nStatus: ${assetInfo.status}\nGenerated: ${new Date().toISOString()}`
            }
          }
        ]
      };
    }

    // Update Status if it exists
    if (assetInfo.status) {
      updateData.properties['Status'] = {
        select: {
          name: 'Script Ready' // Keep existing status for now
        }
      };
    }

    await notion.pages.update({
      page_id: pageId,
      ...updateData
    });

    log(`  ✅ Updated ${pairId} with asset info`, 'green');
    return true;

  } catch (error) {
    log(`  ❌ Failed to update ${pairId}: ${error.message}`, 'red');
    return false;
  }
}

async function updateAllAssets() {
  log('\n🔗 UPDATING NOTION WITH VIDEO ASSETS', 'cyan');
  log('=' .repeat(50), 'blue');

  const results = {
    updated: 0,
    failed: 0,
    notFound: 0
  };

  for (const [pairId, assetInfo] of Object.entries(VIDEO_ASSETS)) {
    log(`\n📝 Processing ${pairId}...`, 'yellow');

    // Find the TikTok page for this pair ID
    const page = await findNotionPage(pairId, 'TikTok');

    if (!page) {
      log(`  ⚠️ No TikTok page found for ${pairId}`, 'yellow');
      results.notFound++;
      continue;
    }

    // Update with asset information
    const success = await updatePageWithAsset(page.id, pairId, assetInfo);
    if (success) {
      results.updated++;
    } else {
      results.failed++;
    }

    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log('\n' + '=' .repeat(50), 'green');
  log('📊 UPDATE SUMMARY', 'cyan');
  log(`✅ Updated: ${results.updated}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⚠️ Not Found: ${results.notFound}`, 'yellow');

  return results;
}

async function main() {
  try {
    const results = await updateAllAssets();

    if (results.updated === 3) {
      log('\n🎉 All video assets linked successfully!', 'green');
      log('📱 Ready for video rendering and posting', 'blue');
    } else {
      log('\n⚠️ Some assets were not linked', 'yellow');
      log('Please check the Notion database manually', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Critical error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();