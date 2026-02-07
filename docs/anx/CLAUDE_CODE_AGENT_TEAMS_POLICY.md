# Claude Code Agent Teams Policy

**Document ID**: ANX-POLICY-AGENT-TEAMS-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS (Operational Control System)
**Status**: OPERATIONAL

---

## Purpose

This policy governs the use of Claude Code Agent Teams (experimental swarm capability) within ANX-controlled operations. It ensures governance integrity while enabling productivity gains from parallel execution.

---

## Definitions

| Term | Definition |
|------|------------|
| **Lead Agent** | The primary Claude instance that spawns and coordinates teammates |
| **Teammate** | A spawned agent instance handling delegated subtasks |
| **Swarm** | Collection of lead + teammates working on parallelized mission |
| **Swarm Run** | Single execution of a multi-agent task batch |
| **Consolidated Receipt** | Single proof artifact aggregating all teammate outputs |

---

## Core Principle

> **ANX is the orchestrator of record. Agent teams are execution resources, not decision authorities.**

All agent teams operate under ANX governance. Teams cannot:
- Create their own missions
- Approve their own gates
- Bypass receipt requirements
- Modify governance documents

---

## Authorization Requirements

### Who May Spawn Agent Teams

| Role | May Spawn | Conditions |
|------|-----------|------------|
| OCS | YES | Any mission type |
| ENGDEL | YES | With ANX authorization per mission |
| Platform Ops | YES | Infrastructure missions only |
| QA Gatekeeper | NO | May request via ENGDEL |
| Content Agents | NO | Single-session only |

### When Agent Teams Are Permitted

Agent teams MAY be used when ALL conditions are met:

1. **Task Independence** - Subtasks have no sequential dependencies
2. **Risk Level** - Mission is not CRITICAL or COMPLIANCE_AUDIT
3. **Parallelization Benefit** - Minimum 3 independent subtasks
4. **ANX Authorization** - Mission packet includes `swarm_authorized: true`
5. **Receipt Capability** - Each subtask can produce verifiable output

### When Agent Teams Are PROHIBITED

- INFRASTRUCTURE missions (CRITICAL risk)
- COMPLIANCE_AUDIT missions (strict governance)
- Missions touching secrets/credentials
- Missions modifying governance documents
- Missions with sequential dependencies that cannot be decomposed

---

## Spawn Authorization Protocol

### Step 1: Mission Packet Annotation

ANX must annotate mission packet with swarm authorization:

```yaml
mission_id: ENGDEL-2026-00123
swarm_authorized: true
max_teammates: 4
allowed_subtask_types:
  - file_modification
  - test_execution
  - documentation_update
prohibited_actions:
  - credential_access
  - governance_modification
  - production_deployment
```

### Step 2: Task Decomposition

ENGDEL decomposes mission into independent subtasks:

```yaml
subtasks:
  - id: ST-001
    description: "Update component A"
    files: ["src/components/A.tsx"]
    owner: teammate_1

  - id: ST-002
    description: "Update component B"
    files: ["src/components/B.tsx"]
    owner: teammate_2

  - id: ST-003
    description: "Update component C"
    files: ["src/components/C.tsx"]
    owner: teammate_3
```

### Step 3: Pre-Swarm Gate

Before spawning, lead agent validates:

- [ ] Mission packet includes `swarm_authorized: true`
- [ ] Task count meets minimum (3+)
- [ ] No prohibited actions in subtask scope
- [ ] All subtasks are truly independent
- [ ] Risk level is not CRITICAL

### Step 4: Spawn Execution

Lead agent spawns teammates with explicit scope boundaries.

---

## Receipt Requirements

### Per-Subtask Receipts

Each teammate MUST produce a subtask receipt:

```yaml
subtask_id: ST-001
teammate_id: teammate_1
started_at: 2026-02-06T10:00:00Z
completed_at: 2026-02-06T10:15:00Z
status: SUCCESS | FAILED | PARTIAL
files_modified:
  - path: src/components/A.tsx
    action: MODIFIED
    lines_changed: 45
tests_run:
  - name: A.test.tsx
    status: PASSED
errors: []
```

### Consolidated Swarm Receipt

Lead agent MUST produce consolidated receipt after all teammates complete:

