# Support Ticket System Setup Guide

Complete setup instructions for the Notion + Slack client ticket system.

## Prerequisites

- Node.js 18+
- Notion workspace with admin access
- Slack workspace with app installation permissions
- Access to create channels and install apps

## Step 1: Create Slack Channels

1. Create the following channels in Slack:
   - `#support-dslv` - DSLV client intake
   - `#support-msaudreyshouse` - MsAudreysHouse client intake
   - `#ops-triage` - Internal triage (private, invite ops team only)

2. Note down the channel IDs:
   - Click channel name > Copy link
   - Extract ID from URL: `https://workspace.slack.com/archives/C0123456789`

## Step 2: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: "Support Ticket System"
4. Select your workspace
5. Capabilities:
   - Read content
   - Update content
   - Insert content
6. Click "Submit"
7. Copy the "Internal Integration Token" (starts with `secret_`)

## Step 3: Create Notion Structure

### Create Support Desk Page

1. Create a new page: "Support Desk (HQ)"
2. This will be the parent page for everything

### Create Client Tickets Database

1. Inside Support Desk, create a new full-page database
2. Name it "Client Tickets"
3. Add the following properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Ticket | Title | Default title property |
| Client | Select | Options: DSLV, MsAudreysHouse, Strata Noble, Other |
| Platform | Select | Options: DSLV, MsAudreysHouse, Direct Cuts, Strata Noble, Other |
| Category | Select | Options: Bug, Feature, Billing, Access/Auth, Data, UX, Question |
| Severity | Select | Options: S1 Critical, S2 High, S3 Medium, S4 Low |
| Status | Status | Groups: To Do (New), In Progress (Triaged, In Progress, Waiting on Client, Blocked), Complete (Ready for Release, Released, Won't Do) |
| Priority | Select | Options: P0, P1, P2, P3 |
| Impact | Number | Format: Number |
| Urgency | Number | Format: Number |
| Effort | Number | Format: Number |
| Priority Score | Formula | `round((Impact * Urgency) / if(Effort == 0, 1, Effort), 1)` |
| Owner | Person | - |
| Intake Source | Select | Options: Slack, Email, Call, Form |
| Slack Permalink | URL | - |
| Attachments | Files & media | - |
| Release Window | Select | Options: Next Patch, This Week, Next Week, Backlog |
| Due Date | Date | - |
| Receipts / Proof Pack | URL | - |
| Notes | Text | - |

4. Copy the database ID from the URL:
   - `https://www.notion.so/workspace/xxxxxxxx?v=...`
   - The database ID is the `xxxxxxxx` part (32 characters)

### Create Database Views

Create these views in the Client Tickets database:

1. **Inbox**: Filter Status = New, Sort by Created time desc
2. **Triage Queue**: Filter Status is New OR Triaged, Sort by Severity asc then Priority Score desc
3. **This Week**: Filter Release Window = "This Week" AND Status not in (Released, Won't Do)
4. **Waiting on Client**: Filter Status = "Waiting on Client"
5. **Blocked**: Filter Status = "Blocked"
6. **Ready for Release**: Filter Status = "Ready for Release"
7. **Released (Last 14 Days)**: Filter Status = "Released" AND Last edited time > 14 days ago
8. **Backlog**: Filter Release Window = "Backlog" AND Status not in (Released, Won't Do)

### Create Templates

1. In the database, click "New" dropdown > "New template"
2. Create "Bug Report" template:
   - Category: Bug
   - Status: New
   - Release Window: Next Patch
3. Create "Feature Request" template:
   - Category: Feature
   - Status: New
   - Release Window: Backlog

### Create Client Portals

1. Inside Support Desk, create page: "DSLV Portal"
2. Add linked database views filtered by Client = DSLV:
   - Inbox
   - In Progress
   - Waiting on Client
   - Released (Last 14 Days)

3. Repeat for "MsAudreysHouse Portal" filtered by Client = MsAudreysHouse

### Share Database with Integration

1. Open Client Tickets database
2. Click "..." menu > "Connections"
3. Search for "Support Ticket System" integration
4. Click to add

### Share Portal Pages

1. For each portal page (DSLV Portal, MsAudreysHouse Portal):
2. Click "Share" > "Invite"
3. Add client email with "Can view" permission
4. Do NOT share the master database directly

## Step 4: Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" > "From scratch"
3. Name: "Support Tickets"
4. Select your workspace

### Configure OAuth & Permissions

1. Go to "OAuth & Permissions"
2. Add Bot Token Scopes:
   - `chat:write` - Post messages
   - `commands` - Handle slash commands
   - `channels:read` - Get channel info
   - `channels:history` - Read message history
   - `reactions:write` - Add reactions
   - `users:read` - Get user info

3. Install to workspace
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Enable Socket Mode (Optional but Recommended)

1. Go to "Socket Mode"
2. Enable Socket Mode
3. Generate an App-Level Token with `connections:write` scope
4. Copy the token (starts with `xapp-`)

### Create Message Shortcut

1. Go to "Interactivity & Shortcuts"
2. Enable Interactivity
3. Request URL: Your server URL + `/slack/events` (or use Socket Mode)
4. Create new shortcut:
   - Name: "Create Ticket"
   - Callback ID: `create_ticket`
   - Type: On messages

### Create Slash Command

1. Go to "Slash Commands"
2. Create new command:
   - Command: `/ticket`
   - Request URL: Your server URL + `/slack/events`
   - Description: "Create a support ticket"
   - Usage hint: "[summary]"

### Get Signing Secret

1. Go to "Basic Information"
2. Copy the "Signing Secret"

## Step 5: Configure Environment

1. Copy `.env.example` to `.env`
2. Fill in all values:

```bash
# Notion
NOTION_TOKEN=secret_xxxxx
NOTION_DATABASE_ID=xxxxx

# Slack
SLACK_BOT_TOKEN=xoxb-xxxxx
SLACK_SIGNING_SECRET=xxxxx
SLACK_APP_TOKEN=xapp-xxxxx  # If using Socket Mode

# Channel IDs
SLACK_SUPPORT_DSLV_CHANNEL_ID=C0123456789
SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID=C0123456789
SLACK_OPS_TRIAGE_CHANNEL_ID=C0123456789

# Portal URLs
NOTION_DSLV_PORTAL_URL=https://notion.so/workspace/DSLV-Portal-xxxxx
NOTION_MSAUDREYS_PORTAL_URL=https://notion.so/workspace/MsAudreysHouse-Portal-xxxxx
```

## Step 6: Install and Verify

```bash
cd support-ticket-system
npm install
npm run verify:setup
```

Expected output should show all checks passing.

## Step 7: Pin Channel Rules

In each support channel, pin this message:

```
Support Channel Rules

- This channel is for issue intake only
- Post one issue per message
- Use the "Create Ticket" shortcut (hover message > More actions)
- Or use /ticket command
- No troubleshooting in DMs
- Track status in Notion: [Portal Link]
```

Replace [Portal Link] with the appropriate portal URL.

## Step 8: Test End-to-End

1. Post a test message in #support-dslv
2. Use the "Create Ticket" shortcut
3. Fill in the form and submit
4. Verify:
   - Thread reply with Notion link
   - Ticket appears in Notion with Client = DSLV
   - Ticket visible in DSLV Portal

5. Repeat for #support-msaudreyshouse

6. Trigger daily digest manually:
   ```bash
   npm run digest:send
   ```

7. Verify digest posts to #ops-triage

## Step 9: Deploy

### Option A: Run with Node.js

```bash
npm run build
npm start
```

### Option B: Deploy to Vercel

See `serverless/` directory for Vercel configuration.

### Option C: Deploy to Railway/Render

Use the standard Node.js buildpack with `npm start`.

## Invite Bot to Channels

Ensure the bot is invited to all relevant channels:

```
/invite @SupportTickets
```

Run in:
- #support-dslv
- #support-msaudreyshouse
- #ops-triage

## Verification Checklist

- [ ] Notion integration created and has database access
- [ ] Client Tickets database has all required properties
- [ ] Database views created
- [ ] DSLV Portal and MsAudreysHouse Portal pages created with filtered views
- [ ] Portal pages shared read-only with clients
- [ ] Slack app created with required scopes
- [ ] Message shortcut "Create Ticket" configured
- [ ] Slash command /ticket configured
- [ ] Bot installed to workspace
- [ ] Bot invited to all channels
- [ ] Environment variables configured
- [ ] Test ticket created successfully
- [ ] Daily digest posts to #ops-triage
- [ ] Pinned rules in each support channel
