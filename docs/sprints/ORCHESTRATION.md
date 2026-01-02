# Automated Orchestration System

## Overview

The orchestration system automatically triggers validation tasks when P0 security fixes complete. It uses **Pattern A** architecture: a universal control plane with durable job tracking.

## Pattern A Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PATTERN A: UNIVERSAL CONTROL PLANE                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  EVENT SOURCES                    CONTROL PLANE         EXECUTION        │
│  ────────────                    ─────────────          ─────────        │
│                                                                          │
│  ┌──────────┐                   ┌─────────────┐                          │
│  │ GitHub   │─┐                 │    POST     │      ┌───────────┐       │
│  │ Actions  │ │                 │  /api/auto- │      │   n8n     │       │
│  └──────────┘ │   ┌─────────┐   │   mation/   │──────│  Workflow │       │
│  ┌──────────┐ │──▶│ Signal  │──▶│   events    │      └─────┬─────┘       │
│  │ Sentry   │ │   │  File   │   └──────┬──────┘            │             │
│  │ Webhooks │ │   └─────────┘          │                   ▼             │
│  └──────────┘ │                        ▼            ┌────────────┐       │
│  ┌──────────┐ │              ┌─────────────────┐    │   POST     │       │
│  │ Stripe   │─┘              │  Supabase       │    │ /agent-    │       │
│  │ Events   │                │  automation_    │───▶│  runner/   │       │
│  └──────────┘                │  jobs table     │    │   run      │       │
│  ┌──────────┐                └─────────────────┘    └──────┬─────┘       │
│  │ Internal │                        ▲                     │             │
│  │ PM Agent │────────────────────────┘                     ▼             │
│  └──────────┘                               ┌──────────────────────────┐ │
│                                             │  Job Handlers            │ │
│                                             │  ├── orchestrate_p0      │ │
│                                             │  ├── run_validation      │ │
│                                             │  ├── deploy_staging      │ │
│                                             │  └── alert_triggered     │ │
│                                             └──────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/automation/events` | POST | Receive automation events from any source |
| `/api/automation/events` | GET | Check automation status and available endpoints |
| `/api/agent-runner/run` | POST | Execute a job by job_id |
| `/api/agent-runner/run` | GET | Check runner status and recent jobs |

### 2. Supabase Tables

| Table | Purpose |
|-------|---------|
| `automation_events` | Durable record of all incoming triggers |
| `automation_jobs` | Job queue with status tracking |
| `automation_runs` | Execution history for each attempt |
| `automation_artifacts` | Proof files and outputs |

### 3. Scripts

| Script | Purpose |
|--------|---------|
| `scripts/orchestrator/trigger-next.mjs` | CLI trigger for GitHub Actions |
| `scripts/orchestrator/trigger-handler.mjs` | Shared orchestration logic |
| `scripts/orchestrator/save-proof.mjs` | Save proof files with sanitization |
| `scripts/orchestrator/sync-github-issues.mjs` | Sync issues to task packet |

## Event Flow

### Via GitHub Actions (current)

```
CI Success → workflow_run trigger → trigger-next.mjs → GitHub Issues
```

### Via Pattern A (recommended)

```
CI Success → POST /api/automation/events → automation_jobs row
           → n8n detects new job → POST /agent-runner/run → Job handler
           → GitHub Issues + proof artifacts
```

## n8n Workflow Integration

### Recommended n8n Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  n8n Workflow: "Automation Job Processor"                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │  Schedule   │     │  Supabase   │     │  HTTP       │        │
│  │  Trigger    │────▶│  Query      │────▶│  Request    │        │
│  │  (1 min)    │     │  Pending    │     │  Agent      │        │
│  └─────────────┘     │  Jobs       │     │  Runner     │        │
│                      └─────────────┘     └──────┬──────┘        │
│                                                  │               │
│                            ┌─────────────────────┘               │
│                            ▼                                     │
│                    ┌─────────────┐     ┌─────────────┐          │
│                    │  Success?   │──No─▶│  Slack      │          │
│                    └──────┬──────┘     │  Alert      │          │
│                           │Yes         └─────────────┘          │
│                           ▼                                     │
│                    ┌─────────────┐                              │
│                    │  Log        │                              │
│                    │  Success    │                              │
│                    └─────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### n8n Configuration

**1. Schedule Trigger Node**
```json
{
  "rule": {
    "interval": [{ "field": "minutes", "minuteInterval": 1 }]
  }
}
```

**2. Supabase Query Node**
```sql
SELECT * FROM automation_jobs
WHERE status = 'pending'
  AND retry_count < max_retries
