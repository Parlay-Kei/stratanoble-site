# Claude Skills for Voice AI Troubleshooting

Automated diagnostic and repair system for Twilio + OpenAI voice calling operations.

## Features

✨ **Auto-Updating Skills** - Always use latest troubleshooting logic  
🔍 **Progressive Disclosure** - Load diagnostics only when needed  
🛠️ **Auto-Repair** - Automatically fix common issues  
📊 **Real-Time Monitoring** - Track call quality and conversation metrics  
🎯 **Campaign Optimization** - Improve prompts, voice models, and timing

## Available Skills

### 1. Call Troubleshooting
**Capabilities**: Call pattern analysis, integration diagnostics, automated fixes

**Diagnoses**:
- Silence patterns (no audio from AI or user)
- Premature disconnections  
- Audio quality issues
- WebSocket connection problems
- OpenAI Realtime API errors
- Twilio Media Stream issues

**Auto-Fixes**:
- Remove manual commits conflicting with VAD
- Add missing keepalive mechanisms  
- Optimize VAD settings for environment
- Fix TwiML configuration errors
- Repair greeting timeout issues

### 2. Conversation Repair
**Capabilities**: Prompt optimization, voice model selection, VAD timing, quality scoring

**Optimizes**:
- System prompts for naturalness
- Voice model selection per campaign
- VAD timing to reduce interruptions
- Response latency and quality
- Conversation engagement scores

**Auto-Repairs**:
- Robotic or repetitive responses
- AI interrupting users
- Non-responsive AI behavior  
- Voice model underperformance

## Quick Start

### 1. Install

```bash
cd C:\Dev\StrataNoble\mcp-servers\claude-skills
npm install
```

### 2. Configure Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "claude-skills": {
      "command": "node",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\claude-skills\\server.js"]
    }
  }
}
```

### 3. Restart Claude Desktop

Skills will be available immediately.

## Usage

### Basic Troubleshooting

```
User: "Why isn't the AI speaking on calls?"

Claude: [Loads call-troubleshooting skill Level 1]
Running quick diagnostics...

✓ WebSocket connected
✓ OpenAI session active  
✗ Greeting timeout not set

Found the issue! Adding 3-second fallback greeting...
✓ Fixed and redeployed

Test with: node apps/website/scripts/twilio-test-call.js
```

### Advanced Diagnostics

```
User: "Analyze calls that failed in last 24 hours"

Claude: [Loads call-troubleshooting skill Level 2]
Querying call logs...

Found 12 problematic calls:
- 8 calls: Premature disconnection (~23s duration)
- 3 calls: Silence > 10s
- 1 call: Audio format error

Pattern: All disconnections at exactly 30s → timeout issue

Diagnosis: Missing keepalive mechanism
Fix: Adding WebSocket ping every 30 seconds

Apply this fix? (yes/no)
```

### Conversation Optimization

```
User: "Optimize prompt for internet campaign"

Claude: [Loads conversation-repair skill]
Analyzing current prompt...

Issues Found:
1. Too rigid (12 instances of "you must")
2. Too long (2,400 characters)
3. No brevity instruction

Optimized Prompt:
─────────────────
You are Jake from StrataNoble's Internet division.

Your goal: Qualify leads for fiber internet services.

Quick flow:
1. Greet: "Hi! Jake from StrataNoble. Got a minute?"
2. Ask current speed/provider
3. Mention: "We offer up to 10 Gig symmetrical"
4. If interested: Schedule quote

Keep it casual and brief (1-2 sentences per response).
─────────────────

Improvements:
✓ Reduced 78% (from 2,400 to 520 characters)
✓ More conversational tone
✓ Clear brevity instruction

Would you like me to deploy this?
```

## Auto-Update System

Skills automatically update from GitHub:

- **On Launch**: Check for updates when Claude starts
- **Every 6 Hours**: Background update check
- **On Demand**: Manual `check_skill_updates` tool

### Check for Updates

```
User: "Check for skill updates"

Claude: [Uses check_skill_updates tool]
Found 1 update:
- conversation-repair: 1.0.0 → 1.0.1

Changes:
- Added new voice model recommendations
- Improved VAD timing optimization
- Fixed edge case in quality scoring

