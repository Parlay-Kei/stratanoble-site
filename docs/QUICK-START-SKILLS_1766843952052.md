# Claude Skills System - Quick Start Guide

**Get started with auto-updating Claude Skills in 5 minutes**

---

## 🚀 Installation (3 Steps)

### Step 1: Navigate to Production Ops
```bash
cd /c/Dev/DSLV/agents/production-ops
```

### Step 2: Verify Dependencies
```bash
npm install
```

Already installed:
- ✅ `@modelcontextprotocol/sdk`
- ✅ `axios` (for GitHub fetching)
- ✅ `crypto` (for SHA-256)

### Step 3: Generate Initial Manifest
```bash
cd /c/Dev/DSLV
node agents/production-ops/src/skills/manifest-generator.js \
  .claude/skills \
  agents/production-ops/src/data/skills-manifest.json
```

**Result**: Manifest with 5 skills and SHA-256 hashes created at:
`agents/production-ops/src/data/skills-manifest.json` (6.4KB)

---

## 🎛️ Configure Claude Desktop

### Option 1: Edit Config File Directly

**Location**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:
```json
{
  "mcpServers": {
    "claude-skills": {
      "command": "node",
      "args": ["C:\\Dev\\DSLV\\agents\\production-ops\\src\\mcp\\skills-server.js"]
    }
  }
}
```

### Option 2: Use Full Config

If you have other MCP servers:
```json
{
  "mcpServers": {
    "claude-skills": {
      "command": "node",
      "args": ["C:\\Dev\\DSLV\\agents\\production-ops\\src\\mcp\\skills-server.js"]
    },
    "datasolutions-prodops": {
      "command": "node",
      "args": ["C:\\Dev\\DSLV\\agents\\production-ops\\src\\mcp\\server.js"]
    }
  }
}
```

### Step: Restart Claude Desktop

Close and reopen Claude Desktop for changes to take effect.

---

## ✅ Verification (Test the System)

### Test 1: List Available Skills
In Claude Desktop, ask:
```
List all available Claude Skills
```

**Expected Response**: 5 skills (cold-calling-ops, deployment-ops, environment-ops, monitoring-ops, testing-ops)

### Test 2: Load a Skill
```
Load the cold-calling-ops skill at level 1
```

**Expected Response**: Quick overview of cold calling operations (0-2KB)

### Test 3: Search Skills
```
Search for skills related to "health check"
```

**Expected Response**: cold-calling-ops and monitoring-ops skills

### Test 4: Check for Updates
```
Check if there are any skill updates available from GitHub
```

**Expected Response**: Update status and list of available updates

---

## 🎯 Common Use Cases

### Use Case 1: Quick Troubleshooting
```
I need to troubleshoot call failures. Load the appropriate skills.
```

**What Happens**:
- System loads `cold-calling-ops` skill at smart level
- Provides quick fixes and diagnostics
- Auto-selects appropriate detail level

### Use Case 2: Deployment Preparation
```
Load deployment skills at detailed level for pre-deployment validation
```

**What Happens**:
- Loads `deployment-ops` at Level 2 (Detailed)
- Shows full deployment workflows
- Includes validation checklists

### Use Case 3: Complete Documentation
```
I need the complete cold calling documentation for architecture review
```

**What Happens**:
- Loads `cold-calling-ops` at Level 3 (Complete)
- Full 12.5KB documentation
- All workflows, metrics, best practices

---

## 🔄 Enable Auto-Updates

### Start Auto-Update Polling

In Claude Desktop:
```
Start the auto-update system for skills
```

**What Happens**:
- System checks GitHub every 6 hours
- Downloads updated skills automatically
- Verifies with SHA-256 hashes
- No interruption to service

### Check Update Status
```
What's the status of the skills auto-update system?
```

**Shows**:
- Is polling active?
- When was last check?
- How many skills loaded?
- Cache directory status

---

## 📊 Available Skills

### 1. cold-calling-ops (12.5KB)
**Use For**: Call failures, OpenAI issues, Twilio problems, health checks

**Quick Commands**:
- "Check cold calling system health"
- "Diagnose why calls are failing"
- "Run automated test calls"

### 2. deployment-ops (11.9KB)
**Use For**: Deployments, rollbacks, staging validation

**Quick Commands**:
- "Prepare for production deployment"
- "Create deployment checklist"
- "How do I rollback if deployment fails?"

### 3. environment-ops (3.0KB)
**Use For**: Environment variables, secrets, configuration sync

**Quick Commands**:
- "Sync environment variables across services"
- "Check for missing env vars"
- "Validate configuration"

### 4. monitoring-ops (1.1KB)
**Use For**: System monitoring, alerting, metrics

**Quick Commands**:
- "Set up monitoring for production"
- "Configure alerts"
- "View system metrics"

