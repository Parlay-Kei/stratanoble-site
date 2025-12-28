# Claude Skills Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
cd C:\Dev\StrataNoble\mcp-servers\claude-skills
npm install
```

### 2. Test Skills Locally

```bash
# Test skill loading
node server.js
```

### 3. Configure Claude Desktop

Add to your Claude Desktop configuration:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "claude-skills": {
      "command": "node",
      "args": [
        "C:\\Dev\\StrataNoble\\mcp-servers\\claude-skills\\server.js"
      ]
    }
  }
}
```

### 4. Restart Claude Desktop

The skills will be available immediately after restart.

## Usage Examples

### Check for Updates

```
User: "Check if there are any skill updates available"

Claude: [Uses check_skill_updates tool]
Found 1 skill update:
- conversation-repair: update (1.0.0 → 1.0.1)

All updates have been applied automatically. ✓
```

### Load Troubleshooting Skill

```
User: "Load the call troubleshooting skill"

Claude: [Reads skill:///call-troubleshooting]
I've loaded the call troubleshooting skill. I can now help you:

- Analyze call logs for silence or failure patterns
- Diagnose Twilio and OpenAI integration issues  
- Suggest fixes for prompt or voice problems
- Automatically repair common issues

What would you like me to diagnose?
```

### Diagnose Call Issues

```
User: "Why isn't the AI responding on calls?"

Claude: [Loads Level 1 diagnostics]
Let me run quick diagnostics:

✓ WebSocket connected
✓ OpenAI session active
✗ Greeting timeout not configured
✗ No keepalive detected

Found 2 issues:

1. Missing greeting timeout - AI won't speak if caller is silent
2. No keepalive - connections may timeout after 30s

Applying auto-fixes:
✓ Added 3-second fallback greeting
✓ Added 30-second keepalive pings

Test the fix with:
node apps/website/scripts/twilio-test-call.js
```

### Optimize Conversation Quality

```
User: "Analyze conversation quality for campaign 'internet-smb'"

Claude: [Loads conversation-repair skill]
Analyzing transcripts from the last 50 calls...

Current Metrics:
- Naturalness Score: 0.65 (target: >0.8)
- Engagement Score: 0.72 ✓
- Qualified Lead Rate: 2.8% (target: >3%)

Issues Found:
1. Robotic phrases detected (14 instances)
   - "I understand" (8x)
   - "Thank you for your patience" (6x)

2. Responses too long (avg 3.5 sentences, target: 1-2)

Suggested Fixes:
1. Update prompt to be more conversational
2. Add brevity instruction
3. Switch voice from 'alloy' to 'fable' (warmer)

Would you like me to implement these changes?
```

## Deployment

### Deploy to Production

```bash
# 1. Commit changes
git add mcp-servers/claude-skills/
git commit -m "feat: add Claude skills for call troubleshooting"

# 2. Push to GitHub
git push origin main

# 3. Skills auto-update within 6 hours
# Or force immediate update via Claude:
# User: "Force update all skills"
```

### Generate Manifest Hashes

```bash
cd mcp-servers/claude-skills
node generate-manifest.js
```

This will:
1. Calculate SHA-256 hashes for all skills
2. Update `skills-manifest.json`
3. Commit changes automatically

### Test Skills Update

```bash
# Test auto-update mechanism
node test-auto-update.js

# Output:
# [skills-updater] Checking for updates...
# [skills-updater] Found 0 updates
# [skills-updater] All skills up to date ✓
```

## Skills Repository Structure

```
mcp-servers/claude-skills/
├── README.md                    # This file
├── SETUP.md                     # Setup instructions
├── AUTO_UPDATE_SYSTEM.md        # Auto-update docs
├── package.json                 # Dependencies
├── server.js                    # MCP server
├── auto-update.js               # Auto-update logic
├── skills-manifest.json         # Version tracking
├── generate-manifest.js         # Hash generator
├── test-auto-update.js          # Update tests
├── call-troubleshooting/
│   ├── SKILL.md                 # Main skill doc
│   └── fixtures/                # Test data
└── conversation-repair/
    ├── SKILL.md                 # Main skill doc
    └── fixtures/                # Test data
```

## Creating New Skills

### 1. Create Skill Directory

```bash
mkdir mcp-servers/claude-skills/my-new-skill
```

### 2. Create SKILL.md