Update applied successfully ✓
```

## Progressive Disclosure

Skills load diagnostics progressively to optimize context window:

**Level 1** (Quick Diagnostics - ~1KB)
- Common issues
- Fast checks  
- Simple fixes
- Loaded first

**Level 2** (Deep Diagnostics - ~3KB)
- Complex analysis
- Detailed queries
- Advanced fixes
- Loaded if Level 1 fails

**Level 3** (Advanced - ~5KB)
- Expert analysis
- Rare edge cases
- System-level fixes
- Loaded for complex issues

This ensures Claude only loads what it needs.

## Monitoring

### Real-Time Quality Tracking

```
User: "Monitor call quality for next hour"

Claude: [Enables conversation monitor]
Monitoring active calls...

Call CA123 (15s in):
✓ Engagement: 0.82
✓ Naturalness: 0.79
⚠ User giving minimal responses

Intervention: Adjusted prompt mid-conversation
```

### Campaign Analytics

```
User: "Show conversation quality by campaign"

Claude: [Queries call analytics]
Campaign Performance (Last 7 Days):

Internet - SMB:
- Qualified Lead Rate: 3.2% ✓
- Avg Quality Score: 4.1/5 ✓
- Naturalness: 0.78
- Engagement: 0.81 ✓

VoIP - Enterprise:
- Qualified Lead Rate: 2.8% ⚠
- Avg Quality Score: 3.8/5
- Naturalness: 0.65 ⚠ (robotic phrases detected)
- Engagement: 0.75

Recommendation: Update VoIP prompt for more natural language
```

## Development

### Create New Skill

```bash
# 1. Create directory
mkdir mcp-servers/claude-skills/my-skill

# 2. Create SKILL.md
cat > mcp-servers/claude-skills/my-skill/SKILL.md << 'EOF'
# My Skill
**Version**: 1.0.0
**Auto-Update**: Enabled
**Progressive Disclosure**: Yes

## Overview
[Description]

## Level 1: Quick Fixes
[Common issues]

## Level 2: Deep Diagnostics  
[Complex analysis]
EOF

# 3. Add to manifest
# Edit skills-manifest.json

# 4. Generate hash
node generate-manifest.js

# 5. Deploy
git add mcp-servers/claude-skills/
git commit -m "feat: add my-skill"
git push origin main
```

### Test Locally

```bash
# Test skill loading
node test-skill.js call-troubleshooting

# Test auto-update
node test-auto-update.js
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│ GitHub Repository (Source of Truth)             │
│ ├── call-troubleshooting/SKILL.md              │
│ ├── conversation-repair/SKILL.md               │
│ └── skills-manifest.json                        │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Auto-Update Service                             │
│ ├── Polls every 6 hours                        │
│ ├── Verifies SHA-256 hashes                    │
│ └── Caches locally                              │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Local Skills Cache (~/.claude/skills/)          │
│ ├── call-troubleshooting/SKILL.md              │
│ ├── conversation-repair/SKILL.md               │
│ └── manifest.json                               │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Claude Agent                                    │
│ ├── Progressive disclosure                     │
│ ├── Real-time diagnostics                      │
│ └── Automated repairs                           │
└─────────────────────────────────────────────────┘
```

## Security

- ✅ SHA-256 hash verification for all skills
- ✅ HTTPS only for GitHub fetching
- ✅ No arbitrary code execution
- ✅ Sandboxed skill loading
- ✅ Version control and rollback support

## Support

**Issues**:
1. Check logs: `~/.claude/skills/`
2. Test updates: `node test-auto-update.js`
3. Clear cache: `rm -rf ~/.claude/skills/`
4. Restart Claude Desktop

**Documentation**:
- [Setup Guide](SETUP.md)
- [Auto-Update System](AUTO_UPDATE_SYSTEM.md)
- [Call Troubleshooting Skill](call-troubleshooting/SKILL.md)
- [Conversation Repair Skill](conversation-repair/SKILL.md)

## Metrics

Track skill effectiveness:
- **MTTR**: Mean Time To Resolution < 5 minutes
- **Auto-Fix Success**: > 80%
- **False Positives**: < 5%
- **Call Success Rate**: > 95%
- **Quality Score**: > 4.0/5.0

## Roadmap

- [ ] GitHub webhook for instant updates
- [ ] A/B testing for skill versions  
- [ ] Skill dependency management
- [ ] Custom skill repositories
- [ ] Usage analytics dashboard
- [ ] Multi-language support

## License

MIT

## Credits

Created by StrataNoble for DSLV Platform  
Powered by Anthropic Claude and MCP SDK
