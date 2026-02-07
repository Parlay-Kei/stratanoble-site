# ENGDEL Swarm Execution Playbook

**Document ID**: ENGDEL-PLAYBOOK-SWARM-001
**Version**: 1.0.0
**Authority**: ENGDEL
**Effective Date**: 2026-02-06

---

## Purpose

This playbook provides step-by-step instructions for turning a parallelizable ticket batch into a Claude Code agent team run, then producing ANX-standard receipts.

**Audience**: ENGDEL operators authorized to execute swarm runs.

---

## Pre-Requisites

Before starting a swarm run, verify:

```
□ Environment variable set: CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
□ Mission packet received from ANX
□ Mission packet contains: swarm_authorized: true
□ Effort Routing Matrix confirms swarm eligibility
□ At least 3 independent tasks identified
```

---

## Phase 1: Task Decomposition

### Step 1.1: Analyze the Ticket Batch

Review incoming tickets and identify:
- Total number of tickets
- Dependencies between tickets
- Shared files or state
- Risk level of each ticket

### Step 1.2: Independence Verification

For each potential task, complete this checklist:

```
TASK: {task_id}
───────────────────────────────────────────
□ Can complete without output from other tasks
□ Modifies different files than other tasks
□ No read-then-write on shared state
□ No database transactions that conflict
□ No shared external API calls with side effects

VERDICT: INDEPENDENT / DEPENDENT
```

### Step 1.3: Create Task Manifest

Produce the task manifest using this template:

```yaml
# TASK_MANIFEST.yaml
swarm_run_id: SWARM-{mission_id}-{sequence}
mission_id: {mission_id}
created_at: {ISO8601}
created_by: {operator_id}

task_count: {number}
estimated_total_duration_minutes: {estimate}
estimated_speedup: {2.5x, 3.2x, etc.}

tasks:
  - id: ST-001
    source_ticket: {ticket_id or description}
    description: "{specific action to take}"
    files_in_scope:
      - {file1.ts}
      - {file2.ts}
    files_excluded:
      - {shared_config.ts}  # Do not modify
    owner: teammate_1
    risk_level: LOW | MEDIUM | HIGH
    estimated_duration_minutes: {minutes}
    requires_tests: true | false

  - id: ST-002
    source_ticket: {ticket_id}
    description: "{specific action}"
    files_in_scope:
      - {file3.ts}
    files_excluded: []
    owner: teammate_2
    risk_level: LOW
    estimated_duration_minutes: {minutes}
    requires_tests: true

  # ... additional tasks

code_review_required: true | false
code_review_reason: "{if required, explain why}"
```

### Step 1.4: Risk Assessment

If any task has `risk_level: HIGH` or modifies:
- Security-sensitive code
- Database schemas
- Public APIs
- Authentication/authorization

Then: **Require plan approval before proceeding.**

---

## Phase 2: Pre-Swarm Approval

### Step 2.1: Plan Approval (If Required)

For risky modules, obtain human approval:

```
PLAN APPROVAL REQUEST
─────────────────────
Mission: {mission_id}
Swarm Run: {swarm_run_id}
Risky Tasks: {list of HIGH risk tasks}

Changes Proposed:
- {ST-003}: Modify auth middleware (security-sensitive)
- {ST-004}: Add new database column (schema change)

Mitigation:
- Code review teammate will review all changes
- Tests required for all modifications
- Rollback plan: {describe}

APPROVAL: [ ] GRANTED  [ ] DENIED
Approver: ________________
Date: ________________
```

### Step 2.2: Code Review Teammate Decision

Determine if code review teammate is required:

```
□ Total lines changed > 100? → REQUIRED
□ Security-sensitive code touched? → REQUIRED
□ New public API introduced? → REQUIRED
□ Database schema modified? → REQUIRED
□ More than 5 files modified? → RECOMMENDED

DECISION: Code review teammate REQUIRED / NOT REQUIRED
```

---

