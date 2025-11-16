# MCP Integration Setup Guide

**Date:** November 3, 2025
**Status:** Ready for Configuration

---

## Overview

This guide walks through configuring Google Drive and Notion MCP (Model Context Protocol) integrations for the StrataNoble DevOps agent.

**Benefits:**
- Access brand assets and documentation from Google Drive
- Query and update Notion databases for task management
- Automated knowledge base integration
- Enhanced agent capabilities with real document access

---

## 1. Google Drive MCP Integration

### Prerequisites
- Google Cloud Console access
- Google Drive with brand assets/documentation

### Step 1: Create OAuth 2.0 Credentials

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Select Project:**
   - Use existing project: `Strata-MAIN`
   - Or create new project: `StrataNoble-DevOps`

3. **Enable Google Drive API:**
   ```
   https://console.cloud.google.com/apis/library/drive.googleapis.com
   ```
   - Click "Enable"
   - Wait for API activation

4. **Create OAuth 2.0 Client ID:**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Desktop app**
   - Name: `StrataNoble DevOps Agent`
   - Click "Create"
   - **Save the Client ID and Client Secret**

### Step 2: Get Refresh Token

1. **Go to OAuth 2.0 Playground:**
   ```
   https://developers.google.com/oauthplayground/
   ```

2. **Configure Settings (gear icon top-right):**
   - ✅ Check "Use your own OAuth credentials"
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Close settings

3. **Select Scopes (left panel):**
   - Expand "Drive API v3"
   - Select: `https://www.googleapis.com/auth/drive.readonly`
   - Click "Authorize APIs"

4. **Authorize:**
   - Sign in with Google account that has access to Drive
   - Click "Allow"
   - You'll be redirected back to playground

5. **Exchange Authorization Code:**
   - Click "Exchange authorization code for tokens"
   - **Copy the Refresh Token** (long string starting with "1//")

### Step 3: Add to Environment

Add to `apps/website/.env.local`:

```env
# --- Google Drive MCP Configuration ---
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=GOCSPX-your_client_secret_here
GOOGLE_DRIVE_REFRESH_TOKEN=1//your_refresh_token_here
```

### Step 4: Install MCP Server

```bash
# Install globally
npm install -g @modelcontextprotocol/server-google-drive

# Verify installation
npx @modelcontextprotocol/server-google-drive --version
```

### Step 5: Test Integration

```bash
# Run test suite
node scripts/test-google-drive-mcp.mjs
```

**Expected output:**
- ✅ Can list files in Drive
- ✅ Can search for files
- ✅ Can read file contents

---

## 2. Notion MCP Integration

### Prerequisites
- Notion workspace access
- Admin permissions to create integrations

### Step 1: Create Notion Integration

1. **Go to Notion Integrations:**
   ```
   https://www.notion.so/my-integrations
   ```

2. **Create New Integration:**
   - Click "New integration"
   - Name: `StrataNoble DevOps Agent`
   - Associated workspace: Select your workspace
   - Type: **Internal integration**

3. **Configure Capabilities:**
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
   - ✅ Read user information (optional)

4. **Submit:**
   - Click "Submit"
   - **Copy the Internal Integration Token** (starts with `secret_`)

### Step 2: Share Databases with Integration

1. **Open each Notion database you want to access**

2. **Click "..." menu → "Connections"**

3. **Search for "StrataNoble DevOps Agent"**

4. **Click "Confirm"**

**Recommended Databases:**
- 📋 Project Roadmap (tasks, milestones, sprints)
- 🐛 Bug Tracker (issues, severity, status)
- 📚 Technical Documentation (API docs, guides)
- 📝 Meeting Notes (decisions, action items)
- 💡 Feature Backlog (user stories, requirements)

### Step 3: Add to Environment

Add to `apps/website/.env.local`:

```env
# --- Notion MCP Configuration ---
NOTION_API_KEY=secret_your_integration_token_here
```

### Step 4: Install MCP Server

```bash
# Install globally
npm install -g @modelcontextprotocol/server-notion

# Verify installation
npx @modelcontextprotocol/server-notion --version
```

### Step 5: Test Integration

```bash
# Test Notion connectivity
node scripts/test-notion-mcp.mjs
```

**Expected output:**
- ✅ Can connect to Notion
- ✅ Can list databases
- ✅ Can query database items
- ✅ Can create pages

---

## 3. Verify MCP Configuration

### Check MCP Config Files

**Google Drive:** `.claude/mcp-configs/google-drive-mcp.json`
```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-drive"],
      "env": {
        "GOOGLE_DRIVE_CLIENT_ID": "${GOOGLE_DRIVE_CLIENT_ID}",
        "GOOGLE_DRIVE_CLIENT_SECRET": "${GOOGLE_DRIVE_CLIENT_SECRET}",
        "GOOGLE_DRIVE_REFRESH_TOKEN": "${GOOGLE_DRIVE_REFRESH_TOKEN}"
      }
    }
  }
}
```

