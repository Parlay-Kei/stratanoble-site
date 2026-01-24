#!/usr/bin/env node
/**
 * Batch render Week 1 videos (P01-P03)
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment for Notion integration
dotenv.config({ path: path.join(__dirname, '../../notion-ops/.env') });

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

// Initialize Notion client if available
let notion = null;
if (process.env.NOTION_API_KEY) {
  notion = new Client({
    auth: process.env.NOTION_API_KEY
  });
}

const DATABASE_ID = '2f213b42-8aa7-81e3-9558-f0c6accc1c67';

async function renderVideo(compositionId, bundleUrl) {
  try {
    log(`\n🎬 Rendering ${compositionId}...`, 'cyan');

    const inputProps = {};
    const composition = await selectComposition({
      serveUrl: bundleUrl,
      id: compositionId,
      inputProps,
    });

    const outputDir = path.join(__dirname, 'output', 'week1');
    const outputPath = path.join(outputDir, `${compositionId}_tiktok.mp4`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await renderMedia({
      composition,
      serveUrl: bundleUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
      chromiumOptions: {
        disableWebSecurity: true,
      },
      imageFormat: 'jpeg',
      pixelFormat: 'yuv420p',
      onProgress: ({ progress }) => {
        const percentage = Math.round(progress * 100);
        process.stdout.write(`\r  ${compositionId}: ${percentage}%`);
      },
    });

    process.stdout.write('\n');

    const stats = fs.statSync(outputPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    log(`  ✅ ${compositionId} rendered (${fileSizeMB} MB)`, 'green');

    return {
      success: true,
      id: compositionId,
      path: outputPath,
      size: fileSizeMB,
      duration: composition.durationInFrames / composition.fps
    };

  } catch (error) {
    log(`  ❌ ${compositionId} failed: ${error.message}`, 'red');
    return {
      success: false,
      id: compositionId,
      error: error.message
    };
  }
}

async function updateNotionAssetLink(pairId, assetPath) {
  if (!notion) return false;

  try {
    // Find the page with this Pair ID
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
              equals: 'TikTok'
            }
          }
        ]
      }
    });

    if (response.results.length === 0) {
      log(`  ⚠️ No Notion page found for ${pairId}`, 'yellow');
      return false;
    }

    const pageId = response.results[0].id;

    // Update with asset link
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Notes': {
          rich_text: [
            {
              text: {
                content: `Video rendered: ${assetPath}`
              }
            }
          ]
        }
      }
    });

    log(`  📝 Updated Notion for ${pairId}`, 'blue');
    return true;

  } catch (error) {
    log(`  ⚠️ Notion update failed for ${pairId}: ${error.message}`, 'yellow');
    return false;
  }
}

async function main() {
  log('\n🚀 WEEK 1 VIDEO BATCH RENDER', 'cyan');
  log('=' .repeat(50), 'blue');

  const week1Videos = ['P01', 'P02', 'P03'];
  const results = [];

  try {
    // Bundle once for all renders
    log('\n📦 Bundling Remotion project...', 'yellow');
    const bundled = await bundle({
      entryPoint: path.join(__dirname, 'src/index.jsx'),
      webpackOverride: (config) => config,
    });

    log('✅ Bundle complete', 'green');

    // Render each video
    for (const videoId of week1Videos) {
      const result = await renderVideo(videoId, bundled);
      results.push(result);

      // Update Notion if successful
      if (result.success && notion) {
        await updateNotionAssetLink(videoId, result.path);
      }

      // Small delay between renders
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate summary
    log('\n' + '=' .repeat(50), 'green');
    log('📊 RENDER SUMMARY', 'cyan');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    log(`\n✅ Successful: ${successful.length}/${week1Videos.length}`, 'green');
    successful.forEach(r => {
      log(`  ${r.id}: ${r.size} MB (${r.duration}s)`, 'blue');
    });

    if (failed.length > 0) {
      log(`\n❌ Failed: ${failed.length}`, 'red');
      failed.forEach(r => {
        log(`  ${r.id}: ${r.error}`, 'yellow');
      });
    }

    // Generate proof pack
    const proofPack = {
      timestamp: new Date().toISOString(),
      totalRequested: week1Videos.length,
      totalRendered: successful.length,
      totalFailed: failed.length,
      videos: results,
      outputDirectory: path.join(__dirname, 'output', 'week1')
    };

    const proofPath = path.join(__dirname, 'output', 'week1', 'RENDER_PROOF_PACK.json');
    fs.writeFileSync(proofPath, JSON.stringify(proofPack, null, 2));

    log(`\n📄 Proof pack saved: ${proofPath}`, 'magenta');
    log('\n🎯 Output directory: ' + path.join(__dirname, 'output', 'week1'), 'cyan');

  } catch (error) {
    log(`\n❌ Critical error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();