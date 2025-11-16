#!/usr/bin/env node
/**
 * Notion MCP Test Suite
 * Tests Notion integration connectivity and capabilities
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function loadEnv() {
  const envPath = join(__dirname, '../apps/website/.env.local');
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const env = {};

    envContent.split(/\r?\n/).forEach(line => {
      line = line.replace(/\r$/, '');
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    });

    return env;
  } catch (error) {
    log(`❌ Failed to load .env.local: ${error.message}`, 'red');
    return {};
  }
}

async function testNotionMCP() {
  log('\n🧪 Notion MCP Test Suite\n', 'cyan');
  log('='.repeat(60), 'cyan');

  const env = await loadEnv();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Check environment variable
  totalTests++;
  log('\n1️⃣  Checking environment configuration...', 'cyan');

  if (env.NOTION_API_KEY && env.NOTION_API_KEY.startsWith('secret_')) {
    log('   ✅ NOTION_API_KEY is configured', 'green');
    log(`   Token: ${env.NOTION_API_KEY.substring(0, 15)}...`, 'reset');
    passedTests++;
  } else if (env.NOTION_API_KEY) {
    log('   ⚠️  NOTION_API_KEY exists but format looks incorrect', 'yellow');
    log('   Expected format: secret_...', 'yellow');
  } else {
    log('   ❌ NOTION_API_KEY not found in .env.local', 'red');
    log('\n   📋 Setup Instructions:', 'cyan');
    log('   1. Go to https://www.notion.so/my-integrations', 'reset');
    log('   2. Create new integration: "StrataNoble DevOps Agent"', 'reset');
    log('   3. Copy the Internal Integration Token', 'reset');
    log('   4. Add to .env.local:', 'reset');
    log('      NOTION_API_KEY=secret_your_token_here\n', 'yellow');
  }

  // Test 2: Check MCP config file
  totalTests++;
  log('\n2️⃣  Checking MCP configuration...', 'cyan');

  const mcpConfigPath = join(__dirname, '../.claude/mcp-configs/notion-mcp.json');
  try {
    const configContent = await fs.readFile(mcpConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (config.mcpServers && config.mcpServers.notion) {
      log('   ✅ Notion MCP config file is valid', 'green');
      log(`   Command: ${config.mcpServers.notion.command}`, 'reset');
      log(`   Package: ${config.mcpServers.notion.args.join(' ')}`, 'reset');
      passedTests++;
    } else {
      log('   ❌ Invalid MCP config structure', 'red');
    }
  } catch (error) {
    log(`   ❌ Failed to read MCP config: ${error.message}`, 'red');
  }

  // Test 3: Test Notion API connectivity (if token exists)
  if (env.NOTION_API_KEY) {
    totalTests++;
    log('\n3️⃣  Testing Notion API connectivity...', 'cyan');

    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (response.ok) {
        const data = await response.json();
        log('   ✅ Successfully connected to Notion API', 'green');
        log(`   Bot ID: ${data.id}`, 'reset');
        log(`   Type: ${data.type}`, 'reset');
        passedTests++;
      } else {
        const error = await response.json();
        log(`   ❌ API Error: ${error.message || response.statusText}`, 'red');
        log(`   Status: ${response.status}`, 'red');

        if (response.status === 401) {
          log('\n   🔧 Troubleshooting:', 'yellow');
          log('   - Verify token is correct in .env.local', 'yellow');
          log('   - Check token hasn\'t been revoked', 'yellow');
          log('   - Ensure token starts with "secret_"', 'yellow');
        }
      }
    } catch (error) {
      log(`   ❌ Network error: ${error.message}`, 'red');
    }

    // Test 4: List databases (if connected)
    if (passedTests === 3) {
      totalTests++;
      log('\n4️⃣  Querying shared databases...', 'cyan');

      try {
        const response = await fetch('https://api.notion.com/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filter: { property: 'object', value: 'database' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const databases = data.results || [];

          log(`   ✅ Found ${databases.length} accessible database(s)`, 'green');

          if (databases.length > 0) {
            log('\n   Databases:', 'cyan');
            databases.forEach((db, i) => {
              const title = db.title?.[0]?.plain_text || 'Untitled';
              log(`   ${i + 1}. ${title}`, 'reset');
            });
            passedTests++;
          } else {
            log('\n   ⚠️  No databases shared with integration', 'yellow');
            log('\n   📋 To share databases:', 'cyan');
            log('   1. Open database in Notion', 'reset');
            log('   2. Click "..." menu → "Connections"', 'reset');
            log('   3. Search for "StrataNoble DevOps Agent"', 'reset');
            log('   4. Click "Confirm"', 'reset');
          }
        } else {
          log(`   ❌ Failed to query databases: ${response.statusText}`, 'red');
        }
      } catch (error) {
        log(`   ❌ Error querying databases: ${error.message}`, 'red');
      }
    }
  }

  // Test Results
  log('\n' + '='.repeat(60), 'cyan');
  log('Test Results', 'cyan');
  log('='.repeat(60), 'cyan');

  const passRate = Math.round((passedTests / totalTests) * 100);
  const resultColor = passRate >= 75 ? 'green' : passRate >= 50 ? 'yellow' : 'red';

  log(`\nPassed: ${passedTests}/${totalTests} tests (${passRate}%)`, resultColor);

  if (passedTests === totalTests) {
    log('\n✅ All tests passed! Notion MCP is ready to use.', 'green');
  } else if (passedTests > 0) {
    log('\n⚠️  Some tests failed. Review errors above.', 'yellow');
  } else {
    log('\n❌ Setup incomplete. Follow instructions above.', 'red');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');

  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
testNotionMCP().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
