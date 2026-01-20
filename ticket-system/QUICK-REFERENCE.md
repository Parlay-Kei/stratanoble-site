# Quick Reference Guide

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd ticket-system
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Set up Notion database
npm run setup:notion

# 4. Start the bot
npm run dev
```

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start bot locally |
| `npm run setup:notion` | Create Notion database |
| `npm run test:digest` | Test daily digest |
| `npm run test:weekly` | Test weekly summary |
| `npm start` | Start in production |

## 🎫 Creating Tickets

### From Slack Message
1. Hover over message
2. Click "⋮" → "Create Ticket"
3. Fill form → Click "Create"

### Using Slash Command
1. Type `/ticket`
2. Fill form → Click "Create"

## 📊 Notion Views

| View | Purpose | Filter |
|------|---------|--------|
| **Inbox** | New tickets | Status = New |
| **Triage Queue** | Prioritized work | Status = New or Triaged |
| **This Week** | Current sprint | Release Window = This Week |
| **Waiting on Client** | Blocked by client | Status = Waiting on Client |
| **Blocked** | Technical blocks | Status = Blocked |
| **Ready for Release** | Ready to ship | Status = Ready for Release |
| **Released** | Recently shipped | Status = Released (14 days) |
| **Backlog** | Future work | Release Window = Backlog |

## 🔢 Priority Scoring

```
Priority Score = (Impact × Urgency) / Effort
```

- **Impact**: 1-5 (how many users affected)
- **Urgency**: 1-5 (how soon needed)
- **Effort**: 1-5 (work required)

**Higher score = Higher priority**

## 📈 Status Flow

```
New → Triaged → In Progress → Ready for Release → Released
                    ↓
                 Blocked
                    ↓
            Waiting on Client
```

## ⚙️ Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **S1 Critical** | System down, blocking | Immediate |
| **S2 High** | Major feature broken | < 4 hours |
| **S3 Medium** | Minor issue, workaround exists | < 1 day |
| **S4 Low** | Enhancement, nice-to-have | Backlog |

## 🔔 Automated Digests

### Daily Digest (Weekdays 9 AM)
Posts to `#ops-triage`:
- New tickets count
- Top 5 by priority
- Waiting on client > 3 days
- Ready for release

### Weekly Summary (Fridays 4 PM)
Posts to `#ops-triage`:
- Released tickets by platform
- Release notes

## 🛠️ Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Modal doesn't open | Check bot is running, verify app installed |
| Ticket not created | Verify Notion token, check database ID |
| No digest | Verify bot in #ops-triage, check cron schedule |
| Permalink missing | Add `links:read` scope to bot |

## 📞 Support

- **Documentation**: `docs/` folder
- **Issues**: `#ops-triage`
- **Setup Help**: See `docs/setup-guide.md`
- **Operations**: See `docs/runbook.md`

## 🔑 Environment Variables

```env
NOTION_TOKEN=secret_...
NOTION_SUPPORT_DESK_PAGE_ID=...
NOTION_DATABASE_ID=...
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_SIGNING_SECRET=...
SLACK_SUPPORT_CHANNEL_ID=C...
SLACK_TRIAGE_CHANNEL_ID=C...
DAILY_DIGEST_CRON=0 9 * * 1-5
WEEKLY_SUMMARY_CRON=0 16 * * 5
TIMEZONE=America/Los_Angeles
```

## 📁 Project Structure

```
ticket-system/
├── automation/
│   ├── src/
│   │   └── index.js          # Main bot
│   └── scripts/
│       ├── setup-notion-database.js
│       ├── test-daily-digest.js
│       └── test-weekly-summary.js
├── docs/
│   ├── setup-guide.md
│   ├── runbook.md
│   └── proof-pack.md
├── .env.example
├── package.json
└── README.md
```

## ✅ Daily Workflow

### Morning (9:00 AM)
1. Check daily digest in `#ops-triage`
2. Open Notion "Inbox" view
3. Triage new tickets:
   - Assign owner
   - Set priority
   - Update status
   - Set release window

### Throughout Day
1. Monitor `#client-support`
2. Create tickets as needed
3. Update statuses
4. Reply in Slack threads

### End of Day
1. Update ticket statuses
2. Move completed to "Ready for Release"
3. Add release notes

### Friday (4:00 PM)
1. Check weekly summary
2. Review what shipped
3. Verify release notes

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-12
