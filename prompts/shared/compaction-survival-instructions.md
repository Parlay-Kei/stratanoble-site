# Compaction Survival Instructions

**Document ID**: PROMPT-SHARED-COMPACT-001
**Version**: 1.0.0
**Authority**: OCS
**Effective Date**: 2026-02-06

---

## Purpose

When Claude's context window compacts (due to length or memory pressure), critical information must survive. This document defines the **survival set** that MUST be preserved through any compaction event.

---

## The Survival Set

The following elements MUST persist through context compaction:

### 1. Mission Identifiers

```
SURVIVAL_PRIORITY: CRITICAL

Preserve:
- mission_id: {current mission ID}
- swarm_run_id: {if swarm execution}
- intake_packet_id: {intake reference}
- parent_mission_id: {if sub-mission}
```

### 2. Current State

```
SURVIVAL_PRIORITY: CRITICAL

Preserve:
- current_phase: {PLANNING | EXECUTING | REVIEWING | COMPLETING}
- tasks_completed: [{list of completed task IDs}]
- tasks_pending: [{list of pending task IDs}]
- current_task_id: {actively working on}
- blocking_issues: [{any blockers}]
```

### 3. Key Decisions Made

```
SURVIVAL_PRIORITY: HIGH

Preserve:
- decisions:
  - decision_id: D-001
    summary: "{what was decided}"
    rationale: "{why}"
    evidence: "{pointer to proof}"

  - decision_id: D-002
    ...
```

### 4. Evidence Pointers

```
SURVIVAL_PRIORITY: HIGH

Preserve:
- proof_artifacts:
  - path: proofs/{mission_id}/INTAKE.yaml
    type: intake_packet

  - path: proofs/{mission_id}/TASK_001.yaml
    type: task_receipt

  - path: proofs/swarm-runs/{swarm_id}/CONSOLIDATED.yaml
    type: swarm_receipt
```

### 5. Human Approvals

```
SURVIVAL_PRIORITY: CRITICAL

Preserve:
- approvals:
  - approval_id: A-001
    type: plan_approval
    approved_by: human
    timestamp: {ISO8601}
    scope: "{what was approved}"

  - approval_id: A-002
    type: destructive_action
    ...
```

### 6. Governance Context

```
SURVIVAL_PRIORITY: CRITICAL

Preserve:
- anx_root: {resolved ANX_ROOT path}
- department: {ENGDEL | QAG | OCS | ...}
- solution_type: {CLIENT_DELIVERY | INTERNAL_TOOLING | ...}
- gate_requirements: [{list from SOLUTION_TYPE_GATES}]
```

---

## Compaction Trigger Protocol

When you detect context pressure (approaching limits), proactively:

### Step 1: Generate Survival Summary

Create a survival summary block:

```markdown
## COMPACTION SURVIVAL SUMMARY
Generated: {timestamp}
Reason: Context approaching limit

### Mission State
- Mission ID: {id}
- Phase: {phase}
- Tasks: {completed}/{total}

### Key Decisions
1. {D-001}: {summary}
2. {D-002}: {summary}

### Evidence Chain
- Intake: proofs/{id}/INTAKE.yaml
- Tasks: proofs/{id}/TASK_*.yaml
- Swarm: proofs/swarm-runs/{swarm_id}/ (if applicable)

### Human Approvals
- {A-001}: {scope} at {timestamp}

### Active Context
- Current task: {task_id}
- Next action: {planned action}
- Blockers: {any blockers}

### Governance
- ANX_ROOT: {path}
- Department: {dept}
- Solution Type: {type}
```

### Step 2: Checkpoint to File

Write survival state to file before compaction:

```
proofs/{mission_id}/CHECKPOINT_{timestamp}.yaml
```

### Step 3: Reference in Continuation

After compaction, the first action should be:

```markdown
## Context Recovery

Reading checkpoint: proofs/{mission_id}/CHECKPOINT_{timestamp}.yaml

Recovered state:
- Mission: {id}
- Phase: {phase}
- Last completed: {task_id}
- Continuing with: {next_task_id}
```

---

## Survival Set Priorities

| Priority | Elements | Compaction Behavior |
|----------|----------|---------------------|
| CRITICAL | Mission IDs, Current State, Approvals, Governance | NEVER drop |
| HIGH | Decisions, Evidence Pointers | Summarize if needed |
| MEDIUM | Detailed rationale, Full error logs | May truncate |
| LOW | Verbose output, Intermediate results | May drop |

---

## What May Be Dropped

These elements can be safely dropped during compaction:

- Verbose tool output (keep summary only)
- Intermediate reasoning steps (keep conclusion only)
- Repeated file contents (keep path reference)
- Exploratory dead-ends (keep decision not to pursue)
- Detailed error traces (keep error type and location)

---

## Recovery After Compaction

After context recovery, verify:

```
□ Mission ID matches checkpoint
□ Phase matches checkpoint
□ All CRITICAL approvals present
□ Evidence pointers accessible
□ Governance context complete
□ Can resume from last known state
```

If verification fails:
1. Read checkpoint file directly
2. Reconstruct missing elements from proofs/
3. If still incomplete, notify human before continuing

---

## Integration with Swarm Execution

For swarm runs, additional survival elements:

```
SWARM_SURVIVAL:
  swarm_run_id: {id}
  lead_agent: self
  teammates_spawned: [{list}]
  teammates_completed: [{list}]
  teammates_pending: [{list}]
  consolidated_receipt_path: proofs/swarm-runs/{id}/CONSOLIDATED.yaml
```

---

## Example Survival Summary

```markdown
## COMPACTION SURVIVAL SUMMARY
Generated: 2026-02-06T14:30:00Z
Reason: Context at 85% capacity

### Mission State
- Mission ID: ENGDEL-2026-00456
- Phase: EXECUTING
- Tasks: 3/5 completed

### Key Decisions
1. D-001: Using swarm execution (3+ independent tasks, speedup >2x)
2. D-002: Code review teammate spawned (changes >100 lines)

### Evidence Chain
- Intake: proofs/ENGDEL-2026-00456/INTAKE.yaml
- Task receipts: proofs/ENGDEL-2026-00456/TASK_001-003.yaml
- Swarm: proofs/swarm-runs/SWARM-2026-00456-001/

### Human Approvals
- A-001: Plan approval for component refactor at 2026-02-06T14:00:00Z

### Active Context
- Current task: ST-004 (Update UserProfile component)
- Next action: Spawn teammate for ST-005
- Blockers: None

### Governance
- ANX_ROOT: C:\Dev\.claude-anx
- Department: ENGDEL
- Solution Type: INTERNAL_TOOLING
```

---

## Verification Commands

After recovery, run these checks:

```bash
# Verify proof files exist
ls proofs/{mission_id}/

# Verify checkpoint readable
cat proofs/{mission_id}/CHECKPOINT_*.yaml

# Verify swarm state (if applicable)
ls proofs/swarm-runs/{swarm_run_id}/
```

---

**Classification**: SYSTEM PROMPT
**Consumers**: All ANX-governed sessions
**Trigger**: Context pressure detection
