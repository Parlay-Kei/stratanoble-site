# Swarm Run Receipt Template

**Document ID**: PROOF-TEMPLATE-SWARM-001
**Version**: 1.0.0
**Authority**: ENGDEL
**Effective Date**: 2026-02-06

---

## Purpose

This template defines the standard format for swarm run receipts. All swarm executions MUST produce receipts conforming to this format.

---

## Receipt Types

A complete swarm run proof pack contains:

1. **TASK_MANIFEST.yaml** - Task decomposition (pre-execution)
2. **ST-{NNN}.yaml** - Per-subtask receipts (during execution)
3. **REVIEW_RECEIPT.yaml** - Code review findings (if applicable)
4. **CONSOLIDATED_RECEIPT.yaml** - Final aggregated receipt

---

## Template 1: TASK_MANIFEST.yaml

```yaml
# ============================================================
# TASK MANIFEST
# Pre-execution planning document
# ============================================================

# Identifiers
swarm_run_id: SWARM-{MISSION_ID}-{SEQ}  # e.g., SWARM-ENGDEL-2026-00123-001
mission_id: {MISSION_ID}                  # Parent mission ID
created_at: {ISO8601}                     # e.g., 2026-02-06T10:00:00Z
created_by: {OPERATOR_ID}                 # Lead agent or operator ID

# Summary
task_count: {NUMBER}
estimated_total_duration_minutes: {NUMBER}
estimated_speedup: "{MULTIPLIER}x"        # e.g., "2.5x"

# Risk Assessment
highest_risk_level: LOW | MEDIUM | HIGH
plan_approval_required: true | false
plan_approval_obtained: true | false | pending
plan_approved_by: {APPROVER_ID or null}
plan_approved_at: {ISO8601 or null}

# Code Review Decision
code_review_required: true | false
code_review_reason: "{REASON or null}"

# Task Definitions
tasks:
  - id: ST-001
    source_ticket: "{TICKET_ID or DESCRIPTION}"
    description: "{SPECIFIC ACTION TO TAKE}"
    files_in_scope:
      - "{FILE_PATH_1}"
      - "{FILE_PATH_2}"
    files_excluded:
      - "{SHARED_FILE_NOT_TO_TOUCH}"
    owner: teammate_1
    risk_level: LOW | MEDIUM | HIGH
    estimated_duration_minutes: {NUMBER}
    requires_tests: true | false
    dependencies: []  # List of ST-IDs this depends on (should be empty for swarm)

  - id: ST-002
    source_ticket: "{TICKET_ID}"
    description: "{SPECIFIC ACTION}"
    files_in_scope:
      - "{FILE_PATH_3}"
    files_excluded: []
    owner: teammate_2
    risk_level: LOW
    estimated_duration_minutes: {NUMBER}
    requires_tests: true
    dependencies: []

  # ... additional tasks

# Execution Notes
notes: |
  {ANY SPECIAL INSTRUCTIONS OR CONTEXT FOR THE SWARM RUN}
```

---

## Template 2: ST-{NNN}.yaml (Subtask Receipt)

```yaml
# ============================================================
# SUBTASK RECEIPT: ST-{NNN}
# Per-teammate completion record
# ============================================================

# Identifiers
subtask_id: ST-{NNN}                      # e.g., ST-001
swarm_run_id: SWARM-{MISSION_ID}-{SEQ}
teammate_id: teammate_{N}

# Timing
started_at: {ISO8601}
completed_at: {ISO8601}
duration_minutes: {NUMBER}

# Status
status: SUCCESS | FAILED | PARTIAL | TIMEOUT | SCOPE_VIOLATION

# Work Performed
files_modified:
  - path: "{FILE_PATH}"
    action: CREATED | MODIFIED | DELETED
    lines_added: {NUMBER}
    lines_removed: {NUMBER}
    lines_changed: {NUMBER}  # Total modified

  - path: "{FILE_PATH_2}"
    action: MODIFIED
    lines_added: 15
    lines_removed: 3
    lines_changed: 18

# Testing
tests_run:
  - name: "{TEST_FILE_OR_SUITE}"
    status: PASSED | FAILED | SKIPPED
    duration_ms: {NUMBER}
    failures: []  # List of failure messages if failed

  - name: "{TEST_FILE_2}"
    status: PASSED
    duration_ms: 1234
    failures: []

# Errors (if status != SUCCESS)
errors:
  - type: "{ERROR_TYPE}"                  # e.g., COMPILE_ERROR, TEST_FAILURE
    message: "{ERROR_MESSAGE}"
    file: "{FILE_PATH or null}"
    line: {LINE_NUMBER or null}
    recoverable: true | false

# Scope Verification
scope_check:
  files_in_scope: ["{EXPECTED_FILES}"]
  files_actually_modified: ["{ACTUAL_FILES}"]
  scope_violation: false                   # true if modified unauthorized files
  violation_details: null                  # Details if violation occurred

# Notes
notes: |
  {ANY RELEVANT NOTES FROM TEAMMATE}
```

