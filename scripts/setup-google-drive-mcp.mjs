#!/usr/bin/env node
/**
 * Google Drive MCP Setup Script
 * Configures Google Drive integration for brand assets and documentation access
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

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

async function setupGoogleDriveMCP() {
  log('\n🔧 Google Drive MCP Setup\n', 'cyan');
  log('='.repeat(60), 'cyan');

  // Step 1: Check existing credentials
  const envPath = join(__dirname, '../apps/website/.env.local');

  try {
    const envContent = await fs.readFile(envPath, 'utf-8');

    const hasGoogleDriveClientId = envContent.includes('GOOGLE_DRIVE_CLIENT_ID');
    const hasGoogleDriveClientSecret = envContent.includes('GOOGLE_DRIVE_CLIENT_SECRET');
    const hasGoogleDriveRefreshToken = envContent.includes('GOOGLE_DRIVE_REFRESH_TOKEN');

    if (!hasGoogleDriveClientId || !hasGoogleDriveClientSecret || !hasGoogleDriveRefreshToken) {
      log('\n⚠️  Google Drive OAuth credentials not found in .env.local\n', 'yellow');

      log('📋 Setup Instructions:', 'cyan');
      log('━'.repeat(60), 'cyan');

      log('\n1️⃣  Go to Google Cloud Console:', 'cyan');
      log('   https://console.cloud.google.com/apis/credentials\n', 'reset');

      log('2️⃣  Create OAuth 2.0 Client ID:', 'cyan');
      log('   • Application type: Web application', 'reset');
      log('   • Name: StrataNoble DevOps Agent', 'reset');
      log('   • Authorized redirect URIs:', 'reset');
      log('     - http://localhost:3000/api/auth/callback/google', 'reset');
      log('     - https://stratanoble.com/api/auth/callback/google\n', 'reset');

      log('3️⃣  Enable Google Drive API:', 'cyan');
      log('   https://console.cloud.google.com/apis/library/drive.googleapis.com\n', 'reset');

      log('4️⃣  Get Refresh Token:', 'cyan');
      log('   • Use OAuth 2.0 Playground:', 'reset');
      log('     https://developers.google.com/oauthplayground/', 'reset');
      log('   • Select "Drive API v3"', 'reset');
      log('   • Authorize and exchange authorization code', 'reset');
      log('   • Copy the refresh token\n', 'reset');

      log('5️⃣  Add to apps/website/.env.local:', 'cyan');
      log('   ─────────────────────────────────────────────', 'cyan');
      log('   # Google Drive MCP', 'reset');
      log('   GOOGLE_DRIVE_CLIENT_ID=your_client_id.apps.googleusercontent.com', 'reset');
      log('   GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret', 'reset');
      log('   GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token', 'reset');
      log('   ─────────────────────────────────────────────\n', 'cyan');

      log('6️⃣  Share StrataNoble workspace folder with service account\n', 'cyan');

      log('💡 Benefits of Google Drive MCP:', 'cyan');
      log('   ✓ Access brand assets (logos, guidelines)', 'green');
      log('   ✓ Read PRDs and technical documentation', 'green');
      log('   ✓ Search across shared documents', 'green');
      log('   ✓ Fetch specific files by ID', 'green');
      log('   ✓ Agent can reference latest documentation\n', 'green');

      process.exit(1);
    }

    // Credentials found
    log('\n✅ Google Drive OAuth credentials found in .env.local\n', 'green');

    // Step 2: Install Google Drive MCP server
    log('📦 Installing Google Drive MCP server...', 'cyan');

    try {
      const { stdout } = await execAsync('npm list -g @modelcontextprotocol/server-google-drive');
      log('✅ Google Drive MCP server already installed\n', 'green');
    } catch (error) {
      log('   Installing package globally...', 'reset');
      await execAsync('npm install -g @modelcontextprotocol/server-google-drive');
      log('✅ Google Drive MCP server installed successfully\n', 'green');
    }

    // Step 3: Test connection
    log('🔍 Testing Google Drive API connection...', 'cyan');
    log('   Note: Actual test requires MCP server running in Claude\n', 'yellow');

    // Step 4: Configuration summary
    log('━'.repeat(60), 'cyan');
    log('🎉 Google Drive MCP Setup Complete!\n', 'green');

    log('📚 Available MCP Tools:', 'cyan');
    log('   • drive_search(query) - Search Drive for files', 'reset');
    log('   • google_drive_fetch(document_ids) - Fetch file content', 'reset');
    log('   • google_drive_list(folder_id) - List files in folder\n', 'reset');

    log('🔧 Usage Examples:', 'cyan');
    log('   drive_search({ query: "PRD StrataNoble" })', 'reset');
    log('   drive_search({ query: "logo brand assets" })', 'reset');
    log('   google_drive_fetch({ document_ids: ["file_id"] })\n', 'reset');

    log('📂 Recommended Folder Structure:', 'cyan');
    log('   StrataNoble Workspace/', 'reset');
    log('   ├── Brand Assets/', 'reset');
    log('   │   ├── Logos/', 'reset');
    log('   │   ├── Color Palettes/', 'reset');
    log('   │   └── Brand Guidelines/', 'reset');
    log('   ├── Documentation/', 'reset');
    log('   │   ├── PRDs/', 'reset');
    log('   │   ├── API Docs/', 'reset');
    log('   │   └── Technical Specs/', 'reset');
    log('   └── Meeting Notes/\n', 'reset');

    log('⚡ Next Steps:', 'cyan');
    log('   1. Ensure workspace folder is shared with OAuth client', 'yellow');
    log('   2. Test MCP connection in Claude Code', 'yellow');
    log('   3. Run: node scripts/test-google-drive-mcp.mjs\n', 'yellow');

    log('━'.repeat(60), 'cyan');

    return true;

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('   Check that apps/website/.env.local exists\n', 'yellow');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupGoogleDriveMCP().catch(error => {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { setupGoogleDriveMCP };
