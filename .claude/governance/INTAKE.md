# ANX Work Intake

**Version**: 3.0 (Lean Governance)
**Last Updated**: January 2026

---

## The Rule

**All work enters through INTAKE. No exceptions.**

```
┌─────────────────────────────────────────────────────────────┐
│                     INTAKE (Single Door)                     │
│  Slack │ Email │ Form │ API │ Agent-to-Agent │ CLI          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      OCS        │
                    │  (Orchestrator) │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │  Agent A  │      │  Agent B  │      │  Agent C  │
   └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
         │                  │                  │
         ▼                  ▼                  ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │   PROOF   │      │   PROOF   │      │   PROOF   │
   └───────────┘      └───────────┘      └───────────┘
```

---

## Intake Channels

| Channel | Format | Response SLA |
|---------|--------|--------------|
| Slack | `/request [description]` or DM to @intake | 15 min |
| Email | intake@anx.io | 2 hours |
| Form | Internal request portal | 2 hours |
| API | POST /api/v1/requests | Immediate |
| Agent | Via OCS routing | Immediate |
| CLI | `anx request "[description]"` | Immediate |

---

## Request Schema

### Required Fields

```yaml
request:
  summary: "One-line description (max 100 chars)"
  category: feature|bug|support|infra|data|legal|finance|hr|marketing|sales
  requester: "Name or agent ID"
  venture: DC|DSLV|SN|ANX
```

### Optional Fields

```yaml
request:
  priority: P0|P1|P2|P3|P4  # Auto-assigned if not provided
  description: "Full details"
  deadline: "ISO8601 date"
  attachments: ["url"]
  business_impact: "Why this matters"
```

---

## Routing Rules

### Category → Agent Mapping

| Category | Primary Agent | Backup |
|----------|---------------|--------|
| `feature` | Product Lead | OCS |
| `bug` | QA Gatekeeper | Platform Ops |
| `support` | Support Triage* | OCS |
| `infra` | Platform Ops | OCS |
| `data` | BI & Insights* | Product Lead |
| `legal` | Legal Ops Lead | OCS |
| `finance` | CFO Agent | OCS |
| `hr` | OCS (People Ops skill) | Principal |
| `marketing` | Growth Lead | OCS |
| `sales` | Growth Lead | OCS |

*Optional agents - routes to backup if not active

### Venture Routing

| Venture | Primary | Escalation |
|---------|---------|------------|
| DC | Direct Cuts GM | OCS |
| DSLV | DSLV GM (future) | OCS |
| SN | Strata Noble GM (future) | OCS |
| ANX | OCS | Principal |

### Priority Auto-Assignment

```
IF category == "bug" AND contains("production", "down", "broken"):
    priority = P0

IF category == "support" AND contains("billing", "payment", "refund"):
    priority = P1

IF category == "legal" AND contains("lawsuit", "subpoena", "breach"):
    priority = P0

IF category == "security":
    priority = P1

DEFAULT:
    priority = P3
```

---

## Priority Framework

| Priority | Name | Definition | Response | Resolution |
|----------|------|------------|----------|------------|
| P0 | Critical | Prod down, security breach, data loss | 15 min | 4 hours |
| P1 | High | Major broken, revenue impact | 2 hours | 24 hours |
| P2 | Medium | Important, workaround exists | 8 hours | 3 days |
| P3 | Low | Nice to have | 24 hours | 1 week |
| P4 | Backlog | Future consideration | 48 hours | Scheduled |

---

## Request Lifecycle

```
NEW → TRIAGED → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED
                    ↓
               BLOCKED → UNBLOCKED → IN_PROGRESS
```

| Status | Who Updates | Next Action |
|--------|-------------|-------------|
| NEW | System | OCS triages within SLA |
| TRIAGED | OCS | Assign to agent |
| ASSIGNED | OCS | Agent picks up |
| IN_PROGRESS | Agent | Work the request |
| BLOCKED | Agent | Document blocker, escalate |
| COMPLETED | Agent | Create proof, request close |
| CLOSED | OCS or Requester | Archive |

---

## Proof Requirements

Every completed request needs:

```yaml
proof:
  request_id: "REQ-2026-XXXXX"
  completed_by: "Agent name"
  completed_at: "ISO8601 timestamp"
  summary: "What was done"
  artifacts:
    - "Link to PR/deploy/doc"
    - "Screenshot if applicable"
  verification: "How to verify it works"
```

Stored in: `agents/[agent]/receipts/[request_id].md`

---

## Escalation Rules

### Auto-Escalate

| Condition | Escalate To | Action |
|-----------|-------------|--------|
| Response SLA missed | OCS | Reassign or notify |
| Resolution SLA at 80% | OCS | Status check |
| Blocked >24 hours | OCS | Unblock or escalate |
| P0/P1 raised | OCS + Principal | Immediate attention |
| Cross-agent conflict | OCS | Coordinate |

### Escalation Chain

