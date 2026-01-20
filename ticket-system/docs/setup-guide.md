# Client Ticket System - Setup Guide

## Prerequisites

Before you begin, ensure you have:
- [ ] Notion workspace with admin access
- [ ] Slack workspace with admin access
- [ ] Node.js 18+ installed
- [ ] A deployment environment (Vercel, AWS Lambda, or VPS)

## Phase 1: Notion Setup

### Step 1: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name it "Support Desk Bot"
4. Select your workspace
5. Set capabilities:
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
6. Click "Submit"
7. **Copy the Internal Integration Token** (starts with `secret_`)
   - Save this as `NOTION_TOKEN` in your `.env` file

### Step 2: Create Support Desk Page

1. In Notion, create a new page called "Support Desk"
2. Click "Share" in the top right
3. Click "Invite" and select your integration "Support Desk Bot"
4. **Copy the Page ID** from the URL:
   - URL format: `https://notion.so/Your-Page-Title-{PAGE_ID}`
   - Example: `https://notion.so/Support-Desk-abc123def456`
   - Page ID is the part after the last dash: `abc123def456`
   - Save this as `NOTION_SUPPORT_DESK_PAGE_ID` in your `.env` file

### Step 3: Run Database Setup Script

```bash
cd ticket-system
npm install
npm run setup:notion
```

This will:
- Create the "Client Tickets" database
- Add all required properties
- Set up the Priority Score formula
- Create Bug Report and Feature Request template pages
- Output the `NOTION_DATABASE_ID` to add to your `.env`

### Step 4: Create Database Views (Manual)

In Notion, open the Client Tickets database and create these views:

#### Inbox
- **Type**: Table
- **Filter**: Status = New
- **Sort**: Created time (newest first)

#### Triage Queue
- **Type**: Table
- **Filter**: Status is New OR Status is Triaged
- **Sort**: 
  1. Severity (S1 → S4)
  2. Priority Score (high → low)

#### This Week
- **Type**: Board (grouped by Status)
- **Filter**: 
  - Release Window = This Week
  - Status is not Released
  - Status is not Won't Do

#### Waiting on Client
- **Type**: Table
- **Filter**: Status = Waiting on Client
- **Sort**: Last edited time (oldest first)

#### Blocked
- **Type**: Table
- **Filter**: Status = Blocked
- **Sort**: Created time (oldest first)

#### Ready for Release
- **Type**: Table
- **Filter**: Status = Ready for Release
- **Sort**: Platform, then Created time

#### Released (Last 14 Days)
- **Type**: Table
- **Filter**: 
  - Status = Released
  - Last edited time is within the past 14 days
- **Sort**: Last edited time (newest first)

#### Backlog
- **Type**: Table
- **Filter**: 
  - Release Window = Backlog
  - Status is not Released
  - Status is not Won't Do
- **Sort**: Priority Score (high → low)

## Phase 2: Slack Setup

### Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name it "Support Ticket Bot"
5. Select your workspace
6. Click "Create App"

### Step 2: Enable Socket Mode (Recommended)

1. In your app settings, go to "Socket Mode"
2. Toggle "Enable Socket Mode" to ON
3. Generate an app-level token:
   - Name: "socket_token"
   - Scope: `connections:write`
4. **Copy the token** (starts with `xapp-`)
   - Save as `SLACK_APP_TOKEN` in your `.env` file

### Step 3: Configure Bot Scopes

1. Go to "OAuth & Permissions"
2. Scroll to "Scopes" → "Bot Token Scopes"
3. Add these scopes:
   - `chat:write` - Post messages
   - `chat:write.public` - Post to public channels
   - `commands` - Use slash commands
   - `channels:read` - View channels
   - `groups:read` - View private channels
   - `users:read` - View user info
   - `links:read` - Get message permalinks

### Step 4: Install App to Workspace

1. Go to "Install App"
2. Click "Install to Workspace"
3. Review permissions and click "Allow"
4. **Copy the Bot User OAuth Token** (starts with `xoxb-`)
   - Save as `SLACK_BOT_TOKEN` in your `.env` file

### Step 5: Get Signing Secret

1. Go to "Basic Information"
2. Scroll to "App Credentials"
3. **Copy the Signing Secret**
   - Save as `SLACK_SIGNING_SECRET` in your `.env` file

### Step 6: Create Message Shortcut

1. Go to "Interactivity & Shortcuts"
2. Toggle "Interactivity" to ON
3. If not using Socket Mode, set Request URL (e.g., `https://your-domain.com/slack/events`)
4. Click "Create New Shortcut"
5. Choose "On messages"
6. Fill in:
   - **Name**: Create Ticket
   - **Short Description**: Create a support ticket from this message
   - **Callback ID**: `create_ticket`
7. Click "Create"

### Step 7: Create Slash Command

1. Go to "Slash Commands"
2. Click "Create New Command"
3. Fill in:
   - **Command**: `/ticket`
   - **Request URL**: (leave blank if using Socket Mode)
   - **Short Description**: Create a support ticket
   - **Usage Hint**: [summary of issue]
4. Click "Save"

### Step 8: Create Slack Channels

1. Create `#client-support` (public or private)
   - Set topic: "Post issues here using the /ticket command or the Create Ticket shortcut. No troubleshooting in threads. Status is tracked in Notion."
   - Invite the bot: `/invite @Support Ticket Bot`
   - **Copy the Channel ID**: 
     - Right-click channel → View channel details → Copy ID
     - Save as `SLACK_SUPPORT_CHANNEL_ID` in your `.env` file

2. Create `#ops-triage` (private, for team only)
   - Set topic: "Internal triage and ticket digests"
   - Invite the bot: `/invite @Support Ticket Bot`
   - **Copy the Channel ID**:
     - Save as `SLACK_TRIAGE_CHANNEL_ID` in your `.env` file

