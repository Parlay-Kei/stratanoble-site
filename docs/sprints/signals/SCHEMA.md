# Signal File Schema

## Overview

Signal files are machine-readable JSON documents that trigger automated orchestration when their status changes to `complete`.

## Schema Version

Current version: `1.0`

## File Location

`docs/sprints/signals/<signal-name>.json`

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `signal` | string | Unique signal identifier (e.g., `security-hotfix-p0`) |
| `version` | string | Schema version (e.g., `1.0`) |
| `date` | string | Date in YYYY-MM-DD format |
| `status` | enum | Signal status: `in_progress` \| `complete` |
| `gates` | object | Gate name to status mapping |
| `completed_tasks` | array | List of completed task IDs |
| `evidence` | array | List of proof file paths |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `next_validation_required` | array | List of validation steps needed |
| `metadata` | object | Additional tracking information |

## Status Values

### Signal Status
- `in_progress` - Work is ongoing, do not trigger orchestration
- `complete` - All gates passed, trigger orchestration

### Gate Status
- `not_started` - Gate work has not begun
- `in_progress` - Gate work is ongoing
- `passed` - Gate requirements met with evidence
- `failed` - Gate requirements not met

## Naming Conventions

### Signal Names
Use lowercase with hyphens: `security-hotfix-p0`, `feature-auth-v2`

### Gate Names
Use lowercase with underscores: `middleware_bypass_removed`, `env_validation_ci`

### Task IDs
Use uppercase with hyphens: `SEC-001`, `BUILD-001`, `VAL-001`

## Example Signal File

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
  "completed_tasks": [
    "SEC-001",
    "SEC-002",
    "SEC-003"
  ],
  "evidence": [
    "docs/audits/proofs/2026-01-01/middleware-fix.log",
    "docs/audits/proofs/2026-01-01/admin-client-validation.log"
  ],
  "next_validation_required": [
    "tests-pass",
    "build-passes"
  ],
  "metadata": {
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:30:00Z",
    "triggered_by": "pm-agent-v1",
    "workflow_run_id": "12345678",
    "commit_sha": "abc1234"
  }
}
```

## Validation Rules

1. **Status transition**: Only `in_progress` -> `complete` triggers orchestration
2. **Gates must be passed**: All gates should be `passed` before setting `status: complete`
3. **Evidence required**: Each gate should have corresponding proof files
4. **No duplicate signals**: Signal name + date must be unique

## Integration

### PM Agent
Reads signals from `docs/sprints/signals/` and updates `_state.json`

### Orchestrator
Triggers on `status: complete` and creates GitHub Issues

### GitHub Actions
`orchestrator-on-p0-complete.yml` checks signal status after CI success

---

**Version:** 1.0
**Last Updated:** 2026-01-01
