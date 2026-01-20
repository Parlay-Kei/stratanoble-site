# ANX Work Intake Schema

**Version**: 2.0
**Last Updated**: January 2026
**Owner**: Work Intake & Triage Agent

---

## Overview

This document defines how work requests are tagged, routed, and escalated across the ANX Agent Operating System. All requests flow through the Front Door (Work Intake & Triage) before being dispatched to the appropriate agents.

---

## Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        REQUEST SOURCES                          │
├─────────────────────────────────────────────────────────────────┤
│  Slack  │  Email  │  Form  │  API  │  Agent-to-Agent  │  CLI   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WORK INTAKE & TRIAGE                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Classify │→ │ Prioritize│→ │  Route   │→ │  Track   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Policy & Approval│ │ Assigned Agent  │ │ Proof Pack      │
│ Matrix (if needed)│ │ or Team        │ │ Librarian       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Request Schema

### Required Fields

```json
{
  "request_id": "REQ-2026-001234",
  "timestamp": "2026-01-18T10:30:00Z",
  "source": "slack|email|form|api|agent|cli",
  "requester": {
    "name": "string",
    "email": "string",
    "role": "string",
    "venture": "DC|DSLV|SN|ANX"
  },
  "category": "feature|bug|support|infrastructure|data|legal|finance|hr|marketing|sales",
  "summary": "string (max 100 chars)",
  "description": "string",
  "priority": "P0|P1|P2|P3|P4",
  "tags": ["string"],
  "venture": "DC|DSLV|SN|ANX",
  "status": "new|triaged|assigned|in_progress|blocked|completed|closed"
}
```

### Optional Fields

```json
{
  "business_impact": "string",
  "desired_outcome": "string",
  "deadline": "ISO8601 date",
  "attachments": ["url"],
  "related_requests": ["request_id"],
  "assigned_to": "agent_name",
  "approval_required": true|false,
  "escalation_path": ["agent_name"],
  "sla": {
    "response": "ISO8601 duration",
    "resolution": "ISO8601 duration"
  }
}
```

---

## Classification Taxonomy

### Primary Categories

| Category | Code | Description | Default Route |
|----------|------|-------------|---------------|
| Feature Request | `feature` | New functionality | Product Lead |
| Bug Report | `bug` | Something broken | QA Gatekeeper |
| Support Request | `support` | Customer help needed | Support Triage |
| Infrastructure | `infra` | DevOps/Platform needs | Core Ops Monitor |
| Data Request | `data` | Analytics/Reports | BI & Insights |
| Legal/Compliance | `legal` | Policy/Legal matters | Legal Ops Lead |
| Finance | `finance` | Budget/Payments | CFO Agent |
| HR/People | `hr` | Team operations | People Ops |
| Marketing | `marketing` | Campaigns/Content | Marketing Ops |
| Sales | `sales` | Pipeline/Deals | Sales Agent |

### Secondary Tags

| Tag | Use For |
|-----|---------|
| `urgent` | Time-sensitive requests |
| `customer-facing` | Impacts customers directly |
| `revenue-impact` | Affects revenue |
| `security` | Security-related |
| `compliance` | Regulatory requirement |
| `cross-functional` | Needs multiple teams |
| `external-dependency` | Waiting on third party |
| `recurring` | Repeating request |

### Venture Tags

| Tag | Venture |
|-----|---------|
| `DC` | Direct Cuts |
| `DSLV` | DSLV |
| `SN` | Strata Noble |
| `ANX` | ANX Holdings (shared) |

---

## Priority Framework

### Priority Definitions

| Priority | Name | Description | Examples |
|----------|------|-------------|----------|
| P0 | Critical | Production down, security breach, data loss | Site outage, payment failure, data breach |
| P1 | High | Major feature broken, significant revenue/user impact | Booking broken, auth failing, major bug |
| P2 | Medium | Important issue, workaround exists | Minor bugs, performance issues |
| P3 | Low | Nice to have, no urgency | Improvements, non-critical requests |
| P4 | Backlog | Future consideration | Ideas, long-term improvements |

### SLA by Priority

| Priority | Response SLA | Resolution SLA | Escalation After |
|----------|--------------|----------------|------------------|
| P0 | 15 minutes | 4 hours | 30 minutes |
| P1 | 2 hours | 24 hours | 4 hours |
| P2 | 8 hours | 3 days | 24 hours |
| P3 | 24 hours | 1 week | 3 days |
| P4 | 48 hours | Scheduled | N/A |

### Priority Calculation Matrix

```
Impact Score (1-5):
- 5: All users affected, revenue at risk
- 4: Many users affected, significant impact
- 3: Some users affected, moderate impact
- 2: Few users affected, low impact
- 1: Minimal user/business impact

Urgency Score (1-5):
- 5: Immediate (happening now)
- 4: Today (must be resolved today)
- 3: This week (needs attention soon)
- 2: This month (can be planned)
- 1: No deadline (when time allows)

Priority = Impact × Urgency
- 20-25: P0
- 12-19: P1
- 6-11: P2
- 3-5: P3
- 1-2: P4
```

---

## Routing Rules

### Standard Routing

