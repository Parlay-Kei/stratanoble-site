# Client Ticket System - Runbook

## Overview
This runbook provides operational guidance for the Notion + Slack Client Ticket System.

## System Architecture

```
Slack (#client-support)
    ↓
Message Shortcut / /ticket command
    ↓
Modal Form (captures ticket details)
    ↓
Notion API (creates ticket in database)
    ↓
Confirmation posted to Slack thread
```

## How to Create a Ticket

### Method 1: Message Shortcut (Recommended)
1. In `#client-support`, find the client's message describing the issue
2. Hover over the message and click the "⋮" (More actions) menu
3. Select "Create Ticket" from the shortcuts menu
4. Fill out the modal form:
   - **Summary**: One-sentence description
   - **Client**: Select from dropdown
   - **Platform**: Direct Cuts, DSLV, Strata Noble, or Other
   - **Category**: Bug, Feature, Billing, etc.
   - **Severity**: S1 (Critical) through S4 (Low)
   - **Impact**: 1-5 (how many users affected)
   - **Urgency**: 1-5 (how soon it needs attention)
   - **Effort**: 1-5 (estimated work required)
5. Click "Create"
6. Bot will post confirmation with Notion link in thread

### Method 2: Slash Command
1. In `#client-support`, type `/ticket`
2. Fill out the same modal form
3. Click "Create"

## How Triage Works

### Priority Scoring
Tickets are automatically scored using this formula:
```
Priority Score = (Impact × Urgency) / Effort
```

Higher scores = higher priority.

### Triage Workflow
1. **New tickets** appear in the "Inbox" view (Status = New)
2. **Daily digest** (weekday mornings at 9 AM) posts to `#ops-triage`:
   - Count of new tickets
   - Top 5 by Severity + Priority Score
   - Tickets waiting on client > 3 days
   - Tickets ready for release
3. **Team reviews** new tickets and:
   - Assigns owner
   - Sets Priority (P0-P3)
   - Updates Status to "Triaged"
   - Moves to appropriate Release Window
4. **Work progresses** through statuses:
   - Triaged → In Progress → Ready for Release → Released
   - Or: Blocked / Waiting on Client (with notes)

### Status Definitions
- **New**: Just created, not yet reviewed
- **Triaged**: Reviewed, prioritized, ready for work
- **In Progress**: Actively being worked on
- **Blocked**: Can't proceed (technical/external dependency)
- **Waiting on Client**: Need client input/approval
- **Ready for Release**: Complete, tested, ready to ship
- **Released**: Shipped to production
- **Won't Do**: Decided not to implement

### Release Windows
- **Next Patch**: Urgent, ship ASAP
- **This Week**: Target current week
- **Next Week**: Target next week
- **Backlog**: No immediate timeline

## Daily Operations

### Morning Routine (9:00 AM)
1. Check `#ops-triage` for daily digest
2. Review new tickets in Notion "Inbox" view
3. Triage each ticket:
   - Assign owner
   - Set priority
   - Update status
   - Add to release window

### Throughout the Day
1. Monitor `#client-support` for new issues
2. Create tickets as needed
3. Update ticket status as work progresses
4. Reply in Slack threads with updates

### End of Day
1. Update ticket statuses
2. Move completed items to "Ready for Release"
3. Add release notes to tickets

### Friday Afternoon (4:00 PM)
1. Check `#ops-triage` for weekly shipped summary
2. Review what was released this week
3. Verify release notes are client-ready

## Notion Database Views

### Inbox
**Purpose**: First stop for new tickets  
**Filter**: Status = New  
**Action**: Review and triage daily

### Triage Queue
**Purpose**: Prioritized list of work to be done  
**Filter**: Status in [New, Triaged]  
**Sort**: Severity, then Priority Score (desc)  
**Action**: Pick next ticket to work on

### This Week
**Purpose**: Current sprint work  
**Filter**: Release Window = This Week, Status not [Released, Won't Do]  
**Action**: Track weekly progress

### Waiting on Client
**Purpose**: Tickets blocked by client response  
**Filter**: Status = Waiting on Client  
**Action**: Follow up if > 3 days old

### Blocked
**Purpose**: Tickets blocked by technical/external issues  
**Filter**: Status = Blocked  
**Action**: Resolve blockers, escalate if needed

### Ready for Release
**Purpose**: Completed work ready to ship  
**Filter**: Status = Ready for Release  
**Action**: Deploy and move to Released

### Released (Last 14 Days)
**Purpose**: Recently shipped features  
**Filter**: Status = Released, last 14 days  
**Action**: Monitor for issues, celebrate wins

### Backlog
**Purpose**: Future work, not scheduled  
**Filter**: Release Window = Backlog  
**Action**: Review monthly, reprioritize

## Client Status Page

### Purpose
Provide clients with read-only visibility into ticket status without making you a help desk.

### Setup
1. In Notion, create page "Client Support Status"
2. Add linked database view of "Client Tickets"
3. Filter to show:
   - This Week
   - In Progress
   - Ready for Release
4. Share page with read-only link
5. Send link to clients

### Client Instructions
"Visit this page to see the status of your tickets. You'll see what we're working on this week and what's ready to ship. For new issues, post in #client-support."

## Troubleshooting

### Ticket creation fails
**Symptoms**: Modal submits but no Notion ticket created  
**Checks**:
1. Verify `NOTION_TOKEN` is valid
2. Verify `NOTION_DATABASE_ID` is correct
3. Check Notion integration has access to database
4. Check bot logs for errors

### Slack permalink not captured
**Symptoms**: Ticket created but "Message Permalink" field empty  
**Checks**:
1. Verify bot has `chat:write` and `links:read` scopes
2. Check if message was in private channel (bot needs access)

### Daily digest not posting
**Symptoms**: No digest in `#ops-triage` at scheduled time  
**Checks**:
1. Verify bot is running (check logs)
2. Verify `SLACK_TRIAGE_CHANNEL_ID` is correct
3. Verify bot is member of `#ops-triage`
4. Check cron schedule in `.env`

### Modal doesn't open
**Symptoms**: Click shortcut/command but nothing happens  
**Checks**:
1. Verify Slack app is installed
2. Verify bot is running
3. Check if using Socket Mode (requires app token)
4. Check bot logs for errors

## Maintenance

### Weekly
- Review backlog, reprioritize
- Archive old Released tickets (optional)
- Update client list in modal if needed

### Monthly
- Review automation logs
- Check for stale "Waiting on Client" tickets
- Update platform/category options if needed

### Quarterly
- Review Priority Score formula effectiveness
- Gather team feedback on process
- Adjust triage workflow if needed

## Escalation

### Critical Issues (S1)
1. Create ticket immediately
2. Post in `#ops-triage` with @channel
3. Assign owner immediately
4. Set Priority = P0
5. Update every 2 hours until resolved

### Client Complaints
1. Create ticket if not exists
2. Set Severity appropriately
3. Add detailed notes
4. Assign to team lead
5. Follow up within 24 hours

## Metrics to Track

### Weekly
- New tickets created
- Tickets resolved
- Average time to triage
- Average time to resolution

### Monthly
- Tickets by platform
- Tickets by category
- Tickets by severity
- Client satisfaction (manual survey)

## Contact

**System Owner**: [Your Name]  
**Slack**: `#ops-triage`  
**Notion**: [Link to Support Desk]

## Change Log

- 2026-01-12: Initial runbook created
