# ANX Agent Roster

**Version**: 3.0 (Lean Governance)
**Last Updated**: January 2026

---

## Legend

| Label | Meaning | Count |
|-------|---------|-------|
| **A** | Agent - Autonomous, owns KPIs, makes decisions | 8-12 |
| **S** | Skill - Playbook owned by an Agent | 31 |
| **V** | Service - Runbook/integration, operated by an Agent | 14 |

---

## TIER 1: Agents (A)

### Core 8 (Active)

| ID | Agent | Owner | Mission | KPIs |
|----|-------|-------|---------|------|
| A1 | **OCS (Orchestrator)** | Steve | Turn direction into plans, delegate, enforce cadence | Ticket velocity, SLA compliance |
| A2 | **QA Gatekeeper** | Steve | Acceptance authority, quality gates, proof standards | Deploy success rate, bug escape rate |
| A3 | **CFO Agent** | Steve | Pricing, runway, money policy, unit economics | Burn rate, runway months, margin |
| A4 | **Legal Ops Lead** | Steve | Contract ops, risk flags, compliance decisions | Contract TAT, compliance score |
| A5 | **Product Lead** | Steve | Roadmap, priorities, what gets built and why | Feature delivery, adoption rate |
| A6 | **Growth Lead** | Steve | Acquisition, activation, retention strategy | CAC, LTV, conversion rates |
| A7 | **Platform Ops Lead** | Steve | Uptime, infrastructure, security, reliability | Uptime %, incident MTTR |
| A8 | **Direct Cuts GM** | Steve | Venture P&L, growth, operational execution | Revenue, retention, unit economics |

### Optional +4 (Activate When Needed)

| ID | Agent | Owner | Activation Trigger |
|----|-------|-------|-------------------|
| A9 | **Support Triage** | OCS | >50 tickets/week |
| A10 | **BI & Insights** | Product Lead | Weekly reporting becomes critical path |
| A11 | **Customer Success** | Growth Lead | NRR <100% or churn >5% |
| A12 | **Trust & Safety** | Legal Ops | Daily moderation/disputes needed |

### Not Agents

| Role | Type | Notes |
|------|------|-------|
| Steve (Principal) | Policy file | Sets direction, approves irreversible only |
| Work Intake | Skill (S) | Owned by OCS, mandatory front door |

---

## TIER 2: Skills (S)

### Owned by OCS (A1)

| ID | Skill | Purpose |
|----|-------|---------|
| S1 | Work Intake & Triage | Single front door, routing, SLA tracking |
| S2 | Tasks Breakdown | Ticket breakdown, estimates, owners |
| S3 | Policy & Approval Matrix | Rules that enable autonomy |
| S4 | People Ops | Contractor onboarding/offboarding, access |
| S5 | Proof Pack Librarian | Store receipts/proofs, audit trail |

### Owned by QA Gatekeeper (A2)

| ID | Skill | Purpose |
|----|-------|---------|
| S6 | Test Spec | Test plan + regression requirements |
| S7 | Judge Spec | Pass/fail criteria, gate verdicts |

### Owned by CFO Agent (A3)

| ID | Skill | Purpose |
|----|-------|---------|
| S8 | Bookkeeper | Categorize transactions, reconcile, close |
| S9 | Vendor & Procurement | Tool/vendor selection, renewals, cost |
| S10 | Payments Compliance | Payment policy + compliance |

### Owned by Legal Ops Lead (A4)

| ID | Skill | Purpose |
|----|-------|---------|
| S11 | Privacy & Consent | GDPR/CCPA, consent logs, DSRs |
| S12 | Entity & Cap Table | Ownership records, grants, vesting |

### Owned by Product Lead (A5)

| ID | Skill | Purpose |
|----|-------|---------|
| S13 | Requirements Spec | Requirements doc template |
| S14 | Design Spec | UX/design spec template |
| S15 | UI/UX Design Virtuoso | UX decisions, design output |
| S16 | Customer Journey | Journey mapping, friction removal |

### Owned by Growth Lead (A6)

