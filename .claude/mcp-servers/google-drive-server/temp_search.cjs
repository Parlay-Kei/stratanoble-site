const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function main() {
  const serviceAccountPath = path.join(__dirname, 'service-account.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.log('ERROR: service-account.json not found');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // Search for Direct Cuts folder
  const res = await drive.files.list({
    q: "name = 'Direct Cuts' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id, name, parents)',
    spaces: 'drive',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  console.log('Direct Cuts folders found:');
  console.log(JSON.stringify(res.data.files, null, 2));
}

main().catch(console.error);
