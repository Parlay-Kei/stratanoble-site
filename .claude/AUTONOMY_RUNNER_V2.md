# Autonomy Runner V2

## Overview

The Autonomy Runner V2 is a robust, always-on execution engine designed to
process asynchronous tasks from the ANX Queue. It introduces distributed
locking, concurrency caps, kill switches, and deduplication to ensure safe and
scalable autonomous operations.

## Architecture

### Components

1. **Runner (`runner.py`)**: The main loop process.
   - **Heartbeat**: Periodically updates its status in the DB.
   - **Poller**: Fetches jobs using transactional locking.
   - **Dispatcher**: Routes jobs to appropriate handlers (scripts, commands).
2. **Queue Manager V2 (`queue_v2.py`)**: Handles DB interactions.
   - **Locking**: Uses `locked_at`, `locked_by`, and database transactions to
     prevent race conditions.
   - **Dedupe**: uses `dedupe_hash` and unique indices to prevent duplicate
     tasks.
   - **Caps & Kill Switch**: Checks dynamic configuration before dispensing
     jobs.
3. **Database (`anx_state.db`)**: SQLite state store.
   - **Tables**: `queue`, `autonomy_config`, `runner_heartbeats`.

## Features

### 1. Robust Queue & Locking

- Jobs are locked to a specific `runner_id` when picked up.
- `locked_at` timestamp allows for stale lock recovery (future enhancement).
- Atomic "Select-for-Update" style logic (via `BEGIN IMMEDIATE` and
  `UPDATE ... WHERE status='PENDING'`).

### 2. Concurrency Caps

- The system checks the total number of `PROCESSING` jobs against
  `max_concurrent_jobs` in `autonomy_config`.
- If the cap is reached, the runner waits before polling again.

### 3. Kill Switch

- A global boolean flag `kill_switch` in `autonomy_config`.
- If set to `true`, all runners pause operations immediately.

### 4. Deduplication

- Enqueue operations accept a `dedupe_hash`.
- `queue` table has a UNIQUE index on `dedupe_hash` where status is `PENDING` or
  `PROCESSING`.
- Attempting to enqueue a duplicate payload results in a no-op or error (handled
  gracefully).

### 5. Receipts & Proofs

- Integrated with `proof_utils` to generate standardized execution receipts.
- Logs `SUCCESS`, `FAILED` or `CRASHED` statuses with full stdout/stderr
  capture.

## Configuration

Managed via `autonomy_config` table:

- `kill_switch`: "true" / "false"
- `max_concurrent_jobs`: Integer (default 5)
- `global_retry_limit`: Integer (default 3)

## Usage

### Starting the Runner

```bash
python c:\Dev\.claude-anx\autonomy\runner.py
```

### Enqueueing a Job (Example)

```python
from autonomy.queue_v2 import QueueV2
q = QueueV2()
q.enqueue({
    "type": "command",
    "command": "dir",
    "cwd": "C:\\"
})
```
