# Automation System Runbook

**Version:** 2.0.0
**Last Updated:** 2026-01-01
**Owner:** Platform Team

This document is the operating contract for the Pattern A automation system. Follow these procedures for triggering events, replaying safely, inspecting state, handling failures, and verifying proofs.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Triggering Events](#triggering-events)
3. [Replaying Safely](#replaying-safely)
4. [Inspecting Job State](#inspecting-job-state)
5. [Handling Failures](#handling-failures)
6. [Proof Requirements](#proof-requirements)
7. [Smoke Tests](#smoke-tests)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Emergency Procedures](#emergency-procedures)

---

## System Overview

### Architecture

```
Event Source → POST /api/automation/events → automation_jobs table
                                                    ↓
                                    n8n polls every 1 min
                                                    ↓
                              POST /api/agent-runner/run
                                                    ↓
                                         Job Handler executes
                                                    ↓
                              automation_runs + automation_artifacts
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Events API | `/api/automation/events` | Receives and deduplicates events |
| Agent Runner | `/api/agent-runner/run` | Executes jobs with locking |
| DB Tables | `automation_*` | Durable state tracking |
| Proof Saver | `scripts/orchestrator/save-proof.mjs` | Sanitized proof storage |
| Trigger Script | `scripts/orchestrator/trigger-next.mjs` | GitHub Actions trigger |

### Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Automation
AUTOMATION_API_KEY=your-secret-key-here

# Webhook signatures (production)
GITHUB_WEBHOOK_SECRET=whsec_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_WEBHOOK_SECRET=your-secret
```

---

## Triggering Events

### Manual Event Trigger

Use this to manually trigger automation jobs (e.g., for testing or recovery):

```bash
curl -sS -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{
    "source": "manual",
    "event_type": "security_hotfix_p0_complete",
    "idempotency_key": "p0-complete-2026-01-01-manual",
    "payload": {
      "signal_path": "docs/sprints/signals/security-hotfix-p0.json",
      "proof_doc": "docs/audits/SECURITY_GATE_PROOF_2026-01-01.md"
    }
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "duplicate": false,
  "event_id": "uuid-here",
  "job_id": "uuid-here",
  "job_type": "orchestrate_p0_complete",
  "job_status": "pending",
  "idempotency_key": "p0-complete-2026-01-01-manual"
}
```

### From GitHub Actions

The workflow at `.github/workflows/orchestrator-on-p0-complete.yml` automatically triggers on CI success:

```yaml
- name: Post completion event
  run: |
    curl -X POST ${{ secrets.SITE_URL }}/api/automation/events \
      -H "Content-Type: application/json" \
      -H "x-github-event: workflow_run" \
      -d '{
        "source": "github",
        "event_type": "ci_success",
        "payload": { "sha": "${{ github.sha }}" },
        "signal_id": "security-hotfix-p0"
      }'
```

### From PM Agent

```typescript
await fetch(`${SITE_URL}/api/automation/events`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': AUTOMATION_API_KEY,
  },
  body: JSON.stringify({
    source: 'pm_agent',
    event_type: 'signal_complete',
    signal_id: 'security-hotfix-p0',
    payload: { triggered_by: 'pm-agent-v1' },
  }),
});
```

---

## Replaying Safely

### Idempotency Guarantee

The system uses idempotency keys to ensure safe replay:

1. **Same idempotency_key** → Returns existing event/job (no duplicate)
2. **Different idempotency_key** → Creates new event/job

### Safe Replay Steps

```bash
# Step 1: Find existing event/job
curl -sS "https://your-domain.com/api/agent-runner/run" \
  -H "x-api-key: $AUTOMATION_API_KEY" | jq '.recent_jobs'

# Step 2: Re-trigger with SAME idempotency key (no-op if exists)
curl -sS -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{
    "source": "manual",
    "event_type": "security_hotfix_p0_complete",
    "idempotency_key": "p0-complete-2026-01-01-manual",
    "payload": {}
  }'

# Response if duplicate:
# { "success": true, "duplicate": true, "message": "Event already processed (idempotent)" }
```

### Force New Job (Different Key)

If you need to run the same job type again:

```bash
# Use a unique idempotency key
curl -sS -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{
    "source": "manual",
    "event_type": "run_validation",
    "idempotency_key": "validation-retry-'$(date +%s)'",
    "payload": { "reason": "retry after fix" }
  }'
```

---

## Inspecting Job State

### Check Queue Status

```bash
curl -sS "https://your-domain.com/api/agent-runner/run" \
  -H "x-api-key: $AUTOMATION_API_KEY" | jq
```

**Response:**

```json
{
  "status": "ok",
  "version": "2.0.0",
  "runner_id": "runner-abc12345",
  "queue": {
    "pending_count": 2,
    "running_count": 1,
    "completed_count": 15,
    "failed_count": 0,
    "dead_letter_count": 0,
    "stuck_jobs_count": 0
  },
  "recent_jobs": [...],
  "dead_letter_jobs": []
}
```

### Query Supabase Directly

```sql
-- Pending jobs
SELECT id, type, status, created_at, retry_count
FROM automation_jobs
WHERE status = 'pending'
ORDER BY created_at ASC;

-- Running jobs (check for stuck)
SELECT id, type, started_at, locked_by, lock_expires_at
FROM automation_jobs
WHERE status = 'running';

-- Dead-letter jobs (need attention)
SELECT id, type, error_message, dead_lettered_at
FROM automation_jobs
WHERE status = 'dead_letter';

-- Queue stats
SELECT * FROM get_queue_stats();
```

### Check Specific Job

```sql
-- Job details
SELECT * FROM automation_jobs WHERE id = 'job-uuid';

-- Run history for job
SELECT * FROM automation_runs WHERE job_id = 'job-uuid' ORDER BY attempt_number;

-- Artifacts for run
SELECT * FROM automation_artifacts WHERE run_id = 'run-uuid';
```

---

## Handling Failures

### Job Failure Flow

```
Job fails → retry_count incremented → status = pending (for retry)
                                         ↓
                          After max_retries (default 3)
                                         ↓
                          status = dead_letter
```

### Retry a Failed Job

```bash
# First, reset the job to pending
UPDATE automation_jobs
SET status = 'pending',
    retry_count = 0,
    error_message = NULL,
    started_at = NULL
WHERE id = 'job-uuid';

# Then execute
curl -sS -X POST "https://your-domain.com/api/agent-runner/run" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{"job_id": "job-uuid"}'
```

### Handle Dead-Letter Jobs

Dead-letter jobs need manual investigation:

```sql
-- List dead-letter jobs
SELECT id, type, error_message, retry_count, dead_lettered_at
FROM automation_jobs
WHERE status = 'dead_letter';

-- After fixing root cause, reset to pending
UPDATE automation_jobs
SET status = 'pending',
    retry_count = 0,
    dead_lettered_at = NULL,
    dead_letter_reason = NULL,
    error_message = 'Reset after fix: [describe fix]'
WHERE id = 'job-uuid';
```

### Clean Up Stuck Jobs

Jobs can get stuck if the runner crashes mid-execution:

```sql
-- Find stuck jobs (lock expired but still "running")
SELECT * FROM automation_jobs
WHERE status = 'running'
  AND lock_expires_at < NOW();

-- Auto-cleanup (run periodically or via n8n)
SELECT cleanup_expired_locks();
```

---

## Proof Requirements

### What Proofs Must Exist

Every completed task requires a proof file:

| Task Type | Required Proof |
|-----------|----------------|
| SEC-* | `docs/audits/proofs/<date>/sec-*-*.log` |
| VAL-* | `docs/audits/proofs/<date>/val-*-*.log` |
| BUILD-* | `docs/audits/proofs/<date>/build-*-*.log` |

### Creating Proofs

```bash
# Test suite proof
npm test 2>&1 | node scripts/orchestrator/save-proof.mjs \
  --task VAL-001 --type test-suite

# Build proof
npm run build 2>&1 | node scripts/orchestrator/save-proof.mjs \
  --task VAL-002 --type build-output

# Manual proof
node scripts/orchestrator/save-proof.mjs \
  --task SEC-001 --type middleware-fix \
  --content "Verified: middleware now rejects unauthenticated requests"
```

### Verifying Proofs

```bash
# Check proof exists
ls docs/audits/proofs/$(date +%Y-%m-%d)/

# Verify no secrets leaked (should see [REDACTED:*] markers)
grep -r "REDACTED" docs/audits/proofs/$(date +%Y-%m-%d)/

# Check proof file structure
head -20 docs/audits/proofs/$(date +%Y-%m-%d)/val-001-test-suite.log
```

### Proof Security

The save-proof script automatically redacts:
- API keys (Supabase, Stripe, GitHub, AWS, OpenAI, etc.)
- JWT tokens and Bearer tokens
- Connection strings
- Private keys
- Environment variable dumps

Use `--strict` to fail instead of redacting:

```bash
npm test 2>&1 | node scripts/orchestrator/save-proof.mjs \
  --task VAL-001 --type test-suite --strict
```

---

## Stress Tests

Run these tests before production to verify the system handles load correctly.

### Test 1: Replay Storm (Idempotency)

Send the same event 50 times in 30 seconds. Verify only 1 job is created.

```bash
IDEM_KEY="replay-storm-$(date +%s)"

for i in {1..50}; do
  curl -sS -X POST "https://your-domain.com/api/automation/events" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $AUTOMATION_API_KEY" \
    -d "{
      \"source\": \"manual\",
      \"event_type\": \"run_validation\",
      \"idempotency_key\": \"$IDEM_KEY\",
      \"payload\": { \"iteration\": $i }
    }" &
done
wait

# Verify: Check job count
curl -sS "https://your-domain.com/api/agent-runner/run" \
  -H "x-api-key: $AUTOMATION_API_KEY" | jq '.recent_jobs | length'
# Expected: Only 1 job with this idempotency key
```

**Expected Results:**
- 1 job created (not 50)
- 1 run executed
- No duplicate GitHub issues
- No duplicate proof files

### Test 2: Runner Concurrency

Trigger 10 jobs at once with MAX_CONCURRENT_JOBS = 3.

```bash
# Create 10 jobs with unique keys
for i in {1..10}; do
  curl -sS -X POST "https://your-domain.com/api/automation/events" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $AUTOMATION_API_KEY" \
    -d "{
      \"source\": \"manual\",
      \"event_type\": \"run_validation\",
      \"idempotency_key\": \"concurrency-test-$i-$(date +%s)\",
      \"payload\": { \"job_number\": $i }
    }"
done

# Wait 2 seconds, check status
sleep 2
curl -sS "https://your-domain.com/api/agent-runner/run" \
  -H "x-api-key: $AUTOMATION_API_KEY" | jq '.queue'
```

**Expected Results:**
- running_count <= 3 (MAX_CONCURRENT)
- pending_count = 10 - running_count
- No lock conflicts (no 409 errors)
- All jobs eventually complete (no starvation)

### Test 3: Crash Recovery

Simulate runner crash mid-job, verify lock cleanup works.

```bash
# 1. Create a job
JOB_ID=$(curl -sS -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{
    "source": "manual",
    "event_type": "run_validation",
    "idempotency_key": "crash-test-'$(date +%s)'",
    "payload": {}
  }' | jq -r '.job_id')

echo "Created job: $JOB_ID"

# 2. Manually set job to 'running' with expired lock (simulates crash)
# Run this in Supabase SQL editor:
# UPDATE automation_jobs
# SET status = 'running',
#     started_at = NOW() - INTERVAL '10 minutes',
#     locked_by = 'crashed-runner',
#     locked_at = NOW() - INTERVAL '10 minutes',
#     lock_expires_at = NOW() - INTERVAL '5 minutes'
# WHERE id = 'JOB_ID';

# 3. Run cleanup
# SELECT cleanup_expired_locks();

# 4. Verify job is back to pending
# SELECT status, locked_by FROM automation_jobs WHERE id = 'JOB_ID';
# Expected: status = 'pending', locked_by = NULL

# 5. Execute job normally
curl -sS -X POST "https://your-domain.com/api/agent-runner/run" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d "{\"job_id\": \"$JOB_ID\"}" | jq
```

**Expected Results:**
- Job returns to 'pending' after lock expires
- New runner can claim and execute job
- No partial side effects from crashed run

### Test 4: Dead-Letter Queue

Force a job to fail 3 times, verify dead-letter handling.

```bash
# 1. Create a job that will fail
# (Modify handler temporarily to always throw, or use a custom job type that fails)

# 2. Check dead-letter status after 3 retries
curl -sS "https://your-domain.com/api/agent-runner/run" \
  -H "x-api-key: $AUTOMATION_API_KEY" | jq '.dead_letter_jobs'

# 3. Verify in database:
# SELECT id, type, status, retry_count, dead_lettered_at, dead_letter_reason
# FROM automation_jobs
# WHERE status = 'dead_letter';
```

**Expected Results:**
- retry_count = 3 (or max_retries value)
- status = 'dead_letter'
- dead_lettered_at is set
- dead_letter_reason = 'max_retries_exceeded'
- No further retry attempts
- Visible in status endpoint dead_letter_jobs array

### Test 5: System Heartbeat

Trigger heartbeat job and verify health checks.

```bash
# Trigger heartbeat
curl -sS -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{
    "source": "internal",
    "event_type": "system_heartbeat",
    "idempotency_key": "heartbeat-'$(date +%Y%m%d-%H%M)'",
    "payload": {}
  }' | jq

# Execute the heartbeat job
JOB_ID=$(curl -sS "https://your-domain.com/api/agent-runner/run" \
  -H "x-api-key: $AUTOMATION_API_KEY" | jq -r '.recent_jobs[0].id')

curl -sS -X POST "https://your-domain.com/api/agent-runner/run" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d "{\"job_id\": \"$JOB_ID\"}" | jq '.output'
```

**Expected Results:**
- overall_status = 'healthy'
- All checks pass
- Artifact reference created

---

## Smoke Tests

Run these tests after deployment to verify the system works:

### Test 1: Event Creates Job

```bash
IDEM_KEY="smoketest-$(date +%s)"

curl -sS -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d "{
    \"source\": \"manual\",
    \"event_type\": \"run_validation\",
    \"idempotency_key\": \"$IDEM_KEY\",
    \"payload\": { \"test\": true }
  }" | jq

# Verify: success=true, duplicate=false, job_id present
```

### Test 2: Runner Executes Job

```bash
JOB_ID="<job_id from test 1>"

curl -sS -X POST "https://your-domain.com/api/agent-runner/run" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d "{\"job_id\": \"$JOB_ID\"}" | jq

# Verify: success=true, status=completed
```

### Test 3: Replay Safety

```bash
# Replay event with same key
curl -sS -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d "{
    \"source\": \"manual\",
    \"event_type\": \"run_validation\",
    \"idempotency_key\": \"$IDEM_KEY\",
    \"payload\": { \"test\": true }
  }" | jq

# Verify: duplicate=true, no new job created

# Replay runner with same job_id
curl -sS -X POST "https://your-domain.com/api/agent-runner/run" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -d "{\"job_id\": \"$JOB_ID\"}" | jq

# Verify: error="Job is already completed", status=409
```

---

## Monitoring & Alerts

### Key Metrics to Watch

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Pending queue depth | > 10 | > 50 |
| Running jobs | > MAX_CONCURRENT (3) | Shouldn't happen |
| Failed rate (last hour) | > 10% | > 25% |
| Stuck jobs | > 0 | > 0 for > 5 min |
| Dead-letter count | > 0 | > 5 |

### Supabase Alert Queries

```sql
-- Alert: Queue depth too high
SELECT COUNT(*) as pending_count
FROM automation_jobs
WHERE status = 'pending';
-- Alert if > 10

-- Alert: Stuck jobs
SELECT COUNT(*) as stuck_count
FROM automation_jobs
WHERE status = 'running'
  AND lock_expires_at < NOW();
-- Alert if > 0

-- Alert: High failure rate
SELECT
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) as total,
  (COUNT(*) FILTER (WHERE status = 'failed')::float / COUNT(*)::float * 100) as failure_rate
FROM automation_jobs
WHERE created_at > NOW() - INTERVAL '1 hour';
-- Alert if failure_rate > 10

-- Alert: Dead-letter jobs
SELECT COUNT(*) as dead_letter_count
FROM automation_jobs
WHERE status = 'dead_letter';
-- Alert if > 0
```

### n8n Alert Workflow

Configure n8n to:
1. Poll `get_queue_stats()` every 5 minutes
2. If `dead_letter_count > 0` → Slack alert
3. If `stuck_jobs_count > 0` → Slack alert + run `cleanup_expired_locks()`
4. If `pending_count > 50` → Slack alert

---

## Emergency Procedures

### System Overload (Queue Flooding)

```sql
-- 1. Pause processing (jobs stay pending)
-- (Stop n8n workflow or set MAX_CONCURRENT = 0)

-- 2. Check for duplicate events
SELECT idempotency_key, COUNT(*)
FROM automation_events
GROUP BY idempotency_key
HAVING COUNT(*) > 1;

-- 3. Cancel suspicious jobs
UPDATE automation_jobs
SET status = 'cancelled'
WHERE created_at > 'timestamp-of-flood'
  AND status = 'pending';

-- 4. Resume processing
```

### Job Execution Failure Loop

If a job keeps failing and retrying:

```sql
-- 1. Stop the loop
UPDATE automation_jobs
SET status = 'cancelled',
    error_message = 'Manual cancellation: failure loop'
WHERE id = 'job-uuid';

-- 2. Investigate the handler
-- Check logs for error stack

-- 3. Fix the issue

-- 4. Create new job (don't retry cancelled one)
```

### Database Issues

```sql
-- Check for lock contention
SELECT * FROM pg_stat_activity
WHERE state = 'active'
  AND query LIKE '%automation%';

-- Kill stuck connections (CAREFUL)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active'
  AND query LIKE '%automation%'
  AND query_start < NOW() - INTERVAL '5 minutes';
```

### Rollback Event Receiver

If the events endpoint is compromised:

```bash
# 1. Rotate AUTOMATION_API_KEY immediately
# 2. Deploy new key to all callers
# 3. Review events received during window:

SELECT * FROM automation_events
WHERE received_at > 'window-start'
ORDER BY received_at;

# 4. Cancel any suspicious jobs:

UPDATE automation_jobs
SET status = 'cancelled'
WHERE event_id IN (
  SELECT id FROM automation_events
  WHERE received_at > 'window-start'
    AND source = 'suspicious-source'
);
```

---

## Quick Reference

### Common Commands

```bash
# Check system status
curl -s "https://your-domain.com/api/agent-runner/run" -H "x-api-key: $AUTOMATION_API_KEY" | jq '.queue'

# Trigger manual job
curl -X POST "https://your-domain.com/api/automation/events" \
  -H "Content-Type: application/json" -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{"source":"manual","event_type":"run_validation","idempotency_key":"manual-'$(date +%s)'","payload":{}}'

# Execute specific job
curl -X POST "https://your-domain.com/api/agent-runner/run" \
  -H "Content-Type: application/json" -H "x-api-key: $AUTOMATION_API_KEY" \
  -d '{"job_id":"uuid"}'

# Save proof
npm test 2>&1 | node scripts/orchestrator/save-proof.mjs --task VAL-001 --type test-suite

# Clean up stuck jobs
psql -c "SELECT cleanup_expired_locks();"
```

### Contact

- **On-Call:** Check #platform-oncall in Slack
- **Escalation:** Platform team lead
- **Runbook Issues:** File PR against this document

---

**Document Version History:**
- 2.0.0 (2026-01-01): Production-grade version with idempotency, locking, rate limiting
- 1.0.0 (2026-01-01): Initial version