**Notion:** `.claude/mcp-configs/notion-mcp.json`
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      }
    }
  }
}
```

### Run Full System Test

```powershell
# Test complete Phase 2 system
.\scripts\test-phase2-system.ps1
```

Should show:
- ✅ Google Drive MCP config exists
- ✅ Notion MCP config exists
- ✅ Environment variables configured

---

## 4. Usage Examples

### Google Drive MCP

**Search for brand assets:**
```
Agent: Search Google Drive for "StrataNoble logo"
→ Returns: List of logo files with links
```

**Read documentation:**
```
Agent: Get contents of "API Documentation.md" from Drive
→ Returns: Full document text for analysis
```

**Find recent files:**
```
Agent: Show me files modified in the last 7 days
→ Returns: Recent updates across Drive
```

### Notion MCP

**Query project roadmap:**
```
Agent: What tasks are due this week?
→ Returns: Filtered database items with deadlines
```

**Create new task:**
```
Agent: Add bug report: "Dashboard not loading on Safari"
→ Creates: New page in Bug Tracker database
```

**Search documentation:**
```
Agent: Find all docs about authentication
→ Returns: Matching pages from Technical Documentation
```

---

## 5. Troubleshooting

### Google Drive Issues

**Error: "invalid_grant" or "Token has been expired or revoked"**
- Refresh token expired (90 days for test apps)
- **Solution:** Generate new refresh token via OAuth Playground

**Error: "Access Not Configured"**
- Drive API not enabled
- **Solution:** Enable Drive API in Cloud Console

**Error: "Insufficient Permission"**
- Wrong scopes selected
- **Solution:** Use `https://www.googleapis.com/auth/drive.readonly`

### Notion Issues

**Error: "Unauthorized"**
- Integration token incorrect
- **Solution:** Verify token in .env.local matches Notion integration

**Error: "Database not found"**
- Database not shared with integration
- **Solution:** Share database via "..." → "Connections" → Select integration

**Error: "Validation failed"**
- Integration lacks required capabilities
- **Solution:** Edit integration, enable Read/Update/Insert content

### General MCP Issues

**Error: "Command not found: npx"**
- Node.js not installed or not in PATH
- **Solution:** Install Node.js 18+ from nodejs.org

**Error: "Module not found"**
- MCP server not installed
- **Solution:** Run `npm install -g @modelcontextprotocol/server-[name]`

---

## 6. Security Best Practices

### Credential Management

✅ **DO:**
- Store credentials in `.env.local` (git-ignored)
- Use separate credentials for dev/staging/production
- Rotate tokens every 90 days
- Limit API scopes to minimum required
- Use service accounts for production

❌ **DON'T:**
- Commit credentials to git
- Share credentials in Slack/email
- Use personal Google accounts for production
- Grant write access unless necessary
- Reuse tokens across environments

### Access Control

**Google Drive:**
- Create dedicated service account for production
- Limit Drive access to specific folders
- Use read-only scope when possible
- Audit access logs monthly

**Notion:**
- Create workspace-specific integrations
- Share only necessary databases
- Review integration connections quarterly
- Revoke unused integrations

---

## 7. Maintenance Schedule

### Weekly
- [ ] Verify MCP servers are running
- [ ] Check error logs for access issues
- [ ] Monitor API quota usage

### Monthly
- [ ] Review shared Notion databases
- [ ] Audit Google Drive file access
- [ ] Update MCP server packages

### Quarterly
- [ ] Rotate API credentials
- [ ] Review access permissions
- [ ] Update integration capabilities
- [ ] Test disaster recovery

### Annually
- [ ] Security audit of all integrations
- [ ] Migrate to service accounts (if using personal)
- [ ] Review and optimize API usage
- [ ] Update documentation

---

## 8. Advanced Configuration

### Custom Drive Folders

Limit access to specific folders:

```json
{
  "env": {
    "GOOGLE_DRIVE_FOLDER_ID": "1a2b3c4d5e6f7g8h9i0j"
  }
}
```

### Notion Database Templates

Pre-configure database schemas:

```json
{
  "env": {
    "NOTION_DATABASE_IDS": "db1_id,db2_id,db3_id"
  }
}
```

### Rate Limiting

Configure request limits:

```json
{
  "env": {
    "MCP_RATE_LIMIT": "100",
    "MCP_RATE_WINDOW": "60000"
  }
}
```

---

## 9. Integration Checklist

### Google Drive MCP

- [ ] Google Cloud project created
- [ ] Drive API enabled
- [ ] OAuth 2.0 client created (Desktop app)
- [ ] Refresh token obtained via OAuth Playground
- [ ] Credentials added to `.env.local`
- [ ] MCP server installed globally
- [ ] Test suite passes
- [ ] Brand assets accessible

### Notion MCP

- [ ] Notion integration created
- [ ] Capabilities configured (Read/Update/Insert)
- [ ] Integration token copied
- [ ] Databases shared with integration
- [ ] Token added to `.env.local`
- [ ] MCP server installed globally
- [ ] Test suite passes
- [ ] Can query databases

### Verification

- [ ] Phase 2 test suite: 100% pass rate
- [ ] DevOps dashboard shows integrations
- [ ] Agent can access Drive files
- [ ] Agent can query Notion databases
- [ ] Documentation updated
- [ ] Team trained on usage

---

## Quick Reference

### Environment Variables

```env
# Google Drive
GOOGLE_DRIVE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=GOCSPX-...
GOOGLE_DRIVE_REFRESH_TOKEN=1//...

# Notion
NOTION_API_KEY=secret_...
```

### Test Commands

```bash
# Google Drive
node scripts/test-google-drive-mcp.mjs

# Notion
node scripts/test-notion-mcp.mjs

# Full system
.\scripts\test-phase2-system.ps1
```

### Installation Commands

```bash
# Install MCP servers
npm install -g @modelcontextprotocol/server-google-drive
npm install -g @modelcontextprotocol/server-notion

# Verify
npx @modelcontextprotocol/server-google-drive --version
npx @modelcontextprotocol/server-notion --version
```

---

**Setup Time:** ~30 minutes (both integrations)
**Difficulty:** Intermediate
**Required Access:** Google Cloud Console, Notion Admin

**Questions?** See troubleshooting section or run: `.\scripts\run-devops-agent.ps1 -Mode setup`

---

**Last Updated:** November 3, 2025
**Version:** 1.0.0
**Status:** Ready for Configuration
