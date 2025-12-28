# File Monitor Operations Skill v2.0

## Metadata
- **Name**: file-monitor-ops
- **Version**: 2.0.0
- **Category**: Infrastructure / DevOps / Autopilot
- **Priority**: High
- **Triggers**: "file monitor", "watch files", "directory monitoring", "file changes", "staleness check", "monitor status", "start monitor", "gate approval", "job queue"

## Purpose

Elite file monitoring system with three-layer architecture:
1. **Layer 1: Monitor** - Detects changes, classifies, routes to orchestrator
2. **Layer 2: Orchestrator** - Decides actions, enforces gates, validates outcomes
3. **Layer 3: Agents** - Security, Docs, Admin, Codebase specialists

This skill manages persistent file monitoring that produces **durable artifacts**, not just activity logs.

## Architecture Overview

```
file-monitor/
├── monitor.js              # Layer 1: Watcher + classifier
├── config.json             # Base configuration
├── state.db                # SQLite persistence
├── profiles/
│   ├── baseline.json       # Shared baseline (inherited by all)
│   ├── direct-cuts.json    # Direct Cuts profile
│   └── anx-vault-ui.json   # ANX Vault UI profile
├── lib/
│   ├── database.js         # SQLite + job queue
│   ├── orchestrator.js     # Layer 2: Gate enforcement
│   ├── event-bus.js        # Priority queue routing
│   └── rule-matcher.js     # Glob pattern matching
└── agents/
    ├── security.js         # Secret/vulnerability scanning
    ├── docs.js             # Documentation analysis
    ├── admin.js            # Config validation
    └── codebase.js         # Code quality metrics
```

## Key Features

### Profile-Based Configuration
```bash
# Start with specific profile
node monitor.js --profile=direct-cuts
node monitor.js --profile=anx-vault-ui
node monitor.js --profile=baseline
```

### Gate System (A/B/C/D)
- **Gate A** (Critical): Auth, payments, secrets - requires explicit approval
- **Gate B** (High): IPC, filesystem, API routes - requires approval
- **Gate C** (Medium): Migrations, configs - requires approval
- **Gate D** (Low): Auto-approved

### Outcome-Required Enforcement
Every job must produce an artifact:
- `security_finding_created`
- `lint_report_generated`
- `test_report_generated`
- `migration_created`
- `build_artifact_produced`
- `no_issues_found`

### Risk Zones
Automatic gate escalation for sensitive paths:
```json
{
  "riskZones": [
    { "pattern": "**/auth/**", "gate": "A" },
    { "pattern": "**/preload/**", "gate": "B" },
    { "pattern": "**/migrations/**", "gate": "C" }
  ]
}
```

## Commands

### Starting
```bash
cd file-monitor && node monitor.js                    # Default profile
cd file-monitor && node monitor.js --profile=baseline # Specific profile
npm run start:daemon                                  # PM2 daemon mode
```

### Status & Monitoring
```bash
node monitor.js --status      # Overall status
node monitor.js --jobs        # Job queue
node monitor.js --gates       # Pending approvals
node monitor.js --artifacts   # Recent artifacts
node monitor.js --scan        # Manual staleness scan
```

### Gate Management
```bash
node monitor.js --gates                                    # List pending
node monitor.js --approve=job_123456_abcd1234             # Approve gate
node monitor.js --reject=job_123456_abcd1234 --reason="..." # Reject gate
```

### Maintenance
```bash
node monitor.js --cleanup  # Remove 30+ day old events
pm2 logs file-monitor      # View logs
pm2 stop file-monitor      # Stop daemon
```

## Profile Reference

### baseline.json (Inherited by all)
- Debounce: 2s window, 10s max wait
- Queue: 2 concurrent, 2 retries
- Outcomes: Required artifacts in `.anx/logs/`
- Gates: Auto-approve D only

### direct-cuts.json
- **Risk Zones**: Auth, payments, Supabase, API routes, migrations
- **Watch**: src, docs, scripts, .claude, supabase
- **Rules**: 11 active (payment audit, API security, migrations)

### anx-vault-ui.json
- **Risk Zones**: Preload, main process, filesystem, SQLite, IPC
- **Watch**: src, main, preload, renderer, db/migrations
- **Rules**: 10 active (Electron security, IPC handlers, indexer)
- **Pipelines**: Default, preload-change, migration

## Database Schema

### agent_jobs (Orchestrator Queue)
```sql
job_id, repo, profile, priority, trigger_reason
event_bundle, assigned_agent
gate_required, gate_status, gate_approved_by
outcome_required, outcome_type, outcome_artifact
status (queued|running|blocked|done|failed)
```

### event_batches (Coalescing)
```sql
batch_id, directory, extension
event_count, paths, coalesced, job_id
```

### artifacts
```sql
job_id, artifact_type, artifact_path, file_hash
```

### gate_history
```sql
job_id, gate_level, action, reason, actor
```

## Outcome Pipeline

```
File Change → Rule Match → Risk Zone Check → Gate Assignment
                                                   ↓
                                            [Gate Required?]
                                            /            \
                                          Yes             No
                                           ↓              ↓
                                     [Await Approval]  [Queue Job]
                                           ↓              ↓
                                      [Approved?]    [Run Agent]
                                      /       \          ↓
                                    Yes        No   [Validate Outcome]
                                     ↓          ↓        ↓
                               [Queue Job]  [Reject] [Create Artifact]
                                     ↓                   ↓
                                [Run Agent]      [Complete Job]
```

## Artifact Output

All jobs produce artifacts in `.anx/logs/agent_runs/`:
```markdown
# Agent Run Report

## Job Details
- **Job ID**: job_1703123456_abc12345
- **Agent**: security
- **Status**: Completed
- **Outcome**: security_finding_created

## Security Findings
- **CRITICAL** [stripeKey] Line 42: sk_live_***MASKED***
- **HIGH** [apiKey] Line 156: api_key = "***MASKED***"

## Metrics
{ "totalLines": 500, "conditionals": 45, "functions": 23 }
```

## Best Practices

### 1. Profile Selection
- Use `baseline` for new projects
- Use `direct-cuts` for web app development
- Use `anx-vault-ui` for Electron apps

### 2. Gate Discipline
- Review Gate A/B jobs before approving
- Reject with clear reason for audit trail
- Auto-approve Gate D for low-risk automation

### 3. Artifact Review
- Check `.anx/logs/agent_runs/` for run reports
- Use artifacts as PR evidence
- Archive important findings to vault

### 4. Debounce Tuning
- Security-critical: 500-1000ms
- Normal code: 2000-3000ms
- Documentation: 3000-5000ms

## Integration with Autopilot

The file monitor provides the **queue layer** for Autopilot:
1. Monitor detects changes → creates jobs
2. Orchestrator enforces gates → queues approved jobs
3. Agents execute → produce artifacts
4. Artifacts become PR evidence or vault entries

## Changelog

### v2.0.0
- Three-layer architecture (Monitor → Orchestrator → Agents)
- Profile-based configuration (baseline, direct-cuts, anx-vault-ui)
- Gate system (A/B/C/D) with approval workflow
- Risk zone routing
- Outcome-required enforcement
- Artifact generation in `.anx/logs/`
- Event batching/coalescing
- Job queue with status tracking

### v1.0.0
- Initial implementation
- Chokidar-based file watching
- SQLite persistence
- Priority event bus