---

## Template 3: REVIEW_RECEIPT.yaml (Code Review)

```yaml
# ============================================================
# CODE REVIEW RECEIPT
# Findings from code review teammate
# ============================================================

# Identifiers
review_id: REVIEW-{SWARM_RUN_ID}
swarm_run_id: SWARM-{MISSION_ID}-{SEQ}
reviewer_id: teammate_review

# Timing
reviewed_at: {ISO8601}
review_duration_minutes: {NUMBER}

# Scope
subtasks_reviewed:
  - ST-001
  - ST-002
  - ST-003

files_reviewed:
  - "{FILE_PATH_1}"
  - "{FILE_PATH_2}"
  - "{FILE_PATH_3}"

total_lines_reviewed: {NUMBER}

# Findings Summary
total_findings: {NUMBER}
critical_findings: {NUMBER}
warning_findings: {NUMBER}
info_findings: {NUMBER}

# Detailed Findings
findings:
  - id: F-001
    severity: CRITICAL | WARNING | INFO
    subtask: ST-001
    file: "{FILE_PATH}"
    line: {LINE_NUMBER}
    category: SECURITY | PERFORMANCE | CORRECTNESS | STYLE | TEST_COVERAGE
    message: "{DESCRIPTION OF FINDING}"
    suggested_fix: "{OPTIONAL SUGGESTION}"

  - id: F-002
    severity: WARNING
    subtask: ST-002
    file: "{FILE_PATH}"
    line: 45
    category: PERFORMANCE
    message: "Consider memoizing this callback to prevent unnecessary re-renders"
    suggested_fix: "Wrap with useCallback"

  # ... additional findings

# Recommendation
recommendation: APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | BLOCK
recommendation_reason: |
  {EXPLANATION OF RECOMMENDATION}

# Blocking Issues (if recommendation is BLOCK or REQUEST_CHANGES)
blocking_issues:
  - finding_id: F-001
    reason: "{WHY THIS BLOCKS MERGE}"
```

---

## Template 4: CONSOLIDATED_RECEIPT.yaml (Final Receipt)

