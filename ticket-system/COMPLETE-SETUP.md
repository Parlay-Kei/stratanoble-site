# 🚀 Complete Multi-Client Setup

This script automates the complete setup of your multi-client support ticket system.

## What It Does

### 1. Creates Slack Channels ✅
- `#support-dslv` - DSLV client support
- `#support-msaudreyshouse` - Ms Audrey's House client support  
- `#support-stratanoble` - Strata Noble client support

### 2. Configures Each Channel ✅
- Invites the bot automatically
- Sets channel topic/description
- Posts and pins channel rules (no emojis, clean format)

### 3. Creates Notion Portal Pages ✅
- One portal page per client
- Located in your Support Desk page
- Ready for linked database views
- Shareable read-only links for clients

### 4. Updates Notion Database ✅
- Adds all clients to the Client property dropdown
- Ensures consistent naming across the system

### 5. Outputs Configuration ✅
- Environment variables for each channel
- Portal URLs for each client
- Next steps checklist

---

## Prerequisites

Before running, ensure:
- ✅ Bot is already deployed and running
- ✅ `.env` file has all base credentials
- ✅ Notion database is created
- ✅ Slack app has required permissions

---

## How to Run

```bash
cd c:\Dev\StrataNoble\ticket-system
npm run setup:complete
```

---

## What You'll See

```
🚀 Starting complete multi-client setup...
════════════════════════════════════════════════════════════

📦 Setting up DSLV...
────────────────────────────────────────────────────────────
📱 Creating Slack channel: #support-dslv...
   ✅ Created channel: C0123456789
   ✅ Bot joined channel
📌 Posting rules to channel...
   ✅ Rules posted and pinned
📄 Creating Notion portal page for DSLV...
   ✅ Portal page created: abc-123
   🔗 URL: https://notion.so/...

[... repeats for each client ...]

════════════════════════════════════════════════════════════
✅ SETUP COMPLETE!
════════════════════════════════════════════════════════════

📋 Environment Variables to Add:
────────────────────────────────────────────────────────────
SLACK_SUPPORT_CHANNEL_DSLV=C0123456789
SLACK_SUPPORT_CHANNEL_MSAUDREYSHOUSE=C9876543210
SLACK_SUPPORT_CHANNEL_STRATANOBLE=C1122334455

🔗 Portal URLs:
────────────────────────────────────────────────────────────
DSLV: https://notion.so/DSLV-Support-Portal-...
MsAudreysHouse: https://notion.so/MsAudreysHouse-Support-Portal-...
StrataNoble: https://notion.so/StrataNoble-Support-Portal-...

📝 Next Steps:
────────────────────────────────────────────────────────────
1. Copy the environment variables above to your .env file
2. Restart your bot to pick up the new configuration
3. Test by posting in each support channel and creating a ticket
4. Share the portal URLs with each client (read-only)
5. Create Notion views manually (Inbox, Triage Queue, etc.)

🎉 Your multi-client support system is ready!
════════════════════════════════════════════════════════════
```

---

## After Running

### 1. Update .env File
Copy the output environment variables to your `.env`:

```env
# Multi-Client Support Channels
SLACK_SUPPORT_CHANNEL_DSLV=C0123456789
SLACK_SUPPORT_CHANNEL_MSAUDREYSHOUSE=C9876543210
SLACK_SUPPORT_CHANNEL_STRATANOBLE=C1122334455

# Keep your existing triage channel
SLACK_TRIAGE_CHANNEL_ID=C0A8451R1B8
```

### 2. Restart the Bot
Stop the current bot (Ctrl+C) and restart:

```bash
npm run dev
```

### 3. Test Each Channel
For each support channel:
1. Post a test message
2. Use `/ticket` or message shortcut
3. Verify ticket is created with correct client auto-tagged
4. Check Notion for the ticket

### 4. Share Portal URLs
Send each client their portal URL:
- Make sure the page is shared with "Anyone with link can view"
- Test the link in an incognito window
- Add instructions on how to check ticket status

### 5. Create Notion Views
Manually create these views in your Client Tickets database:

**Per-Client Views:**
- DSLV Tickets (filter: Client = DSLV)
- MsAudreysHouse Tickets (filter: Client = MsAudreysHouse)
- StrataNoble Tickets (filter: Client = StrataNoble)

**Workflow Views:**
- Inbox (Status = New)
- Triage Queue (Status in [New, Triaged], sort by Severity + Priority Score)
- This Week (Release Window = This Week)
- Waiting on Client (Status = Waiting on Client)
- Blocked (Status = Blocked)
- Ready for Release (Status = Ready for Release)
- Released (Last 14 Days)
- Backlog (Release Window = Backlog)

---

## Channel Rules Posted

Each channel gets this pinned message:

```
📋 Support Channel Rules

1. Report Issues Here - Post any bugs, questions, or feature requests
2. Use /ticket - Convert your message to a tracked ticket with /ticket
3. Or Use Shortcut - Click ⋮ on any message → "Create Ticket"
4. No Troubleshooting in Threads - All status updates happen in Notion
5. Check Status - View your ticket status in the Notion portal (link pinned)

How It Works:
• Post your issue → Create ticket → Get Notion link
• We triage daily and update status in Notion
• You get notified when resolved

Need urgent help? Tag @channel for critical issues only.
```

---

## Customization

To add more clients, edit `automation/scripts/complete-setup.js`:

```javascript
const CLIENTS = [
    {
        name: 'DSLV',
        channelName: 'support-dslv',
        description: 'DSLV client support tickets',
    },
    {
        name: 'YourNewClient',
        channelName: 'support-yournewclient',
        description: 'Your New Client support tickets',
    },
    // Add more clients here...
];
```

Then run `npm run setup:complete` again.

---

## Troubleshooting

### "Channel already exists"
The script will detect existing channels and skip creation. It will still post rules if needed.

### "Permission denied"
Make sure your Slack bot has these scopes:
- `channels:manage`
- `channels:write`
- `chat:write`
- `pins:write`

### "Notion page not found"
Verify `NOTION_SUPPORT_DESK_PAGE_ID` in your `.env` is correct and the integration has access.

---

## What's Next?

After setup is complete:
1. ✅ Channels created and configured
2. ✅ Portal pages ready
3. ✅ Client options updated in Notion
4. ⏳ Update .env with new channel IDs
5. ⏳ Restart bot
6. ⏳ Test ticket creation
7. ⏳ Share portal URLs
8. ⏳ Create Notion views

---

**Ready to run? Execute:**
```bash
npm run setup:complete
```
