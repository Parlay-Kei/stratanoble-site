# Notion MCP - 5-Minute Setup

**Status:** Ready to configure
**Time:** 5 minutes
**Date:** November 3, 2025

---

## Step 1: Create Notion Integration (2 min)

1. **Open Notion Integrations:**
   ```
   https://www.notion.so/my-integrations
   ```

2. **Create Integration:**
   - Click "+ New integration"
   - Name: `StrataNoble DevOps Agent`
   - Associated workspace: Select your workspace
   - Type: **Internal integration**

3. **Configure Capabilities:**
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
   - ❌ Read user information (leave unchecked)

4. **Submit & Copy Token:**
   - Click "Submit"
   - **Copy the "Internal Integration Token"**
   - It starts with `secret_`

---

## Step 2: Add Token to Environment (1 min)

Add this line to `apps/website/.env.local`:

```env
# --- Notion MCP Configuration ---
NOTION_API_KEY=secret_PASTE_YOUR_TOKEN_HERE
```

Save the file.

---

## Step 3: Share Databases (2 min)

For each Notion database you want the AI to access:

1. Open the database in Notion
2. Click "**...**" (three dots, top-right)
3. Select "**Connections**"
4. Find "StrataNoble DevOps Agent"
5. Click "**Confirm**"

**Recommended databases to share:**
- 📋 Project Roadmap / Sprint Board
- 🐛 Bug Tracker / Issues
- 📚 Technical Documentation
- 💡 Feature Ideas / Backlog
- 📝 Meeting Notes

---

## Step 4: Install MCP Server (Optional)

The Notion MCP server will auto-install when Cline restarts, but you can install manually:

```bash
npm install -g @modelcontextprotocol/server-notion
```

---

## Step 5: Restart & Test

1. **Restart Cline/VS Code** to load the new configuration

2. **Test Notion access** by asking Cline:
   ```
   "What databases are in my Notion?"
   "Show me tasks in the project board"
   "Search Notion for authentication docs"
   ```

---

## Verify Configuration

### Check .env.local:
```bash
grep NOTION_API_KEY apps/website/.env.local
```

Should show:
```
NOTION_API_KEY=secret_...
```

### Test with script:
```bash
node scripts/test-notion-mcp.mjs
```

Expected output:
```
✅ NOTION_API_KEY is configured
✅ Notion MCP config file is valid
✅ Successfully connected to Notion API
✅ Found X accessible database(s)
```

---

## What You Can Do After Setup

**Query Databases:**
```
"What tasks are due this week?"
"Show me all open bugs"
"List features in the backlog"
```

**Create Content:**
```
"Add a bug: Dashboard not loading on Safari"
"Create a task: Implement OAuth with GitHub"
```

**Search:**
```
"Find all docs about authentication"
"Search meeting notes for decisions about API design"
```

**Get Information:**
```
"What's the status of the mobile app project?"
"Show me action items from last week's standup"
```

---

## Troubleshooting

**"Unauthorized" Error:**
- Check token in .env.local starts with `secret_`
- Verify token matches the one in Notion integrations
- Make sure you saved .env.local

**"Database not found":**
- Database not shared with integration
- Share via "..." → "Connections" in Notion

**"No databases accessible":**
- You haven't shared any databases yet
- Share at least one database to test

---

## Security Notes

✅ **Token is in .env.local** - git-ignored, won't be committed
✅ **Workspace-specific** - only your workspace data
✅ **Explicit sharing** - only sees databases you share
✅ **Revocable** - delete integration anytime to revoke

---

## Next Steps After Setup

1. ✅ Google Drive MCP (already configured)
2. ✅ Notion MCP (configure now)
3. 🔄 Restart Cline to load both MCPs
4. 🧪 Test both integrations
5. 🚀 Start using AI with your Drive & Notion data!

---

**MCP Config Files:**
- Google Drive: `.claude/mcp-configs/google-drive-mcp.json` ✅
- Notion: `.claude/mcp-configs/notion-mcp.json` ✅

Both MCP configs are ready - just need the Notion API key!

---

**Last Updated:** November 3, 2025
**Status:** Ready to configure
**Time Required:** 5 minutes
