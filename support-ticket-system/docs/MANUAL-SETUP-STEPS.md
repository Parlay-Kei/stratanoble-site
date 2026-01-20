# Client Ticket System - Manual Setup Steps

This document lists the remaining setup steps that require manual intervention because they cannot be completed via API.

## Existing Notion Structure

The following pages already exist in Notion under "Support Desk" (parent page):

- **Client Tickets** (database) - ID: `2e613b42-8aa7-813d-81d6-cd4e0f8377a7`
- **DSLV Portal** (existing page - use this, NOT "DSLV Support Portal")
- **MsAudreysHouse Portal** (existing page - use this, NOT "MsAudreysHouse Support Portal")

**NOTE:** If duplicate "Support Portal" pages exist (e.g., "DSLV Support Portal", "MsAudreysHouse Support Portal"), these were created in error and should be deleted.

---

## Manual Step 1: Create Database Views in Notion

The Notion API does not support creating database views programmatically. Please create these views in the **Client Tickets** database:

### 1. Inbox
- **Filter:** Status = "New"
- **Sort:** Created time (descending)

### 2. Triage Queue
- **Filter:** Status is "New" OR Status is "Triaged"
- **Sort:** Severity (ascending), then Priority Score (descending)

### 3. This Week
- **Filter:** Release Window = "This Week" AND Status is NOT "Released" AND Status is NOT "Won't Do"
- **Sort:** Priority Score (descending)

### 4. Waiting on Client
- **Filter:** Status = "Waiting on Client"
- **Sort:** Last edited time (ascending)

### 5. Blocked
- **Filter:** Status = "Blocked"
- **Sort:** Created time (descending)

### 6. Ready for Release
- **Filter:** Status = "Ready for Release"
- **Sort:** Priority Score (descending)

### 7. Released (Last 14 Days)
- **Filter:** Status = "Released" AND Created time is within the past 2 weeks
- **Sort:** Created time (descending)

### 8. Backlog
- **Filter:** Release Window = "Backlog" AND Status is NOT "Released" AND Status is NOT "Won't Do"
- **Sort:** Priority Score (descending)

---

## Manual Step 2: Add Linked Database Views to Portal Pages

Each portal page needs a linked database view filtered by client.

**IMPORTANT:** Use the EXISTING portal pages (DSLV Portal and MsAudreysHouse Portal), NOT any "Support Portal" variants.

### DSLV Portal
1. Open the existing "DSLV Portal" page in Notion (under Support Desk)
2. Type `/linked` and select "Linked view of database"
3. Select "Client Tickets" database
4. Add filter: Client = "DSLV"
5. Choose a table or board view

### MsAudreysHouse Portal
1. Open the existing "MsAudreysHouse Portal" page in Notion (under Support Desk)
2. Type `/linked` and select "Linked view of database"
3. Select "Client Tickets" database
4. Add filter: Client = "MsAudreysHouse"
5. Choose a table or board view

---

## Manual Step 3: Add Slack Bot Scopes

The Slack bot is missing required scopes to create channels. Add these scopes:

1. Go to https://api.slack.com/apps
2. Select the **Support Ticket Bot** app
3. Navigate to **OAuth & Permissions**
4. Under **Bot Token Scopes**, add:
   - `channels:manage` - Create and archive public channels
   - `channels:join` - Join public channels
   - `chat:write` - Post messages
   - `pins:write` - Pin messages
   - `reactions:write` - Add reactions (for ticket confirmations)

5. Click **Reinstall to Workspace** to apply the new scopes
6. Update the `SLACK_BOT_TOKEN` in your `.env` file with the new token

---

## Manual Step 4: Create Slack Channels

After updating bot scopes, either:

### Option A: Run the Setup Script
```bash
cd c:/Dev/StrataNoble/support-ticket-system
npm run setup:complete
```

### Option B: Create Manually in Slack
1. Create public channel `#support-dslv`
2. Create public channel `#support-msaudreyshouse`
3. Invite the Support Ticket Bot to both channels
4. Post and pin the channel rules message in each channel

**Channel Rules Template:**
```
Support Channel Rules

- This channel is for issue intake only
- Post one issue per message
- Use the "Create Ticket" shortcut (hover message > More actions)
- Or use /ticket command
- No troubleshooting in DMs
- Track status in Notion: [Portal URL]
```

---

## Manual Step 5: Update Environment Variables

After completing the above steps, update your `.env` file:

```env
# Slack Channel IDs
SLACK_SUPPORT_DSLV_CHANNEL_ID=C... (from #support-dslv)
SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID=C... (from #support-msaudreyshouse)
SLACK_OPS_TRIAGE_CHANNEL_ID=C0A8451R1B8

# Portal URLs - Update with the CORRECT existing portal page URLs
NOTION_DSLV_PORTAL_URL=https://notion.so/[DSLV-Portal-page-id]
NOTION_MSAUDREYS_PORTAL_URL=https://notion.so/[MsAudreysHouse-Portal-page-id]
```

---

## Manual Step 6: Delete Duplicate Pages

If the setup script created duplicate "Support Portal" pages, delete them:

**Pages to DELETE (if they exist):**
- "DSLV Support Portal" (incorrect - delete this)
- "MsAudreysHouse Support Portal" (incorrect - delete this)

**Pages to KEEP:**
- "DSLV Portal" (correct)
- "MsAudreysHouse Portal" (correct)

---

## Verification

After completing all manual steps, run:

```bash
cd c:/Dev/StrataNoble/support-ticket-system
npm run verify:setup
```

This will confirm all services are properly configured.

---

## Summary

| Task | Status | Method |
|------|--------|--------|
| Verify Notion database | Done | Automated |
| Use existing DSLV Portal page | Use existing | Manual |
| Use existing MsAudreysHouse Portal page | Use existing | Manual |
| Delete duplicate "Support Portal" pages | Pending | Manual |
| Create 8 database views | Pending | Manual |
| Add linked views to portals | Pending | Manual |
| Add Slack bot scopes | Pending | Manual |
| Create Slack channels | Pending | Manual or Script |
| Update .env file | Pending | Manual |
