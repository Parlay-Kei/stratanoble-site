# Client Support Ticket System

Lightweight ticket system using Notion as the source of truth and Slack as the intake layer.

## Architecture

```
Slack Channels (Intake)          Notion (Source of Truth)
------------------------         -------------------------
#support-dslv          ------>   Client Tickets (Master DB)
#support-msaudreyshouse ------>      |
                                     +-- DSLV Portal (filtered view)
#ops-triage <-------- Daily --------+-- MsAudreysHouse Portal (filtered view)
                      Digest
```

## Features

- **Slack Intake**: Message shortcut or /ticket command
- **Auto-Routing**: Channel determines client tag automatically
- **Daily Digest**: Weekday 9 AM summary to #ops-triage
- **Client Portals**: Read-only filtered views per client
- **Priority Scoring**: Formula-based prioritization

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Verify setup
npm run verify:setup

# Start development server
npm run dev

# Test ticket creation
npm run test:ticket
```

## Directory Structure

```
support-ticket-system/
├── docs/
│   ├── SETUP.md              # Full setup guide
│   └── RUNBOOK.md            # Operations guide
├── src/
│   ├── config/               # Configuration
│   ├── notion/               # Notion API client
│   ├── slack/                # Slack handlers
│   ├── automations/          # Daily digest
│   ├── handlers/             # Ticket creation
│   └── index.ts              # Entry point
├── scripts/
│   ├── test-ticket.ts        # Test ticket creation
│   └── verify-setup.ts       # Verify configuration
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| NOTION_TOKEN | Notion integration API key |
| NOTION_DATABASE_ID | Client Tickets database ID |
| SLACK_BOT_TOKEN | Slack bot OAuth token |
| SLACK_SIGNING_SECRET | Slack request verification |
| SLACK_APP_TOKEN | Socket Mode app token (optional) |
| SLACK_SUPPORT_DSLV_CHANNEL_ID | #support-dslv channel ID |
| SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID | #support-msaudreyshouse channel ID |
| SLACK_OPS_TRIAGE_CHANNEL_ID | #ops-triage channel ID |
| NOTION_DSLV_PORTAL_URL | DSLV Portal page URL |
| NOTION_MSAUDREYS_PORTAL_URL | MsAudreysHouse Portal page URL |

## Usage

### Creating Tickets

**Message Shortcut (Preferred)**
1. Post issue in support channel
2. Hover > More actions > "Create Ticket"
3. Complete modal form
4. Bot replies with Notion link

**Slash Command**
```
/ticket Login broken for enterprise users
```

### Daily Workflow

1. Check #ops-triage for morning digest
2. Open Triage Queue in Notion
3. Set Priority and Owner for new tickets
4. Update status as work progresses

### Manual Digest

```bash
npm run digest:send
```

## Documentation

- [Setup Guide](./docs/SETUP.md) - Complete installation instructions
- [Runbook](./docs/RUNBOOK.md) - Daily operations and troubleshooting

## Claude Agent Integration

This system is integrated with the Claude agent architecture:

- **Skill**: `support-ticket-ops` at `C:/Dev/.claude-anx/skills/support-ticket-ops/`
- **Agent**: `support-ticket-admin` at `C:/Dev/.claude-anx/agents/support-ticket-admin.md`
- **MCP Server**: `C:/Dev/.claude-anx/mcp-servers/support-ticket-server/`

Trigger the agent with queries like:
- "create ticket"
- "check tickets"
- "triage queue"
- "daily digest"

## License

Internal use only - Parlay-Kei/DataSolutions
