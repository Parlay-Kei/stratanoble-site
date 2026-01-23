#!/usr/bin/env node
/**
 * ANX Google Drive MCP Server v1.0
 *
 * Provides Google Drive operations for CFO agent and subordinates:
 * - File upload/download
 * - Folder creation and management
 * - File/folder sharing
 * - File movement between folders
 *
 * Authentication: OAuth2 or Service Account
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, 'credentials.json'),
  tokenPath: process.env.GOOGLE_TOKEN_PATH || path.join(__dirname, 'token.json'),
  serviceAccountPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'service-account.json'),
  logPath: path.join(__dirname, 'server.log'),
  downloadPath: process.env.GOOGLE_DRIVE_DOWNLOAD_PATH || path.join(__dirname, 'downloads'),
};

// SCOPES for Google Drive API
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
];

// Server state
const state = {
  auth: null,
  drive: null,
  startTime: Date.now(),
  initialized: false,
};

/**
 * Logger with file persistence
 */
class Logger {
  static async log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, ...meta };

    console.error(`[${timestamp}] ${level.toUpperCase()}: ${message}`);

    try {
      await fs.appendFile(
        CONFIG.logPath,
        JSON.stringify(entry) + '\n',
        'utf-8'
      );
    } catch (err) {
      // Silently fail logging
    }
  }

  static info(msg, meta) { return this.log('info', msg, meta); }
  static warn(msg, meta) { return this.log('warn', msg, meta); }
  static error(msg, meta) { return this.log('error', msg, meta); }
}

/**
 * Initialize Google Drive authentication
 * Supports Application Default Credentials (ADC), OAuth2, and Service Account authentication
 */
async function initializeAuth() {
  // Try Application Default Credentials first (from gcloud auth application-default login)
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
    });

    // Test if ADC works by getting a client
    const client = await auth.getClient();

    state.auth = auth;
    state.drive = google.drive({ version: 'v3', auth });
    state.initialized = true;

    await Logger.info('Initialized with Application Default Credentials (ADC)');
    return true;
  } catch (err) {
    await Logger.warn('ADC auth failed', { error: err.message });
  }

  // Try Service Account
  try {
    const serviceAccountExists = await fs.access(CONFIG.serviceAccountPath).then(() => true).catch(() => false);

    if (serviceAccountExists) {
      const content = await fs.readFile(CONFIG.serviceAccountPath, 'utf-8');
      const credentials = JSON.parse(content);

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });

      state.auth = auth;
      state.drive = google.drive({ version: 'v3', auth });
      state.initialized = true;

      await Logger.info('Initialized with Service Account authentication');
      return true;
    }
  } catch (err) {
    await Logger.warn('Service Account auth failed', { error: err.message });
  }

  // Try OAuth2
  try {
    const credentialsExist = await fs.access(CONFIG.credentialsPath).then(() => true).catch(() => false);
    const tokenExists = await fs.access(CONFIG.tokenPath).then(() => true).catch(() => false);

    if (credentialsExist && tokenExists) {
      const credContent = await fs.readFile(CONFIG.credentialsPath, 'utf-8');
      const tokenContent = await fs.readFile(CONFIG.tokenPath, 'utf-8');

      const credentials = JSON.parse(credContent);
      const token = JSON.parse(tokenContent);

      const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

      const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      oauth2Client.setCredentials(token);

      state.auth = oauth2Client;
      state.drive = google.drive({ version: 'v3', auth: oauth2Client });
      state.initialized = true;

      await Logger.info('Initialized with OAuth2 authentication');
      return true;
    }
  } catch (err) {
    await Logger.warn('OAuth2 auth failed', { error: err.message });
  }

  await Logger.error('No valid authentication credentials found. Please set up credentials.');
  state.initialized = false;
  return false;
}

/**
 * Ensure downloads directory exists
 */
async function ensureDownloadDir() {
  await fs.mkdir(CONFIG.downloadPath, { recursive: true });
}

/**
 * Upload file to Google Drive
 */
