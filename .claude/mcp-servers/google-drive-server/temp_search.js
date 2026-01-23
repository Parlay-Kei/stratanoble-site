const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function main() {
  const credPath = path.join(__dirname, 'credentials.json');
  const tokenPath = path.join(__dirname, 'token.json');

  if (!fs.existsSync(credPath)) {
    console.log('ERROR: credentials.json not found');
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (!fs.existsSync(tokenPath)) {
    console.log('ERROR: token.json not found');
    return;
  }

  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  oAuth2Client.setCredentials(token);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  // Search for Direct Cuts folder
  const res = await drive.files.list({
    q: "name = 'Direct Cuts' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id, name, parents)',
    spaces: 'drive'
  });

  console.log('Direct Cuts folders found:');
  console.log(JSON.stringify(res.data.files, null, 2));
}

main().catch(console.error);
