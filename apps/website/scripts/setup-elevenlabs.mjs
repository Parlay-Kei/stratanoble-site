#!/usr/bin/env node

/**
 * ElevenLabs Setup Script
 *
 * Automated setup for ElevenLabs TTS integration:
 * 1. Checks for API key in environment
 * 2. Validates API key if present
 * 3. Lists available voices
 * 4. Recommends voice for cold calling (Josh)
 * 5. Tests TTS with sample audio
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
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

function getEnvValue(key) {
  // Check process.env first
  if (process.env[key]) return process.env[key];

  // Check .env.local file
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
    if (match) return match[1].trim();
  }

  return null;
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if key exists
  const keyRegex = new RegExp(`^${key}=.*$`, 'm');
  if (keyRegex.test(envContent)) {
    // Update existing
    envContent = envContent.replace(keyRegex, `${key}=${value}`);
  } else {
    // Add new
    envContent += `\n# ElevenLabs TTS Configuration\n${key}=${value}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  log(`✅ Updated ${key} in .env.local`, 'green');
}

async function validateApiKey(apiKey) {
  try {
    const client = new ElevenLabsClient({ apiKey });
    const user = await client.user.get();
    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function listVoices(apiKey) {
  try {
    const client = new ElevenLabsClient({ apiKey });
    const voices = await client.voices.getAll();
    return voices.voices || [];
  } catch (error) {
    log(`❌ Error listing voices: ${error.message}`, 'red');
    return [];
  }
}

async function testTTS(apiKey, voiceId, text) {
  try {
    const client = new ElevenLabsClient({ apiKey });

    log('\n🔊 Generating test audio...', 'cyan');

    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_monolingual_v1',
    });

    // Save to file
    const testDir = path.join(__dirname, '..', '.data', 'audio-tests');
    fs.mkdirSync(testDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-${timestamp}.mp3`;
    const filepath = path.join(testDir, filename);

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    fs.writeFileSync(filepath, buffer);
    log(`✅ Test audio saved to: ${filepath}`, 'green');
    log('   You can play this file to verify voice quality', 'cyan');

    return true;
  } catch (error) {
    log(`❌ Error generating test audio: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'bold');
  log('  ElevenLabs TTS Setup for Voice AI Cold Calling', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  // Step 1: Check for API key
  log('Step 1: Checking for ElevenLabs API key...', 'cyan');
  let apiKey = getEnvValue('ELEVENLABS_API_KEY');

  if (!apiKey) {
    log('❌ No API key found in environment', 'red');
    log('\n📋 To get your API key:', 'yellow');
    log('   1. Go to https://elevenlabs.io/', 'yellow');
    log('   2. Sign up or log in', 'yellow');
    log('   3. Navigate to Profile Settings → API Keys', 'yellow');
    log('   4. Copy your API key', 'yellow');
    log('   5. Run: ELEVENLABS_API_KEY=your_key_here npm run setup:elevenlabs', 'yellow');
    log('\n💡 Free tier includes:', 'cyan');
    log('   - 10,000 characters/month (~20 test calls)', 'cyan');
    log('   - Access to all pre-made voices', 'cyan');
    log('   - Commercial license', 'cyan');
    process.exit(1);
  }

  log(`✅ Found API key: ${apiKey.substring(0, 8)}...`, 'green');

  // Step 2: Validate API key
  log('\nStep 2: Validating API key...', 'cyan');
  const validation = await validateApiKey(apiKey);

  if (!validation.valid) {
    log(`❌ Invalid API key: ${validation.error}`, 'red');
    log('   Please check your API key and try again', 'yellow');
    process.exit(1);
  }

  log('✅ API key is valid', 'green');

  if (validation.user) {
    const { subscription } = validation.user;
    log(`   Subscription: ${subscription?.tier || 'Free'}`, 'cyan');
    log(`   Characters remaining: ${subscription?.character_limit - subscription?.character_count || 'N/A'}`, 'cyan');
  }

  // Step 3: List available voices
  log('\nStep 3: Loading available voices...', 'cyan');
  const voices = await listVoices(apiKey);

  if (voices.length === 0) {
    log('❌ No voices available', 'red');
    process.exit(1);
  }

  log(`✅ Found ${voices.length} voices`, 'green');

  // Find recommended voice (Josh)
  const recommendedVoice = voices.find(v => v.name === 'Josh');

  log('\n📊 Available Voices:', 'bold');
  voices.slice(0, 10).forEach(voice => {
    const isRecommended = voice.voice_id === recommendedVoice?.voice_id;
    const marker = isRecommended ? '⭐ RECOMMENDED' : '  ';
    log(`   ${marker} ${voice.name} (${voice.voice_id})`, isRecommended ? 'green' : 'reset');
    if (voice.labels) {
      const labels = Object.entries(voice.labels).map(([k, v]) => `${k}: ${v}`).join(', ');
      log(`      Labels: ${labels}`, 'cyan');
    }
  });

  // Step 4: Set recommended voice
  if (recommendedVoice) {
    log('\n✅ Recommended voice for cold calling: Josh', 'green');
    log('   Characteristics: Professional, warm, clear', 'cyan');
    log('   Best for: Business calls, professional communication', 'cyan');

    updateEnvFile('ELEVENLABS_VOICE_ID', recommendedVoice.voice_id);
    updateEnvFile('ELEVENLABS_VOICE_NAME', 'Josh');
  }

  // Step 5: Test TTS
  log('\nStep 5: Testing text-to-speech...', 'cyan');
  const testText = "Hi! This is a test call from StrataNoble's AI system. Can you hear me clearly?";

  const testSuccess = await testTTS(
    apiKey,
    recommendedVoice?.voice_id || voices[0].voice_id,
    testText
  );

  if (!testSuccess) {
    log('⚠️  Test audio generation failed, but setup is complete', 'yellow');
  }

  // Step 6: Check for Deepgram API key
  log('\nStep 6: Checking for Deepgram API key (speech-to-text)...', 'cyan');
  const deepgramKey = getEnvValue('DEEPGRAM_API_KEY');

  if (!deepgramKey) {
    log('⚠️  No Deepgram API key found', 'yellow');
    log('\n📋 To get your Deepgram API key:', 'yellow');
    log('   1. Go to https://console.deepgram.com/', 'yellow');
    log('   2. Sign up or log in', 'yellow');
    log('   3. Create a new API key', 'yellow');
    log('   4. Add to .env.local: DEEPGRAM_API_KEY=your_key_here', 'yellow');
    log('\n💡 Free tier includes:', 'cyan');
    log('   - $200 free credit', 'cyan');
    log('   - ~45,000 minutes of transcription', 'cyan');
    log('   - Real-time streaming support', 'cyan');
  } else {
    log(`✅ Found Deepgram API key: ${deepgramKey.substring(0, 8)}...`, 'green');
  }

  // Summary
  log('\n' + '='.repeat(60), 'bold');
  log('  Setup Summary', 'bold');
  log('='.repeat(60), 'bold');

  log('\n✅ ElevenLabs API key: Configured', 'green');
  log(`✅ Voice selected: ${recommendedVoice?.name || voices[0].name}`, 'green');
  log(`${deepgramKey ? '✅' : '⚠️ '} Deepgram API key: ${deepgramKey ? 'Configured' : 'Missing'}`, deepgramKey ? 'green' : 'yellow');

  log('\n📋 Next Steps:', 'bold');
  log('   1. If Deepgram key is missing, add it to .env.local', 'cyan');
  log('   2. Review TTS session handler: apps/website/server/tts-session.js', 'cyan');
  log('   3. Set USE_TTS_MODE=true in .env.local to enable TTS mode', 'cyan');
  log('   4. Restart gateway server: node server/server.js', 'cyan');
  log('   5. Make test call to verify voice output works', 'cyan');

  log('\n🎉 ElevenLabs setup complete!', 'green');
  log('   Your AI will now speak using professional TTS instead of OpenAI Realtime\n', 'cyan');
}

main().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
