# ANX Intake Routing Rules

**Document ID**: ANX-INTAKE-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS
**Status**: CANONICAL - Governs all work intake routing

---

## Purpose

This document defines routing rules for incoming work requests. All requests are classified and routed to the appropriate agent based on these rules.

---

## Default Routing Matrix

### By Request Type

| Request Type | Default Owner | Backup Owner | Notes |
|--------------|---------------|--------------|-------|
| Requirements clarification | **PM** | OCS | PM owns BA function |
| User story creation | **PM** | ENGDEL | PM drafts, stakeholder approves |
| Acceptance criteria | **PM** | QAG | PM drafts, QAG validates |
| Operator documentation | **PM** | DOCSMITH | PM owns operator docs |
| Technical documentation | DOCSMITH | PM | API docs, runbooks |
| Feature implementation | ENGDEL | - | After requirements clear |
| Bug fix | ENGDEL | - | Technical resolution |
| Infrastructure change | PLATOPS | - | Database, deploy, config |
| Quality validation | QAG | - | Testing, gate checks |
| Security review | SECOPS | - | Threat models, audits |
| Release coordination | RELEASE | PLATOPS | Deployment orchestration |
| Governance question | OCS | - | Routing, policy, gates |

---

## PM as Requirements Owner

The Project Manager (with embedded BA capability) is the **default owner** for:

### Owned by PM

```
┌─────────────────────────────────────────────────────────────────┐
│                    PM INTAKE OWNERSHIP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Requirements & Analysis                                         │
│  ─────────────────────────                                      │
│  • "What should this feature do?"                               │
│  • "What are the acceptance criteria?"                          │
│  • "Can you clarify this requirement?"                          │
│  • "What's the user story for this?"                            │
│  • "Document the business process"                              │
│                                                                  │
│  Operator Documentation                                          │
│  ─────────────────────────                                      │
│  • "Create a how-to guide for operators"                        │
│  • "Document the manual workflow"                               │
│  • "Write the FAQ for this feature"                             │
│  • "Create stakeholder communication"                           │
│  • "Write the training material"                                │
│                                                                  │
│  Stakeholder Communication                                       │
│  ─────────────────────────                                      │
│  • "Prepare status report for stakeholders"                     │
│  • "Summarize technical work for business"                      │
│  • "Create executive summary"                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### NOT Owned by PM

```
┌─────────────────────────────────────────────────────────────────┐
│                    PM DOES NOT OWN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Product Vision (→ Product Lead)                                 │
│  • "What should we build next quarter?"                         │
│  • "Should we pivot the product?"                               │
│  • "What's the product roadmap?"                                │
│                                                                  │
│  Governance (→ OCS)                                              │
│  • "Which agent handles this?"                                  │
│  • "What's the approval process?"                               │
│  • "How do gates work?"                                         │
│                                                                  │
│  Technical Implementation (→ ENGDEL)                             │
│  • "How should we implement this?"                              │
│  • "What's the technical design?"                               │
│  • "Fix this bug"                                               │
│                                                                  │
│  Infrastructure (→ PLATOPS)                                      │
│  • "Configure the database"                                     │
│  • "Set up the deployment"                                      │
│                                                                  │
│  Technical Documentation (→ DOCSMITH)                            │
│  • "Document the API"                                           │
│  • "Write the technical runbook"                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Routing Decision Flow

```
                    ┌─────────────────────────────┐
                    │    New Request Received      │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
              ┌────────────────────────────────────────┐
              │ Is this a requirements/clarification    │
              │ or operator documentation request?      │
              └───────────────────┬────────────────────┘
                                  │
               ┌──────────────────┴──────────────────┐
              YES                                   NO
               │                                     │
               ▼                                     ▼
       ┌───────────────┐              ┌─────────────────────────────┐
       │   Route to    │              │ Is this a governance/routing │
       │      PM       │              │ question?                    │
       └───────────────┘              └──────────────┬──────────────┘
                                                     │
                                      ┌──────────────┴──────────────┐
                                     YES                           NO
                                      │                             │
                                      ▼                             ▼
                              ┌───────────────┐      ┌─────────────────────────┐
                              │   Route to    │      │ Is this technical       │
                              │     OCS       │      │ implementation work?    │
                              └───────────────┘      └──────────────┬──────────┘
                                                                    │
                                                     ┌──────────────┴──────────┐
                                                    YES                        NO
                                                     │                          │
                                                     ▼                          ▼
                                             ┌───────────────┐     ┌─────────────────────┐
                                             │   Route to    │     │ Continue routing    │
                                             │    ENGDEL     │     │ per request type... │
                                             └───────────────┘     └─────────────────────┘
```

