#!/usr/bin/env node

/**
 * TTS Environment Configuration Script
 *
 * Quickly configure .env.local with API keys for TTS mode
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function updateEnvFile(updates) {
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const lines = envContent.split('\n');
  let modified = false;

  // Update each key
  for (const [key, value] of Object.entries(updates)) {
    const keyRegex = new RegExp(`^${key}=.*$`);
    const existingIndex = lines.findIndex(line => keyRegex.test(line));

    if (existingIndex !== -1) {
      // Update existing
      lines[existingIndex] = `${key}=${value}`;
      log(`✅ Updated ${key}`, 'green');
      modified = true;
    } else {
      // Add new - find or create TTS section
      const ttsSectionIndex = lines.findIndex(line => line.includes('# --- TTS Mode Configuration'));

      if (ttsSectionIndex !== -1) {
        // Insert after TTS section header
        const insertIndex = ttsSectionIndex + 1;
        lines.splice(insertIndex, 0, `${key}=${value}`);
      } else {
        // Create TTS section at end
        if (!lines[lines.length - 1].startsWith('#')) {
          lines.push('');
        }
        lines.push('# --- TTS Mode Configuration ---');
        lines.push(`${key}=${value}`);
      }

      log(`✅ Added ${key}`, 'green');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(envPath, lines.join('\n'));
    log('\n✅ .env.local updated successfully', 'green');
  } else {
    log('\n⚠️  No changes made', 'yellow');
  }
}

function main() {
  log('\n' + '='.repeat(60), 'bold');
  log('  TTS Configuration Script', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  const args = process.argv.slice(2);

  const updates = {};

  // Parse arguments
  if (args.length === 0) {
    log('❌ No arguments provided', 'red');
    log('\nUsage:', 'yellow');
    log('  node configure-tts-env.mjs <elevenlabs_key> [deepgram_key]', 'yellow');
    log('\nExamples:', 'cyan');
    log('  node configure-tts-env.mjs sk_abc123...', 'cyan');
    log('  node configure-tts-env.mjs sk_abc123... dg_xyz789...', 'cyan');
    log('\nOr use flags:', 'cyan');
    log('  node configure-tts-env.mjs --elevenlabs=sk_abc123...', 'cyan');
    log('  node configure-tts-env.mjs --elevenlabs=sk_abc... --deepgram=dg_xyz...', 'cyan');
    process.exit(1);
  }

  // Check for flag-based arguments
  for (const arg of args) {
    if (arg.startsWith('--elevenlabs=')) {
      updates.ELEVENLABS_API_KEY = arg.substring('--elevenlabs='.length);
    } else if (arg.startsWith('--deepgram=')) {
      updates.DEEPGRAM_API_KEY = arg.substring('--deepgram='.length);
    } else if (!arg.startsWith('--')) {
      // Positional argument
      if (!updates.ELEVENLABS_API_KEY) {
        updates.ELEVENLABS_API_KEY = arg;
      } else if (!updates.DEEPGRAM_API_KEY) {
        updates.DEEPGRAM_API_KEY = arg;
      }
    }
  }

  // Add TTS configuration defaults
  updates.USE_TTS_MODE = 'true';
  updates.ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Josh voice
  updates.ELEVENLABS_VOICE_NAME = 'Josh';

  if (!updates.ELEVENLABS_API_KEY) {
    log('❌ ElevenLabs API key required', 'red');
    log('\nProvide key as first argument:', 'yellow');
    log('  node configure-tts-env.mjs sk_your_key_here', 'yellow');
    process.exit(1);
  }

  // Validate key format
  if (!updates.ELEVENLABS_API_KEY.startsWith('sk_')) {
    log('⚠️  Warning: ElevenLabs API key should start with "sk_"', 'yellow');
    log('   Make sure you copied the entire key', 'yellow');
  }

  log('📝 Configuring .env.local with:', 'cyan');
  log(`   ElevenLabs API Key: ${updates.ELEVENLABS_API_KEY.substring(0, 12)}...`, 'cyan');
  log(`   Voice: ${updates.ELEVENLABS_VOICE_NAME} (${updates.ELEVENLABS_VOICE_ID})`, 'cyan');
  log(`   TTS Mode: ${updates.USE_TTS_MODE}`, 'cyan');

  if (updates.DEEPGRAM_API_KEY) {
    log(`   Deepgram API Key: ${updates.DEEPGRAM_API_KEY.substring(0, 12)}...`, 'cyan');
  } else {
    log('   Deepgram API Key: (not provided - add later)', 'yellow');
  }

  log('');

  // Update .env.local
  updateEnvFile(updates);

  log('\n📋 Configuration Summary:', 'bold');
  log('   ✅ USE_TTS_MODE=true', 'green');
  log('   ✅ ELEVENLABS_API_KEY configured', 'green');
  log('   ✅ Voice: Josh (professional, warm, clear)', 'green');

  if (updates.DEEPGRAM_API_KEY) {
    log('   ✅ DEEPGRAM_API_KEY configured', 'green');
    log('\n🎉 All configuration complete!', 'green');
    log('\n📝 Next Steps:', 'bold');
    log('   1. Start TTS gateway: node server/server-tts.js', 'cyan');
    log('   2. Make test call and hear your AI speak! 🎤', 'cyan');
  } else {
    log('   ⚠️  DEEPGRAM_API_KEY not configured yet', 'yellow');
    log('\n📝 Next Steps:', 'bold');
    log('   1. Get Deepgram API key: https://console.deepgram.com/', 'cyan');
    log('   2. Add to .env.local: DEEPGRAM_API_KEY=your_key_here', 'cyan');
    log('   3. Or run: node configure-tts-env.mjs --deepgram=your_key', 'cyan');
    log('   4. Start TTS gateway: node server/server-tts.js', 'cyan');
    log('   5. Make test call! 🎤', 'cyan');
  }

  log('');
}

main();
