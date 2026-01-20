---
description: Deploy Notion + Slack Ticket System
---

# Notion + Slack Client Ticket System Deployment Workflow

## Overview
This workflow guides the deployment of the integrated ticket system using Notion as the system of record and Slack as the intake layer.

## Prerequisites Checklist
Before starting, ensure you have:
- [ ] Notion workspace access with permission to create pages/databases
- [ ] Notion Integration Token (internal integration)
- [ ] Slack workspace admin access
- [ ] Slack App creation permissions
- [ ] Deployment environment chosen (Vercel/AWS Lambda/VPS)

## Execution Order

### Phase 1: Notion Setup (Manual + Scripted)
1. **Create Notion Integration**
   - Go to https://www.notion.so/my-integrations
   - Create new internal integration named "Support Desk Bot"
   - Copy the integration token (starts with `secret_`)
   - Grant access to the workspace

2. **Create Support Desk Structure**
   - Create a new page called "Support Desk"
   - Share the page with your integration
   - Copy the page ID from the URL

3. **Run Notion Database Setup Script**
   ```bash
   cd automation
   npm install
   node scripts/setup-notion-database.js
   ```
   This will create the Client Tickets database with all required properties, views, and templates.

### Phase 2: Slack Setup
1. **Create Slack App**
   - Go to https://api.slack.com/apps
   - Create new app "Support Ticket Bot"
   - Enable Socket Mode (recommended) or configure Request URL
   - Add required scopes (see credentials section)

2. **Create Slack Channels**
   - Create `#client-support` (public or private)
   - Create `#ops-triage` (private, for team)
   - Set channel topics as specified

3. **Install Slack App to Workspace**
   - Install app and copy Bot Token (xoxb-...)
   - Copy App-Level Token if using Socket Mode (xapp-...)
   - Copy Signing Secret

### Phase 3: Automation Service Deployment
1. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your tokens
   ```

2. **Test Locally**
   ```bash
   cd automation
   npm run dev
   ```

3. **Deploy to Production**
   - For Vercel: `vercel --prod`
   - For AWS Lambda: `npm run deploy:lambda`
   - For VPS: `pm2 start ecosystem.config.js`

### Phase 4: Verification & Testing
1. **End-to-End Test**
   - Post a test message in #client-support
   - Use the /ticket command or message shortcut
   - Verify ticket appears in Notion with correct fields
   - Check Slack permalink is captured

2. **Test Automations**
   - Trigger daily digest manually
   - Verify digest posts to #ops-triage
   - Test weekly shipped summary

3. **Client Status Page**
   - Create "Client Support Status" page in Notion
   - Add linked database views
   - Generate shareable link
   - Test read-only access

### Phase 5: Documentation & Handoff
1. **Create Runbook** (see runbook.md)
2. **Capture Proof Pack**
   - Screenshot: Notion database properties
   - Screenshot: Notion views
   - Screenshot: Slack modal/command
   - Link to test ticket
   - Automation logs
3. **Train Team**
   - How to create tickets
   - How triage works
   - How to update ticket status

## Rollback Plan
If issues arise:
1. Disable Slack app (prevents new tickets)
2. Revert automation service deployment
3. Notion data remains intact
4. Re-enable once fixed

## Success Criteria
- ✅ Slack message → Notion ticket in <30 seconds
- ✅ All required fields populated automatically
- ✅ Slack permalink captured correctly
- ✅ Daily digest posting correctly
- ✅ Weekly summary posting correctly
- ✅ Client status page accessible and live
- ✅ Proof pack complete