async function uploadFile(filePath, folderId = null, mimeType = null) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  const fileName = path.basename(filePath);

  const fileMetadata = {
    name: fileName,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType: mimeType || 'application/octet-stream',
    body: createReadStream(filePath),
  };

  try {
    const response = await state.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, mimeType, size, webViewLink, webContentLink',
    });

    await Logger.info('File uploaded', { fileName, fileId: response.data.id });

    return {
      success: true,
      fileId: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      size: response.data.size,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (err) {
    await Logger.error('Upload failed', { fileName, error: err.message });
    throw new Error(`Upload failed: ${err.message}`);
  }
}

/**
 * Download file from Google Drive
 */
async function downloadFile(fileId, destinationPath = null) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  try {
    // Get file metadata first
    const fileMetadata = await state.drive.files.get({
      fileId: fileId,
      fields: 'name, mimeType, size',
    });

    const fileName = fileMetadata.data.name;
    await ensureDownloadDir();

    const destPath = destinationPath || path.join(CONFIG.downloadPath, fileName);

    // Download the file
    const response = await state.drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
      const dest = createWriteStream(destPath);

      response.data
        .on('end', async () => {
          await Logger.info('File downloaded', { fileName, fileId, destPath });
          resolve({
            success: true,
            fileId,
            name: fileName,
            mimeType: fileMetadata.data.mimeType,
            size: fileMetadata.data.size,
            downloadedTo: destPath,
          });
        })
        .on('error', async (err) => {
          await Logger.error('Download failed', { fileId, error: err.message });
          reject(new Error(`Download failed: ${err.message}`));
        })
        .pipe(dest);
    });
  } catch (err) {
    await Logger.error('Download failed', { fileId, error: err.message });
    throw new Error(`Download failed: ${err.message}`);
  }
}

/**
 * List folder contents
 */
async function listFolder(folderId = 'root', pageSize = 100, pageToken = null) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  try {
    const query = folderId === 'root'
      ? "'root' in parents and trashed = false"
      : `'${folderId}' in parents and trashed = false`;

    const params = {
      q: query,
      pageSize,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, parents)',
      orderBy: 'modifiedTime desc',
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await state.drive.files.list(params);

    await Logger.info('Folder listed', { folderId, fileCount: response.data.files.length });

    return {
      success: true,
      folderId,
      files: response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        isFolder: file.mimeType === 'application/vnd.google-apps.folder',
      })),
      nextPageToken: response.data.nextPageToken,
      hasMore: !!response.data.nextPageToken,
    };
  } catch (err) {
    await Logger.error('List folder failed', { folderId, error: err.message });
    throw new Error(`List folder failed: ${err.message}`);
  }
}

/**
 * Create folder in Google Drive
 */
async function createFolder(name, parentId = null) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  try {
    const response = await state.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink',
    });

    await Logger.info('Folder created', { name, folderId: response.data.id });

    return {
      success: true,
      folderId: response.data.id,
      name: response.data.name,
      webViewLink: response.data.webViewLink,
    };
  } catch (err) {
    await Logger.error('Create folder failed', { name, error: err.message });
    throw new Error(`Create folder failed: ${err.message}`);
  }
}

/**
 * Share file or folder
 */
async function shareFile(fileId, email, role = 'reader', type = 'user', sendNotification = true) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  const validRoles = ['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];
  const validTypes = ['user', 'group', 'domain', 'anyone'];

  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  if (!validTypes.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  const permission = {
    type,
    role,
  };

  if (type === 'user' || type === 'group') {
    permission.emailAddress = email;
  } else if (type === 'domain') {
    permission.domain = email;
  }

  try {
    const response = await state.drive.permissions.create({
      fileId,
      requestBody: permission,
      sendNotificationEmail: sendNotification,
      fields: 'id, type, role, emailAddress',
    });

    await Logger.info('File shared', { fileId, email, role, type });

    // Get the sharing link
    const fileResponse = await state.drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    });

    return {
      success: true,
      fileId,
      permissionId: response.data.id,
      sharedWith: email,
      role,
      type,
      webViewLink: fileResponse.data.webViewLink,
      webContentLink: fileResponse.data.webContentLink,
    };
  } catch (err) {
    await Logger.error('Share file failed', { fileId, email, error: err.message });
    throw new Error(`Share file failed: ${err.message}`);
  }
}

