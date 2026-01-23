# Autonomy Acceptance Gate V1

**Objective**: Verify that the Autonomy Runner respects all defined safety
constraints before being "attached" to the live environment.

## Gate Criteria

The following automated demos must pass:

### DEMO-002: Happy Path Execution

- **Scenario**: Enqueue a valid task with a safe tool (`read_file`).
- **Expectation**:
  - Runner picks up job.
  - Policy allows execution.
  - Tool runs (simulated).
  - Receipt emitted with status `SUCCESS`.
  - Job status updates to `COMPLETED`.

### DEMO-003: Policy Gate (Allowlist)

- **Scenario**: Enqueue a task with a disallowed tool (e.g., `delete_file`).
- **Expectation**:
  - Runner picks up job.
  - Policy blocks execution (`Tool delete_file not allowed`).
  - Receipt emitted (or logged) as `FAILED`.
  - Job status updates to `FAILED`.

### DEMO-004: Budget Gate (Cap)

- **Scenario**: Enqueue a task with a cost exceeding the transaction limit ($25
  vs $20 limit).
- **Expectation**:
  - Runner picks up job.
  - Policy blocks execution (`Transaction amount 25 exceeds limit 20`).
  - Job status updates to `FAILED`.

### DEMO-005: Kill Switch / Hard Fail

- **Scenario**: Enable Kill Switch. Enqueue a valid task.
- **Expectation**:
  - Runner detects Kill Switch immediately.
  - Runner HALTS (does not pick up job).
  - Job remains `PENDING`.

## Execution

Run the gate suite via: `python scripts/run_gate_demos.py`

## Sign-off

- [x] DEMO-002 PASS
- [x] DEMO-003 PASS
- [x] DEMO-004 PASS
- [x] DEMO-005 PASS
