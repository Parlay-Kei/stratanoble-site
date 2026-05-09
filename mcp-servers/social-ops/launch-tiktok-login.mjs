#!/usr/bin/env node
/**
 * One-time TikTok login via QR code.
 *
 * Uses Playwright Chromium with anti-detection flags.
 * DO NOT use Google login — it is blocked in this browser.
 * USE QR CODE LOGIN: open TikTok on your phone → tap the scan icon → scan the QR code shown.
 *
 * Run:  node launch-tiktok-login.mjs
 * Then: npm run validate-tiktok-profile
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profileDir = path.join(__dirname, '.auth', 'tiktok-profile');

async function main() {
  await fs.ensureDir(profileDir);

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ignoreDefaultArgs: ['--enable-automation'],
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  await page.goto('https://www.tiktok.com/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  console.log('');
  console.log('========================================');
  console.log('TikTok login page is open.');
  console.log('');
  console.log('USE QR CODE LOGIN — do NOT use Google.');
  console.log('  1. Open TikTok on your phone');
  console.log('  2. Tap Profile → tap the scan/QR icon (top right)');
  console.log('  3. Scan the QR code shown on screen');
  console.log('  4. Approve on your phone');
  console.log('');
  console.log('Waiting up to 5 minutes for login to complete...');
  console.log('========================================');
  console.log('');

  try {
    await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 300000 });
    const finalUrl = page.url();
    console.log('Login complete. URL:', finalUrl);
    console.log('Holding 3s for session to stabilize...');
    await new Promise((r) => setTimeout(r, 3000));
    console.log('Session saved.');
  } catch {
    console.log('5-minute timeout. Closing and saving whatever session exists.');
  }

  await context.close();
  console.log('');
  console.log('Browser closed. Profile saved to:', profileDir);
  console.log('');
  console.log('Next: npm run validate-tiktok-profile');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
