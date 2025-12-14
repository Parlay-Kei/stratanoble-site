# Agent Monitoring Quick Reference

## 🚀 Quick Commands

```bash
# Check agent status
npm run agents:status

# List all agents
npm run agents:list

# Watch logs in real-time (Unix/Git Bash)
npm run agents:logs

# Manually trigger agents
npm run agents trigger pre-commit
npm run agents trigger pre-push
```

## 📊 Where to Find Information

| What You Need | Where to Look |
|---------------|---------------|
| **Real-time status** | Run `npm run agents:status` |
| **Web dashboard** | Visit `/admin/agents` in browser |
| **Detailed logs** | Check `logs/agents/*.log` files |
| **Execution history** | View `logs/agents/history.jsonl` |
| **Desktop alerts** | Windows notifications (automatic) |

## 🎯 Common Scenarios

### See what agents did during last commit
```bash
# View most recent log
ls -lt logs/agents/*.log | head -1 | awk '{print $NF}' | xargs cat
```

### Check for recent failures
```bash
npm run agents:status | grep "❌"
```

### Monitor agents in real-time
```bash
# Terminal 1: Watch status
watch -n 5 npm run agents:status

# Terminal 2: Watch logs
tail -f logs/agents/*.log
```

## 📁 File Locations

- **Agent scripts**: `scripts/agents/`
- **Log files**: `logs/agents/`
- **Web dashboard**: `apps/website/src/app/admin/agents/`
- **API endpoint**: `apps/website/src/app/api/admin/agents/activity/`
- **Git hooks**: `.husky/pre-commit`, `.husky/pre-push`

## 🔧 Component Overview

```
Agent Monitoring System
│
├── Console Output (Real-time)
│   ├── logger.ts - Colored logging
│   └── banner.ts - Visual banners
│
├── Desktop Notifications
│   └── notifications.ts - Toast alerts
│
├── Web Dashboard
│   ├── AgentActivity.tsx - React component
│   ├── route.ts - API endpoint
│   └── page.tsx - Admin page
│
├── Storage & History
│   └── storage.ts - Log management
│
├── CLI Tools
│   └── status.ts - Status viewer
│
└── Git Hooks
    ├── pre-commit - Commit validation
    └── pre-push - Deployment validation
```

## 💡 Tips

1. **First run**: No data until an agent executes
2. **Web dashboard**: Auto-refreshes every 10 seconds
3. **Notifications**: Configurable in Windows settings
4. **Logs**: Automatically cleaned up after 30 days (configurable)
5. **Git hooks**: Enhanced with visual feedback

## 🔍 Troubleshooting Quick Fixes

```bash
# No logs directory?
mkdir -p logs/agents

# Hooks not working?
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push

# Dependencies missing?
npm install

# Test the system?
npm run agents trigger pre-commit
```

## 📖 Full Documentation

See [AGENT_VISIBILITY_GUIDE.md](./AGENT_VISIBILITY_GUIDE.md) for complete details.
