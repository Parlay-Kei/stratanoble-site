# Netlify MCP Server

Model Context Protocol server for Netlify API access, enabling direct configuration and management of Netlify sites, environment variables, and deployments.

## Features

- **Environment Variable Management**
  - List all environment variables
  - Verify required variables exist
  - Get specific variable details
  - Create/update variables
  - Delete variables

- **Deployment Management**
  - List recent deployments
  - Trigger new deployment
  - Clear cache and deploy
  - Get deployment status
  - Monitor build logs

- **Site Information**
  - Get site details
  - View build settings
  - Check custom domains

## Installation

### 1. Install Dependencies

```bash
cd mcp-servers/netlify
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the MCP server directory or add to your root `.env.local`:

```bash
# Netlify API Configuration
NETLIFY_API_TOKEN=your_netlify_api_token_here
NETLIFY_SITE_ID=your_netlify_site_id_here
```

**To get your Netlify API token:**
1. Go to https://app.netlify.com/user/applications
2. Click "New access token"
3. Give it a name (e.g., "MCP Server")
4. Copy the token

**To get your Netlify Site ID:**
1. Go to your site in Netlify Dashboard
2. Go to Site Settings → General
3. Find "Site information" → "Site ID"
4. Copy the ID

### 3. Add to Claude Desktop Configuration

Edit your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the Netlify MCP server:

```json
{
  "mcpServers": {
    "netlify": {
      "command": "node",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\netlify\\index.js"],
      "env": {
        "NETLIFY_API_TOKEN": "your_netlify_api_token_here",
        "NETLIFY_SITE_ID": "your_netlify_site_id_here"
      }
    }
  }
}
```

**Security Note:** For production use, avoid hardcoding tokens in the config file. Instead, use environment variables or a secure credential store.

### 4. Restart Claude Desktop

After adding the configuration, restart Claude Desktop for the changes to take effect.

## Available Tools

### Environment Variables

#### `netlify_list_env_variables`
List all environment variables configured in Netlify.

**No parameters required**

**Example:**
```
List all Netlify environment variables
```

#### `netlify_verify_env_variables`
Verify that required environment variables exist.

**Parameters:**
- `required_variables` (array of strings): Variable names to check

**Example:**
```
Verify these Netlify variables exist: NEXTAUTH_SECRET, AWS_ACCESS_KEY_ID, SES_FROM_EMAIL
```

#### `netlify_get_env_variable`
Get detailed information about a specific variable.

**Parameters:**
- `key` (string): Variable name

**Example:**
```
Get details for NEXTAUTH_URL variable in Netlify
```

#### `netlify_set_env_variable`
Create or update an environment variable.

**Parameters:**
- `key` (string): Variable name
- `value` (string): Variable value
- `context` (string, optional): 'all', 'production', 'deploy-preview', 'branch-deploy', or 'dev' (default: 'all')
- `is_secret` (boolean, optional): Mark as secret to hide in UI (default: false)

**Example:**
```
Set NEXTAUTH_SECRET to [value] in Netlify for all contexts, mark as secret
```

#### `netlify_delete_env_variable`
Delete an environment variable.

**Parameters:**
- `key` (string): Variable name to delete

**Example:**
```
Delete the OLD_API_KEY variable from Netlify
```

### Deployments

#### `netlify_list_deployments`
List recent deployments.

**Parameters:**
- `limit` (number, optional): Number of deployments (default: 10, max: 100)

**Example:**
```
List the last 20 Netlify deployments
```

#### `netlify_trigger_deploy`
Trigger a new deployment.

**Parameters:**
- `clear_cache` (boolean, optional): Clear build cache first (default: false)

**Example:**
```
Trigger a new Netlify deployment and clear the cache
```

#### `netlify_get_deploy_status`
Get status of a specific deployment.

**Parameters:**
- `deploy_id` (string): Deployment ID

**Example:**
```
Get status of Netlify deployment 673abc123def
```

### Site Information

#### `netlify_get_site_info`
Get detailed site information.

**No parameters required**

**Example:**
```
Get StrataNoble Netlify site information
```

## Usage Examples

### Complete Environment Variable Verification Workflow

```
1. List all Netlify environment variables
2. Verify these required variables exist: NEXTAUTH_SECRET, NEXTAUTH_URL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, SES_FROM_EMAIL, ADMIN_EMAIL, VAULT_ENCRYPTION_KEY
3. For any missing variables, add them using netlify_set_env_variable
4. Trigger a new deployment with cache clearing
5. Monitor deployment status until complete
```

### Quick Deployment with Verification

```
1. Verify critical variables: NEXTAUTH_SECRET, AWS_ACCESS_KEY_ID, SES_FROM_EMAIL
2. If all present, trigger deployment with clear_cache: true
3. List recent deployments to get the deploy_id
4. Get deploy status to monitor progress
```

## Automation Scripts

### Verify All Required Variables

Create a script using the MCP tools to verify all 25+ required environment variables from NETLIFY_ENVIRONMENT_SETUP.md:

```javascript
const requiredVars = [
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_ACHIEVERY_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'SES_FROM_EMAIL',
  'ADMIN_EMAIL',
  'VAULT_ENCRYPTION_KEY'
];

