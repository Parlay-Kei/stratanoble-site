# Client Ticket System

A lightweight, integrated support ticket system using **Notion** as the system of record and **Slack** as the intake and notification layer.

## Overview

This system enables you to:
- ✅ Capture client issues from Slack in under 30 seconds
- ✅ Track tickets in Notion with automated priority scoring
- ✅ Provide clients with read-only status visibility
- ✅ Receive automated daily triage digests
- ✅ Get weekly shipped summaries
- ✅ Eliminate ad hoc texting and scattered issue tracking

## Features

### Slack Integration
- **Message Shortcut**: Convert any Slack message into a ticket
- **Slash Command**: `/ticket` for quick ticket creation
- **Automated Confirmations**: Instant Notion link posted to thread
- **Daily Digests**: Weekday morning summaries in `#ops-triage`
- **Weekly Summaries**: Friday afternoon shipped features recap

### Notion Database
- **Comprehensive Properties**: 20+ fields including Client, Platform, Category, Severity, Status, Priority, Impact, Urgency, Effort
- **Automated Priority Scoring**: Formula-based: `(Impact × Urgency) / Effort`
- **8 Pre-configured Views**: Inbox, Triage Queue, This Week, Waiting on Client, Blocked, Ready for Release, Released, Backlog
- **Template Pages**: Bug Report and Feature Request templates
- **Slack Integration**: Automatic capture of message permalinks and attachments

### Client Status Page
- Read-only Notion view showing current work
- No client edits = no help desk burden
- Transparent status without constant updates

## Quick Start

### Prerequisites
- Notion workspace (admin access)
- Slack workspace (admin access)
- Node.js 18+
- Deployment environment (Vercel/AWS Lambda/VPS)

### Installation

1. **Clone and install**
   ```bash
   cd ticket-system
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Set up Notion**
   - Create Notion integration at https://notion.so/my-integrations
   - Create "Support Desk" page and share with integration
   - Run setup script:
     ```bash
     npm run setup:notion
     ```

4. **Set up Slack**
   - Create Slack app at https://api.slack.com/apps
   - Enable Socket Mode
   - Add bot scopes (see setup guide)
   - Create message shortcut and slash command
   - Install to workspace

5. **Test locally**
   ```bash
   npm run dev
   ```

6. **Deploy**
   ```bash
   npm run deploy:vercel
   # or deploy to your preferred platform
   ```

For detailed instructions, see **[Setup Guide](docs/setup-guide.md)**.

## Usage

### Creating a Ticket

**From Slack Message (Recommended)**:
1. Find the client's message in `#client-support`
2. Click "⋮" (More actions) → "Create Ticket"
3. Fill out the modal form
4. Click "Create"
5. Confirmation with Notion link posts to thread

**Using Slash Command**:
1. Type `/ticket` in `#client-support`
2. Fill out the modal form
3. Click "Create"

### Triage Workflow

1. **Morning**: Check daily digest in `#ops-triage`
2. **Review**: Open Notion "Inbox" view
3. **Triage**: For each new ticket:
   - Assign owner
   - Set priority (P0-P3)
   - Update status to "Triaged"
   - Set release window
4. **Work**: Progress tickets through statuses
5. **Ship**: Move to "Ready for Release" → "Released"
6. **Friday**: Review weekly shipped summary

For detailed operations, see **[Runbook](docs/runbook.md)**.

## Architecture

```
┌─────────────────┐
│  Slack Channel  │
│ #client-support │
└────────┬────────┘
         │
         │ Message Shortcut / /ticket
         ▼
┌─────────────────┐
│   Slack Modal   │
│  (Input Form)   │
└────────┬────────┘
         │
         │ Submit
         ▼
┌─────────────────┐
│   Node.js Bot   │
│  (@slack/bolt)  │
└────────┬────────┘
         │
         │ Notion API
         ▼
┌─────────────────┐
│ Notion Database │
│ Client Tickets  │
└─────────────────┘
         │
         │ Scheduled Queries
         ▼
┌─────────────────┐
│  Slack Channel  │
│  #ops-triage    │
│  (Digests)      │
└─────────────────┘
```

## Project Structure

