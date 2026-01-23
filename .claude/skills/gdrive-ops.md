---
name: gdrive-ops
description: Google Drive operations skill for file upload, download, folder management, sharing, and file movement. CFO tool available to subordinate agents.
version: 1.0.0
level: 3
triggers:
  - google drive
  - gdrive
  - upload to drive
  - download from drive
  - share file
  - drive folder
  - move file
---

# gdrive-ops Skill

Google Drive file and folder operations for CFO agent and subordinates. Enables autonomous document management, sharing, and organization across Google Drive.

## Quick Commands

| Command | Tool | Description |
|---------|------|-------------|
| `upload` | `gdrive_upload` | Upload local file to Drive |
| `download` | `gdrive_download` | Download file from Drive |
| `list` | `gdrive_list` | List folder contents |
| `create folder` | `gdrive_create_folder` | Create new folder |
| `share` | `gdrive_share` | Share file/folder with users |
| `move` | `gdrive_move` | Move file between folders |
| `search` | `gdrive_search` | Search files by name |
| `info` | `gdrive_info` | Get file metadata and permissions |
| `status` | `gdrive_status` | Check Drive connection status |

---

## Level 1: Basic Operations

### Upload File

Upload a local file to Google Drive.

```json
{
  "tool": "gdrive_upload",
  "params": {
    "file_path": "C:/path/to/file.pdf",
    "folder_id": "1abc123...",
    "mime_type": "application/pdf"
  }
}
```

**Parameters:**
- `file_path` (required): Absolute path to local file
- `folder_id` (optional): Target folder ID (defaults to root)
- `mime_type` (optional): MIME type (auto-detected if omitted)

**Response:**
```json
{
  "success": true,
  "fileId": "1xyz789...",
  "name": "file.pdf",
  "webViewLink": "https://drive.google.com/file/d/..."
}
```

### Download File

Download a file from Google Drive.

```json
{
  "tool": "gdrive_download",
  "params": {
    "file_id": "1xyz789...",
    "destination_path": "C:/downloads/file.pdf"
  }
}
```

**Parameters:**
- `file_id` (required): Google Drive file ID
- `destination_path` (optional): Local save path (defaults to server downloads folder)

### List Folder Contents

List files and folders in a Drive folder.

```json
{
  "tool": "gdrive_list",
  "params": {
    "folder_id": "root",
    "page_size": 50,
    "page_token": null
  }
}
```

**Parameters:**
- `folder_id` (optional): Folder ID or "root" (defaults to root)
- `page_size` (optional): Items per page, max 100 (default: 50)
- `page_token` (optional): Pagination token for next page

---

## Level 2: Folder Management

### Create Folder

Create a new folder in Google Drive.

```json
{
  "tool": "gdrive_create_folder",
  "params": {
    "name": "Project Documents",
    "parent_id": "1abc123..."
  }
}
```

**Parameters:**
- `name` (required): Folder name
- `parent_id` (optional): Parent folder ID (defaults to root)

### Move File

Move a file or folder to a different location.

```json
{
  "tool": "gdrive_move",
  "params": {
    "file_id": "1xyz789...",
    "new_folder_id": "1abc123...",
    "remove_from_current": true
  }
}
```

**Parameters:**
- `file_id` (required): File or folder ID to move
- `new_folder_id` (required): Destination folder ID
- `remove_from_current` (optional): Remove from current location (default: true)

---

## Level 3: Sharing & Search

### Share File/Folder

Share a file or folder with users.

```json
{
  "tool": "gdrive_share",
  "params": {
    "file_id": "1xyz789...",
    "email": "user@example.com",
    "role": "reader",
    "type": "user",
    "send_notification": true
  }
}
```

**Parameters:**
- `file_id` (required): File or folder ID
- `email` (required): Email address or domain to share with
- `role` (optional): Permission level (default: "reader")
  - `reader` - View only
  - `commenter` - View and comment
  - `writer` - Edit access
  - `organizer` - Full folder control
  - `owner` - Transfer ownership
- `type` (optional): Share type (default: "user")
  - `user` - Individual user
  - `group` - Google Group
  - `domain` - Entire domain
  - `anyone` - Public link
- `send_notification` (optional): Email notification (default: true)

### Search Files

Search for files by name.

```json
{
  "tool": "gdrive_search",
  "params": {
    "query": "quarterly report",
    "page_size": 50
  }
}
```

### Get File Info

Get detailed metadata and permissions for a file.

```json
{
  "tool": "gdrive_info",
  "params": {
    "file_id": "1xyz789..."
  }
}
```

---

## Authentication Setup

The server supports two authentication methods:

### Option 1: Service Account (Recommended for Server)

1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Save as `service-account.json` in the server directory
4. Share target Drive folders with the service account email

### Option 2: OAuth2

1. Create OAuth2 credentials in Google Cloud Console
2. Save `credentials.json` in the server directory
3. Run initial auth flow to generate `token.json`

### Environment Variables

Set in Claude desktop config or server environment:

```bash
GOOGLE_CLIENT_ID=           # OAuth2 client ID
GOOGLE_CLIENT_SECRET=       # OAuth2 client secret
GOOGLE_REFRESH_TOKEN=       # OAuth2 refresh token
GOOGLE_SERVICE_ACCOUNT_PATH=# Path to service account JSON
GOOGLE_CREDENTIALS_PATH=    # Path to OAuth2 credentials JSON
GOOGLE_TOKEN_PATH=          # Path to OAuth2 token JSON
GOOGLE_DRIVE_DOWNLOAD_PATH= # Default download directory
```

---

## Usage Examples

### Upload Report to Project Folder

```
Upload the quarterly report PDF to the Finance folder in Google Drive.

Use gdrive_upload with:
- file_path: C:/reports/Q4-2026-report.pdf
- folder_id: 1abc123xyz (Finance folder ID)
```

### Share Folder with Team

```
Share the Project Documents folder with the engineering team.

Use gdrive_share with:
- file_id: 1xyz789abc (folder ID)
- email: engineering@company.com
- role: writer
- type: group
```

### Organize Files

```
Move all Q4 reports to the Archive folder.

1. Use gdrive_search with query: "Q4 report"
2. For each result, use gdrive_move with:
   - file_id: (from search results)
   - new_folder_id: 1archive123
```

### Create Project Structure

```
Create a new project folder structure.

1. gdrive_create_folder: "Project Alpha" in root
2. gdrive_create_folder: "Documents" in Project Alpha
3. gdrive_create_folder: "Resources" in Project Alpha
4. gdrive_create_folder: "Archive" in Project Alpha
```

---

## Integration Points

| Agent | Use Case |
|-------|----------|
| `docs-admin-ops` | Upload generated documentation |
| `bookkeeper-ops` | Store financial reports |
| `proof-librarian-ops` | Archive proof packs |
| `release-ops` | Store release artifacts |

---

## Success Criteria

- Files upload without errors
- Downloads complete and are accessible
- Sharing permissions are applied correctly
- Folder operations complete successfully
- Search returns relevant results
- Connection status shows initialized

---

## Troubleshooting

### "Google Drive not initialized"

Authentication credentials are missing or invalid. Check:
1. Service account JSON exists and is valid
2. OR OAuth2 credentials and token exist
3. Environment variables are set correctly

### "Permission denied"

For service accounts:
- Ensure the target folder is shared with the service account email

For OAuth2:
- Refresh the token if expired
- Verify the token has Drive API scopes

### "File not found"

- Verify the file ID is correct
- Check if the file is in trash
- Ensure you have access permissions
