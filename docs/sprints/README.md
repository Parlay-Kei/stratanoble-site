# Sprint Management System

## PM Agent v1 - Quick Reference

### Commands
```bash
npm run agents sprint:plan    # Create/update sprint plan
npm run agents sprint:status  # Generate status update
npm run agents sprint:next    # Plan next sprint
npm run agents:list           # List all agents
```

### Key Files
| File | Purpose |
|------|---------|
| `_state.json` | Canonical sprint state (machine-readable) |
| `sprint-N-plan.md` | Human-readable sprint plan |
| `sprint-N-tasks.json` | Orchestrator task packet |
| `status.md` | Weekly status update |
| `backlog.md` | Prioritized backlog |
| `roadmap.md` | Phase-based roadmap |
| `risks.md` | Risk register |

### Evidence Requirements

All completed tasks **must** have proof files in `docs/audits/proofs/<date>/`

**Example:**
```bash
# Task: SEC-001 (Middleware bypass removed)
# Proof: docs/audits/proofs/2026-01-01/middleware-fix.log
```

**Gate Status Rules:**
- `in_progress` - Work ongoing, some proofs may exist
- `passed` - ALL required proofs exist and verified
- `blocked` - Missing dependencies or external blockers
- `not_started` - No work begun

### Orchestrator Integration

Orchestrator reads `sprint-N-tasks.json` and delegates tasks by role:

| Role | Agent |
|------|-------|
| `security` | Security Agent |
| `tech-lead` | Tech Lead Agent |
| `platform` | Platform Engineer Agent |
| `pm` | PM Agent |
| `qa` | QA Agent |

### Task Packet Schema

```json
{
  "sprint": 1,
  "goal": "Security closeout + build stabilization",
  "duration": "2 weeks",
  "tasks": [
    {
      "id": "SEC-001",
      "title": "Remove middleware bypass",
      "assigneeRole": "security",
      "priority": "critical|high|medium|low",
      "status": "completed|in_progress|not_started|blocked",
      "dependencies": ["OTHER-TASK-ID"],
      "acceptanceCriteria": ["Criteria 1", "Criteria 2"],
      "artifacts": ["docs/audits/proofs/2026-01-01/proof.log"],
      "estimateHours": 4
    }
  ]
}
```

### State Updates

PM Agent updates state **only when proof files exist**. Never claims completion without evidence.

**Conservative Update Rules:**
1. Only mark tasks `completed` if proof artifacts exist
2. Only mark gates `passed` if all required proofs exist
3. If unsure, mark as `in_progress` or `blocked`
4. Never claim completion without evidence

### Automated Orchestration

When P0 tasks complete:
1. Update signal file: `docs/sprints/signals/security-hotfix-p0.json`
2. Set `status: "complete"`
3. On CI success, GitHub Actions triggers orchestrator
4. Orchestrator creates GitHub Issues for next validation tasks

### Sprint Lifecycle

```
Sprint Planning          Sprint Execution         Sprint Closeout
     │                         │                        │
     ▼                         ▼                        ▼
sprint:plan              Agents work on          sprint:status
     │                   tasks with proof             │
     ▼                         │                      ▼
_state.json              artifacts saved         Update gates
sprint-N-plan.md              │                  to "passed"
sprint-N-tasks.json           ▼                       │
                         sprint:status                ▼
                              │                  sprint:next
                              ▼
                         status.md updated
```

---

**Maintained by:** PM Agent v1
**Version:** 1.0.0
**Last Updated:** 2026-01-01