/**
 * Move file to different folder
 */
async function moveFile(fileId, newFolderId, removeFromCurrent = true) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  try {
    // Get current parents
    const file = await state.drive.files.get({
      fileId,
      fields: 'name, parents',
    });

    const previousParents = removeFromCurrent
      ? file.data.parents.join(',')
      : undefined;

    const response = await state.drive.files.update({
      fileId,
      addParents: newFolderId,
      removeParents: previousParents,
      fields: 'id, name, parents, webViewLink',
    });

    await Logger.info('File moved', { fileId, newFolderId });

    return {
      success: true,
      fileId: response.data.id,
      name: response.data.name,
      newParents: response.data.parents,
      webViewLink: response.data.webViewLink,
    };
  } catch (err) {
    await Logger.error('Move file failed', { fileId, newFolderId, error: err.message });
    throw new Error(`Move file failed: ${err.message}`);
  }
}

/**
 * Search files in Google Drive
 */
async function searchFiles(query, pageSize = 50) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  try {
    // Build the search query
    const searchQuery = `name contains '${query}' and trashed = false`;

    const response = await state.drive.files.list({
      q: searchQuery,
      pageSize,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, parents)',
      orderBy: 'modifiedTime desc',
    });

    await Logger.info('Search completed', { query, resultCount: response.data.files.length });

    return {
      success: true,
      query,
      files: response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        isFolder: file.mimeType === 'application/vnd.google-apps.folder',
      })),
      count: response.data.files.length,
    };
  } catch (err) {
    await Logger.error('Search failed', { query, error: err.message });
    throw new Error(`Search failed: ${err.message}`);
  }
}

/**
 * Get file metadata
 */
async function getFileInfo(fileId) {
  if (!state.initialized) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  try {
    const response = await state.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime, createdTime, webViewLink, webContentLink, parents, owners, sharingUser, permissions',
    });

    await Logger.info('File info retrieved', { fileId, name: response.data.name });

    return {
      success: true,
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      size: response.data.size,
      modifiedTime: response.data.modifiedTime,
      createdTime: response.data.createdTime,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      parents: response.data.parents,
      owners: response.data.owners,
      permissions: response.data.permissions,
      isFolder: response.data.mimeType === 'application/vnd.google-apps.folder',
    };
  } catch (err) {
    await Logger.error('Get file info failed', { fileId, error: err.message });
    throw new Error(`Get file info failed: ${err.message}`);
  }
}

/**
 * Initialize server
 */
async function initializeServer() {
  await Logger.info('Starting ANX Google Drive MCP Server v1.0');

  // Initialize authentication
  const authSuccess = await initializeAuth();

  if (authSuccess) {
    await Logger.info('Server initialized with Google Drive authentication');
  } else {
    await Logger.warn('Server started without Google Drive authentication. Configure credentials to enable operations.');
  }

  await ensureDownloadDir();

  return authSuccess;
}

/**
 * Main MCP Server
 */
