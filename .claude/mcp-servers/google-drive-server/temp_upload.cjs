const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const DIRECT_CUTS_FOLDER_ID = '1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK';
const DATA_ROOM_PATH = 'C:\\Dev\\Direct-Cuts\\.anx-artifacts\\data_room_cameron_v1';

async function main() {
  const serviceAccountPath = path.join(__dirname, 'service-account.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // Step 1: Create "Cameron Data Room" folder
  console.log('Creating "Cameron Data Room" folder...');
  const folderMetadata = {
    name: 'Cameron Data Room',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [DIRECT_CUTS_FOLDER_ID]
  };

  const folder = await drive.files.create({
    resource: folderMetadata,
    fields: 'id, name, webViewLink'
  });

  const dataRoomFolderId = folder.data.id;
  console.log(`Created folder: ${folder.data.name}`);
  console.log(`Folder ID: ${dataRoomFolderId}`);
  console.log(`Web Link: ${folder.data.webViewLink}`);

  // Step 2: Upload all markdown files
  const files = fs.readdirSync(DATA_ROOM_PATH).filter(f => f.endsWith('.md'));
  console.log(`\nUploading ${files.length} files...`);

  for (const file of files) {
    const filePath = path.join(DATA_ROOM_PATH, file);
    const fileMetadata = {
      name: file,
      parents: [dataRoomFolderId]
    };
    const media = {
      mimeType: 'text/markdown',
      body: fs.createReadStream(filePath)
    };

    const uploaded = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name'
    });

    console.log(`  Uploaded: ${uploaded.data.name}`);
  }

  console.log('\n=== UPLOAD COMPLETE ===');
  console.log(`Folder: Cameron Data Room`);
  console.log(`Location: Direct Cuts / Cameron Data Room`);
  console.log(`Link: ${folder.data.webViewLink}`);
}

main().catch(console.error);
