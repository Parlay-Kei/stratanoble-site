import { google } from 'googleapis';
import fs from 'fs';

const FOLDER_ID = '1KFd2O3k-hq8QS6QBPtUB6vTU8zJYzuFK';

// All financial documents to upload with their source paths
const FILES_TO_UPLOAD = [
  // From .anx-artifacts/mobile_parity_v1/
  {
    name: 'DC_RUN_RATE_MODEL_V1.md',
    path: 'c:\\Dev\\Direct-Cuts\\.anx-artifacts\\mobile_parity_v1\\DC_RUN_RATE_MODEL_V1.md'
  },
  {
    name: 'RUNWAY_AND_CASH_PLAN.md',
    path: 'c:\\Dev\\Direct-Cuts\\.anx-artifacts\\mobile_parity_v1\\RUNWAY_AND_CASH_PLAN.md'
  },
  {
    name: 'CFO_MISSION_SUMMARY.md',
    path: 'c:\\Dev\\Direct-Cuts\\.anx-artifacts\\mobile_parity_v1\\CFO_MISSION_SUMMARY.md'
  },
  {
    name: 'DC_DECISION_MEMOS_V1.md',
    path: 'c:\\Dev\\Direct-Cuts\\.anx-artifacts\\mobile_parity_v1\\DC_DECISION_MEMOS_V1.md'
  },
  // From docs/DC-TRUST-SPINE-30D/
  {
    name: '02_TWO_PATH_TERM_SHEET_FINAL_2025-12-29.md',
    path: 'c:\\Dev\\Direct-Cuts\\docs\\DC-TRUST-SPINE-30D\\02_TWO_PATH_TERM_SHEET_FINAL_2025-12-29.md'
  },
  {
    name: '06_CAP_TABLE_DRAFT_FINAL_2025-12-29.md',
    path: 'c:\\Dev\\Direct-Cuts\\docs\\DC-TRUST-SPINE-30D\\06_CAP_TABLE_DRAFT_FINAL_2025-12-29.md'
  },
  {
    name: '03_MSA_TEMPLATE_FINAL_2025-12-29.md',
    path: 'c:\\Dev\\Direct-Cuts\\docs\\DC-TRUST-SPINE-30D\\03_MSA_TEMPLATE_FINAL_2025-12-29.md'
  },
  {
    name: '05_IP_ASSIGNMENT_OR_LICENSE_FINAL_2025-12-29.md',
    path: 'c:\\Dev\\Direct-Cuts\\docs\\DC-TRUST-SPINE-30D\\05_IP_ASSIGNMENT_OR_LICENSE_FINAL_2025-12-29.md'
  },
  // From archive/
  {
    name: 'Direct Cuts Deck Powerpoint.pdf',
    path: 'c:\\Dev\\Direct-Cuts\\archive\\Direct Cuts Deck Powerpoint.pdf'
  }
];

function getMimeType(fileName) {
  if (fileName.endsWith('.pdf')) return 'application/pdf';
  if (fileName.endsWith('.md')) return 'text/markdown';
  return 'application/octet-stream';
}

async function uploadFiles() {
  try {
    // Use Application Default Credentials
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    console.log('Authenticated with Google Drive using ADC');
    console.log(`Target folder ID: ${FOLDER_ID}\n`);
    console.log('='.repeat(60));

    const results = [];

    for (const file of FILES_TO_UPLOAD) {
      const filePath = file.path;

      if (!fs.existsSync(filePath)) {
        console.log(`SKIP: ${file.name} - File not found at ${filePath}`);
        results.push({ fileName: file.name, status: 'not_found', path: filePath });
        continue;
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      const mimeType = getMimeType(file.name);

      console.log(`\nUploading: ${file.name}`);
      console.log(`  Size: ${fileSizeMB} MB`);
      console.log(`  MIME: ${mimeType}`);

      const response = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: [FOLDER_ID]
        },
        media: {
          mimeType: mimeType,
          body: fs.createReadStream(filePath)
        },
        fields: 'id, name, webViewLink, size'
      });

      const fileData = response.data;
      const link = fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`;

      console.log(`  SUCCESS!`);
      console.log(`  ID: ${fileData.id}`);
      console.log(`  Link: ${link}`);

      results.push({
        fileName: fileData.name,
        fileId: fileData.id,
        link: link,
        sizeMB: fileSizeMB,
        status: 'success'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n=== UPLOAD SUMMARY ===\n');

    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status !== 'success');

    console.log(`Total: ${results.length} files`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed/Skipped: ${failed.length}\n`);

    console.log('--- SUCCESSFUL UPLOADS ---\n');
    for (const r of successful) {
      console.log(`${r.fileName}`);
      console.log(`  ID: ${r.fileId}`);
      console.log(`  Link: ${r.link}`);
      console.log(`  Size: ${r.sizeMB} MB\n`);
    }

    if (failed.length > 0) {
      console.log('--- FAILED/SKIPPED ---\n');
      for (const r of failed) {
        console.log(`${r.fileName}: ${r.status}`);
      }
    }

    console.log('\n--- JSON RESULTS ---\n');
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
