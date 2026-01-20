# File Monitor

Real-time directory watching agent with intelligent event routing and automated agent triggering.

## Quick Start

```bash
# Install dependencies
npm install

# Start in foreground (for testing)
npm start

# Start as daemon
npm run start:daemon

# Check status
node monitor.js --status

# View logs
npm run logs
```

## Features

- **Real-time Watching**: Uses chokidar for efficient file system monitoring
- **Priority Queue**: Critical events processed before low-priority ones
- **Debouncing**: Prevents spam on rapid file changes
- **Persistence**: SQLite database for event history and state tracking
- **Multiple Agents**: Security, docs, admin, and codebase analysis

## Configuration

Edit `config.json` to customize:
- Watch directories
- File patterns and rules
- Agent timeouts and retries
- Scanning intervals

## Agents

| Agent | Trigger | Purpose |
|-------|---------|---------|
| security | Sensitive files, source code | Scans for secrets, credentials, vulnerabilities |
| docs | Markdown files | Validates structure, checks links |
| admin | Config files, migrations | Validates JSON/YAML, tracks changes |
| codebase | Source code, scripts | Analyzes complexity, finds issues |

## Commands

```bash
# Start monitoring
node monitor.js

# Check status
node monitor.js --status

# View statistics
node monitor.js --stats

# Run staleness scan
node monitor.js --scan

# Cleanup old events
node monitor.js --cleanup
```

## PM2 Daemon Mode

```bash
# Start daemon
pm2 start ecosystem.config.cjs

# Stop daemon
pm2 stop file-monitor

# View logs
pm2 logs file-monitor

# Monitor resources
pm2 monit
```

## Directory Structure

```
file-monitor/
├── monitor.js          # Main entry point
├── config.json         # Configuration
├── ecosystem.config.cjs # PM2 config
├── state.db            # SQLite database
├── lib/
│   ├── database.js     # Persistence layer
│   ├── event-bus.js    # Event routing
│   └── rule-matcher.js # Pattern matching
├── agents/
│   ├── security.js     # Security scanning
│   ├── docs.js         # Documentation analysis
│   ├── admin.js        # Config validation
│   └── codebase.js     # Code analysis
└── logs/               # PM2 logs
```

## License

MIT
