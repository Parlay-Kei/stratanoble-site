const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const DIRECT_CUTS_FOLDER_ID = '1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK';

const FILES_TO_UPLOAD = [
  'C:\\Dev\\Direct-Cuts\\.anx-artifacts\\mobile_parity_v1\\DC_MONTHLY_COST_TRACKER.md',
  'C:\\Dev\\Direct-Cuts\\.anx-artifacts\\mobile_parity_v1\\DC_USAGE_ALERTS_SETUP.md'
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  console.log('Uploading CFO documents to Direct Cuts folder...\n');

  for (const filePath of FILES_TO_UPLOAD) {
    const fileName = path.basename(filePath);
    const fileMetadata = {
      name: fileName,
      parents: [DIRECT_CUTS_FOLDER_ID]
    };
    const media = {
      mimeType: 'text/markdown',
      body: fs.createReadStream(filePath)
    };

    try {
      const uploaded = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });
      console.log(`✓ ${uploaded.data.name}`);
      console.log(`  ${uploaded.data.webViewLink}\n`);
    } catch (err) {
      console.log(`✗ ${fileName}: ${err.message}`);
    }
  }

  console.log('=== UPLOAD COMPLETE ===');
}

main().catch(console.error);
