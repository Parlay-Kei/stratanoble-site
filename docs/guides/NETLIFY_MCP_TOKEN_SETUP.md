# Netlify MCP Token Setup Guide
**Date:** October 16, 2025
**Status:** 🎉 Deployment Complete - Ready for MCP Configuration

---

## ✅ Deployment Success!

**Production URL:** https://stratanoble.com
**Deploy ID:** `68f0f413f1fe6e613a9f37ba`
**Status:** ✅ LIVE
**Build Time:** 7 minutes 1 second

**All environment variables configured:**
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ AWS SES credentials
- ✅ VAULT_ENCRYPTION_KEY
- ✅ Supabase keys
- ✅ Stripe configuration

---

## Netlify MCP Configuration Values

### Site ID (Ready to Use)
```
4e5f1885-511a-49cf-af9f-631665a3f43e
```

### API Token: StrataNoble-CLI

You mentioned you have a token named "StrataNoble-CLI". Here's how to retrieve it:

#### Option 1: From Netlify Dashboard (Recommended)

1. **Visit:** https://app.netlify.com/user/applications
2. **Look for:** "StrataNoble-CLI" in your Personal access tokens list
3. **If visible:** Copy the token value
4. **If hidden:** You'll need to generate a new token (tokens are only shown once at creation)

#### Option 2: Generate New Token (If Original Not Available)

1. **Visit:** https://app.netlify.com/user/applications
2. **Click:** "New access token"
3. **Name:** `Claude-MCP-Server` (or keep `StrataNoble-CLI`)
4. **Scopes:** Leave default (full access)
5. **Click:** "Generate token"
6. **Copy immediately:** Token starts with `nfp_...`
7. **Save securely:** You can only see it once!

---

## Configure Netlify MCP Server

### Method 1: Automated Setup (PowerShell Script)

```powershell
cd C:\Dev\StrataNoble\mcp-servers\netlify
.\configure-claude-desktop.ps1
```

**When prompted, enter:**
- **Netlify API Token:** Your `StrataNoble-CLI` token (or newly generated token)
- **Netlify Site ID:** `4e5f1885-511a-49cf-af9f-631665a3f43e`

The script will automatically:
- Create/update Claude Desktop config file
- Add Netlify MCP server configuration
- Verify paths and credentials

### Method 2: Manual Configuration

**1. Locate Claude Desktop Config:**
```
%APPDATA%\Claude\claude_desktop_config.json
```
Full path: `C:\Users\MrSte\AppData\Roaming\Claude\claude_desktop_config.json`

**2. Edit Config File:**

If file doesn't exist, create it with:
```json
{
  "mcpServers": {}
}
```

If file exists, add the `netlify` entry to `mcpServers`:
```json
{
  "mcpServers": {
    "netlify": {
      "command": "node",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\netlify\\index.js"],
      "env": {
        "NETLIFY_API_TOKEN": "nfp_YOUR_STRATANOBLE_CLI_TOKEN_HERE",
        "NETLIFY_SITE_ID": "4e5f1885-511a-49cf-af9f-631665a3f43e"
      }
    },
    "n8n-docs": {
      "command": "npx",
      "args": ["-y", "n8n-mcp-server@latest"]
    }
  }
}
```

**3. Replace Token:**
Change `nfp_YOUR_STRATANOBLE_CLI_TOKEN_HERE` to your actual `StrataNoble-CLI` token

**4. Verify JSON Syntax:**
Use a JSON validator or paste into: https://jsonlint.com

**5. Save File**

---

## Restart Claude Desktop

**Important:** Changes only take effect after restart

1. **Close Claude Desktop completely** (check system tray)
2. **Wait 5 seconds**
3. **Restart Claude Desktop**
4. **Wait for initialization** (~10 seconds)

---

## Test MCP Server

Once Claude Desktop restarts, test these commands:

### Test 1: List Environment Variables
```
List all Netlify environment variables for StrataNoble
```

**Expected Response:** JSON with all 39 environment variables

### Test 2: Verify Critical Variables
```
Verify these Netlify variables exist: NEXTAUTH_SECRET, AWS_ACCESS_KEY_ID, SES_FROM_EMAIL, VAULT_ENCRYPTION_KEY
```

**Expected Response:**
```json
{
  "total": 4,
  "present": 4,
  "missing": 0,
  "missingVariables": [],
  "presentVariables": ["NEXTAUTH_SECRET", "AWS_ACCESS_KEY_ID", "SES_FROM_EMAIL", "VAULT_ENCRYPTION_KEY"]
}
```

