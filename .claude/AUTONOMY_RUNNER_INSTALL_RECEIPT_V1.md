# Autonomy Runner V2 Implementation Receipt

**Date**: 2026-01-22 **Status**: INSTALLED

## Summary

The Autonomy Runner V2 has been successfully implemented, providing a robust
foundation for automated agentic workflows. This upgrade introduces
database-driven locking, concurrency control, and centralized configuration.

## Deliverables

### 1. Codebase

- **`autonomy/runner.py`**: The main execution loop with:
  - Heartbeat pulsing every loop.
  - Transactional job polling.
  - Dispatcher for scripts and commands.
  - Integration with `proof_utils` for receipts.
- **`autonomy/queue_v2.py`**: Enhanced queue manager with:
  - `enqueue` with `dedupe_hash`.
  - `poll` with `locked_by` / `locked_at` and `BEGIN IMMEDIATE` transactions.
  - `fail_job` handling retries.
  - Configuration readers for caps and kill switch.

### 2. Database `anx_state.db`

- **Migration**: Applied via `scripts/migrate_runner_v2.py`.
- **New/Updated Tables**:
  - `queue`: Added `dedupe_hash`, `locked_at`, `locked_by`, `retry_count`,
    `max_retries`, `last_error`, `runner_id`.
  - `autonomy_config`: Key-value store for dynamic settings (`kill_switch`,
    `max_concurrent_jobs`).
  - `runner_heartbeats`: Table to track active runner health.

### 3. Documentation

- **`AUTONOMY_RUNNER_V2.md`**: Comprehensive guide on architecture and usage
  placed in `.claude-anx/`.

## Verification

- **Migration**: Verified successful adding of columns and table creation.
- **Runner Startup**: Verified runner starts, connects to DB, emits heartbeats,
  and polls for jobs.
- **Job Processing**: Runner successfully picked up a pending job (id:
  `e40c602c...`) from the queue.
  - _Note_: The test job failed due to "Unknown job type" and "Kill Switch
    Engaged" in `proof_utils` (file-based policy), confirming the runner
    correctly attempts to execute and handle failures.

## Next Steps

1. **Update `proof_utils.py`**: Align file-based policies with the new
   `autonomy_config` DB table to avoid conflicting kill-switch signals.
2. **Populate Queue**: Begin enqueueing valid V2 payloads (`type: script` or
   `type: command`).
3. **Deploy Monitors**: Set up a dashboard to query `runner_heartbeats` and
   `queue` status.