---

## Intake Examples

### Routed to PM

| Request | Classification | Route |
|---------|---------------|-------|
| "What should the booking confirmation include?" | Requirements clarification | **PM** |
| "Create acceptance criteria for the payment flow" | Acceptance criteria | **PM** |
| "Write a guide for operators on handling refunds" | Operator documentation | **PM** |
| "I'm unclear on what the user expects here" | Requirements clarification | **PM** |
| "Document the manual reconciliation process" | Process documentation | **PM** |
| "Prepare a status update for the client" | Stakeholder communication | **PM** |

### Routed to OCS

| Request | Classification | Route |
|---------|---------------|-------|
| "Which agent should handle this?" | Governance | **OCS** |
| "What's the approval process?" | Governance | **OCS** |
| "Escalate this blocker" | Escalation | **OCS** |

### Routed to ENGDEL

| Request | Classification | Route |
|---------|---------------|-------|
| "Implement the booking confirmation feature" | Implementation | **ENGDEL** |
| "Fix the null pointer bug in checkout" | Bug fix | **ENGDEL** |
| "Create the API endpoint for payments" | Implementation | **ENGDEL** |

### Routed to PLATOPS

| Request | Classification | Route |
|---------|---------------|-------|
| "Set up the database migration" | Infrastructure | **PLATOPS** |
| "Configure the deployment pipeline" | Infrastructure | **PLATOPS** |

---

## Handoff Protocols

### PM → ENGDEL Handoff

When requirements are complete, PM hands off to ENGDEL with:

```yaml
handoff:
  from: PM
  to: ENGDEL
  artifacts:
    - user_stories: "docs/prd/{feature}/user-stories.md"
    - acceptance_criteria: "docs/prd/{feature}/acceptance-criteria.md"
    - process_diagram: "docs/prd/{feature}/process.md" (if applicable)
  status: REQUIREMENTS_COMPLETE
  notes: "Ready for technical design and implementation"
```

### ENGDEL → QAG Handoff

When implementation is complete, ENGDEL hands off to QAG with:

```yaml
handoff:
  from: ENGDEL
  to: QAG
  artifacts:
    - implementation: "PR #{pr_number}"
    - tests: "tests/{feature}/*.test.ts"
  acceptance_criteria_reference: "docs/prd/{feature}/acceptance-criteria.md"
  status: IMPLEMENTATION_COMPLETE
  notes: "Ready for QA validation"
```

### QAG → PM Handoff (for acceptance)

When QA passes, QAG returns to PM for acceptance validation:

```yaml
handoff:
  from: QAG
  to: PM
  artifacts:
    - qa_report: "proofs/{mission_id}/qa-report.md"
    - test_results: "proofs/{mission_id}/test-results.json"
  status: QA_PASSED
  notes: "Ready for acceptance criteria verification"
```

---

## Conflict Resolution

| Conflict Type | Resolution |
|---------------|------------|
| PM vs Product Lead | Product Lead has authority on product vision; PM executes within that vision |
| PM vs OCS | OCS has authority on governance and routing |
| PM vs ENGDEL | PM clarifies requirements; ENGDEL owns technical approach |
| Unclear ownership | Escalate to OCS for routing decision |

---

## Governance Note

These routing rules are defined at ANX_ROOT and cannot be overridden by local projects.

Projects may add LOCAL CONTEXT but cannot change:
- Default routing assignments
- Ownership boundaries
- Handoff protocols
- Escalation paths

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-06 | Initial intake rules with PM as requirements/operator docs owner |

---

**Classification**: CANONICAL ROUTING RULES
**Authority**: ANX_ROOT - No local overrides permitted
