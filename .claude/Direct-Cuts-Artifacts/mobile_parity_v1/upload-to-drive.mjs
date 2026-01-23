import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FOLDER_ID = '1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK';

const FILES_TO_UPLOAD = [
  'DEVELOPER_COMPENSATION_MEMO.pdf',
  'DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.pdf',
  'DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.pdf',
  'DC_COST_LEDGER_V1.md'
];

async function uploadFiles() {
  try {
    // Use Application Default Credentials
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    console.log('Authenticated with Google Drive using ADC\n');

    const results = [];

    for (const fileName of FILES_TO_UPLOAD) {
      const filePath = path.join(__dirname, fileName);

      if (!fs.existsSync(filePath)) {
        console.log(`SKIP: ${fileName} - File not found`);
        results.push({ fileName, status: 'not_found' });
        continue;
      }

      // Determine MIME type
      const mimeType = fileName.endsWith('.pdf')
        ? 'application/pdf'
        : 'text/markdown';

      console.log(`Uploading: ${fileName}...`);

      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [FOLDER_ID]
        },
        media: {
          mimeType: mimeType,
          body: fs.createReadStream(filePath)
        },
        fields: 'id, name, webViewLink'
      });

      const fileData = response.data;
      console.log(`  SUCCESS: ${fileData.name}`);
      console.log(`  ID: ${fileData.id}`);
      console.log(`  Link: ${fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`}\n`);

      results.push({
        fileName: fileData.name,
        fileId: fileData.id,
        link: fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`,
        status: 'success'
      });
    }

    console.log('\n=== UPLOAD SUMMARY ===');
    console.log(JSON.stringify(results, null, 2));

    return results;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

uploadFiles();
