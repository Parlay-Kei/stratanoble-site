# 🔑 NOTION API KEY SETUP - WHERE TO SET IT

**Generated**: 2026-01-23T20:45:00Z
**Purpose**: Clear instructions on where to set the Notion API key

## ✅ **API KEY LOCATIONS (IN ORDER OF PRIORITY)**

The notion-ops MCP server checks for the API key in these locations (uses the first one it finds):

### 📍 **Location 1: MCP Server .env file** (RECOMMENDED)
```
C:\Dev\StrataNoble\mcp-servers\notion-ops\.env
```
✅ **Already created** with placeholders - just edit and replace:
```bash
NOTION_API_KEY=secret_REPLACE_THIS_WITH_YOUR_ACTUAL_TOKEN
NOTION_SOCIAL_MEDIA_HQ_PAGE_ID=REPLACE_WITH_YOUR_PAGE_ID
DRY_RUN_MODE=false
```

### 📍 **Location 2: Website .env.local file** (ALTERNATIVE)
```
C:\Dev\StrataNoble\apps\website\.env.local
```
✅ **Already added** to the file (lines 69-74) - just replace the placeholders:
```bash
NOTION_API_KEY=secret_REPLACE_THIS_WITH_YOUR_ACTUAL_TOKEN
NOTION_SOCIAL_MEDIA_HQ_PAGE_ID=REPLACE_WITH_YOUR_PAGE_ID
```

### 📍 **Location 3: System Environment Variables** (GLOBAL)
Set in Windows Environment Variables or your terminal:
```bash
set NOTION_API_KEY=secret_your_actual_token_here
set NOTION_SOCIAL_MEDIA_HQ_PAGE_ID=your_page_id_here
```

## 🚀 **QUICK SETUP STEPS**

### Step 1: Get Your Notion API Key
1. Go to: https://www.notion.so/my-integrations
2. Click "New Integration"
3. Name it: "StrataNoble Content System"
4. Enable: ✅ Read, ✅ Update, ✅ Insert content
5. Copy the token (starts with `secret_`)

### Step 2: Get Your Page ID
1. Open your main Notion workspace page
2. Copy the URL from browser
3. Extract the ID after the last `/`
   - Example: `https://notion.so/My-Workspace-abc123def456`
   - Use: `abc123def456` (remove any hyphens)

### Step 3: Update ONE of These Files
Choose the most convenient location:

**Option A (Recommended): Edit MCP Server .env**
```bash
# Edit this file:
C:\Dev\StrataNoble\mcp-servers\notion-ops\.env

# Change from:
NOTION_API_KEY=secret_REPLACE_THIS_WITH_YOUR_ACTUAL_TOKEN

# To your actual token:
NOTION_API_KEY=secret_abc123def456789...
```

**Option B: Edit Website .env.local**
```bash
# Edit this file:
C:\Dev\StrataNoble\apps\website\.env.local

# The placeholders are already added at the bottom (lines 69-74)
# Just replace with your actual values
```

### Step 4: Grant Integration Access
1. In Notion, open your workspace page
2. Click "..." menu → "Add connections"
3. Select "StrataNoble Content System"
4. Grant access

## ✅ **VERIFICATION**

Test that your API key is working:
```bash
cd mcp-servers/notion-ops
node smoke-test.js
```

Expected output:
```
✅ API Key configured
✅ Connected as: StrataNoble Content System
```

## 🎯 **READY TO DEPLOY**

Once the API key is set in ANY of the above locations:
1. The notion-ops MCP server will find it automatically
2. Run the deployment script to create your database
3. All 31 tasks will be imported with proper scheduling
4. Your 30-day social media system will be operational

## ⚠️ **IMPORTANT NOTES**

- **Only set the key in ONE location** (to avoid confusion)
- **Never commit .env files to Git** (they're already in .gitignore)
- **The server checks locations in order** (1 → 2 → 3)
- **DRY_RUN_MODE=false** for production deployment

## 📞 **TROUBLESHOOTING**

If the API key isn't being detected:
1. **Check file exists**: Ensure .env file is created in correct location
2. **No quotes**: Don't wrap the token in quotes
3. **Correct format**: Token should start with `secret_`
4. **Restart required**: Restart any running processes after adding key
5. **Permission check**: Ensure integration has access to your Notion page

---

**Status**: 📝 **FILES READY WITH PLACEHOLDERS**
**Next Step**: Replace placeholders with your actual Notion API credentials
**Deployment Time**: ~4 minutes after credentials are set