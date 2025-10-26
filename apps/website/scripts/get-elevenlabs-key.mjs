#!/usr/bin/env node

/**
 * ElevenLabs API Key Retrieval Script
 *
 * Authenticates to ElevenLabs and retrieves/creates API key
 * Based on: https://elevenlabs.io/docs/api-reference/authentication
 */

import https from 'https';
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

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          // Return raw data if not JSON
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function login(email, password) {
  log('\n🔐 Authenticating to ElevenLabs...', 'cyan');

  const postData = JSON.stringify({
    email,
    password,
  });

  const options = {
    hostname: 'api.elevenlabs.io',
    port: 443,
    path: '/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  try {
    const response = await httpsRequest(options, postData);

    if (response.status === 200 && response.data.token) {
      log('✅ Authentication successful', 'green');
      return response.data.token;
    } else {
      log(`❌ Authentication failed: ${response.status}`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Authentication error: ${error.message}`, 'red');
    return null;
  }
}

async function getApiKeys(authToken) {
  log('\n🔑 Retrieving API keys...', 'cyan');

  const options = {
    hostname: 'api.elevenlabs.io',
    port: 443,
    path: '/v1/user/api-keys',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await httpsRequest(options);

    if (response.status === 200) {
      return response.data;
    } else {
      log(`❌ Failed to get API keys: ${response.status}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error getting API keys: ${error.message}`, 'red');
    return null;
  }
}

async function createApiKey(authToken, name) {
  log(`\n🔨 Creating new API key: ${name}...`, 'cyan');

  const postData = JSON.stringify({
    name,
  });

  const options = {
    hostname: 'api.elevenlabs.io',
    port: 443,
    path: '/v1/user/api-keys',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  try {
    const response = await httpsRequest(options, postData);

    if (response.status === 200 || response.status === 201) {
      log('✅ API key created successfully', 'green');
      return response.data;
    } else {
      log(`❌ Failed to create API key: ${response.status}`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error creating API key: ${error.message}`, 'red');
    return null;
  }
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
    // Add new - find TTS section or append
    const ttsSection = envContent.indexOf('# --- TTS Mode Configuration');
    if (ttsSection !== -1) {
      // Insert after TTS section header
      const lines = envContent.split('\n');
      const insertIndex = lines.findIndex(line => line.includes('ELEVENLABS_API_KEY='));
      if (insertIndex !== -1) {
        lines[insertIndex] = `${key}=${value}`;
        envContent = lines.join('\n');
      } else {
        // Append to TTS section
        const nextSectionIndex = lines.findIndex((line, idx) => idx > ttsSection && line.startsWith('# ---'));
        if (nextSectionIndex !== -1) {
          lines.splice(nextSectionIndex, 0, `${key}=${value}`);
        } else {
          lines.push(`${key}=${value}`);
        }
        envContent = lines.join('\n');
      }
    } else {
      // No TTS section, create it
      envContent += `\n# --- TTS Mode Configuration ---\n${key}=${value}\n`;
    }
  }

  fs.writeFileSync(envPath, envContent);
  log(`✅ Updated ${key} in .env.local`, 'green');
}

async function main() {
  log('\n' + '='.repeat(60), 'bold');
  log('  ElevenLabs API Key Retrieval', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  const email = 'steve.hubbard@stratanoble.com';
  const password = 'Anewday4Me2day!';

  // Step 1: Login
  const authToken = await login(email, password);
  if (!authToken) {
    log('\n❌ Failed to authenticate. Please check credentials.', 'red');
    process.exit(1);
  }

  // Step 2: Get existing API keys
  const keysData = await getApiKeys(authToken);

  let apiKey = null;

  if (keysData && keysData.api_keys && keysData.api_keys.length > 0) {
    log(`\n✅ Found ${keysData.api_keys.length} existing API key(s)`, 'green');

    // Look for StrataNoble key
    const strataKey = keysData.api_keys.find(k =>
      k.name && k.name.toLowerCase().includes('strata')
    );

    if (strataKey) {
      log(`   Using existing key: ${strataKey.name}`, 'cyan');
      apiKey = strataKey.api_key || strataKey.key;
    } else {
      // Use first available key
      log(`   Using key: ${keysData.api_keys[0].name}`, 'cyan');
      apiKey = keysData.api_keys[0].api_key || keysData.api_keys[0].key;
    }
  }

  // Step 3: Create new key if none exists
  if (!apiKey) {
    log('\n⚠️  No existing API keys found, creating new one...', 'yellow');

    const newKeyData = await createApiKey(authToken, 'StrataNoble Voice AI');

    if (newKeyData && (newKeyData.api_key || newKeyData.key)) {
      apiKey = newKeyData.api_key || newKeyData.key;
    } else {
      log('\n❌ Failed to create API key', 'red');
      process.exit(1);
    }
  }

  // Step 4: Validate and save API key
  if (!apiKey) {
    log('\n❌ No API key available', 'red');
    process.exit(1);
  }

  log('\n' + '='.repeat(60), 'bold');
  log('  Success!', 'bold');
  log('='.repeat(60), 'bold');

  log(`\n🔑 API Key Retrieved: ${apiKey.substring(0, 12)}...`, 'green');

  // Update .env.local
  updateEnvFile('ELEVENLABS_API_KEY', apiKey);

  // Also set default voice
  updateEnvFile('ELEVENLABS_VOICE_ID', 'pNInz6obpgDQGcFmaJgB');
  updateEnvFile('ELEVENLABS_VOICE_NAME', 'Josh');
  updateEnvFile('USE_TTS_MODE', 'true');

  log('\n📋 Configuration Summary:', 'bold');
  log('   ✅ ElevenLabs API Key: Configured', 'green');
  log('   ✅ Voice: Josh (Professional, warm, clear)', 'green');
  log('   ✅ TTS Mode: Enabled', 'green');

  log('\n📝 Next Steps:', 'bold');
  log('   1. Get Deepgram API key: https://console.deepgram.com/', 'cyan');
  log('   2. Add DEEPGRAM_API_KEY to .env.local', 'cyan');
  log('   3. Start TTS gateway: node server/server-tts.js', 'cyan');
  log('   4. Make test call and hear your AI speak! 🎉', 'cyan');

  log('\n🎉 ElevenLabs setup complete!\n', 'green');
}

main().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