```markdown
# My New Skill

**Version**: 1.0.0
**Last Updated**: 2025-11-16
**Auto-Update**: Enabled
**Progressive Disclosure**: Yes

## Overview

[Description of what the skill does]

## Progressive Disclosure Sections

### Level 1: Quick Fixes
[Common issues and quick solutions]

### Level 2: Deep Diagnostics
[Complex analysis and detailed fixes]

### Level 3: Advanced Troubleshooting
[Rare issues and expert-level solutions]
```

### 3. Add to Manifest

Edit `skills-manifest.json`:

```json
{
  "skills": [
    ...existing skills...,
    {
      "name": "my-new-skill",
      "version": "1.0.0",
      "path": "my-new-skill/SKILL.md",
      "hash": "sha256:pending",
      "autoUpdate": true,
      "updateInterval": "6h",
      "description": "Description of my new skill",
      "capabilities": [
        "capability-1",
        "capability-2"
      ]
    }
  ]
}
```

### 4. Generate Hash

```bash
node generate-manifest.js
```

### 5. Test Locally

```bash
# Test skill loading
node test-skill.js my-new-skill
```

### 6. Deploy

```bash
git add mcp-servers/claude-skills/
git commit -m "feat: add my-new-skill"
git push origin main
```

Skills will auto-update within 6 hours.

## Progressive Disclosure

Skills use progressive disclosure to optimize context window usage:

**Level 1**: Quick diagnostics (loaded first)
- Common issues
- Quick checks
- Fast fixes
- ~1KB context

**Level 2**: Deep diagnostics (loaded if Level 1 fails)
- Complex analysis
- Detailed diagnostics
- Advanced fixes
- ~3KB context

**Level 3**: Advanced troubleshooting (loaded for rare issues)
- Expert analysis
- Rare edge cases
- System-level fixes
- ~5KB context

This ensures Claude only loads what it needs when it needs it.

## Auto-Update Schedule

- **On Launch**: Check for updates when Claude starts
- **Every 6 Hours**: Automatic background check  
- **On Demand**: Manual trigger via `check_skill_updates` tool
- **On Push**: Updates available within 6 hours of GitHub push

## Monitoring

### Check Update Status

```
User: "Show skill update status"

Claude: [Lists current versions]
Current Skills:
- call-troubleshooting: v1.0.0 (last checked: 2 hours ago)
- conversation-repair: v1.0.1 (last checked: 2 hours ago)

Next update check: in 4 hours
```

### View Skill Capabilities

```
User: "What capabilities are available?"

Claude: [Uses list_skill_capabilities tool]
Available Skills and Capabilities:

call-troubleshooting (v1.0.0):
  call-pattern-analysis, integration-diagnostics, 
  conversation-repair, automated-fixes

conversation-repair (v1.0.1):
  prompt-optimization, voice-model-selection,
  vad-timing-optimization, quality-scoring
```

## Troubleshooting

### Skills Not Loading

```bash
# Check MCP server logs
# Windows: %APPDATA%\Claude\logs\
# Mac: ~/Library/Logs/Claude/

# Look for:
[skills-updater] Initialized with 2 skills
```

### Update Check Failing

```bash
# Test internet connection
curl https://raw.githubusercontent.com/Parlay-Kei/stratanoble-site/main/mcp-servers/claude-skills/skills-manifest.json

# Test auto-update directly
node test-auto-update.js
```

### Stale Cache

```bash
# Clear skills cache
# Windows:
del /s /q %USERPROFILE%\.claude\skills\*

# Mac/Linux:
rm -rf ~/.claude/skills/

# Restart Claude Desktop
```

### Hash Mismatch

```bash
# Regenerate hashes
node generate-manifest.js

# Commit updated manifest
git add skills-manifest.json
git commit -m "fix: update skill hashes"
git push origin main
```

## Best Practices

### 1. Version Incrementing

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### 2. Testing Before Deploy

```bash
# Always test locally first
node test-skill.js skill-name

# Verify hash
node generate-manifest.js

# Push to GitHub
git push origin main
```

### 3. Documentation

- Keep SKILL.md up to date
- Use clear progressive disclosure sections
- Include code examples
- Document all capabilities

### 4. Security

- All skills verified with SHA-256 hashes
- HTTPS only for fetching
- No arbitrary code execution
- Sandboxed skill loading

## Support

For issues or questions:
1. Check logs in `~/.claude/skills/`
2. Test with `node test-auto-update.js`
3. Review skill manifest for version mismatches
4. Clear cache and retry

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure Claude Desktop  
3. ✅ Test skills locally
4. ✅ Deploy to production
5. Monitor auto-updates
6. Create custom skills as needed
