# Quick MCP Setup - Step by Step

**Time Required:** 25 minutes
**Last Updated:** November 3, 2025

---

## Google Drive MCP (15 minutes)

### Step 1: Create OAuth Client (5 min)

1. **Open Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials?project=strata-main-440220
   ```

2. **Enable Drive API:**
   - Click "Enable APIs and Services"
   - Search for "Google Drive API"
   - Click "Enable"

3. **Create Credentials:**
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth client ID"
   - Application type: **Desktop app**
   - Name: `StrataNoble DevOps Agent`
   - Click "Create"

4. **Save Credentials:**
   - Copy **Client ID** (ends with .apps.googleusercontent.com)
   - Copy **Client Secret** (starts with GOCSPX-)
   - Keep this tab open

### Step 2: Get Refresh Token (5 min)

1. **Open OAuth Playground:**
   ```
   https://developers.google.com/oauthplayground/
   ```

2. **Configure Settings (gear icon top-right):**
   - ✅ Check "Use your own OAuth credentials"
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Close settings

3. **Authorize:**
   - In left panel under "Drive API v3", select:
     ```
     https://www.googleapis.com/auth/drive.readonly
     ```
   - Click "Authorize APIs"
   - Sign in and click "Allow"

4. **Get Token:**
   - Click "Exchange authorization code for tokens"
   - Copy the **Refresh token** (starts with 1//)

### Step 3: Add to .env.local (2 min)

Open `apps/website/.env.local` and add:

```env
# --- Google Drive MCP Configuration ---
GOOGLE_DRIVE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=GOCSPX-YOUR_SECRET_HERE
GOOGLE_DRIVE_REFRESH_TOKEN=1//YOUR_REFRESH_TOKEN_HERE
```

### Step 4: Install & Test (3 min)

```bash
# Install MCP server
npm install -g @modelcontextprotocol/server-google-drive

# Test
node scripts/test-google-drive-mcp.mjs
```

**Expected:** ✅ All 3 tests pass

---

## Notion MCP (10 minutes)

### Step 1: Create Integration (3 min)

1. **Open Notion Integrations:**
   ```
   https://www.notion.so/my-integrations
   ```

2. **Create New Integration:**
   - Click "+ New integration"
   - Name: `StrataNoble DevOps Agent`
   - Associated workspace: Select your workspace
   - Type: **Internal**

3. **Configure Capabilities:**
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
   - Leave "Read user information" unchecked

4. **Save:**
   - Click "Submit"
   - Copy **Internal Integration Token** (starts with secret_)

### Step 2: Share Databases (3 min)

For each database you want the agent to access:

1. Open the database in Notion
2. Click "**...**" menu (top-right)
3. Select "**Connections**"
4. Search for "StrataNoble DevOps Agent"
5. Click "**Confirm**"

**Recommended databases:**
- Project Roadmap
- Bug Tracker
- Technical Documentation
- Meeting Notes
- Feature Backlog

### Step 3: Add to .env.local (1 min)

Open `apps/website/.env.local` and add:

```env
# --- Notion MCP Configuration ---
NOTION_API_KEY=secret_YOUR_TOKEN_HERE
```

### Step 4: Install & Test (3 min)

```bash
# Install MCP server
npm install -g @modelcontextprotocol/server-notion

# Test
node scripts/test-notion-mcp.mjs
```

**Expected:** ✅ All 4 tests pass

---

## Verify Complete Setup

```powershell
# Run full system test
.\scripts\test-phase2-system.ps1
```

**Expected:** 18/19 tests passed (94.7%) → 100% with MCP credentials

---

## What You Can Do Now

**Google Drive:**
```
"Search my Drive for the StrataNoble logo"
"Get the contents of brand-guidelines.pdf"
"Show me files modified in the last week"
```

**Notion:**
```
"What tasks are due this week?"
"Create a bug report for the login issue"
"Search documentation about authentication"
```

---

## Troubleshooting

**Google Drive: "invalid_grant"**
- Refresh token expired
- Get new token from OAuth Playground

**Notion: "Unauthorized"**
- Check token in .env.local
- Verify it starts with "secret_"

**MCP: "Command not found"**
- Install server: `npm install -g @modelcontextprotocol/server-[name]`

---

**Need Help?** See full guide: [MCP_INTEGRATION_SETUP.md](MCP_INTEGRATION_SETUP.md)
