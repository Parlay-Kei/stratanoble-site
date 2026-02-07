# Claude Code Team Operations Guide

**Document ID**: ANX-PLATOPS-TEAM-OPS-001
**Version**: 1.0.0
**Authority**: Platform Ops
**Effective Date**: 2026-02-06
**Status**: OPERATIONAL (Experimental Feature)

---

## Overview

This document provides operational guidance for enabling, controlling, and troubleshooting Claude Code Agent Teams within ANX-governed environments.

**Key Warning**: Agent teams are **EXPERIMENTAL** and **disabled by default**.

---

## Startup

### Enabling Agent Teams

Agent teams are enabled via environment variable only:

```bash
# Windows PowerShell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"

# Windows CMD
set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Unix/macOS
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

**Do NOT** modify `settings.agent-teams.json` to enable. The environment variable approach ensures:
- Explicit operator intent
- Easy session-scoped control
- Simple rollback (just unset)

### Verifying Enablement

After setting the variable, verify in Claude Code:

```
> Ask Claude: "Are agent teams available?"

Expected response should confirm experimental feature status.
```

### Selecting Teammate Mode

Two modes available:

| Mode | Environment | Command |
|------|-------------|---------|
| **in-process** | Any | Default, no setup needed |
| **tmux** | Unix/macOS with tmux | Requires tmux session |

#### In-Process Mode (Default)
- Teammates run in same process
- Fastest coordination
- Best for quick, small tasks
- No additional setup required

#### tmux Mode
Provides visual monitoring via split panes:

```bash
# Start tmux session first
tmux new -s claude-teams

# Set mode (if implementing mode selection)
# Follow Claude Code's tmux integration docs
```

---

## Control

### Mission Authorization

Before any swarm execution, verify mission packet contains:

```yaml
swarm_authorized: true
max_teammates: 4  # or less
```

If missing, swarm execution is blocked.

### Real-Time Monitoring

#### In-Process Mode
Lead agent reports status inline:

```
[SWARM] Spawned teammate_1 for ST-001
[SWARM] Spawned teammate_2 for ST-002
[SWARM] teammate_1 completed ST-001 (SUCCESS)
[SWARM] teammate_2 completed ST-002 (SUCCESS)
[SWARM] All teammates complete. Consolidating receipts.
```

#### tmux Mode
Visual panes show each teammate's progress:

```
┌─────────────────────┬─────────────────────┐
│ Lead Agent          │ Teammate 1          │
│                     │                     │
│ Coordinating...     │ Working on ST-001   │
│                     │                     │
├─────────────────────┼─────────────────────┤
│ Teammate 2          │ Teammate 3          │
│                     │                     │
│ Working on ST-002   │ Working on ST-003   │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

### Pausing/Stopping Execution

To stop a swarm run mid-execution:

1. **Graceful stop**: Signal lead agent to terminate teammates
2. **Force stop**: Kill the process (loses state, requires cleanup)

```bash
# Graceful (if lead is responsive)
# Ask lead: "Stop all teammates and consolidate current progress"

# Force (if unresponsive)
# Kill the main Claude Code process
# Then manually clean up per Cleanup section
```

---

## Shutdown

### Normal Completion

Lead agent performs automatic cleanup:
1. Verifies all teammates terminated
2. Consolidates receipts
3. Archives logs
4. Reports final status

### Abnormal Termination

If swarm terminates unexpectedly:

1. **Check for orphaned processes**:
   ```bash
   # Look for Claude processes
   ps aux | grep -i claude

   # Windows
   tasklist | findstr /i claude
   ```

2. **Kill orphaned teammates**:
   ```bash
   # Unix
   pkill -f "claude.*teammate"

   # Windows (identify PIDs first)
   taskkill /PID <pid> /F
   ```

3. **Recover state** from checkpoint files:
   ```
   proofs/swarm-runs/{SWARM_RUN_ID}/
   proofs/{MISSION_ID}/CHECKPOINT_*.yaml
   ```

---

## Cleanup

### Lead-Only Cleanup Rule

**CRITICAL**: Only the lead agent performs cleanup. Teammates NEVER perform cleanup operations.

This prevents:
- Race conditions
- Double-deletion of resources
- Orphaned temporary files
- Inconsistent state

### Post-Swarm Cleanup Checklist

Lead agent (or operator if lead failed) must verify:

```
□ All teammate processes terminated
□ All subtask receipts collected
□ Consolidated receipt generated
□ Temporary files removed
□ Temporary branches deleted (if any)
□ Logs archived to proof directory
□ Mission status updated in ANX
```

### Manual Cleanup Procedure

If lead agent failed to clean up:

```bash
# 1. Navigate to swarm proof directory
cd proofs/swarm-runs/{SWARM_RUN_ID}/

# 2. Check for partial receipts
ls -la

# 3. If consolidated receipt missing, create manually from subtask receipts
# (See SWARM_RUN_RECEIPT_TEMPLATE.md for format)

# 4. Clean up temporary files
rm -rf /tmp/claude-swarm-*

# 5. Check for and remove temporary git branches
git branch | grep "swarm-temp-" | xargs git branch -D

# 6. Update mission status
# Edit mission packet or notify ANX system
```

---

## Known Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Experimental status | May have edge cases | Use in non-critical environments first |
| No teammate-to-teammate communication | Teammates cannot message each other | Route all coordination through lead |
| Context isolation | Teammates don't share memory | Include full context in spawn message |
| Max 4 teammates | Hard limit | Decompose into multiple swarm runs if needed |
| Single session | All teammates must complete in one session | Checkpoint for long-running work |
| tmux on Unix only | tmux mode not available on Windows | Use in-process mode on Windows |

---

## Troubleshooting

### Teammate Not Spawning

**Symptoms**: Lead reports spawn attempt but teammate doesn't start

**Checks**:
1. Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set
2. Check system resources (memory, CPU)
3. Verify mission packet has `swarm_authorized: true`
4. Check teammate count doesn't exceed limit (4)

### Teammate Timeout

**Symptoms**: Teammate stops responding, no completion receipt

**Resolution**:
1. Lead should terminate unresponsive teammate
2. Reassign task or mark as failed
3. Document in consolidated receipt
4. Continue with remaining teammates

### Receipt Not Generated

**Symptoms**: Swarm completes but receipts missing

**Resolution**:
1. Check `proofs/swarm-runs/{SWARM_RUN_ID}/` directory exists
2. Verify disk space and write permissions
3. Manually reconstruct from logs if needed
4. Flag mission for review

### Conflict Between Teammates

**Symptoms**: Multiple teammates modified same file

**Resolution**:
1. This should not happen (lead assigns exclusive file scopes)
2. If it does: merge manually or choose one version
3. Document in consolidated receipt
4. Review task decomposition for future runs

---

## Metrics and Monitoring

### Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Swarm success rate | >95% | <90% |
| Average speedup | >2.5x | <2x |
| Teammate failure rate | <5% | >10% |
| Cleanup completion | 100% | <100% |
| Receipt generation | 100% | <100% |

### Log Locations

```
# Swarm execution logs
proofs/swarm-runs/{SWARM_RUN_ID}/logs/

# Mission checkpoint files
proofs/{MISSION_ID}/CHECKPOINT_*.yaml

# System logs (if configured)
~/.claude/logs/agent-teams/
```

---

## Configuration Reference

Settings file location:
```
configs/claude-code/settings.agent-teams.json
```

Key settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `agent_teams.enabled` | `false` | Master switch (use env var to enable) |
| `teammate_mode.default` | `in-process` | Default execution mode |
| `limits.max_teammates` | `4` | Maximum concurrent teammates |
| `limits.teammate_timeout_minutes` | `30` | Per-teammate timeout |
| `limits.total_swarm_timeout_minutes` | `120` | Total swarm timeout |
| `cleanup.lead_cleanup_only` | `true` | Enforce lead-only cleanup |
| `cleanup.preserve_logs` | `true` | Keep logs after completion |

---

## Related Documents

- [CLAUDE_CODE_AGENT_TEAMS_POLICY.md](./CLAUDE_CODE_AGENT_TEAMS_POLICY.md) - Governance policy
- [EFFORT_ROUTING_MATRIX.md](./EFFORT_ROUTING_MATRIX.md) - When to use swarm
- [OPUS_4_6_IMPACT_BRIEF.md](./OPUS_4_6_IMPACT_BRIEF.md) - Feature overview
- `prompts/engdel/use-agent-teams.md` - Execution prompt
- `proofs/templates/SWARM_RUN_RECEIPT_TEMPLATE.md` - Receipt format

---

**Classification**: OPERATIONS GUIDE
**Review Cycle**: Monthly during experimental phase