## Phase 3: Configure Environment

### Step 1: Create .env File

```bash
cd ticket-system
cp .env.example .env
```

### Step 2: Fill in All Values

Edit `.env` with all the tokens and IDs you collected:

```env
# Notion Configuration
NOTION_TOKEN=secret_your_token_here
NOTION_SUPPORT_DESK_PAGE_ID=abc123def456
NOTION_DATABASE_ID=xyz789abc123

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_APP_TOKEN=xapp-your-token-here
SLACK_SIGNING_SECRET=your_secret_here

# Slack Channel IDs
SLACK_SUPPORT_CHANNEL_ID=C0123456789
SLACK_TRIAGE_CHANNEL_ID=C9876543210

# Automation Configuration
DAILY_DIGEST_CRON=0 9 * * 1-5
WEEKLY_SUMMARY_CRON=0 16 * * 5
TIMEZONE=America/Los_Angeles

# Deployment
PORT=3000
NODE_ENV=production
```

## Phase 4: Test Locally

### Step 1: Install Dependencies

```bash
cd ticket-system
npm install
```

### Step 2: Start the Bot

```bash
npm run dev
```

You should see:
```
⚡️ Support Ticket Bot is running!
📅 Daily digest scheduled: 0 9 * * 1-5
📅 Weekly summary scheduled: 0 16 * * 5

✅ System ready:
  - Message shortcut: "Create Ticket"
  - Slash command: /ticket
  - Daily digest scheduled
  - Weekly summary scheduled
```

### Step 3: Test Ticket Creation

1. In Slack, go to `#client-support`
2. Post a test message: "Test issue: login button not working"
3. Hover over the message → Click "⋮" → Select "Create Ticket"
4. Fill out the form:
   - Summary: "Login button not working"
   - Client: (select any)
   - Platform: (select any)
   - Category: Bug
   - Severity: S3 Medium
   - Impact: 3
   - Urgency: 3
   - Effort: 2
5. Click "Create"
6. Verify:
   - ✅ Confirmation posted in Slack thread
   - ✅ Ticket appears in Notion database
   - ✅ All fields populated correctly
   - ✅ Slack permalink captured

### Step 4: Test Slash Command

1. In `#client-support`, type `/ticket`
2. Fill out the modal
3. Click "Create"
4. Verify ticket created in Notion

### Step 5: Test Digests

```bash
# Test daily digest
npm run test:digest

# Test weekly summary
npm run test:weekly
```

Verify messages post to `#ops-triage`.

## Phase 5: Deploy to Production

### Option A: Vercel (Recommended for Serverless)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "automation/src/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "automation/src/index.js"
       }
     ],
     "env": {
       "NOTION_TOKEN": "@notion-token",
       "NOTION_DATABASE_ID": "@notion-database-id",
       "SLACK_BOT_TOKEN": "@slack-bot-token",
       "SLACK_APP_TOKEN": "@slack-app-token",
       "SLACK_SIGNING_SECRET": "@slack-signing-secret",
       "SLACK_SUPPORT_CHANNEL_ID": "@slack-support-channel-id",
       "SLACK_TRIAGE_CHANNEL_ID": "@slack-triage-channel-id"
     }
   }
   ```

3. Add secrets:
   ```bash
   vercel secrets add notion-token "secret_..."
   vercel secrets add slack-bot-token "xoxb-..."
   # ... add all other secrets
   ```

4. Deploy:
   ```bash
   npm run deploy:vercel
   ```

### Option B: AWS Lambda

1. Install Serverless Framework:
   ```bash
   npm install -g serverless
   ```

2. Create `serverless.yml` (see deployment docs)

3. Deploy:
   ```bash
   serverless deploy
   ```

### Option C: VPS (DigitalOcean, Linode, etc.)

1. SSH into your server
2. Clone the repository
3. Install Node.js and PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

4. Set up the app:
   ```bash
   cd ticket-system
   npm install --production
   ```

5. Create `.env` file with production values

6. Start with PM2:
   ```bash
   pm2 start automation/src/index.js --name ticket-bot
   pm2 save
   pm2 startup
   ```

## Phase 6: Create Client Status Page

1. In Notion, create a new page "Client Support Status"
2. Type `/linked` and select "Create linked database"
3. Choose "Client Tickets" database
4. Select "This Week" view
5. Click "Share" → "Share to web"
6. Toggle "Share to web" ON
7. Copy the public link
8. Send to clients with instructions:
   > "Visit this page to see the status of your support tickets. You'll see what we're working on this week and what's ready to ship. For new issues, post in #client-support."

## Phase 7: Proof Pack

Create a proof pack with:

### Screenshots
1. Notion database properties (all fields visible)
2. Notion database views (Inbox, Triage Queue, etc.)
3. Slack modal for creating ticket
4. Slack confirmation message with Notion link
5. Daily digest in #ops-triage
6. Weekly summary in #ops-triage

### Links
1. Test ticket in Notion
2. Slack permalink to test message
3. Client status page (public link)

### Logs
1. Bot startup logs
2. Ticket creation logs
3. Daily digest execution logs
4. Weekly summary execution logs

### Documentation
1. This setup guide
2. Runbook (see `docs/runbook.md`)
3. Environment variables reference

## Troubleshooting

See `docs/runbook.md` for detailed troubleshooting steps.

## Next Steps

1. ✅ Train team on ticket creation process
2. ✅ Add real client names to modal options
3. ✅ Customize automation schedules if needed
4. ✅ Set up monitoring/alerting for bot uptime
5. ✅ Schedule weekly review of backlog

## Support

For issues with this system, contact [Your Name] or post in `#ops-triage`.
