import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const CAMERON_FOLDER_ID = '1j692Itw3GEALq4ydR4YTu35XY_Bb2Pvh';

// Files to upload
const files = [
  // Compensation Documents (from C:\Dev\.claude-anx\Direct-Cuts-Artifacts\mobile_parity_v1)
  {
    path: 'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DEVELOPER_COMPENSATION_MEMO.pdf',
    name: 'DEVELOPER_COMPENSATION_MEMO.pdf',
    type: 'application/pdf'
  },
  {
    path: 'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.pdf',
    name: 'DEVELOPER_COMPENSATION_EXECUTIVE_SUMMARY.pdf',
    type: 'application/pdf'
  },
  {
    path: 'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.pdf',
    name: 'DEVELOPER_COMPENSATION_DATA_ROOM_TABLE.pdf',
    type: 'application/pdf'
  },
  {
    path: 'C:/Dev/.claude-anx/Direct-Cuts-Artifacts/mobile_parity_v1/DC_COST_LEDGER_V1.md',
    name: 'DC_COST_LEDGER_V1.md',
    type: 'text/markdown'
  },

  // Financial Models & Planning (from c:\Dev\Direct-Cuts\.anx-artifacts\mobile_parity_v1)
  {
    path: 'C:/Dev/Direct-Cuts/.anx-artifacts/mobile_parity_v1/DC_RUN_RATE_MODEL_V1.md',
    name: 'DC_RUN_RATE_MODEL_V1.md',
    type: 'text/markdown'
  },
  {
    path: 'C:/Dev/Direct-Cuts/.anx-artifacts/mobile_parity_v1/RUNWAY_AND_CASH_PLAN.md',
    name: 'RUNWAY_AND_CASH_PLAN.md',
    type: 'text/markdown'
  },
  {
    path: 'C:/Dev/Direct-Cuts/.anx-artifacts/mobile_parity_v1/CFO_MISSION_SUMMARY.md',
    name: 'CFO_MISSION_SUMMARY.md',
    type: 'text/markdown'
  },
  {
    path: 'C:/Dev/Direct-Cuts/.anx-artifacts/mobile_parity_v1/DC_DECISION_MEMOS_V1.md',
    name: 'DC_DECISION_MEMOS_V1.md',
    type: 'text/markdown'
  },

  // Legal & Corporate (from c:\Dev\Direct-Cuts\docs\DC-TRUST-SPINE-30D)
  {
    path: 'C:/Dev/Direct-Cuts/docs/DC-TRUST-SPINE-30D/02_TWO_PATH_TERM_SHEET_FINAL_2025-12-29.md',
    name: '02_TWO_PATH_TERM_SHEET_FINAL_2025-12-29.md',
    type: 'text/markdown'
  },
  {
    path: 'C:/Dev/Direct-Cuts/docs/DC-TRUST-SPINE-30D/06_CAP_TABLE_DRAFT_FINAL_2025-12-29.md',
    name: '06_CAP_TABLE_DRAFT_FINAL_2025-12-29.md',
    type: 'text/markdown'
  },
  {
    path: 'C:/Dev/Direct-Cuts/docs/DC-TRUST-SPINE-30D/03_MSA_TEMPLATE_FINAL_2025-12-29.md',
    name: '03_MSA_TEMPLATE_FINAL_2025-12-29.md',
    type: 'text/markdown'
  },
  {
    path: 'C:/Dev/Direct-Cuts/docs/DC-TRUST-SPINE-30D/05_IP_ASSIGNMENT_OR_LICENSE_FINAL_2025-12-29.md',
    name: '05_IP_ASSIGNMENT_OR_LICENSE_FINAL_2025-12-29.md',
    type: 'text/markdown'
  },

  // Investor Materials (from c:\Dev\Direct-Cuts\archive)
  {
    path: 'C:/Dev/Direct-Cuts/archive/Direct Cuts Deck Powerpoint.pdf',
    name: 'Direct Cuts Deck Powerpoint.pdf',
    type: 'application/pdf'
  }
];

async function uploadFiles() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file']
  });

  const drive = google.drive({ version: 'v3', auth });

  console.log('Cameron Data Room Folder ID:', CAMERON_FOLDER_ID);
  console.log('Starting upload of ' + files.length + ' files...\n');

  const results = [];

  for (const file of files) {
    try {
      // Check if file exists
      if (!fs.existsSync(file.path)) {
        console.log('SKIP: File not found: ' + file.name);
        console.log('  Path: ' + file.path);
        results.push({ name: file.name, status: 'NOT_FOUND', error: 'File not found', path: file.path });
        continue;
      }

      const fileMetadata = {
        name: file.name,
        parents: [CAMERON_FOLDER_ID]
      };

      const media = {
        mimeType: file.type,
        body: fs.createReadStream(file.path)
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, size'
      });

      console.log('SUCCESS: ' + file.name);
      console.log('  ID: ' + response.data.id);
      console.log('  Link: ' + response.data.webViewLink);
      console.log('');

      results.push({
        name: file.name,
        status: 'SUCCESS',
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        size: response.data.size
      });
    } catch (err) {
      console.log('FAILED: ' + file.name);
      console.log('  Error: ' + err.message);
      console.log('');

      results.push({
        name: file.name,
        status: 'FAILED',
        error: err.message
      });
    }
  }

  console.log('\n=== UPLOAD SUMMARY ===');
  console.log('Total files: ' + files.length);
  console.log('Successful: ' + results.filter(r => r.status === 'SUCCESS').length);
  console.log('Failed: ' + results.filter(r => r.status === 'FAILED').length);
  console.log('Not found: ' + results.filter(r => r.status === 'NOT_FOUND').length);

  console.log('\n=== FULL RESULTS JSON ===');
  console.log(JSON.stringify(results, null, 2));
}

uploadFiles().catch(console.error);
