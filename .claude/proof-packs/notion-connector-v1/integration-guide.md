# NOTION CONNECTOR V1 INTEGRATION GUIDE

**Generated**: 2026-01-23T20:26:00Z
**Target**: Claude Code MCP Integration
**Purpose**: Step-by-step deployment of Notion Operations MCP Server

## 🚀 Quick Start Guide

### Prerequisites
1. **Notion Workspace**: Admin access required
2. **Notion Integration**: Created with proper permissions
3. **Node.js**: Version 18+ installed
4. **Claude Code**: Latest version with MCP support

### 5-Minute Setup
```bash
# 1. Navigate to MCP server
cd mcp-servers/notion-ops

# 2. Install dependencies (already completed)
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Notion credentials

# 4. Test connection
npm test

# 5. Register with Claude Code
# Add server to MCP configuration (see below)
```

## 📋 Detailed Configuration

### Step 1: Notion Integration Setup

#### Create Notion Integration
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New Integration"
3. Configure integration:
   - **Name**: `StrataNoble DevOps Agent`
   - **Associated workspace**: Select your workspace
   - **Type**: Internal integration
   - **Capabilities**:
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
     - ✅ Comment capabilities (optional)

#### Get Integration Token
1. After creation, find "Integration Token" section
2. Click "Show" to reveal the token
3. Copy the `secret_...` token
4. Store securely (never commit to git)

#### Share Pages with Integration
1. Open your Social Media HQ page in Notion
2. Click the "..." menu (top right)
3. Select "Add connections"
4. Choose "StrataNoble DevOps Agent"
5. Grant access

### Step 2: Environment Configuration

#### Environment Variables
Create `.env` file in `mcp-servers/notion-ops/`:
```bash
# Required Configuration
NOTION_API_KEY=secret_your_integration_token_here
NOTION_SOCIAL_MEDIA_HQ_PAGE_ID=your_social_media_hq_page_id_here

# Optional Safety Configuration
DRY_RUN_MODE=false
RATE_LIMIT_REQUESTS_PER_SECOND=3
```

#### Get Page ID
To find your page ID:
1. Open the page in Notion
2. Copy the URL
3. Extract the page ID from URL:
   - URL: `https://notion.so/My-Page-abc123def456...`
   - Page ID: `abc123def456...` (after last `/` and before any `?`)
   - Remove any hyphens: `abc123def456`

### Step 3: Claude Code Integration

#### MCP Server Registration
Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "notion-ops": {
      "command": "node",
      "args": ["/path/to/StrataNoble/mcp-servers/notion-ops/index.js"],
      "env": {
        "NOTION_API_KEY": "secret_your_integration_token_here",
        "NOTION_SOCIAL_MEDIA_HQ_PAGE_ID": "your_page_id_here"
      }
    }
  }
}
```

#### Windows Configuration
```json
{
  "mcpServers": {
    "notion-ops": {
      "command": "node.exe",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\notion-ops\\index.js"],
      "env": {
        "NOTION_API_KEY": "secret_your_integration_token_here",
        "NOTION_SOCIAL_MEDIA_HQ_PAGE_ID": "your_page_id_here"
      }
    }
  }
}
```

#### Alternative: Environment File Method
```json
{
  "mcpServers": {
    "notion-ops": {
      "command": "node",
      "args": ["/path/to/StrataNoble/mcp-servers/notion-ops/index.js"],
      "cwd": "/path/to/StrataNoble/mcp-servers/notion-ops"
    }
  }
}
```

## 🧪 Testing & Verification

### Step 1: Smoke Test
```bash
cd mcp-servers/notion-ops
node smoke-test.js
```

Expected output:
```
🧪 Notion Operations MCP Server - Smoke Test
============================================================

1️⃣  Validating Configuration...
✅ API Key configured
✅ Social Media HQ Page ID configured

2️⃣  Initializing Notion Client...
✅ Notion client initialized

3️⃣  Testing API Connectivity...
✅ Connected as: StrataNoble DevOps Agent

4️⃣  Creating Test Database...
✅ Test database created: [database-id]
   URL: https://notion.so/[clean-id]

5️⃣  Creating Test Pages...
✅ Created page 1: [page-id-1]
✅ Created page 2: [page-id-2]
✅ Created 2/2 test pages

