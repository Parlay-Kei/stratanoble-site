# Agent Visibility & Monitoring System Guide

> Complete guide to monitoring autonomous agent execution with real-time feedback, historical logs, visual dashboards, and notifications.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Monitoring Methods](#monitoring-methods)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Overview

The Agent Visibility & Monitoring System provides comprehensive visibility into agent execution through multiple channels:

- 🖥️ **Real-Time Console Feedback** - Colorful terminal output with progress indicators
- 🔔 **Desktop Notifications** - Windows toast notifications for agent events
- 📊 **Web Dashboard** - Visual dashboard at `/admin/agents`
- 📁 **Log Files** - Detailed execution logs in `logs/agents/`
- 📈 **CLI Status Tool** - Command-line agent status viewer
- 🎯 **Git Hook Feedback** - Enhanced pre-commit/pre-push output

## Quick Start

### 1. Check Agent Status

```bash
# View current agent status and statistics
npm run agents:status
```

### 2. View Real-Time Logs

```bash
# Watch logs as they're created (Unix-like systems)
npm run agents:logs

# Or manually tail the logs
tail -f logs/agents/*.log
```

### 3. Access Web Dashboard

Visit the admin dashboard to see agent activity:
- **Local**: http://localhost:3000/admin/agents
- **Production**: https://stratanoble.com/admin/agents

### 4. List Available Agents

```bash
# See all registered agents
npm run agents:list
```

## Monitoring Methods

### Method 1: Real-Time Console Output

When agents run (e.g., during git commits), you'll see colorful terminal output:

```
┌─────────────────────────────────────────┐
│  🤖 AUTONOMOUS AGENT ACTIVATED          │
│                                         │
│  Agent: Auto-Fix Lint                   │
│  Trigger: pre-commit                    │
│  Time: 11/3/2025, 2:30:15 PM           │
└─────────────────────────────────────────┘

ℹ️  Scanning files for lint errors...
✅ Fixed 12 escape character errors
✅ Removed 5 console statements
⚠️  1 error requires manual review

┌─────────────────────────────────────────┐
│  🤖 AGENT EXECUTION ✅ COMPLETED        │
│                                         │
│  Agent: Auto-Fix Lint                   │
│  Duration: 2.35s                        │
│  Actions: 17                            │
│  Modified: 8 files                      │
└─────────────────────────────────────────┘
```

### Method 2: Desktop Notifications

Agents send Windows toast notifications for key events:

- **Agent Start**: Notification when agent begins execution
- **Agent Success**: Success notification with stats
- **Agent Failure**: Error notification with action buttons
- **Agent Warning**: Warning notifications for non-critical issues

### Method 3: Web Dashboard

The web dashboard at `/admin/agents` provides:

#### Active Agents Section
- Real-time view of currently running agents
- Shows agent name, trigger, and elapsed time
- Animated spinner for active agents

#### Recent Executions
- Last 10 agent executions
- Status indicators (✅ success, ❌ failed, ⚙️ running)
- Duration, actions taken, files modified
- Clickable to view detailed logs

#### Statistics Cards
- **Successful Executions** - Count of successful runs
- **Failed Executions** - Count of failed runs
- **Total Actions** - Sum of all actions taken
- **Files Modified** - Total files changed by agents

#### Auto-Refresh
- Dashboard refreshes every 10 seconds
- No manual refresh needed

### Method 4: CLI Status Tool

Use the command-line status tool for quick checks:

```bash
npm run agents:status
```

Output example:
```
🤖 AGENT SYSTEM STATUS

┌────────────────────────────┬────────────────────┐
│ Metric                     │ Value              │
├────────────────────────────┼────────────────────┤
│ Total Executions           │ 47                 │
│ Success Rate               │ 95.7%              │
│ Avg Duration               │ 2.34s              │
│ Total Actions              │ 523                │
│ Files Modified             │ 124                │
└────────────────────────────┴────────────────────┘

📋 Recent Executions:

┌─────────────────────────┬────────────┬──────────────────────┬────────┐
│ Agent                   │ Status     │ Time                 │ Actions│
├─────────────────────────┼────────────┼──────────────────────┼────────┤
│ Auto-Fix Lint           │ ✅ success │ 5m ago               │ 12     │
│ Type Check              │ ✅ success │ 15m ago              │ 0      │
│ Pre-Push Validation     │ ✅ success │ 1h ago               │ 8      │
└─────────────────────────┴────────────┴──────────────────────┴────────┘
```

### Method 5: Log Files

Detailed logs are stored in `logs/agents/`:

```bash
# List all agent logs
ls logs/agents/

# View specific log
cat logs/agents/auto-fix-lint-2025-11-03T14-30-15.log

# View history file (all executions)
cat logs/agents/history.jsonl
```

Log file naming: `{agent-name}-{timestamp}.log`

Each log contains:
- Timestamp for each action
- Agent name and event
- Duration markers
- Success/failure indicators
- Execution summary

### Method 6: Git Hook Output

Enhanced git hooks provide visual feedback:

#### Pre-Commit Hook
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AUTONOMOUS AGENTS: PRE-COMMIT VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Files staged for commit:
   src/components/Header.tsx
   src/utils/helpers.ts

[Agent execution output here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRE-COMMIT VALIDATION PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Pre-Push Hook
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 AUTONOMOUS AGENTS: PRE-DEPLOYMENT VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Commits to be pushed:
   a1b2c3d Fix header component
   e4f5g6h Update utilities

[Comprehensive validation output here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRE-DEPLOYMENT VALIDATION PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Pushing to production...
```

## Components

### Core Components

#### AgentLogger (`scripts/agents/logger.ts`)
Handles logging with color-coded console output and file writing.

**Usage in agents:**
```typescript
import { AgentLogger } from './logger';

const logger = new AgentLogger('My Agent');

await logger.info('Starting process...');
await logger.success('Process completed!');
await logger.warning('Minor issue detected');
await logger.error('Critical error occurred');

// At end of execution
await logger.summary({
  success: true,
  actionsTaken: 10,
  filesModified: 5,
  errors: 0
});
```

#### AgentNotifier (`scripts/agents/notifications.ts`)
Sends desktop notifications for agent events.

**Usage:**
```typescript
import { AgentNotifier } from './notifications';

const notifier = new AgentNotifier();

notifier.notifyStart('My Agent', 'pre-commit');
notifier.notifySuccess('My Agent', { actionsTaken: 10, filesModified: 5 });
notifier.notifyFailure('My Agent', 'Connection timeout');
notifier.notifyWarning('My Agent', 'Deprecated API usage detected');
```

#### AgentStorage (`scripts/agents/storage.ts`)
Manages execution history and log file storage.

**Usage:**
```typescript
import { AgentStorage } from './storage';

const storage = new AgentStorage();

// Save execution
await storage.saveExecution({
  id: 'unique-id',
  agentName: 'My Agent',
  trigger: 'pre-commit',
  status: 'success',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 2500,
  actionsTaken: 10,
  filesModified: 5,
  errors: 0,
  fullLog: 'log content here'
});

// Get history
const history = await storage.getHistory(50);

// Get statistics
const stats = await storage.getStats();
```

#### Banner Functions (`scripts/agents/banner.ts`)
Creates visual banners for agent execution.

**Usage:**
```typescript
import { showAgentStartBanner, showAgentCompleteBanner, showProgressBar } from './banner';

showAgentStartBanner('My Agent', 'pre-commit');

// Show progress
for (let i = 0; i <= 10; i++) {
  showProgressBar(i, 10, 'Processing files');
  await processFile(i);
}

showAgentCompleteBanner('My Agent', {
  success: true,
  duration: '2.35s',
  actionsTaken: 10,
  filesModified: 5
});
```

### Web Components

#### AgentActivity (`apps/website/src/components/admin/AgentActivity.tsx`)
React component displaying agent activity dashboard.

#### Activity API (`apps/website/src/app/api/admin/agents/activity/route.ts`)
API endpoint serving agent execution data.

#### Admin Page (`apps/website/src/app/admin/agents/page.tsx`)
Admin page hosting the agent activity dashboard.

## Usage Examples

### Example 1: Creating a Monitored Agent

```typescript
import { Agent, AgentEvent } from './registry';
import { AgentLogger } from './logger';
import { AgentNotifier } from './notifications';
import { AgentStorage } from './storage';
import { showAgentStartBanner, showAgentCompleteBanner } from './banner';

const myAgent: Agent = {
  name: 'My Custom Agent',
  description: 'Does something useful',
  priority: 5,
  triggers: [
    {
      event: AgentEvent.PRE_COMMIT,
      autoRun: true
    }
  ],
  execute: async () => {
    const logger = new AgentLogger('My Custom Agent');
    const notifier = new AgentNotifier();
    const storage = new AgentStorage();
    
    const startTime = new Date();
    const executionId = `my-agent-${Date.now()}`;
    
    try {
      // Show start banner
      showAgentStartBanner('My Custom Agent', 'pre-commit');
      notifier.notifyStart('My Custom Agent', 'pre-commit');
      
      await logger.info('Starting agent execution...');
      
      // Do work
      let actionsTaken = 0;
      let filesModified = 0;
      
      await logger.info('Processing files...');
      // ... your agent logic here
      actionsTaken = 10;
      filesModified = 5;
      
      await logger.success(`Completed ${actionsTaken} actions`);
      
      // Show completion
      const stats = {
        success: true,
        duration: `${((Date.now() - startTime.getTime()) / 1000).toFixed(2)}s`,
        actionsTaken,
        filesModified
      };
      
      showAgentCompleteBanner('My Custom Agent', stats);
      notifier.notifySuccess('My Custom Agent', stats);
      
      await logger.summary({
        success: true,
        actionsTaken,
        filesModified,
        errors: 0
      });
      
      // Save to storage
      await storage.saveExecution({
        id: executionId,
        agentName: 'My Custom Agent',
        trigger: 'pre-commit',
        status: 'success',
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime.getTime(),
        actionsTaken,
        filesModified,
        errors: 0,
        fullLog: 'full log content'
      });
      
    } catch (error) {
      await logger.error('Agent failed', error);
      notifier.notifyFailure('My Custom Agent', error.message);
      
      await logger.summary({
        success: false,
        actionsTaken: 0,
        filesModified: 0,
        errors: 1
      });
      
      throw error;
    }
  }
};
```

### Example 2: Checking Agent Status in CI/CD

```bash
#!/bin/bash

# Check if any recent agent failures
npm run agents:status > /tmp/agent-status.txt

if grep -q "❌" /tmp/agent-status.txt; then
  echo "Recent agent failures detected!"
  cat /tmp/agent-status.txt
  exit 1
fi

echo "All agents healthy ✅"
```

### Example 3: Monitoring Logs in Production

```bash
# Watch for agent failures in production
watch -n 5 'npm run agents:status | grep -A 5 "Recent Executions"'

# Alert on failures
npm run agents:status | grep "❌" && echo "ALERT: Agent failure detected!"
```

## Troubleshooting

### Issue: No logs appearing

**Solution:**
1. Check logs directory exists: `ls logs/agents/`
2. If missing, create it: `mkdir -p logs/agents`
3. Verify agents are actually running: `npm run agents:list`

### Issue: Desktop notifications not showing

**Solution:**
1. Check Windows notification settings
2. Ensure `node-notifier` is installed: `npm list node-notifier`
3. Test notifications manually in Node REPL

### Issue: Web dashboard shows no data

**Solution:**
1. Verify API endpoint works: `curl http://localhost:3000/api/admin/agents/activity`
2. Check logs directory path in API route
3. Ensure logs exist: `ls logs/agents/*.log`

### Issue: Git hooks not showing enhanced output

**Solution:**
1. Verify hooks are executable: `chmod +x .husky/pre-commit .husky/pre-push`
2. Check husky is installed: `npm run prepare`
3. Test manually: `.husky/pre-commit`

### Issue: Status command shows no executions

**Solution:**
1. Run an agent to create history: `npm run agents trigger pre-commit`
2. Verify history file: `cat logs/agents/history.jsonl`
3. Check file permissions on logs directory

## Summary

You'll always know when agents are working through:

| Scenario | What You'll See |
|----------|----------------|
| **Git Commit** | Colorful terminal banner + progress bars |
| **Git Push** | Pre-deployment validation output |
| **Hourly Check** | Desktop notification (if issues found) |
| **Any Time** | Run `npm run agents:status` for full report |
| **Web Browser** | Visit `/admin/agents` for visual overview |
| **Log Analysis** | Check `logs/agents/*.log` for details |

**No agent runs silently** - they all announce themselves clearly through multiple channels!

---

For more information, see:
- [Autonomous Agent System](./AUTONOMOUS_AGENT_SYSTEM.md)
- [Pre-Push Validation Guide](./PRE_PUSH_VALIDATION_GUIDE.md)