## Phase 3: Swarm Execution

### Step 3.1: Initialize Proof Directory

Create the proof directory structure:

```bash
mkdir -p proofs/swarm-runs/{SWARM_RUN_ID}
cp TASK_MANIFEST.yaml proofs/swarm-runs/{SWARM_RUN_ID}/
```

### Step 3.2: Spawn Teammates

For each task, spawn a teammate using the prompt template from `prompts/engdel/use-agent-teams.md`:

```markdown
## Teammate Assignment: ST-001

**Mission Context**: {brief context from mission packet}
**Your Task**: {description from task manifest}
**Files You May Modify**: {files_in_scope}
**Files You Must NOT Modify**: {files_excluded}

### Constraints
- Complete independently
- Produce subtask receipt when done
- Do NOT perform cleanup

### Expected Output
1. Code changes
2. Tests passing
3. Subtask receipt
```

### Step 3.3: Monitor Progress

Track teammate status:

```
┌──────────┬────────────┬────────────────────────┐
│ Task ID  │ Owner      │ Status                 │
├──────────┼────────────┼────────────────────────┤
│ ST-001   │ teammate_1 │ IN_PROGRESS            │
│ ST-002   │ teammate_2 │ COMPLETED (SUCCESS)    │
│ ST-003   │ teammate_3 │ IN_PROGRESS            │
│ ST-004   │ review     │ WAITING (for ST-001-3) │
└──────────┴────────────┴────────────────────────┘
```

### Step 3.4: Handle Teammate Completion

As each teammate completes:

1. Collect subtask receipt
2. Save to proof directory:
   ```bash
   # Save receipt
   proofs/swarm-runs/{SWARM_RUN_ID}/ST-001.yaml
   ```
3. Update tracking table
4. If error, document and continue others

### Step 3.5: Code Review (If Required)

After execution teammates complete, spawn code review teammate:

```markdown
## Code Review Teammate Assignment

**Subtasks to Review**: [ST-001, ST-002, ST-003]
**Review Focus**:
- Security vulnerabilities
- Breaking changes
- Test coverage
- Type safety

**Output**: REVIEW_RECEIPT.yaml with findings and recommendation
```

---

## Phase 4: Consolidation

### Step 4.1: Collect All Receipts

Verify all receipts present:

```bash
ls proofs/swarm-runs/{SWARM_RUN_ID}/
# Expected:
# - TASK_MANIFEST.yaml
# - ST-001.yaml
# - ST-002.yaml
# - ST-003.yaml
# - REVIEW_RECEIPT.yaml (if code review performed)
```

### Step 4.2: Generate Consolidated Receipt

Use the template from `proofs/templates/SWARM_RUN_RECEIPT_TEMPLATE.md`:

```yaml
# CONSOLIDATED_RECEIPT.yaml
mission_id: {mission_id}
swarm_run_id: {swarm_run_id}
lead_agent: {operator_id}
total_teammates: {count}
started_at: {ISO8601}
completed_at: {ISO8601}
overall_status: SUCCESS | PARTIAL | FAILED

subtask_summary:
  total: {count}
  succeeded: {count}
  failed: {count}

files_touched:
  - {file1}
  - {file2}
  # ... all files modified by all teammates

tests_run: {total}
tests_passed: {passed}
tests_failed: {failed}

code_review:
  performed: true | false
  reviewer: {teammate_id}
  recommendation: APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | BLOCK
  critical_findings: {count}
  total_findings: {count}

evidence_pointers:
  - proofs/swarm-runs/{id}/TASK_MANIFEST.yaml
  - proofs/swarm-runs/{id}/ST-001.yaml
  - proofs/swarm-runs/{id}/ST-002.yaml
  - proofs/swarm-runs/{id}/ST-003.yaml
  - proofs/swarm-runs/{id}/REVIEW_RECEIPT.yaml
```

### Step 4.3: Verify Tests

Run test suite to verify all changes work together:

```bash
npm run test
# or
npm run validate

# Document results in consolidated receipt
```

### Step 4.4: Final Verification Checklist

```
□ All subtask receipts collected
□ Consolidated receipt complete
□ All tests passing
□ Code review approved (if required)
□ No scope violations detected
□ Files touched matches expectations
```

---

## Phase 5: Cleanup and Reporting

### Step 5.1: Lead-Only Cleanup

**CRITICAL**: Only the lead performs cleanup.

```
□ Verify all teammates terminated
□ Remove temporary files
□ Delete temporary git branches (if any)
□ Archive execution logs
```

### Step 5.2: Update Mission Status

Report completion to ANX:

```yaml
mission_id: {mission_id}
swarm_run_id: {swarm_run_id}
status: COMPLETE | PARTIAL | FAILED
completion_time: {ISO8601}
proof_pack_location: proofs/swarm-runs/{swarm_run_id}/
```

### Step 5.3: Archive

Ensure proof pack is complete:

```
proofs/swarm-runs/{SWARM_RUN_ID}/
  ├── TASK_MANIFEST.yaml
  ├── ST-001.yaml
  ├── ST-002.yaml
  ├── ST-003.yaml
  ├── REVIEW_RECEIPT.yaml
  ├── CONSOLIDATED_RECEIPT.yaml
  └── logs/
      └── execution.log
```

---

## Failure Scenarios

### Scenario: Teammate Fails Mid-Task

1. Document failure in that teammate's receipt
2. Continue other teammates
3. After all complete, assess:
   - Can failed task be reassigned?
   - Is partial completion acceptable?
4. Mark overall status as PARTIAL
5. Include failure details in consolidated receipt
6. Escalate for human decision if needed

### Scenario: Code Review Blocks Merge

1. Document review findings
2. Create remediation tasks
3. Either:
   - Reassign to original teammates for fix
   - Create new single-session mission for fixes
4. Re-run code review after fixes
5. Update consolidated receipt

### Scenario: Conflict Detected

1. STOP all remaining teammates
2. Identify conflicting files
3. Merge manually or choose one version
4. Document conflict and resolution
5. Re-run tests
6. Update consolidated receipt

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              SWARM EXECUTION QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ BEFORE:                                                      │
│   □ Verify swarm_authorized: true in mission packet         │
│   □ Confirm 3+ independent tasks                            │
│   □ Get plan approval for risky modules                     │
│   □ Create TASK_MANIFEST.yaml                               │
│                                                              │
│ DURING:                                                      │
│   □ Spawn teammates with explicit scope                     │
│   □ Monitor progress                                         │
│   □ Collect receipts as teammates complete                  │
│   □ Run code review if required                             │
│                                                              │
│ AFTER:                                                       │
│   □ Generate CONSOLIDATED_RECEIPT.yaml                      │
│   □ Run full test suite                                     │
│   □ Lead performs cleanup (teammates never clean up)        │
│   □ Archive proof pack                                      │
│   □ Report to ANX                                           │
│                                                              │
│ PROOF PACK MUST CONTAIN:                                    │
│   - TASK_MANIFEST.yaml                                      │
│   - ST-{NNN}.yaml for each subtask                         │
│   - REVIEW_RECEIPT.yaml (if code review)                   │
│   - CONSOLIDATED_RECEIPT.yaml                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Documents

- `docs/anx/EFFORT_ROUTING_MATRIX.md` - When to use swarm
- `docs/anx/CLAUDE_CODE_AGENT_TEAMS_POLICY.md` - Governance policy
- `docs/anx/CLAUDE_CODE_TEAM_OPS.md` - Operations guide
- `prompts/engdel/use-agent-teams.md` - Execution prompt
- `proofs/templates/SWARM_RUN_RECEIPT_TEMPLATE.md` - Receipt format

---

**Classification**: EXECUTION PLAYBOOK
**Consumers**: ENGDEL operators
**Review Cycle**: Quarterly