```yaml
mission_id: ENGDEL-2026-00123
swarm_run_id: SWARM-2026-00123-001
lead_agent: lead_001
total_teammates: 3
started_at: 2026-02-06T10:00:00Z
completed_at: 2026-02-06T10:20:00Z
overall_status: SUCCESS | PARTIAL | FAILED

subtask_summary:
  total: 3
  succeeded: 3
  failed: 0

files_touched:
  - src/components/A.tsx
  - src/components/B.tsx
  - src/components/C.tsx

tests_run: 15
tests_passed: 15
tests_failed: 0

evidence_pointers:
  - proofs/swarm-runs/SWARM-2026-00123-001/ST-001.yaml
  - proofs/swarm-runs/SWARM-2026-00123-001/ST-002.yaml
  - proofs/swarm-runs/SWARM-2026-00123-001/ST-003.yaml
```

### Receipt Storage

All swarm receipts stored in:
```
proofs/swarm-runs/{SWARM_RUN_ID}/
  ├── CONSOLIDATED_RECEIPT.yaml
  ├── ST-001.yaml
  ├── ST-002.yaml
  └── ST-003.yaml
```

---

## Code Review Teammate Requirement

For non-trivial code changes, ENGDEL MUST spawn a **dedicated code review teammate**:

### Trigger Conditions

Code review teammate required when ANY of:
- Lines changed > 100
- Files modified > 3
- New public API introduced
- Security-sensitive code touched
- Database schema modified

### Code Review Teammate Responsibilities

1. Review all changes from other teammates
2. Check for:
   - Security vulnerabilities
   - Breaking API changes
   - Test coverage gaps
   - Style/lint violations
3. Produce review receipt with findings
4. Block consolidation if critical issues found

### Review Receipt Format

```yaml
reviewer_id: teammate_review
reviewed_at: 2026-02-06T10:18:00Z
subtasks_reviewed: [ST-001, ST-002, ST-003]
total_findings: 2
critical_findings: 0
findings:
  - severity: WARNING
    subtask: ST-001
    file: src/components/A.tsx
    line: 45
    message: "Consider memoizing this callback"

  - severity: INFO
    subtask: ST-002
    file: src/components/B.tsx
    line: 12
    message: "Missing JSDoc comment"

recommendation: APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | BLOCK
```

---

## Cleanup Rules

### Lead-Only Cleanup

> **CRITICAL**: Only the lead agent performs cleanup. Teammates NEVER perform cleanup operations.

This prevents:
- Double-deletion of temporary files
- Race conditions in cleanup
- Orphaned resources from failed teammates

### Cleanup Checklist

Lead agent cleanup responsibilities:
- [ ] Verify all teammates terminated
- [ ] Consolidate all receipts
- [ ] Remove temporary branches (if any)
- [ ] Archive swarm logs
- [ ] Update mission status in ANX

### Failed Swarm Cleanup

If swarm fails mid-execution:
1. Lead agent terminates remaining teammates
2. Lead agent produces failure receipt
3. Lead agent performs rollback if configured
4. Lead agent notifies ANX of failure
5. Human review required before retry

---

## Monitoring and Audit

### Real-Time Monitoring

During swarm execution, lead agent reports:
- Teammate spawn events
- Subtask completion events
- Error events
- Resource utilization

### Post-Swarm Audit Trail

Audit trail preserved in consolidated receipt:
- Complete chronology of events
- All teammate outputs
- Decision points and rationale
- Evidence pointers for all artifacts

### Governance Compliance Check

After swarm completion, ANX validates:
- All required receipts present
- No prohibited actions taken
- File modifications within scope
- Tests pass or failures documented

---

## Failure Modes and Handling

| Failure Mode | Detection | Handling |
|--------------|-----------|----------|
| Teammate timeout | No response in 5 min | Lead terminates, reassigns |
| Teammate error | Error receipt | Lead continues others, documents |
| Lead failure | No heartbeat | ANX cleanup, human review |
| Conflict detected | Same file modified | Lead merges or fails fast |
| Scope violation | Prohibited action attempted | Immediate termination |

---

## Limitations and Known Issues

1. **Experimental Status** - Agent teams are experimental; expect edge cases
2. **Context Isolation** - Teammates cannot share context directly
3. **No Cross-Team Communication** - Teammates cannot message each other
4. **Resource Limits** - Maximum 4 teammates per swarm run
5. **Session Constraints** - All teammates must complete in single session

---

## Approval Chain

| Role | Status | Date |
|------|--------|------|
| OCS | APPROVED | 2026-02-06 |
| ENGDEL | PENDING | - |
| Platform Ops | PENDING | - |

---

**Document Classification**: OPERATIONAL POLICY
**Review Cycle**: Monthly during experimental phase