```
ticket-system/
├── automation/
│   ├── src/
│   │   └── index.js           # Main Slack bot + automations
│   └── scripts/
│       ├── setup-notion-database.js  # Database setup script
│       ├── test-daily-digest.js      # Test daily digest
│       └── test-weekly-summary.js    # Test weekly summary
├── docs/
│   ├── setup-guide.md         # Detailed setup instructions
│   └── runbook.md             # Operational guide
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NOTION_TOKEN` | Notion integration token | `secret_abc123...` |
| `NOTION_SUPPORT_DESK_PAGE_ID` | Support Desk page ID | `abc123def456` |
| `NOTION_DATABASE_ID` | Client Tickets database ID | `xyz789abc123` |
| `SLACK_BOT_TOKEN` | Slack bot OAuth token | `xoxb-...` |
| `SLACK_APP_TOKEN` | Slack app-level token | `xapp-...` |
| `SLACK_SIGNING_SECRET` | Slack signing secret | `abc123...` |
| `SLACK_SUPPORT_CHANNEL_ID` | Support channel ID | `C0123456789` |
| `SLACK_TRIAGE_CHANNEL_ID` | Triage channel ID | `C9876543210` |
| `DAILY_DIGEST_CRON` | Daily digest schedule | `0 9 * * 1-5` |
| `WEEKLY_SUMMARY_CRON` | Weekly summary schedule | `0 16 * * 5` |
| `TIMEZONE` | Timezone for schedules | `America/Los_Angeles` |

### Notion Database Properties

| Property | Type | Description |
|----------|------|-------------|
| Ticket | Title | Ticket summary |
| Client | Select | Client name |
| Platform | Select | Direct Cuts, DSLV, Strata Noble, Other |
| Category | Select | Bug, Feature, Billing, Access/Auth, Data, UX, Question |
| Severity | Select | S1 Critical, S2 High, S3 Medium, S4 Low |
| Status | Status | New, Triaged, In Progress, Blocked, Waiting on Client, Ready for Release, Released, Won't Do |
| Priority | Select | P0, P1, P2, P3 |
| Impact | Number | 1-5 (how many users affected) |
| Urgency | Number | 1-5 (how soon it needs attention) |
| Effort | Number | 1-5 (estimated work required) |
| Priority Score | Formula | `(Impact × Urgency) / Effort` |
| Owner | Person | Assigned team member |
| Intake Source | Select | Slack, Email, Call, Form |
| Slack Thread | URL | Link to Slack thread |
| Message Permalink | URL | Link to original message |
| Attachments | Files | Screenshots, recordings, etc. |
| Release Window | Select | Next Patch, This Week, Next Week, Backlog |
| Due Date | Date | Target completion date |
| Receipts / Proof Pack | URL | Link to proof/evidence |
| Notes | Text | Additional context |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start bot in development mode |
| `npm run setup:notion` | Create Notion database |
| `npm run test:digest` | Test daily digest |
| `npm run test:weekly` | Test weekly summary |
| `npm run deploy:vercel` | Deploy to Vercel |
| `npm start` | Start bot in production mode |

## Deployment Options

### Vercel (Serverless)
- ✅ Easy setup
- ✅ Auto-scaling
- ✅ Free tier available
- ⚠️ Requires Socket Mode for Slack

### AWS Lambda
- ✅ Serverless
- ✅ Pay per use
- ⚠️ More complex setup

### VPS (DigitalOcean, Linode, etc.)
- ✅ Full control
- ✅ Simple deployment
- ⚠️ Requires server management
- ⚠️ Fixed monthly cost

See [Setup Guide](docs/setup-guide.md) for deployment instructions.

## Monitoring

### Health Checks
- Bot startup logs
- Ticket creation confirmations
- Daily digest execution
- Weekly summary execution

### Metrics to Track
- New tickets per week
- Tickets resolved per week
- Average time to triage
- Average time to resolution
- Tickets by platform
- Tickets by severity

## Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Ticket creation fails | Verify Notion token and database ID |
| Modal doesn't open | Check Slack app installation and scopes |
| Digest not posting | Verify bot is member of triage channel |
| Permalink not captured | Add `links:read` scope to bot |

See [Runbook](docs/runbook.md) for detailed troubleshooting.

## Roadmap

Future enhancements:
- [ ] Email intake integration
- [ ] Web form for external clients
- [ ] SLA tracking and alerts
- [ ] Client satisfaction surveys
- [ ] Analytics dashboard
- [ ] Integration with Linear/Jira for engineering tickets

## Contributing

This is an internal tool. For changes:
1. Test locally first
2. Document changes in runbook
3. Update proof pack
4. Deploy during low-traffic hours

## License

Internal use only.

## Support

- **Documentation**: See `docs/` folder
- **Issues**: Post in `#ops-triage`
- **Questions**: Contact system owner

## Acknowledgments

Built for efficient client support without becoming a help desk.

---

**Last Updated**: 2026-01-12  
**Version**: 1.0.0  
**Maintainer**: [Your Name]
