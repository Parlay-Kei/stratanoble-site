# ANX Google Drive MCP Server

A Model Context Protocol (MCP) server that provides Google Drive operations for Claude agents. This server is designed for the CFO agent and subordinate agents to manage files, folders, and sharing in Google Drive.

## Features

- **File Upload**: Upload local files to Google Drive folders
- **File Download**: Download files from Drive to local storage
- **Folder Management**: Create folders and list folder contents
- **File Sharing**: Share files/folders with users, groups, or publicly
- **File Movement**: Move files between folders
- **Search**: Search for files by name
- **File Info**: Get detailed metadata and permissions

## Quick Start

1. **Install dependencies**:
   ```bash
   cd C:\Dev\.claude-anx\mcp-servers\google-drive-server
   npm install
   ```

2. **Configure authentication** (see [SETUP_CREDENTIALS.md](./SETUP_CREDENTIALS.md) for detailed instructions)

3. **Start the server**:
   ```bash
   npm start
   ```

## Available Tools

| Tool | Description |
|------|-------------|
| `gdrive_upload` | Upload file to Drive folder |
| `gdrive_download` | Download file from Drive |
| `gdrive_list` | List folder contents |
| `gdrive_create_folder` | Create new folder |
| `gdrive_share` | Share file/folder with email |
| `gdrive_move` | Move file to different folder |
| `gdrive_search` | Search for files by name |
| `gdrive_info` | Get detailed file/folder info |
| `gdrive_status` | Check connection status |

## Authentication Options

### Option 1: Service Account (Recommended for Automation)

Best for server-to-server automation. Place your service account JSON at:
```
C:\Dev\.claude-anx\mcp-servers\google-drive-server\service-account.json
```

### Option 2: OAuth2 (For User-Level Access)

For accessing a specific user's Drive. Requires:
- `credentials.json` - OAuth2 client credentials
- `token.json` - OAuth2 refresh token

### Environment Variables

Override default paths using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CREDENTIALS_PATH` | OAuth2 credentials file | `./credentials.json` |
| `GOOGLE_TOKEN_PATH` | OAuth2 token file | `./token.json` |
| `GOOGLE_SERVICE_ACCOUNT_PATH` | Service account file | `./service-account.json` |
| `GOOGLE_DRIVE_DOWNLOAD_PATH` | Download directory | `./downloads` |

## Claude Desktop Configuration

The server is configured in Claude Desktop at:
```
C:\Users\mrste\AppData\Roaming\Claude\claude_desktop_config.json
```

## Example Usage

### Upload a file
```json
{
  "tool": "gdrive_upload",
  "arguments": {
    "file_path": "C:\\Reports\\monthly-report.pdf",
    "folder_id": "1ABC123xyz"
  }
}
```

### List folder contents
```json
{
  "tool": "gdrive_list",
  "arguments": {
    "folder_id": "root",
    "page_size": 50
  }
}
```

### Share a file
```json
{
  "tool": "gdrive_share",
  "arguments": {
    "file_id": "1ABC123xyz",
    "email": "user@example.com",
    "role": "reader"
  }
}
```

### Create a folder
```json
{
  "tool": "gdrive_create_folder",
  "arguments": {
    "name": "2026 Financial Reports",
    "parent_id": "1ABC123xyz"
  }
}
```

## Error Handling

All tools return a consistent response format:

**Success:**
```json
{
  "success": true,
  "fileId": "...",
  "name": "...",
  ...
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "tool": "tool_name"
}
```

## Logging

Server logs are written to:
```
C:\Dev\.claude-anx\mcp-servers\google-drive-server\server.log
```

## Access Control

This server is intended for use by:
- **CFO Agent**: Full access to all operations
- **Bookkeeper Agent**: Access via CFO delegation
- **Finance Subordinates**: Access as delegated by CFO

## Troubleshooting

### "Google Drive not initialized"
Credentials are missing or invalid. Run `gdrive_status` to check configuration paths, then see SETUP_CREDENTIALS.md.

### "Permission denied"
The authenticated account doesn't have access to the requested file/folder. Verify sharing permissions.

### "Invalid credentials"
The credentials.json or service-account.json is malformed. Re-download from Google Cloud Console.

## Related Documentation

- [SETUP_CREDENTIALS.md](./SETUP_CREDENTIALS.md) - Detailed credential setup guide
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/reference)
- [ANX Skills Registry](../../skills/manifest.json) - Available skills