// Use: netlify_verify_env_variables with requiredVars
```

### Monitor Deployment

```javascript
// 1. Trigger deployment
const deploy = await netlify_trigger_deploy({ clear_cache: true });

// 2. Wait and check status
const status = await netlify_get_deploy_status({ deploy_id: deploy.id });

// 3. Show build log URL
console.log(`Monitor at: https://app.netlify.com/sites/${SITE_ID}/deploys/${deploy.id}`);
```

## Troubleshooting

### Error: "NETLIFY_API_TOKEN environment variable is required"

**Solution:** Ensure your API token is configured in the MCP server environment variables or .env file.

### Error: "Netlify API Error (401): Unauthorized"

**Solution:** Your API token may be invalid or expired. Generate a new token at https://app.netlify.com/user/applications

### Error: "Netlify API Error (404): Not Found"

**Solution:** Verify your NETLIFY_SITE_ID is correct. Check Site Settings → General → Site ID in Netlify Dashboard.

### Variables not updating after setting

**Solution:** After adding/updating variables, trigger a new deployment with `clear_cache: true` to ensure the new values are used.

## Security Best Practices

1. **API Token Security**
   - Never commit API tokens to version control
   - Use environment variables or secure credential stores
   - Rotate tokens periodically (every 90 days)
   - Use scoped tokens with minimal permissions

2. **Secret Variables**
   - Always mark sensitive variables as `is_secret: true`
   - Examples: API keys, passwords, encryption keys, OAuth secrets

3. **Variable Scoping**
   - Use context-specific variables when possible
   - Production secrets should use `context: 'production'`
   - Development values can use `context: 'dev'`

## API Rate Limits

Netlify API has the following rate limits:
- **500 requests per minute** per access token
- **5 concurrent requests** per access token

The MCP server automatically handles rate limiting errors, but avoid rapid-fire requests.

## Related Documentation

- [Netlify API Documentation](https://docs.netlify.com/api/get-started/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [NETLIFY_ENVIRONMENT_SETUP.md](../../NETLIFY_ENVIRONMENT_SETUP.md) - Complete variable configuration
- [AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md](../../docs/AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md) - Email diagnostic guide

## Support

For issues or questions:
1. Check the [Netlify API Status](https://www.netlifystatus.com/)
2. Review [Netlify Support Documentation](https://docs.netlify.com/)
3. Check MCP server logs for detailed error messages

## Changelog

### Version 1.0.0 (October 16, 2025)
- Initial release
- Environment variable management
- Deployment triggers and monitoring
- Site information retrieval
- Comprehensive error handling
- Security best practices documentation

---

**Status:** Production Ready
**Last Updated:** October 16, 2025
**Maintained By:** StrataNoble Development Team