```yaml
# ============================================================
# CONSOLIDATED SWARM RECEIPT
# Final aggregated record of swarm execution
# ============================================================

# Mission Context
mission_id: {MISSION_ID}
swarm_run_id: SWARM-{MISSION_ID}-{SEQ}
mission_type: "{FEATURE | REFACTOR | BUGFIX | TESTS | DOCS}"
department: ENGDEL

# Execution Context
lead_agent: {LEAD_AGENT_ID}
total_teammates: {NUMBER}
execution_mode: in-process | tmux

# Timing
started_at: {ISO8601}
completed_at: {ISO8601}
total_duration_minutes: {NUMBER}
estimated_single_session_minutes: {NUMBER}
actual_speedup: "{MULTIPLIER}x"

# Overall Status
overall_status: SUCCESS | PARTIAL | FAILED | ABORTED

# Subtask Summary
subtask_summary:
  total: {NUMBER}
  succeeded: {NUMBER}
  failed: {NUMBER}
  partial: {NUMBER}
  timeout: {NUMBER}

# Subtask Details
subtasks:
  - id: ST-001
    status: SUCCESS
    owner: teammate_1
    duration_minutes: {NUMBER}

  - id: ST-002
    status: SUCCESS
    owner: teammate_2
    duration_minutes: {NUMBER}

  # ... all subtasks

# Files Summary
files_touched:
  - path: "{FILE_PATH_1}"
    subtask: ST-001
    action: MODIFIED
    lines_changed: {NUMBER}

  - path: "{FILE_PATH_2}"
    subtask: ST-002
    action: CREATED
    lines_changed: {NUMBER}

total_files_modified: {NUMBER}
total_files_created: {NUMBER}
total_files_deleted: {NUMBER}
total_lines_changed: {NUMBER}

# Testing Summary
tests_run: {TOTAL_NUMBER}
tests_passed: {NUMBER}
tests_failed: {NUMBER}
tests_skipped: {NUMBER}
test_coverage_delta: "{+N% or -N% or unchanged}"

# Code Review Summary (if performed)
code_review:
  performed: true | false
  reviewer: teammate_review | null
  recommendation: APPROVE | APPROVE_WITH_NOTES | REQUEST_CHANGES | BLOCK | null
  critical_findings: {NUMBER}
  total_findings: {NUMBER}
  blocking_issues: {NUMBER}

# Plan Approval (if required)
plan_approval:
  required: true | false
  approved: true | false | null
  approved_by: "{APPROVER_ID or null}"
  approved_at: "{ISO8601 or null}"

# Errors (if any subtasks failed)
errors:
  - subtask: ST-003
    type: TEST_FAILURE
    message: "{ERROR DESCRIPTION}"

  # ... all errors

# Cleanup
cleanup:
  performed_by: lead
  completed_at: {ISO8601}
  temporary_files_removed: {NUMBER}
  temporary_branches_removed: {NUMBER}

# Evidence Chain
evidence_pointers:
  task_manifest: proofs/swarm-runs/{SWARM_RUN_ID}/TASK_MANIFEST.yaml
  subtask_receipts:
    - proofs/swarm-runs/{SWARM_RUN_ID}/ST-001.yaml
    - proofs/swarm-runs/{SWARM_RUN_ID}/ST-002.yaml
    - proofs/swarm-runs/{SWARM_RUN_ID}/ST-003.yaml
  review_receipt: proofs/swarm-runs/{SWARM_RUN_ID}/REVIEW_RECEIPT.yaml  # or null
  execution_logs: proofs/swarm-runs/{SWARM_RUN_ID}/logs/

# Verification
verification:
  all_receipts_collected: true | false
  all_tests_passing: true | false
  scope_violations: {NUMBER}
  cleanup_complete: true | false

# Approval
approval:
  lead_sign_off: true | false
  lead_sign_off_at: {ISO8601}
  anx_notified: true | false
  anx_notified_at: {ISO8601}

# Notes
notes: |
  {ANY ADDITIONAL NOTES OR CONTEXT}
```

---

## Directory Structure

Complete proof pack structure:

```
proofs/swarm-runs/{SWARM_RUN_ID}/
├── TASK_MANIFEST.yaml           # Pre-execution planning
├── ST-001.yaml                  # Subtask 1 receipt
├── ST-002.yaml                  # Subtask 2 receipt
├── ST-003.yaml                  # Subtask 3 receipt
├── ...                          # Additional subtask receipts
├── REVIEW_RECEIPT.yaml          # Code review (if performed)
├── CONSOLIDATED_RECEIPT.yaml    # Final aggregated receipt
└── logs/
    ├── execution.log            # Overall execution log
    ├── teammate_1.log           # Per-teammate logs
    ├── teammate_2.log
    └── ...
```

---

## Validation Rules

A swarm run proof pack is VALID only when:

```
□ TASK_MANIFEST.yaml exists and is complete
□ One ST-{NNN}.yaml exists for each task in manifest
□ REVIEW_RECEIPT.yaml exists if code_review_required was true
□ CONSOLIDATED_RECEIPT.yaml exists and summarizes all subtasks
□ All file paths in evidence_pointers are valid
□ overall_status matches subtask statuses
□ verification.all_receipts_collected is true
□ cleanup.performed_by is "lead" (never teammate)
```

---

## Usage

### Creating Receipts

1. Copy relevant template
2. Replace all `{PLACEHOLDER}` values
3. Remove any unused optional sections
4. Save to proof pack directory

### Validating Receipts

```bash
# Check all required files exist
ls proofs/swarm-runs/{SWARM_RUN_ID}/

# Validate YAML syntax
yamllint proofs/swarm-runs/{SWARM_RUN_ID}/*.yaml

# Verify evidence pointers
for f in $(grep "proofs/" CONSOLIDATED_RECEIPT.yaml); do
  test -f "$f" || echo "MISSING: $f"
done
```

---

**Classification**: PROOF TEMPLATE
**Consumers**: ENGDEL operators, ANX governance
**Conformance**: Required for all swarm executions