| ID | Skill | Purpose |
|----|-------|---------|
| S17 | Sales Operations | Outbound sequences, follow-ups |
| S18 | Marketing Ops | Campaign setup, tracking, landing pages |
| S19 | Content Engine | Repurpose into posts, ads, scripts |
| S20 | Brand Guardian | Enforce voice/positioning |
| S21 | Ambassador Program | Influencer/ambassador outreach |
| S22 | Geofencing Marketing | Location-based outreach |

### Owned by Platform Ops Lead (A7)

| ID | Skill | Purpose |
|----|-------|---------|
| S23 | Implementation Spec | Execution plan template |

### Owned by Direct Cuts GM (A8)

| ID | Skill | Purpose |
|----|-------|---------|
| S24 | Training Module | Training content, onboarding |
| S25 | Earnings Payouts | Payout workflows (CFO policy bounded) |
| S26 | Product Upsell | Upsell flows, offers, triggers |
| S27 | Subscription Ops | Subscription lifecycle (CFO bounded) |
| S28 | Barber Portal | Barber-facing UX/product iteration |

### Owned by BI & Insights (A10)

| ID | Skill | Purpose |
|----|-------|---------|
| S29 | Instrumentation | Event tracking, data contracts |
| S30 | Experiment Analyst | Test interpretation, winner calls |

### Owned by Customer Success (A11)

| ID | Skill | Purpose |
|----|-------|---------|
| S31 | Loyalty Retention | Retention nudges, winbacks |

---

## TIER 3: Services (V)

### Operated by Platform Ops Lead (A7)

| ID | Service | Purpose |
|----|---------|---------|
| V1 | Feature Flags | Flag config, rollout controls |
| V2 | Infra Deployment | Deploy runbook, rollback steps |
| V3 | GitHub Admin | Repo/branch protection, secrets |
| V4 | Supabase Admin | DB/auth/storage admin |
| V5 | Ops Monitoring | Monitoring, alerts, heartbeat |
| V6 | Security Audit | Security checks, access reviews |
| V7 | Auth Flows | Auth config, incident runbook |
| V8 | Prompt Loader | Prompt registry, runtime loading |

### Operated by QA Gatekeeper (A2)

| ID | Service | Purpose |
|----|---------|---------|
| V9 | Quality Auditor | Quality audit system, reporting |
| V10 | QA Automation | Test automation harness |

### Operated by Direct Cuts GM (A8)

| ID | Service | Purpose |
|----|---------|---------|
| V11 | Checkr Verification | Background check integration |
| V12 | Mobile Notifications | Push/SMS/email notifications |
| V13 | Flutter SDK | Mobile SDK, versioning, release |

### Operated by DSLV GM (Future)

| ID | Service | Purpose |
|----|---------|---------|
| V14 | Voice AI Calling | Calling stack integration |

---

## Ownership Matrix

```
Steve (Principal)
├── A1: OCS ─────────────── S1-S5 (5 skills)
├── A2: QA Gatekeeper ───── S6-S7 (2 skills), V9-V10 (2 services)
├── A3: CFO Agent ───────── S8-S10 (3 skills)
├── A4: Legal Ops Lead ──── S11-S12 (2 skills)
├── A5: Product Lead ────── S13-S16 (4 skills)
├── A6: Growth Lead ─────── S17-S22 (6 skills)
├── A7: Platform Ops ────── S23 (1 skill), V1-V8 (8 services)
├── A8: Direct Cuts GM ──── S24-S28 (5 skills), V11-V13 (3 services)
│
├── A9: Support Triage (optional)
├── A10: BI & Insights ──── S29-S30 (2 skills) (optional)
├── A11: Customer Success ─ S31 (1 skill) (optional)
└── A12: Trust & Safety (optional)
```

---

## Promotion Rules

A Skill becomes an Agent only when **2+ of these** are true:

1. Shows up weekly without prompting
2. Needs unique permissions with risk (money, legal, prod, comms)
3. Needs a KPI + escalation policy
4. Makes trade-off decisions autonomously
5. Requires dedicated context/memory

**Otherwise it stays a Skill.**

---

## Summary

| Tier | Count | Purpose |
|------|-------|---------|
| Agents (A) | 8-12 | Autonomous decision-makers |
| Skills (S) | 31 | Playbooks owned by agents |
| Services (V) | 14 | Runbooks operated by agents |
| **Total** | **53-57** | Down from 60+ flat "agents" |