const server = new Server(
  {
    name: 'anx-google-drive-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'gdrive_upload',
        description: 'Upload a file to Google Drive. Optionally specify a folder ID to upload to a specific folder.',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Absolute path to the local file to upload',
            },
            folder_id: {
              type: 'string',
              description: 'Optional: Google Drive folder ID to upload to. If not specified, uploads to root.',
            },
            mime_type: {
              type: 'string',
              description: 'Optional: MIME type of the file. Auto-detected if not specified.',
            },
          },
          required: ['file_path'],
        },
      },
      {
        name: 'gdrive_download',
        description: 'Download a file from Google Drive to local storage.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'Google Drive file ID to download',
            },
            destination_path: {
              type: 'string',
              description: 'Optional: Local path to save the file. If not specified, saves to default downloads folder.',
            },
          },
          required: ['file_id'],
        },
      },
      {
        name: 'gdrive_list',
        description: 'List contents of a Google Drive folder. Returns files and subfolders.',
        inputSchema: {
          type: 'object',
          properties: {
            folder_id: {
              type: 'string',
              description: 'Folder ID to list. Use "root" for root folder.',
              default: 'root',
            },
            page_size: {
              type: 'integer',
              description: 'Number of items to return (max 100)',
              default: 50,
            },
            page_token: {
              type: 'string',
              description: 'Optional: Token for pagination to get next page of results.',
            },
          },
        },
      },
      {
        name: 'gdrive_create_folder',
        description: 'Create a new folder in Google Drive.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the new folder',
            },
            parent_id: {
              type: 'string',
              description: 'Optional: Parent folder ID. If not specified, creates in root.',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'gdrive_share',
        description: 'Share a file or folder with a user, group, or make it public.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'Google Drive file or folder ID to share',
            },
            email: {
              type: 'string',
              description: 'Email address to share with (for user/group type) or domain name (for domain type)',
            },
            role: {
              type: 'string',
              enum: ['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'],
              description: 'Permission role: reader, commenter, writer, organizer, fileOrganizer, or owner',
              default: 'reader',
            },
            type: {
              type: 'string',
              enum: ['user', 'group', 'domain', 'anyone'],
              description: 'Type of share: user, group, domain, or anyone',
              default: 'user',
            },
            send_notification: {
              type: 'boolean',
              description: 'Whether to send an email notification to the recipient',
              default: true,
            },
          },
          required: ['file_id', 'email'],
        },
      },
      {
        name: 'gdrive_move',
        description: 'Move a file or folder to a different location in Google Drive.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'Google Drive file or folder ID to move',
            },
            new_folder_id: {
              type: 'string',
              description: 'Destination folder ID',
            },
            remove_from_current: {
              type: 'boolean',
              description: 'Whether to remove from current folder(s). If false, creates a copy reference.',
              default: true,
            },
          },
          required: ['file_id', 'new_folder_id'],
        },
      },
      {
        name: 'gdrive_search',
        description: 'Search for files in Google Drive by name.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query - searches file names',
            },
            page_size: {
              type: 'integer',
              description: 'Maximum number of results to return',
              default: 50,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'gdrive_info',
        description: 'Get detailed information about a file or folder, including permissions and sharing status.',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: {
              type: 'string',
              description: 'Google Drive file or folder ID',
            },
          },
          required: ['file_id'],
        },
      },
      {
        name: 'gdrive_status',
        description: 'Check the status of the Google Drive connection and authentication.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'gdrive_upload': {
        const { file_path, folder_id, mime_type } = args;
        const result = await uploadFile(file_path, folder_id, mime_type);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_download': {
        const { file_id, destination_path } = args;
        const result = await downloadFile(file_id, destination_path);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_list': {
        const { folder_id = 'root', page_size = 50, page_token } = args;
        const result = await listFolder(folder_id, page_size, page_token);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_create_folder': {
        const { name: folderName, parent_id } = args;
        const result = await createFolder(folderName, parent_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_share': {
        const { file_id, email, role = 'reader', type = 'user', send_notification = true } = args;
        const result = await shareFile(file_id, email, role, type, send_notification);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_move': {
        const { file_id, new_folder_id, remove_from_current = true } = args;
        const result = await moveFile(file_id, new_folder_id, remove_from_current);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_search': {
        const { query, page_size = 50 } = args;
        const result = await searchFiles(query, page_size);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_info': {
        const { file_id } = args;
        const result = await getFileInfo(file_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'gdrive_status': {
        const status = {
          initialized: state.initialized,
          uptime_ms: Date.now() - state.startTime,
          auth_type: state.initialized
            ? (state.auth.constructor.name === 'GoogleAuth' ? 'adc_or_service_account' : 'oauth2')
            : 'none',
          credentials_path: CONFIG.credentialsPath,
          service_account_path: CONFIG.serviceAccountPath,
          token_path: CONFIG.tokenPath,
          download_path: CONFIG.downloadPath,
        };

        if (!state.initialized) {
          status.setup_instructions = 'See SETUP_CREDENTIALS.md for instructions on configuring Google Drive authentication.';
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    await Logger.error(`Tool error: ${name}`, { error: err.message });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: err.message,
            tool: name,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start server
 */
async function main() {
  try {
    await initializeServer();

    const transport = new StdioServerTransport();
    await server.connect(transport);

    await Logger.info('Server connected and ready');
  } catch (err) {
    await Logger.error('Server failed to start', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

main();
