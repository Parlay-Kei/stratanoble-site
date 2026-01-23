const { google } = require('googleapis');
const path = require('path');

async function main() {
  const serviceAccountPath = path.join(__dirname, 'service-account.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // List shared drives the service account has access to
  const res = await drive.drives.list({
    fields: 'drives(id, name)'
  });

  console.log('Shared Drives accessible by service account:');
  console.log(JSON.stringify(res.data.drives, null, 2));
}

main().catch(console.error);