```
Request Blocked
    ↓
Agent notifies OCS
    ↓
OCS attempts unblock (4 hours)
    ↓
If still blocked: Escalate to Principal
```

---

## Request Templates

### Feature Request

```markdown
**Category**: feature
**Venture**: [DC/DSLV/SN/ANX]

### Summary
[One-line description]

### Problem
[What problem does this solve?]

### Solution
[Proposed approach]

### Success Criteria
[How do we know it's done?]
```

### Bug Report

```markdown
**Category**: bug
**Venture**: [DC/DSLV/SN/ANX]
**Priority**: [P0/P1/P2/P3]

### Summary
[One-line description]

### Steps to Reproduce
1. [Step]
2. [Step]

### Expected
[What should happen]

### Actual
[What happens]

### Impact
[Users affected, workaround?]
```

### Support Request

```markdown
**Category**: support
**Venture**: [DC/DSLV/SN/ANX]

### Summary
[One-line description]

### Customer
[ID or email]

### Issue
[Full details]

### Resolution Requested
[What they want]
```

---

## Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Response SLA | 95% | OCS |
| Resolution SLA | 90% | OCS |
| Routing accuracy | 95% | OCS |
| Proof completion | 100% | QA Gatekeeper |
| Requester satisfaction | 4.5/5 | OCS |

---

## Weekly Intake Report

Generated every Monday by OCS:

```markdown
## Intake Report - Week of [Date]

### Volume
- Total: [N] requests
- By priority: P0:[N] P1:[N] P2:[N] P3:[N] P4:[N]
- By category: [breakdown]
- By venture: DC:[N] DSLV:[N] SN:[N] ANX:[N]

### SLA Performance
- Response: [%] met
- Resolution: [%] met

### Bottlenecks
- [Issue 1]
- [Issue 2]

### Proofs Archived
- [N] receipts filed
- [N] pending

### Action Items
- [Item 1]
- [Item 2]
```

---

## Summary

1. **Single door**: All work through INTAKE
2. **Fast routing**: Category → Agent in <15 min
3. **Clear SLAs**: Know when to escalate
4. **Proof required**: Every closure has a receipt
5. **No bypass**: Side channels = governance failure

---

## Delegation Command (Insert Into Intake Exactly)

```text
Venture: [Direct Cuts | DSLV | Strata Noble | Shared]
Type: [Bug | Feature | Ops | Legal | Finance | Marketing | Support]
Priority: [P0 | P1 | P2 | P3]
Outcome: [one sentence]
Why now: [one sentence]
Deadline: [date/time or none]
Risk: [Low | Medium | High]
Approvals expected: [none | spend | legal | deploy | data | PII]
Proof required: [screenshot | link | query | deploy receipt | doc]
```

---

## Routing Map (Lean)

### Type -> Owner Agent

| Type | Owner |
|------|-------|
| Bug | QA Gatekeeper |
| Feature | Product Lead |
| Ops | Platform Ops Lead |
| Legal | Legal Ops Lead |
| Finance | CFO Agent |
| Marketing | Growth Lead |
| Support | Support Triage (or OCS if inactive) |

### Venture -> Owner Agent

| Venture | Owner |
|---------|-------|
| Direct Cuts | Direct Cuts GM |
| DSLV | OCS (until GM active) |
| Strata Noble | OCS (until GM active) |
| Shared | OCS |

### Risk/Approval Triggers

If Approvals expected includes `spend`, `legal`, `deploy`, `data`, or `PII`, route to the owning agent and flag OCS for approval chain per `governance/APPROVALS.md`.

---

## No Intake, Not Real

Work starts only after an Intake card exists. Work without an Intake card is invalid and must be paused until created.

---

## Close Loop Protocol

Every completed task attaches exactly one receipt artifact. If approval was required, attach the approval receipt plus the proof artifact.

---

## Workflow Change Rule

Any workflow change requires a drill rerun within 7 days. Only rerun the drill that touches the changed area.

---

## Example Intake Cards

### P0 - Production Incident

```text
Venture: Direct Cuts
Type: Bug
Priority: P0
Outcome: New user auth restored with verified login success
Why now: New user signups failing in production
Deadline: ASAP
Risk: High
Approvals expected: deploy
Proof required: deploy receipt
Owner: Platform Ops Lead (QA Gatekeeper sign-off)
```

### P1 - Spend Request

```text
Venture: Direct Cuts
Type: Finance
Priority: P1
Outcome: $79/mo tool subscription active for shipping X
Why now: Required to ship current sprint deliverable
Deadline: 2026-01-21
Risk: Medium
Approvals expected: spend
Proof required: doc
Owner: CFO Agent
```

### P2 - Contract Request

```text
Venture: Shared
Type: Legal
Priority: P2
Outcome: Partner MSA reviewed and redline summary delivered
Why now: Partner onboarding blocked
Deadline: 2026-01-24
Risk: Medium
Approvals expected: legal
Proof required: doc
Owner: Legal Ops Lead
```
