const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const DATA_ROOM_FOLDER_ID = '1j692Itw3GEALq4ydR4YTu35XY_Bb2Pvh';
const DATA_ROOM_PATH = 'C:\\Dev\\Direct-Cuts\\.anx-artifacts\\data_room_cameron_v1';

async function main() {
  // Try Application Default Credentials first
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // Test connection
  console.log('Testing ADC connection...');
  try {
    const about = await drive.about.get({ fields: 'user' });
    console.log('Connected as:', about.data.user.displayName, '(' + about.data.user.emailAddress + ')');
  } catch (err) {
    console.log('ADC failed:', err.message);
    console.log('\nTry running: gcloud auth application-default login');
    process.exit(1);
  }

  // Upload files
  const files = fs.readdirSync(DATA_ROOM_PATH).filter(f => f.endsWith('.md'));
  console.log(`\nUploading ${files.length} files to Cameron Data Room...`);

  for (const file of files) {
    const filePath = path.join(DATA_ROOM_PATH, file);
    const fileMetadata = {
      name: file,
      parents: [DATA_ROOM_FOLDER_ID]
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
      console.log(`  ✓ ${uploaded.data.name}`);
    } catch (err) {
      console.log(`  ✗ ${file}: ${err.message}`);
    }
  }

  console.log('\n=== UPLOAD COMPLETE ===');
  console.log('Folder: https://drive.google.com/drive/folders/' + DATA_ROOM_FOLDER_ID);
}

main().catch(console.error);
