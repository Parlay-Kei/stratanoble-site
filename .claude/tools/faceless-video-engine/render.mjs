#!/usr/bin/env node
/**
 * Render individual TikTok videos
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function renderVideo(compositionId) {
  try {
    log(`\n🎬 Starting render for ${compositionId}...`, 'cyan');

    // Bundle the Remotion project
    log('📦 Bundling project...', 'yellow');
    const bundled = await bundle({
      entryPoint: path.join(__dirname, 'src/index.jsx'),
      webpackOverride: (config) => config,
    });

    // Select composition
    const inputProps = {};
    const composition = await selectComposition({
      serveUrl: bundled,
      id: compositionId,
      inputProps,
    });

    log(`📐 Composition: ${composition.width}x${composition.height} @ ${composition.fps}fps`, 'blue');
    log(`⏱️ Duration: ${composition.durationInFrames / composition.fps} seconds`, 'blue');

    // Output path
    const outputDir = path.join(__dirname, 'output');
    const outputPath = path.join(outputDir, `${compositionId}_tiktok.mp4`);

    // Ensure output directory exists
    const fs = await import('fs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Render the video
    log('🎥 Rendering video...', 'yellow');
    await renderMedia({
      composition,
      serveUrl: bundled,
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
        process.stdout.write(`\r  Progress: ${percentage}%`);
      },
    });

    process.stdout.write('\n');
    log(`\n✅ Video rendered successfully!`, 'green');
    log(`📁 Output: ${outputPath}`, 'green');

    // Get file size
    const stats = fs.statSync(outputPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    log(`📊 File size: ${fileSizeMB} MB`, 'blue');

    return {
      success: true,
      path: outputPath,
      size: fileSizeMB,
      composition: compositionId
    };

  } catch (error) {
    log(`\n❌ Render failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
      composition: compositionId
    };
  }
}

// Main execution
async function main() {
  const compositionId = process.argv[2];

  if (!compositionId) {
    log('❌ Please specify a composition ID (P01, P02, P03, P04)', 'red');
    log('Usage: node render.mjs P01', 'yellow');
    process.exit(1);
  }

  const validIds = ['P01', 'P02', 'P03', 'P04'];
  if (!validIds.includes(compositionId)) {
    log(`❌ Invalid composition ID. Valid options: ${validIds.join(', ')}`, 'red');
    process.exit(1);
  }

  await renderVideo(compositionId);
}

main();