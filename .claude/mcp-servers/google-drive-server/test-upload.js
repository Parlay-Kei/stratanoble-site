#!/usr/bin/env node
/**
 * Test script to verify Google Drive credentials and upload files
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const TARGET_FOLDER_ID = '1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK';

const FILES_TO_UPLOAD = [
  'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DEVELOPER_COMPENSATION_MEMO.pdf',
  'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.pdf',
  'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.pdf',
  'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DC_COST_LEDGER_V1.md',
];

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
];

async function initAuth() {
  console.log('Loading service account credentials...');
  const content = await fs.readFile(SERVICE_ACCOUNT_PATH, 'utf-8');
  const credentials = JSON.parse(content);

  console.log(`Service account email: ${credentials.client_email}`);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

async function testConnection(drive) {
  console.log('\nTesting connection...');
  try {
    const res = await drive.about.get({ fields: 'user' });
    console.log('Connection successful!');
    console.log(`Authenticated as: ${res.data.user.displayName || res.data.user.emailAddress}`);
    return true;
  } catch (err) {
    console.error('Connection test failed:', err.message);
    return false;
  }
}

async function uploadFile(drive, filePath, folderId) {
  const fileName = path.basename(filePath);
  console.log(`\nUploading: ${fileName}`);

  // Determine MIME type
  let mimeType = 'application/octet-stream';
  if (filePath.endsWith('.pdf')) {
    mimeType = 'application/pdf';
  } else if (filePath.endsWith('.md')) {
    mimeType = 'text/markdown';
  }

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log(`  Success! File ID: ${response.data.id}`);
    console.log(`  View link: ${response.data.webViewLink}`);
    return { success: true, ...response.data };
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return { success: false, error: err.message, fileName };
  }
}

async function main() {
  console.log('=== Google Drive Upload Test ===\n');

  try {
    const drive = await initAuth();

    const connected = await testConnection(drive);
    if (!connected) {
      console.log('\nCannot proceed without connection.');
      process.exit(1);
    }

    console.log(`\nTarget folder ID: ${TARGET_FOLDER_ID}`);
    console.log('\n--- Starting uploads ---');

    const results = [];
    for (const filePath of FILES_TO_UPLOAD) {
      const result = await uploadFile(drive, filePath, TARGET_FOLDER_ID);
      results.push(result);
    }

    console.log('\n=== Upload Summary ===');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed uploads:');
      failed.forEach(f => console.log(`  - ${f.fileName}: ${f.error}`));
    }

    if (successful.length > 0) {
      console.log('\nUploaded files:');
      successful.forEach(f => console.log(`  - ${f.name}: ${f.webViewLink}`));
    }

  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('does not have')) {
      console.log('\n*** PERMISSION ISSUE ***');
      console.log('The service account does not have access to the target folder.');
      console.log('Please share the folder with the service account email:');
      console.log('  anx-drive-mcp@direct-cuts-483907.iam.gserviceaccount.com');
    }
    process.exit(1);
  }
}

main();