### 5. testing-ops (1.1KB)
**Use For**: Test calls, validation, smoke tests

**Quick Commands**:
- "Run 10 test calls"
- "Validate system after deployment"
- "Execute smoke tests"

---

## 🛠️ CLI Quick Reference

### Skill Management
```bash
# List all skills
cd /c/Dev/DSLV/agents/production-ops
node src/skills/progressive-disclosure.js list

# Load specific skill at level 1
node src/skills/progressive-disclosure.js load cold-calling-ops 1

# Search for skills
node src/skills/progressive-disclosure.js search "deployment"

# Get statistics
node src/skills/progressive-disclosure.js stats
```

### Updates
```bash
# Check for updates
node src/skills/github-fetcher.js check

# Force update now
node src/skills/github-fetcher.js update

# Start auto-update polling
node src/skills/github-fetcher.js poll
```

### Regenerate Manifest
```bash
cd /c/Dev/DSLV
node agents/production-ops/src/skills/manifest-generator.js
```

---

## 🚨 Troubleshooting

### Problem: MCP Server Not Showing in Claude Desktop

**Solution**:
1. Check config path is correct: `C:\Dev\DSLV\agents\production-ops\src\mcp\skills-server.js`
2. Use double backslashes: `C:\\Dev\\DSLV\\...`
3. Restart Claude Desktop completely
4. Check Claude logs: `%APPDATA%\Claude\logs\`

### Problem: "No manifest available" Error

**Solution**:
```bash
cd /c/Dev/DSLV
node agents/production-ops/src/skills/manifest-generator.js \
  .claude/skills \
  agents/production-ops/src/data/skills-manifest.json
```

### Problem: GitHub Fetch Fails

**Solution**:
- System automatically uses cached skills
- No action needed - skills still work offline
- Will retry on next poll cycle (6 hours)

### Problem: Skills Not Updating

**Solution**:
```bash
# Force immediate update
cd /c/Dev/DSLV/agents/production-ops
node src/skills/github-fetcher.js update

# Check fetcher status
node -e "import('./src/skills/github-fetcher.js').then(m => { const f = new m.GitHubSkillsFetcher(); console.log(f.getStatus()); })"
```

---

## 💡 Pro Tips

### Tip 1: Start with Smart Loading
Let the system choose the right detail level:
```
Smart load cold-calling-ops skill for a critical OpenAI connection issue
```

### Tip 2: Upgrade Incrementally
Start with Level 1, upgrade if needed:
```
Load deployment-ops at level 1
[if more detail needed]
Upgrade deployment-ops to level 2
```

### Tip 3: Search Before Loading
Find the right skill first:
```
Search skills for "health monitoring"
[then]
Load the monitoring-ops skill
```

### Tip 4: Use Problem-Based Loading
Load skills by problem type:
```
Load skills for troubleshooting call failures
```

### Tip 5: Monitor System Health
Regularly check stats:
```
Show me skill system statistics
```

---

## 📈 What to Expect

### Performance
- **Skill loading**: <100ms (cached), <500ms (GitHub)
- **Update checks**: ~500ms
- **Full updates**: 2-3 seconds for all skills
- **Memory usage**: ~50KB for all skills at Level 1

### Auto-Updates
- **Frequency**: Every 6 hours
- **Bandwidth**: ~30KB per update cycle
- **Verification**: SHA-256 on every download
- **Rollback**: Automatic on verification failure

### Success Rates
- **Target auto-fix rate**: >80%
- **MTTR improvement**: 30 min → <5 min
- **Call success rate**: 85% → >95%

---

## ✅ Quick Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Manifest generated (6.4KB file exists)
- [ ] Claude Desktop config updated
- [ ] Claude Desktop restarted
- [ ] Skills list shows 5 skills
- [ ] Can load at least one skill
- [ ] Search works
- [ ] Auto-update started (optional)

---

## 📚 Next Steps

1. **Explore Skills**: Try loading each skill at different levels
2. **Enable Auto-Updates**: Keep skills fresh automatically
3. **Test Workflows**: Try real troubleshooting scenarios
4. **Monitor Usage**: Check stats regularly
5. **Read Full Docs**: See [CLAUDE-SKILLS-SYSTEM.md](CLAUDE-SKILLS-SYSTEM.md) for complete details

---

## 🤝 Need Help?

**Documentation**:
- Full system docs: [CLAUDE-SKILLS-SYSTEM.md](CLAUDE-SKILLS-SYSTEM.md)
- Production ops: [AGENT.md](AGENT.md)
- Skill files: `/c/Dev/DSLV/.claude/skills/*/SKILL.md`

**Common Issues**:
- Manifest generation problems → Check paths and permissions
- GitHub fetch errors → System uses cache automatically
- MCP server issues → Verify config and restart Claude Desktop

---

**Status**: ✅ System is production-ready!

**Last Updated**: 2025-11-18