🎉 Smoke Test Complete!
```

### Step 2: MCP Tools Verification
In Claude Code, verify these tools are available:
- `create_database`
- `add_property`
- `create_page`
- `update_page`
- `bulk_create_pages`
- `get_database_schema`

### Step 3: Integration Test
Test basic database creation:
```
create_database({
  "parent_page_id": "your_page_id_here",
  "title": "Test Database",
  "properties": {}
})
```

## 🎯 Usage Examples

### Create Strata Noble Tracker Database
```json
{
  "parent_page_id": "your_social_media_hq_page_id",
  "title": "Strata Noble 30-Day Social Media Tracker",
  "properties": {
    "Name": { "title": {} },
    "Status": {
      "select": {
        "options": [
          { "name": "Not Started", "color": "gray" },
          { "name": "In Progress", "color": "yellow" },
          { "name": "Complete", "color": "green" },
          { "name": "On Hold", "color": "red" }
        ]
      }
    },
    "Priority": {
      "select": {
        "options": [
          { "name": "Critical", "color": "red" },
          { "name": "High", "color": "orange" },
          { "name": "Medium", "color": "yellow" },
          { "name": "Low", "color": "gray" }
        ]
      }
    }
  }
}
```

### Create Task Entry
```json
{
  "database_id": "your_database_id",
  "row_payload": {
    "Name": {
      "title": [
        { "type": "text", "text": { "content": "Week 1: Content Strategy" } }
      ]
    },
    "Status": { "select": { "name": "In Progress" } },
    "Priority": { "select": { "name": "High" } }
  }
}
```

### Batch Create Tasks
```json
{
  "database_id": "your_database_id",
  "rows": [
    {
      "Name": { "title": [{ "type": "text", "text": { "content": "Task 1" } }] },
      "Status": { "select": { "name": "Not Started" } },
      "Priority": { "select": { "name": "Medium" } }
    },
    {
      "Name": { "title": [{ "type": "text", "text": { "content": "Task 2" } }] },
      "Status": { "select": { "name": "Not Started" } },
      "Priority": { "select": { "name": "High" } }
    }
  ]
}
```

## 🛠️ Troubleshooting

### Common Issues

#### Issue: "NOTION_API_KEY not found"
**Solution**:
1. Verify `.env` file exists in correct directory
2. Check environment variable name spelling
3. Ensure no quotes around the token in `.env`
4. Restart Claude Code after changes

#### Issue: "parent not found" Error
**Solutions**:
1. **Verify Page ID**: Copy page URL and extract ID correctly
2. **Share Integration**: Ensure page is shared with integration
3. **Permission Check**: Verify integration has "Insert content" permission
4. **Wait Period**: Allow 5-10 minutes after sharing for propagation

#### Issue: Rate Limited (429 Errors)
**Solutions**:
1. **Reduce Rate**: Lower `RATE_LIMIT_REQUESTS_PER_SECOND`
2. **Enable Dry Run**: Test with `DRY_RUN_MODE=true` first
3. **Batch Size**: System automatically uses conservative batching
4. **Retry Logic**: Built-in exponential backoff handles temporary limits

#### Issue: MCP Server Not Connecting
**Solutions**:
1. **Path Verification**: Ensure absolute paths in MCP config
2. **Node.js Check**: Verify Node.js is in system PATH
3. **Permission Issues**: Check file permissions on server files
4. **Port Conflicts**: Restart Claude Code to clear any port conflicts

### Debugging Commands

#### Test Environment Loading
```bash
cd mcp-servers/notion-ops
node -e "
require('dotenv').config();
console.log('API Key:', process.env.NOTION_API_KEY ? 'CONFIGURED' : 'MISSING');
console.log('Page ID:', process.env.NOTION_SOCIAL_MEDIA_HQ_PAGE_ID ? 'CONFIGURED' : 'MISSING');
"
```

#### Test Notion Connection
```bash
cd mcp-servers/notion-ops
node -e "
const { Client } = require('@notionhq/client');
require('dotenv').config();
const notion = new Client({ auth: process.env.NOTION_API_KEY });
notion.users.me().then(user => console.log('Connected:', user.name)).catch(console.error);
"
```

## 📊 Performance Optimization

### Rate Limiting Tuning
- **Conservative**: 1-2 requests/second for large operations
- **Standard**: 3 requests/second (default)
- **Aggressive**: 5+ requests/second (monitor for 429 errors)

### Batch Size Optimization
- **Small Datasets**: 5-10 items per batch
- **Large Datasets**: 3-5 items per batch
- **Media-Heavy**: 2-3 items per batch

### Memory Management
- **Long-Running**: Restart server daily for large operations
- **Monitoring**: Check for memory leaks with extended use
- **Cleanup**: Clear unused variables in bulk operations

## 🚀 Production Deployment

### Security Checklist
- [ ] API tokens stored in environment variables only
- [ ] No tokens committed to version control
- [ ] Integration permissions minimized to required scope
- [ ] Regular token rotation scheduled
- [ ] Access logs monitored for unusual activity

### Monitoring Setup
- [ ] Error logging configured
- [ ] Performance metrics tracked
- [ ] Rate limit monitoring enabled
- [ ] Database creation alerts set up
- [ ] Integration health checks automated

### Backup Strategy
- [ ] Database schemas documented
- [ ] Content export procedures tested
- [ ] Recovery procedures validated
- [ ] Team access procedures documented
- [ ] Emergency contact list maintained

## 📞 Support & Maintenance

### Regular Maintenance
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review integration permissions and usage patterns
- **Annually**: Evaluate new Notion API features and optimizations

### Support Resources
- **Notion API Docs**: [https://developers.notion.com](https://developers.notion.com)
- **MCP Protocol**: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Claude Code Docs**: [https://docs.claude.ai](https://docs.claude.ai)

---

**Integration Guide Complete**
Ready for deployment with comprehensive testing and troubleshooting support.