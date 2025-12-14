#!/usr/bin/env node
/**
 * Automated Google Drive Refresh Token Generator
 * Uses existing OAuth credentials to generate a refresh token for Drive API
 */

import { createServer } from 'http';
import { URL } from 'url';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

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

async function getGoogleDriveRefreshToken() {
  log('\n🔐 Google Drive Refresh Token Generator\n', 'cyan');
  log('='.repeat(60), 'cyan');

  // Read existing credentials
  const envPath = join(__dirname, '../apps/website/.env.local');
  const envContent = await fs.readFile(envPath, 'utf-8');

  const clientIdMatch = envContent.match(/GOOGLE_CLIENT_ID=(.+)/);
  const clientSecretMatch = envContent.match(/GOOGLE_CLIENT_SECRET=(.+)/);

  if (!clientIdMatch || !clientSecretMatch) {
    log('\n❌ Missing Google OAuth credentials in .env.local', 'red');
    process.exit(1);
  }

  const CLIENT_ID = clientIdMatch[1].trim();
  const CLIENT_SECRET = clientSecretMatch[1].trim();
  const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
  const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

  log('\n📋 Using existing OAuth credentials:', 'cyan');
  log(`   Client ID: ${CLIENT_ID.substring(0, 20)}...`, 'reset');
  log(`   Redirect URI: ${REDIRECT_URI}`, 'reset');
  log(`   Scope: ${SCOPE}\n`, 'reset');

  // Create authorization URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent'
  })}`;

  log('🌐 Opening browser for authorization...', 'cyan');
  log('   Please sign in and authorize Drive access\n', 'yellow');

  // Create local server to receive callback
  let authCode = null;

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname === '/oauth2callback') {
      authCode = url.searchParams.get('code');
      
      if (authCode) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Authorization Successful</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: green;">✅ Authorization Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);
        
        // Exchange code for tokens
        log('\n✅ Authorization code received!', 'green');
        log('🔄 Exchanging code for refresh token...\n', 'cyan');

        try {
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code: authCode,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code'
            })
          });

          const tokens = await tokenResponse.json();

          if (tokens.refresh_token) {
            log('✅ Refresh token obtained successfully!\n', 'green');
            
            // Add to .env.local
            let updatedEnv = envContent;
            
            // Add Google Drive MCP section if not exists
            if (!updatedEnv.includes('# --- Google Drive MCP Configuration ---')) {
              updatedEnv += '\n\n# --- Google Drive MCP Configuration ---\n';
            }
            
            // Add or update refresh token
            if (updatedEnv.includes('GOOGLE_DRIVE_CLIENT_ID=')) {
              updatedEnv = updatedEnv.replace(
                /GOOGLE_DRIVE_CLIENT_ID=.*/,
                `GOOGLE_DRIVE_CLIENT_ID=${CLIENT_ID}`
              );
            } else {
              updatedEnv += `GOOGLE_DRIVE_CLIENT_ID=${CLIENT_ID}\n`;
            }
            
            if (updatedEnv.includes('GOOGLE_DRIVE_CLIENT_SECRET=')) {
              updatedEnv = updatedEnv.replace(
                /GOOGLE_DRIVE_CLIENT_SECRET=.*/,
                `GOOGLE_DRIVE_CLIENT_SECRET=${CLIENT_SECRET}`
              );
            } else {
              updatedEnv += `GOOGLE_DRIVE_CLIENT_SECRET=${CLIENT_SECRET}\n`;
            }
            
            if (updatedEnv.includes('GOOGLE_DRIVE_REFRESH_TOKEN=')) {
              updatedEnv = updatedEnv.replace(
                /GOOGLE_DRIVE_REFRESH_TOKEN=.*/,
                `GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`
              );
            } else {
              updatedEnv += `GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
            }
            
            await fs.writeFile(envPath, updatedEnv);
            
            log('✅ Refresh token saved to .env.local\n', 'green');
            log('━'.repeat(60), 'cyan');
            log('🎉 Google Drive MCP configuration complete!\n', 'green');
            log('📝 Next steps:', 'cyan');
            log('   1. Install MCP server: npm install -g @modelcontextprotocol/server-google-drive', 'yellow');
            log('   2. Test connection: node scripts/test-google-drive-mcp.mjs\n', 'yellow');
            
            server.close();
            process.exit(0);
          } else {
            log('❌ No refresh token in response', 'red');
            log('   Response:', 'yellow');
            log(JSON.stringify(tokens, null, 2), 'reset');
            server.close();
            process.exit(1);
          }
        } catch (error) {
          log(`\n❌ Error exchanging code: ${error.message}`, 'red');
          server.close();
          process.exit(1);
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Error: No authorization code received</h1>');
        server.close();
        process.exit(1);
      }
    }
  });

  server.listen(3000, () => {
    log('✅ Local server started on http://localhost:3000\n', 'green');
    
    // Open browser (Windows compatible)
    setTimeout(() => {
      exec(`start "" "${authUrl}"`, (error) => {
        if (error) {
          log('\n⚠️  Could not open browser automatically', 'yellow');
          log('   Please open this URL manually:', 'yellow');
          log(`   ${authUrl}\n`, 'cyan');
        }
      });
    }, 1000);
  });

  // Timeout after 5 minutes
  setTimeout(() => {
    log('\n⏱️  Timeout: No authorization received in 5 minutes', 'yellow');
    server.close();
    process.exit(1);
  }, 5 * 60 * 1000);
}

getGoogleDriveRefreshToken().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
