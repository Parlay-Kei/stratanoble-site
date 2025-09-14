#!/usr/bin/env node

/**
 * Convert HTML mockups to optimized images for ACHIEVERY preview page
 * This script uses Playwright to take screenshots of HTML mockups and Sharp to optimize them
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../../../temp');
const OUTPUT_DIR = path.join(__dirname, '../public/images/achievery');

const HTML_FILES = [
  {
    file: 'achievery-free-dashboard.html',
    output: 'dashboard-free-tier-new',
    viewport: { width: 1200, height: 800 }
  },
  {
    file: 'achievery-growth-dashboard.html',
    output: 'dashboard-growth-tier-new',
    viewport: { width: 1200, height: 800 }
  },
  {
    file: 'achievery-partner-dashboard.html',
    output: 'dashboard-partner-tier-new',
    viewport: { width: 1200, height: 800 }
  }
];

async function convertHtmlToImages() {
  console.log('🎨 Converting HTML mockups to optimized images...');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  try {
    for (const config of HTML_FILES) {
      const htmlPath = path.join(TEMP_DIR, config.file);
      const pngPath = path.join(OUTPUT_DIR, `${config.output}.png`);
      const webpPath = path.join(OUTPUT_DIR, `${config.output}.webp`);

      try {
        // Check if HTML file exists
        await fs.access(htmlPath);

        console.log(`📷 Converting ${config.file}...`);

        const page = await browser.newPage();
        await page.setViewportSize(config.viewport);

        // Load the HTML file
        await page.goto(`file://${htmlPath}`);

        // Wait for any potential loading
        await page.waitForTimeout(1000);

        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: false
        });

        // Save PNG version
        await fs.writeFile(pngPath, screenshot);

        // Create optimized WebP version
        await sharp(screenshot)
          .webp({ quality: 85, effort: 6 })
          .toFile(webpPath);

        console.log(`✅ Generated ${config.output}.png and ${config.output}.webp`);

        await page.close();
      } catch (error) {
        console.error(`❌ Failed to convert ${config.file}:`, error.message);
      }
    }
  } finally {
    await browser.close();
  }

  console.log('🎉 HTML to image conversion complete!');
  console.log('💡 Generated images are optimized for web delivery.');
}

// Run conversion
convertHtmlToImages().catch(console.error);