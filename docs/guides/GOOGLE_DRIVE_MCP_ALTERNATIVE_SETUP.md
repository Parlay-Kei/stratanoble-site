# Google Drive MCP - Alternative Setup (Service Account)

**Error 401: invalid_client** - The OAuth Playground approach is encountering client validation issues.

## Alternative Solution: Use Google Service Account

Service accounts are simpler for server-side access and don't require user OAuth flow.

---

## Option A: Service Account Setup (Recommended for MCP)

### Step 1: Create Service Account

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts
   ```

2. **Create Service Account:**
   - Click "+ CREATE SERVICE ACCOUNT"
   - Name: `stratanoble-drive-mcp`
   - Description: `MCP server for Drive access`
   - Click "CREATE AND CONTINUE"

3. **Grant Roles:**
   - Role: "Viewer" (or skip - we'll use direct sharing)
   - Click "CONTINUE"
   - Click "DONE"

4. **Create Key:**
   - Find your new service account in the list
   - Click the three dots (⋮) → "Manage keys"
   - Click "ADD KEY" → "Create new key"
   - Type: **JSON**
   - Click "CREATE"
   - Save the JSON file as `google-drive-service-account.json`

### Step 2: Enable Drive API

1. **Go to API Library:**
   ```
   https://console.cloud.google.com/apis/library/drive.googleapis.com
   ```

2. **Click "Enable"** (if not already enabled)

### Step 3: Share Drive Folders with Service Account

1. **Open Google Drive** (drive.google.com)

2. **Find folders/files you want MCP to access**

3. **Share with the service account email:**
   - The email is in the JSON file: `client_email` field
   - Format: `stratanoble-drive-mcp@[PROJECT-ID].iam.gserviceaccount.com`
   - Give "Viewer" permission

### Step 4: Configure MCP Server

1. **Copy JSON file to project:**
   ```bash
   mkdir -p apps/website/.credentials
   cp google-drive-service-account.json apps/website/.credentials/
   ```

2. **Add to `.env.local`:**
   ```env
   # --- Google Drive MCP Configuration (Service Account) ---
   GOOGLE_APPLICATION_CREDENTIALS=./apps/website/.credentials/google-drive-service-account.json
   ```

3. **Update `.gitignore` to protect credentials:**
   ```
   apps/website/.credentials/
   ```

### Step 5: Install & Test

```bash
npm install -g @modelcontextprotocol/server-google-drive
node scripts/test-google-drive-mcp.mjs
```

---

## Option B: Fix OAuth Client (If You Prefer OAuth)

### Issue: "invalid_client" Error

**Possible causes:**
1. OAuth client not configured for "Web application" type
2. Redirect URI mismatch
3. Client ID/Secret mismatch

### Solution:

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Check your OAuth client:**
   - Client ID: `610390622110-4qd779cm57kanujmdnq9tt91o2gnpu4l`
   - **Application type:** Must be "Web application" (NOT Desktop app)

3. **If it's NOT "Web application":**
   - Delete the existing OAuth client
   - Create NEW OAuth client:
     - Type: **Web application**
     - Name: `StrataNoble Web Client`
     - Authorized JavaScript origins:
       ```
       https://developers.google.com
       https://stratanoble.com
       http://localhost:3000
       ```
     - Authorized redirect URIs:
       ```
       https://developers.google.com/oauthplayground
       https://stratanoble.com/api/auth/callback/google
       http://localhost:3000/api/auth/callback/google
       ```

4. **Copy NEW Client ID and Secret**

5. **Update `.env.local` with NEW credentials**

6. **Try OAuth Playground again**

---

## Option C: Use Existing OAuth for NextAuth Only

Keep your current OAuth client ONLY for NextAuth (user sign-in), and use a **service account** for MCP Drive access.

**Benefits:**
- ✅ Cleaner separation of concerns
- ✅ No user OAuth flow needed for MCP
- ✅ Service accounts don't expire
- ✅ Easier to manage permissions

---

## Recommendation

**Use Service Account (Option A)** because:

1. **Simpler:** No OAuth flow complexity
2. **Secure:** JSON key file protected by `.gitignore`
3. **Reliable:** No token expiration issues
4. **Standard:** This is how server-to-server access typically works

Your existing OAuth client can stay focused on user authentication (NextAuth), which is what it's already doing successfully.

---

## Next: Notion MCP Setup

Once Google Drive MCP is working, configure Notion:

1. **Go to:** https://www.notion.so/my-integrations
2. **Create integration:** "StrataNoble DevOps Agent"
3. **Copy token to `.env.local`:**
   ```env
   NOTION_API_KEY=secret_YOUR_TOKEN_HERE
   ```
4. **Share databases with integration**
5. **Install & test:**
   ```bash
   npm install -g @modelcontextprotocol/server-notion
   node scripts/test-notion-mcp.mjs
   ```

---

**Created:** 2025-11-15  
**Status:** Alternative approaches ready
