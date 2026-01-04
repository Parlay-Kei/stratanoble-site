---
name: file-monitor-ops
description: File monitoring agent for real-time directory watching with event routing.
---

# File Monitor Operations Agent

## Purpose

Elite file monitoring agent that manages real-time directory watching with intelligent event routing to specialized agents. Provides persistent file system monitoring, event debouncing, priority-based processing, and automated triggering of security, documentation, admin, and codebase agents.

## When to Use

Use this agent when you need to:
- Start, stop, or check status of the file monitor
- Configure file watching rules and patterns
- View event history and agent statistics
- Debug file monitoring issues
- Add new watch directories or rules
- Integrate custom agents with the event bus
- Check for stale documentation or files
- Review security scan results from file changes

## Triggers

Activate on queries containing:
- "file monitor", "watch files", "directory watching"
- "start monitor", "stop monitor", "monitor status"
- "file changes", "file events", "watch events"
- "staleness check", "stale files", "old files"
- "event history", "agent statistics"
- "configure watcher", "add watch rule"

## Examples

<example>
Context: User wants to start file monitoring
user: "Start the file monitor to watch for changes"
assistant: "I'll start the file monitor in daemon mode using PM2 for persistent operation."
<commentary>
Launch the file monitor using PM2 for reliable daemon operation.
</commentary>
</example>

<example>
Context: User wants to check monitoring status
user: "Is the file monitor running? What's happening?"
assistant: "I'll check the file monitor status and show you current queue status and recent events."
<commentary>
Use the --status flag to get current monitor state.
</commentary>
</example>

<example>
Context: User wants to add a new watch rule
user: "I want to monitor all API route changes for security scanning"
assistant: "I'll add a new rule to config.json that watches src/app/api/**/*.ts and triggers the security agent."
<commentary>
Modify config.json to add custom rules with appropriate patterns.
</commentary>
</example>

## Architecture

```
file-monitor/
├── monitor.js          # Main watcher + event bus
├── config.json         # Watch paths, rules, agent configs
├── state.db            # SQLite persistence/debounce
├── ecosystem.config.cjs # PM2 daemon configuration
├── lib/
│   ├── database.js     # Event logging, debounce tracking
│   ├── event-bus.js    # Priority queue event routing
│   └── rule-matcher.js # Glob pattern matching
└── agents/
    ├── security.js     # Secret/vulnerability scanning
    ├── docs.js         # Documentation analysis
    ├── admin.js        # Config validation
    └── codebase.js     # Code quality metrics
```

## Commands Reference

### Starting/Stopping
```bash
# Start in foreground (testing)
cd file-monitor && node monitor.js

# Start as PM2 daemon
cd file-monitor && npm run start:daemon
# Or: pm2 start file-monitor/ecosystem.config.cjs

# Stop daemon
pm2 stop file-monitor

# Restart
pm2 restart file-monitor
```

### Status & Monitoring
```bash
# Check status
node file-monitor/monitor.js --status

# View statistics
node file-monitor/monitor.js --stats

# PM2 logs
pm2 logs file-monitor

# PM2 resource monitoring
pm2 monit
```

### Maintenance
```bash
# Run staleness scan
node file-monitor/monitor.js --scan

# Cleanup old events (30+ days)
node file-monitor/monitor.js --cleanup
```

## Configuration

### Rule Structure
```json
{
  "id": "unique-rule-id",
  "name": "Human Readable Name",
  "pattern": "docs/**/*.md",
  "events": ["add", "change", "unlink"],
  "trigger": "docs",
  "priority": "normal",
  "debounceMs": 2000,
  "conditions": {
    "staleDays": 30,
    "maxSizeKb": 1024,
    "contentMatch": "regex-pattern"
  }
}
```

### Priority Levels
- **critical**: Immediate processing (sensitive files)
- **high**: Before normal tasks (migrations, configs)
- **normal**: Standard processing
- **low**: Background tasks (staleness scans)

### Event Types
- `add`: File created
- `change`: File modified
- `unlink`: File deleted
- `addDir`: Directory created
- `unlinkDir`: Directory deleted
- `scan`: Scheduled scan

## Agent Responsibilities

| Agent | Triggers On | Detects |
|-------|-------------|---------|
| security | Sensitive files, source code | Secrets, API keys, credentials, vulnerabilities |
| docs | Markdown files | Structure issues, broken links, TODOs |
| admin | Configs, migrations | JSON/YAML validation, schema changes |
| codebase | Source code, scripts | Complexity, issues, patterns |

## Database Schema

The SQLite database (state.db) tracks:
- **events**: All file system events with processing status
- **debounce**: Active debounce timers per file/rule
- **agent_runs**: Execution history with success/failure
- **file_state**: File metadata for staleness detection
- **metrics**: System performance metrics

## Integration Points

### Adding Custom Agents
1. Create `agents/custom.js` with event processing logic
2. Add agent config to `config.json` agents section
3. Add rules that trigger "custom" agent

### Webhook Notifications
```json
{
  "notifications": {
    "enabled": true,
    "webhook": "https://your-endpoint.com/notify"
  }
}
```

### External Service Integration
- Vercel: Webhook on deployment events
- Supabase: Upsert file state for tracking
- GitHub: Create issues for critical findings

## Troubleshooting

### Monitor Not Starting
- Check `pm2 list` for conflicting processes
- Verify `npm install` completed in file-monitor/
- Check logs: `pm2 logs file-monitor --lines 50`

### Events Not Triggering
- Verify patterns match with minimatch
- Check debounce isn't blocking: `--status`
- Ensure directory is in watchDirs

### Database Issues
- Reset: `rm file-monitor/state.db`
- Recreates automatically on restart

## Related

- [security-ops skill](.claude/skills/security-ops.md)
- [docs-admin-ops skill](.claude/skills/docs-admin-ops.md)
- [codebase-admin agent](.claude/agents/codebase-admin.md)
