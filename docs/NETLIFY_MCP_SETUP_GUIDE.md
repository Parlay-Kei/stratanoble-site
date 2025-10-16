# Netlify MCP Server Setup Guide
**Date:** October 16, 2025
**Purpose:** Enable direct Netlify API access through Claude Code via MCP server

---

## Overview

The Netlify MCP (Model Context Protocol) server enables Claude Code to directly interact with the Netlify API, automating environment variable verification, deployment triggers, and site management.

**Benefits:**
- ✅ Automated environment variable verification
- ✅ Direct deployment triggering with cache clearing
- ✅ Real-time deployment status monitoring
- ✅ Eliminates manual Netlify Dashboard navigation
- ✅ Integrated workflow for email authentication fixes

---

## Prerequisites

- ✅ Netlify account with site access
- ✅ Netlify API token (admin access recommended)
- ✅ Claude Desktop installed
- ✅ Node.js installed (for MCP server)

---

## Step 1: Get Netlify Credentials

### 1.1 Get Your Netlify API Token

1. **Login to Netlify:** https://app.netlify.com
2. **Navigate to:** User Settings → Applications → Personal access tokens
3. **URL:** https://app.netlify.com/user/applications
4. **Click:** "New access token"
5. **Name:** `Claude MCP Server` (or any descriptive name)
6. **Click:** "Generate token"
7. **Copy:** The token (you'll only see it once!)
8. **Save:** Store securely - you'll need it for configuration

**Token Format:** `nfp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 1.2 Get Your Netlify Site ID

1. **Login to Netlify:** https://app.netlify.com
2. **Select:** Your StrataNoble site
3. **Navigate to:** Site settings → General
4. **Find:** "Site information" section
5. **Copy:** Site ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**Alternative Method:**
```bash
# If you have Netlify CLI installed
netlify sites:list
# Copy the Site ID for StrataNoble
```

---

## Step 2: Configure Environment Variables

### Option A: Using .env File (Recommended for Development)

Create a `.env` file in the MCP server directory:

```bash
# Navigate to MCP server directory
cd C:\Dev\StrataNoble\mcp-servers\netlify

# Create .env file
echo NETLIFY_API_TOKEN=nfp_YOUR_TOKEN_HERE > .env
echo NETLIFY_SITE_ID=your-site-id-here >> .env
```

**Full .env file:**
```bash
NETLIFY_API_TOKEN=nfp_YOUR_ACTUAL_TOKEN_HERE
NETLIFY_SITE_ID=YOUR_ACTUAL_SITE_ID_HERE
```

### Option B: Using System Environment Variables (Recommended for Production)

**Windows:**
```powershell
# Set user environment variables
[Environment]::SetEnvironmentVariable("NETLIFY_API_TOKEN", "nfp_YOUR_TOKEN_HERE", "User")
[Environment]::SetEnvironmentVariable("NETLIFY_SITE_ID", "your-site-id-here", "User")
```

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export NETLIFY_API_TOKEN="nfp_YOUR_TOKEN_HERE"
export NETLIFY_SITE_ID="your-site-id-here"
```

---

## Step 3: Add MCP Server to Claude Desktop

### 3.1 Locate Claude Desktop Configuration File

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```
Full path: `C:\Users\[YourUsername]\AppData\Roaming\Claude\claude_desktop_config.json`

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 3.2 Edit Configuration File

**If file doesn't exist, create it:**
```json
{
  "mcpServers": {}
}
```

**Add Netlify MCP server:**

```json
{
  "mcpServers": {
    "netlify": {
      "command": "node",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\netlify\\index.js"],
      "env": {
        "NETLIFY_API_TOKEN": "nfp_YOUR_ACTUAL_TOKEN_HERE",
        "NETLIFY_SITE_ID": "YOUR_ACTUAL_SITE_ID_HERE"
      }
    },
    "n8n-docs": {
      "command": "npx",
      "args": [
        "-y",
        "n8n-mcp-server@latest"
      ]
    }
  }
}
```

**⚠️ Important:** Replace:
- `C:\\Dev\\StrataNoble` with your actual project path (use double backslashes on Windows)
- `nfp_YOUR_ACTUAL_TOKEN_HERE` with your Netlify API token
- `YOUR_ACTUAL_SITE_ID_HERE` with your Netlify Site ID

**Security Note:** For production, avoid hardcoding tokens. Use environment variables:

```json
{
  "mcpServers": {
    "netlify": {
      "command": "node",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\netlify\\index.js"]
      // Environment variables will be loaded from system or .env file
    }
  }
}
```

### 3.3 Verify Configuration Syntax

**Use a JSON validator or run:**
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('C:\\Users\\[Username]\\AppData\\Roaming\\Claude\\claude_desktop_config.json')))"
```

If no errors, configuration is valid.

---

## Step 4: Restart Claude Desktop

1. **Close Claude Desktop completely**
2. **Wait 5 seconds**
3. **Restart Claude Desktop**
4. **Check:** MCP server should initialize automatically

---

## Step 5: Verify MCP Server is Working

### Test in Claude Code

Start a new conversation in Claude Desktop and try:

```
List all Netlify environment variables for StrataNoble
```

**Expected Response:**
```json
[
  {
    "key": "NEXT_PUBLIC_BASE_URL",
    "scopes": ["builds", "functions", "runtime", "post_processing"],
    "values": [...]
  },
  ...
]
```

### Verify Required Variables

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

---

## Common Use Cases

### Use Case 1: Complete Environment Variable Audit

```
1. List all Netlify environment variables
2. Verify these required variables exist: NEXTAUTH_SECRET, NEXTAUTH_URL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, SES_FROM_EMAIL, ADMIN_EMAIL, VAULT_ENCRYPTION_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
3. For each missing variable, show me the value from NETLIFY_ENVIRONMENT_SETUP.md
```

### Use Case 2: Add Missing Variables

```
Set these Netlify variables:
- NEXTAUTH_SECRET = [value from NETLIFY_ENVIRONMENT_SETUP.md] (mark as secret)
- AWS_SECRET_ACCESS_KEY = [value] (mark as secret)
- VAULT_ENCRYPTION_KEY = [value] (mark as secret)

All variables should be available in all contexts.
```

### Use Case 3: Deploy with Cache Clear

```
1. Verify critical variables exist: NEXTAUTH_SECRET, AWS_ACCESS_KEY_ID, SES_FROM_EMAIL
2. If all present, trigger a Netlify deployment and clear the cache
3. Get the deploy ID from the response
4. Check deployment status every 30 seconds until state is "ready" or "error"
```

### Use Case 4: Monitor Recent Deployments

```
List the last 5 Netlify deployments and show their status
```

---

## Troubleshooting

### Error: "NETLIFY_API_TOKEN environment variable is required"

**Cause:** API token not configured

**Solutions:**
1. Check `.env` file exists in `mcp-servers/netlify/` directory
2. Verify token is set in Claude Desktop config under `env`
3. Ensure no typos in environment variable name

### Error: "Netlify API Error (401): Unauthorized"

**Cause:** Invalid or expired API token

**Solutions:**
1. Regenerate API token at https://app.netlify.com/user/applications
2. Update `.env` file or Claude Desktop config with new token
3. Restart Claude Desktop

### Error: "Netlify API Error (404): Not Found"

**Cause:** Incorrect Site ID

**Solutions:**
1. Verify Site ID in Netlify Dashboard → Site Settings → General
2. Ensure no extra spaces or characters in Site ID
3. Update configuration with correct Site ID

### MCP Server Not Appearing in Claude Desktop

**Solutions:**
1. **Check config file syntax:** Use JSON validator
2. **Verify file path:** Ensure path to `index.js` is correct
3. **Check Node.js:** Run `node --version` (should be 18+)
4. **Restart Claude Desktop:** Complete shutdown and restart
5. **Check logs:** Look for MCP errors in Claude Desktop logs

### Variables Not Updating After Setting

**Cause:** Build cache contains old values

**Solution:**
```
Trigger a Netlify deployment with clear_cache: true
```

---

## Security Best Practices

### 1. API Token Security

✅ **DO:**
- Store tokens in `.env` file (add to `.gitignore`)
- Use system environment variables for production
- Rotate tokens every 90 days
- Use separate tokens for dev/staging/production

❌ **DON'T:**
- Commit tokens to version control
- Share tokens in chat or email
- Reuse tokens across projects
- Use root/admin tokens when scoped tokens suffice

### 2. Secret Variables

Always mark these as `is_secret: true` in Netlify:
- `NEXTAUTH_SECRET`
- `AWS_SECRET_ACCESS_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VAULT_ENCRYPTION_KEY`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_PASSWORD`

### 3. Variable Scoping

Use context-specific variables when possible:
- **Production secrets:** `context: 'production'`
- **Development values:** `context: 'dev'`
- **Preview deploys:** `context: 'deploy-preview'`
- **All environments:** `context: 'all'` (use cautiously)

---

## MCP Server Tools Reference

### Environment Variables

| Tool | Description | Parameters |
|------|-------------|------------|
| `netlify_list_env_variables` | List all variables | None |
| `netlify_verify_env_variables` | Verify required variables | `required_variables` (array) |
| `netlify_get_env_variable` | Get variable details | `key` (string) |
| `netlify_set_env_variable` | Create/update variable | `key`, `value`, `context?`, `is_secret?` |
| `netlify_delete_env_variable` | Delete variable | `key` (string) |

### Deployments

| Tool | Description | Parameters |
|------|-------------|------------|
| `netlify_list_deployments` | List recent deploys | `limit?` (number, default: 10) |
| `netlify_trigger_deploy` | Trigger new deploy | `clear_cache?` (boolean) |
| `netlify_get_deploy_status` | Get deploy status | `deploy_id` (string) |

### Site Information

| Tool | Description | Parameters |
|------|-------------|------------|
| `netlify_get_site_info` | Get site details | None |

---

## Integration with Email Authentication Fix

The Netlify MCP server directly addresses the AWS SES email authentication diagnostic findings:

**Automated Workflow:**
1. Verify all 25+ required environment variables exist
2. Identify missing variables (especially NEXTAUTH_SECRET, AWS credentials)
3. Add missing variables with correct values
4. Trigger deployment with cache clearing
5. Monitor deployment until complete
6. Test production email authentication

**Manual Verification Replacement:**
- **Before MCP:** Manual Netlify Dashboard navigation (15 minutes)
- **After MCP:** Automated verification via Claude (2 minutes)

---

## Next Steps

1. ✅ Complete Steps 1-5 to setup MCP server
2. ✅ Test with "List all Netlify environment variables"
3. ✅ Run complete environment variable verification
4. ✅ Add any missing variables identified in AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md
5. ✅ Trigger deployment with cache clearing
6. ✅ Test production email authentication flow

---

## Related Documentation

- [Netlify MCP Server README](../../mcp-servers/netlify/README.md) - Detailed tool documentation
- [NETLIFY_ENVIRONMENT_SETUP.md](../../NETLIFY_ENVIRONMENT_SETUP.md) - All required variables
- [AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md](AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md) - Email diagnostic
- [NETLIFY_VERIFICATION_CHECKLIST.md](../../NETLIFY_VERIFICATION_CHECKLIST.md) - Manual verification guide

---

**Status:** Setup guide complete
**MCP Server:** Production ready
**Next Action:** Configure Claude Desktop and test tools
**Last Updated:** October 16, 2025