### Test 3: Get Site Information
```
Get StrataNoble Netlify site information
```

**Expected Response:** Site details including URL, build settings, etc.

### Test 4: List Recent Deployments
```
List the last 5 Netlify deployments
```

**Expected Response:** Deployment history with status and timestamps

---

## MCP Tools Available After Setup

Once configured, you'll have access to 9 Netlify automation tools:

1. **netlify_list_env_variables** - List all environment variables
2. **netlify_verify_env_variables** - Check if required variables exist
3. **netlify_get_env_variable** - Get details for specific variable
4. **netlify_set_env_variable** - Create/update environment variable
5. **netlify_delete_env_variable** - Delete environment variable
6. **netlify_list_deployments** - List recent deployments
7. **netlify_trigger_deploy** - Trigger new deployment (with cache clearing)
8. **netlify_get_deploy_status** - Monitor deployment progress
9. **netlify_get_site_info** - Get site configuration details

---

## Troubleshooting

### Issue: MCP Tools Not Available in Claude Desktop

**Possible Causes:**
1. Claude Desktop not restarted
2. Config file syntax error
3. Wrong file path to MCP server
4. Invalid API token

**Solutions:**
```powershell
# 1. Verify config file exists
Test-Path "$env:APPDATA\Claude\claude_desktop_config.json"

# 2. Check JSON syntax
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json

# 3. Verify MCP server file exists
Test-Path "C:\Dev\StrataNoble\mcp-servers\netlify\index.js"

# 4. Restart Claude Desktop completely
```

### Issue: "NETLIFY_API_TOKEN is required"

**Cause:** Token not configured or invalid

**Solution:**
1. Verify token in config file
2. Ensure token starts with `nfp_`
3. Generate new token if original expired
4. Restart Claude Desktop after config change

### Issue: "Netlify API Error (401): Unauthorized"

**Cause:** Invalid or expired API token

**Solution:**
1. Generate new token at https://app.netlify.com/user/applications
2. Update config file with new token
3. Restart Claude Desktop

---

## Next Steps: Test Email Authentication

Now that deployment is complete with all environment variables, test the email authentication flow:

### Priority 1: Magic Link Email Test

1. **Visit:** https://stratanoble.com/auth/signin
2. **Enter email:** `Mr.Steve.Hubbard@outlook.com`
3. **Click:** "Continue with Email"
4. **Expected:** "Check your email" page (NOT error page)
5. **Check inbox:** Email from `no-reply@stratanoble.com`
6. **Click:** Magic link in email
7. **Expected:** Successful authentication to dashboard

**Success Criteria:**
- ✅ No `error=Configuration` in URL
- ✅ No `error=undefined` in URL
- ✅ Email arrives in inbox (not spam)
- ✅ Magic link redirects to authenticated dashboard

### Priority 2: Admin Vault Access

1. **Visit:** https://stratanoble.com/admin/vault
2. **Expected:** Vault dashboard loads
3. **Verify:** No "VAULT_ENCRYPTION_KEY is required" error
4. **Success:** Credentials list displays

### Priority 3: Discovery Form Submission

1. **Visit:** https://stratanoble.com/get-started
2. **Complete:** All 7 form steps
3. **Submit:** Final form
4. **Expected:** Success message
5. **Verify:** Lead created in Supabase
6. **Success:** No "Failed to create lead" error

---

## Quick Reference Card

**Netlify Site ID:**
```
4e5f1885-511a-49cf-af9f-631665a3f43e
```

**Netlify API Token Name:**
```
StrataNoble-CLI
```

**Get Token At:**
```
https://app.netlify.com/user/applications
```

**Claude Desktop Config:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**MCP Server Location:**
```
C:\Dev\StrataNoble\mcp-servers\netlify\index.js
```

**Setup Script:**
```powershell
C:\Dev\StrataNoble\mcp-servers\netlify\configure-claude-desktop.ps1
```

**Production Site:**
```
https://stratanoble.com
```

**Deployment Dashboard:**
```
https://app.netlify.com/sites/stratanoble/deploys
```

---

## Summary

✅ **Deployment Complete:** All environment variables configured
✅ **Site Live:** https://stratanoble.com
✅ **MCP Server Ready:** Waiting for token configuration
⏭️ **Next Action:** Configure MCP server with StrataNoble-CLI token
⏭️ **Then Test:** Email authentication flow

**All systems operational and ready for testing!** 🎉

---

**Last Updated:** October 16, 2025
**Deployment ID:** 68f0f413f1fe6e613a9f37ba
**Status:** Production Live