ORDER BY created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED
```

**3. HTTP Request Node**
```json
{
  "method": "POST",
  "url": "https://your-domain.com/api/agent-runner/run",
  "headers": {
    "Content-Type": "application/json",
    "x-api-key": "{{$env.AUTOMATION_API_KEY}}"
  },
  "body": {
    "job_id": "{{$json.id}}"
  }
}
```

**4. Slack Alert Node (on failure)**
```json
{
  "channel": "#automation-alerts",
  "text": "Job {{$json.job_id}} failed: {{$json.error}}"
}
```

## Signal File Structure

Signal files in `docs/sprints/signals/` trigger orchestration when `status` is set to `"complete"`.

**Schema:** See `docs/sprints/signals/SCHEMA.md`

**Example:** `security-hotfix-p0.json`

```json
{
  "signal": "security-hotfix-p0",
  "version": "1.0",
  "date": "2026-01-01",
  "status": "complete",
  "gates": {
    "middleware_bypass_removed": "passed",
    "supabase_admin_fail_loud": "passed",
    "protected_routes_jwt": "passed"
  },
  "completed_tasks": ["SEC-001", "SEC-002", "SEC-003"],
  "evidence": [
    "docs/audits/proofs/2026-01-01/middleware-fix.log",
    "docs/audits/proofs/2026-01-01/admin-client-validation.log"
  ]
}
```

## Posting Events via API

### From GitHub Actions

```yaml
- name: Post completion event
  run: |
    curl -X POST ${{ secrets.SITE_URL }}/api/automation/events \
      -H "Content-Type: application/json" \
      -H "x-github-event: workflow_run" \
      -d '{
        "source": "github",
        "event_type": "ci_success",
        "payload": {
          "run_id": "${{ github.run_id }}",
          "sha": "${{ github.sha }}",
          "branch": "${{ github.ref_name }}"
        },
        "signal_id": "security-hotfix-p0"
      }'
```

### From PM Agent

```typescript
await fetch(`${process.env.SITE_URL}/api/automation/events`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.AUTOMATION_API_KEY,
  },
  body: JSON.stringify({
    source: 'pm_agent',
    event_type: 'signal_complete',
    payload: { signal_id: 'security-hotfix-p0' },
    signal_id: 'security-hotfix-p0',
  }),
});
```

## Job Types

| Type | Handler | Description |
|------|---------|-------------|
| `orchestrate_p0_complete` | Creates GitHub Issues for validation tasks | Triggered on P0 signal completion |
| `run_validation` | Runs test suite and saves proof | Triggered by QA agent |
| `deploy_staging` | Triggers staging deployment | Triggered by platform agent |
| `alert_triggered` | Processes Sentry/monitoring alerts | Triggered by webhooks |
| `sprint_status_update` | Updates sprint state | Triggered by PM agent |
| `custom` | Generic handler | For custom automation |

## Proof File Requirements

All completed tasks require proof files in `docs/audits/proofs/<date>/`

### Using save-proof.mjs

```bash
# Pipe command output (recommended)
npm test 2>&1 | node scripts/orchestrator/save-proof.mjs \
  --task VAL-001 \
  --type test-suite

# Build output
npm run build 2>&1 | node scripts/orchestrator/save-proof.mjs \
  --task VAL-002 \
  --type build-output

# Inline content
node scripts/orchestrator/save-proof.mjs \
  --task SEC-001 \
  --type middleware-fix \
  --content "All tests passed"
```

### Security Features

The save-proof.mjs script automatically:
- Strips Supabase PATs, Stripe keys, GitHub tokens, JWTs
- Truncates files exceeding 1MB
- Adds proper headers and timestamps

## Deduplication

### SHA + Run ID Strategy

The orchestrator creates marker issues with a dedupe key:

```
Orchestrator: security-hotfix-p0 2026-01-01 sha=abc1234
```

This prevents:
- Duplicate triggers from the same commit
- Duplicate triggers from the same date
- Race conditions in parallel workflows

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `AUTOMATION_API_KEY` | API key for internal/agent auth | Yes |
| `GITHUB_TOKEN` | GitHub token for issue creation | Yes (for trigger-next.mjs) |
| `GITHUB_REPOSITORY` | owner/repo format | Yes (for trigger-next.mjs) |

## Database Setup

Run the migration to create automation tables:

```bash
supabase migration up --project-ref your-project-ref
```

Or apply directly:

```sql
-- See: supabase/migrations/20260101_automation_jobs.sql
```

## Troubleshooting

### Events Not Creating Jobs

1. Check POST /api/automation/events returns 200
2. Verify Supabase connection in server logs
3. Check RLS policies allow service_role access
4. Verify source validation passes

### Jobs Not Running

1. Check n8n workflow is active
2. Verify AUTOMATION_API_KEY matches
3. Check job status in Supabase dashboard
4. Review agent-runner logs

### Duplicate Issues Created

1. Check dedupe key includes sha
2. Verify GitHub search API returns existing issues
3. Review trigger-next.mjs logs for dedupe check

### Proof Files Missing Secrets

This is expected behavior. save-proof.mjs strips:
- Supabase PATs (`sbp_*`)
- Stripe keys (`sk_*`)
- GitHub tokens (`ghp_*`, `gho_*`)
- JWTs (`eyJ*`)
- AWS keys (`AKIA*`)

---

**Version:** 2.0.0
**Last Updated:** 2026-01-01
**Pattern:** A (Universal Control Plane)
**Maintained By:** Platform Team
