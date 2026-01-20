# Support Ticket System Runbook

## Overview

This document covers the operational procedures for the Client Support Ticket System that uses Slack for intake and Notion for tracking.

## System Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Slack Channels | Issue intake | #support-dslv, #support-msaudreyshouse |
| Slack Channel | Triage notifications | #ops-triage |
| Notion Database | Source of truth | Client Tickets (master) |
| Notion Pages | Client portals | DSLV Portal, MsAudreysHouse Portal |
| Service | Integration | support-ticket-system (Node.js) |

## How Clients Submit Tickets

### Option 1: Message Shortcut (Preferred)

1. Client posts issue in their support channel (#support-dslv or #support-msaudreyshouse)
2. Staff member hovers over the message
3. Click "More actions" (three dots)
4. Select "Create Ticket"
5. Fill in the modal form:
   - Summary (pre-filled from message)
   - Platform
   - Category
   - Severity
   - Impact (1-10)
   - Urgency (1-10)
   - Effort estimate (optional)
6. Submit
7. Bot replies in thread with Notion ticket link
8. Ticket reaction added to original message

### Option 2: Slash Command

1. In support channel, type: `/ticket [summary]`
2. Complete the modal form
3. Submit

### Auto-Routing

Tickets are automatically tagged with the correct Client based on source channel:
- #support-dslv -> Client = DSLV
- #support-msaudreyshouse -> Client = MsAudreysHouse

## Daily Triage Workflow

### Morning (9:00 AM Weekdays)

1. Daily digest posts automatically to #ops-triage
2. Review the digest sections:
   - **New Tickets by Client**: Overnight submissions
   - **Top 5 Priority**: Highest severity/score tickets
   - **Waiting on Client (>3 days)**: Stale items needing follow-up
   - **Ready for Release**: Items completed and pending deployment

### Triage Process

1. Open the **Triage Queue** view in Notion (Support Desk > Client Tickets > Triage Queue)
2. For each New ticket:
   - Review the issue description and Slack permalink
   - Set Priority (P0-P3) based on business impact
   - Assign Owner
   - Update Status to "Triaged"
   - Optionally set Release Window
3. For items needing immediate action:
   - Set Status to "In Progress"
   - Communicate in Slack thread if needed

### Priority Guidelines

| Priority | Criteria | Response Target |
|----------|----------|-----------------|
| P0 | Production down, data loss, security | Immediate |
| P1 | Major feature broken, high impact | Same day |
| P2 | Significant issue, workaround exists | This week |
| P3 | Minor issue, enhancement | Backlog |

### Severity Guidelines

| Severity | Definition |
|----------|------------|
| S1 Critical | Production outage, security breach, data corruption |
| S2 High | Major functionality broken, many users affected |
| S3 Medium | Feature degraded, some users affected |
| S4 Low | Minor issue, cosmetic, single user |

## Status Transitions

```
New -> Triaged -> In Progress -> Ready for Release -> Released
         |             |
         v             v
      Blocked    Waiting on Client
         |             |
         +-----+-------+
               |
               v
          Won't Do
```

### Status Definitions

| Status | Meaning |
|--------|---------|
| New | Just submitted, not reviewed |
| Triaged | Reviewed, priority set, awaiting work |
| In Progress | Actively being worked on |
| Blocked | Cannot proceed (dependency, external factor) |
| Waiting on Client | Needs client input or action |
| Ready for Release | Code complete, awaiting deployment |
| Released | Deployed to production |
| Won't Do | Closed without action (duplicate, invalid, deferred) |

## Marking Releases

When deploying fixes:

1. Open the **Ready for Release** view in Notion
2. For each deployed item:
   - Update Status to "Released"
   - Add release notes to Notes field if applicable
   - Released Date is auto-set via last_edited_time

## Client Portal Management

### Portal URLs

Each client has a read-only portal page with filtered views:
- DSLV Portal: Shows only DSLV tickets
- MsAudreysHouse Portal: Shows only MsAudreysHouse tickets

### Portal Views

- Inbox: New items for this client
- In Progress: Currently being worked
- Waiting on Client: Needs their input
- Released (Last 14 Days): Recently completed

### Sharing Rules

- Share only the portal pages with clients (read-only, "Can view")
- Never share the master Client Tickets database directly
- Review sharing permissions quarterly

## Troubleshooting

### Ticket not appearing in Notion

1. Check Slack bot is in the channel (`/invite @TicketBot`)
2. Verify NOTION_DATABASE_ID is correct
3. Check Notion integration has access to database
4. Review service logs: `npm run dev` and watch console

### Daily digest not posting

1. Verify service is running
2. Check SLACK_OPS_TRIAGE_CHANNEL_ID
3. Confirm bot is in #ops-triage channel
4. Manual trigger: `npm run digest:send`

### Slack modal not opening

1. Ensure message shortcut "Create Ticket" is configured in Slack app
2. Verify SLACK_SIGNING_SECRET matches app settings
3. Check trigger_id in logs

### Wrong client auto-tagged

1. Verify channel IDs in .env match actual Slack channels
2. Check CHANNEL_CLIENT_MAP in config

## Manual Operations

### Create ticket without Slack

1. Open Support Desk > Client Tickets in Notion
2. Click "New" or use Bug Report / Feature Request template
3. Fill all required fields manually
4. Set Intake Source to "Email", "Call", or "Form" as appropriate

### Bulk status update

1. In Notion, select multiple tickets
2. Use bulk property editor to change Status
3. Add release notes in batch if needed

### Generate digest manually

```bash
cd support-ticket-system
npm run digest:send
```

## Environment Variables Reference

| Variable | Purpose |
|----------|---------|
| NOTION_TOKEN | Notion integration API key |
| NOTION_DATABASE_ID | Client Tickets database ID |
| SLACK_BOT_TOKEN | Slack bot OAuth token |
| SLACK_SIGNING_SECRET | Slack request verification |
| SLACK_APP_TOKEN | Socket Mode app token |
| SLACK_SUPPORT_DSLV_CHANNEL_ID | #support-dslv channel ID |
| SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID | #support-msaudreyshouse channel ID |
| SLACK_OPS_TRIAGE_CHANNEL_ID | #ops-triage channel ID |
| NOTION_DSLV_PORTAL_URL | DSLV Portal page URL |
| NOTION_MSAUDREYS_PORTAL_URL | MsAudreysHouse Portal page URL |

## Maintenance

### Weekly

- Review Backlog items for re-prioritization
- Clear any Won't Do items older than 30 days
- Check Waiting on Client items for staleness

### Monthly

- Review portal sharing permissions
- Audit channel membership
- Check for orphaned tickets (no owner, in progress > 2 weeks)

### Quarterly

- Update severity/priority guidelines if needed
- Review automation effectiveness
- Clean up test tickets