```yaml
routes:
  feature:
    default: product-lead
    if_venture: venture_gm
    cc: [growth-lead]

  bug:
    default: qa-gatekeeper
    if_critical: [ocs, platform-engineering]

  support:
    default: support-triage
    if_billing: payments-compliance
    if_safety: trust-and-safety

  infra:
    default: core-ops-monitor
    if_security: saas-security-auditor

  data:
    default: bi-and-insights
    if_pii: privacy-and-consent

  legal:
    default: legal-ops-lead
    if_contract: [legal-ops-lead, cfo-agent]

  finance:
    default: cfo-agent
    if_vendor: vendor-and-procurement

  hr:
    default: people-ops
    if_hiring: [people-ops, principal]

  marketing:
    default: marketing-ops
    if_brand: brand-guardian
    if_content: content-engine

  sales:
    default: sales-agent
    if_enterprise: [sales-agent, growth-lead]
```

### Cross-Functional Routing

When requests involve multiple categories:

1. Identify primary category
2. Route to primary owner
3. CC all secondary stakeholders
4. Set cross-functional tag
5. Create sync meeting if needed

---

## Escalation Paths

### Standard Escalation Chain

```
Agent → Lead → Executive → OCS → Principal
```

### By Category

| Category | L1 | L2 | L3 | Final |
|----------|----|----|----|----|
| Feature | Product Lead | OCS | Principal | - |
| Bug | QA Gatekeeper | OCS | Principal | - |
| Support | Support Triage | Customer Success | OCS | Principal |
| Finance | CFO Agent | Principal | - | - |
| Legal | Legal Ops Lead | Principal | - | - |
| Security | SaaS Security Auditor | OCS | Principal | - |

### Auto-Escalation Triggers

1. **SLA Breach**: Automatically escalate to L2
2. **P0/P1 Priority**: Immediate escalation to L2
3. **Customer Complaint**: Escalate to Customer Success
4. **Revenue Impact >$1K**: Escalate to CFO Agent
5. **Security Flag**: Escalate to SaaS Security Auditor
6. **Legal Risk**: Escalate to Legal Ops Lead

---

## Status Lifecycle

```
new → triaged → assigned → in_progress → completed → closed
                    ↓
               blocked → unblocked → in_progress
```

### Status Definitions

| Status | Definition | Who Updates |
|--------|------------|-------------|
| `new` | Just received | System |
| `triaged` | Classified and prioritized | Work Intake |
| `assigned` | Assigned to owner | Work Intake |
| `in_progress` | Being worked on | Assigned Agent |
| `blocked` | Waiting on dependency | Assigned Agent |
| `completed` | Work done, pending verification | Assigned Agent |
| `closed` | Verified and closed | Requester/Work Intake |

---

## Request Templates

### Feature Request

```markdown
**Category**: feature
**Venture**: [DC/DSLV/SN/ANX]

### Feature Summary
[One-line description]

### Problem Statement
[What problem does this solve?]

### Proposed Solution
[How should it work?]

### Success Criteria
[How do we know it's done?]

### Business Impact
[Why is this important?]

### Timeline
- Desired: [Date]
- Flexible: [Yes/No]
```

### Bug Report

```markdown
**Category**: bug
**Venture**: [DC/DSLV/SN/ANX]
**Environment**: [production/staging/local]

### Bug Summary
[One-line description]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]

### Expected Behavior
[What should happen]

### Actual Behavior
[What happens instead]

### Impact
- Users affected: [N or All]
- Revenue impact: [Y/N, estimate if Y]
- Workaround: [Description if available]

### Attachments
[Screenshots, logs, etc.]
```

### Support Request

```markdown
**Category**: support
**Venture**: [DC/DSLV/SN/ANX]

### Issue Summary
[One-line description]

### Customer Details
- Customer ID: [ID]
- Account type: [Type]
- Contact preference: [Email/Phone]

### Issue Description
[Full details]

### Actions Taken
[What has already been tried]

### Resolution Requested
[What the customer wants]
```

---

## Metrics & Reporting

### Key Metrics Tracked

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Time | <SLA | Avg time to first response |
| Resolution Time | <SLA | Avg time to close |
| Routing Accuracy | >95% | % correctly routed first time |
| SLA Compliance | >95% | % meeting SLA |
| Requester Satisfaction | >4.5/5 | Post-close survey |

### Weekly Intake Report

```markdown
## Weekly Intake Report - [Week of Date]

### Volume
- Total requests: [N]
- By priority: P0:[N] P1:[N] P2:[N] P3:[N] P4:[N]
- By category: [breakdown]
- By venture: DC:[N] DSLV:[N] SN:[N] ANX:[N]

### SLA Performance
- Response SLA met: [%]
- Resolution SLA met: [%]

### Bottlenecks
- [Issue 1]
- [Issue 2]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

## Integration Points

### Inbound Integrations
- Slack: `/request` command, DM to intake bot
- Email: intake@anx.io
- Web Form: Internal request portal
- API: POST /api/v1/requests
- GitHub: Issue labels trigger intake

### Outbound Integrations
- Notion: Task creation
- Linear: Engineering tickets
- Zendesk: Support tickets
- Slack: Notifications to channels
- Email: Acknowledgments and updates

---

## Appendix: Request ID Format

```
REQ-[YEAR]-[SEQUENCE]
Example: REQ-2026-001234

For specific categories:
BUG-2026-001234 (Bug reports)
FTR-2026-001234 (Feature requests)
SUP-2026-001234 (Support requests)
```
