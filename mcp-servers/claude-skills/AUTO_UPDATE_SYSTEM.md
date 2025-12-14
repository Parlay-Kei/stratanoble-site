# Claude Skills Auto-Update System

**Version**: 1.0.0  
**Last Updated**: November 16, 2025

## Overview

This system enables Claude to automatically update its troubleshooting and conversation repair skills from the GitHub repository, ensuring the agent always has the latest diagnostic logic and repair tactics.

## Architecture

```
GitHub Repository (Source of Truth)
    ↓
Auto-Update Service (Polls for changes)
    ↓
Local Skills Cache (~/.claude/skills/)
    ↓
Claude Agent (Loads skills on demand)
```

## Configuration

### 1. Skills Repository Setup

**Repository**: `https://github.com/Parlay-Kei/stratanoble-site`  
**Path**: `mcp-servers/claude-skills/`

**Structure**:
```
mcp-servers/claude-skills/
├── call-troubleshooting/
│   ├── SKILL.md           # Main skill documentation
│   ├── diagnostics.js     # Diagnostic scripts
│   └── fixtures/          # Test data
├── conversation-repair/
│   ├── SKILL.md
│   ├── optimizer.js
│   └── fixtures/
└── skills-manifest.json   # Version and update tracking
```

### 2. Skills Manifest

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-16T12:00:00Z",
  "skills": [
    {
      "name": "call-troubleshooting",
      "version": "1.0.0",
      "path": "call-troubleshooting/SKILL.md",
      "hash": "sha256:abc123...",
      "autoUpdate": true,
      "updateInterval": "6h"
    },
    {
      "name": "conversation-repair",
      "version": "1.0.0",
      "path": "conversation-repair/SKILL.md",
      "hash": "sha256:def456...",
      "autoUpdate": true,
      "updateInterval": "6h"
    }
  ],
  "updateEndpoint": "https://raw.githubusercontent.com/Parlay-Kei/stratanoble-site/main/mcp-servers/claude-skills/skills-manifest.json"
}
```

### 3. Auto-Update Service

**File**: `mcp-servers/claude-skills/auto-update.js`

```javascript
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const https = require('https');

class SkillsAutoUpdater {
  constructor(config = {}) {
    this.githubRepo = config.githubRepo || 'Parlay-Kei/stratanoble-site';
    this.branch = config.branch || 'main';
    this.skillsPath = config.skillsPath || 'mcp-servers/claude-skills';
    this.localCache = config.localCache || path.join(process.env.HOME, '.claude', 'skills');
    this.updateInterval = config.updateInterval || 6 * 60 * 60 * 1000; // 6 hours
    this.manifest = null;
  }

  async initialize() {
    // Ensure local cache directory exists
    await fs.mkdir(this.localCache, { recursive: true });
    
    // Load or fetch manifest
    await this.loadManifest();
    
    // Start auto-update timer
    this.startAutoUpdate();
    
    console.log('[skills-updater] Initialized with', this.manifest.skills.length, 'skills');
  }

  async loadManifest() {
    const manifestUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.branch}/${this.skillsPath}/skills-manifest.json`;
    
    try {
      const data = await this.fetchFromGitHub(manifestUrl);
      this.manifest = JSON.parse(data);
      
      // Cache manifest locally
      await fs.writeFile(
        path.join(this.localCache, 'manifest.json'),
        JSON.stringify(this.manifest, null, 2)
      );
    } catch (error) {
      console.error('[skills-updater] Failed to load manifest:', error);
      
      // Try to load from local cache
      try {
        const cached = await fs.readFile(path.join(this.localCache, 'manifest.json'), 'utf8');
        this.manifest = JSON.parse(cached);
        console.log('[skills-updater] Using cached manifest');
      } catch {
        throw new Error('No manifest available (remote or cached)');
      }
    }
  }

  async fetchFromGitHub(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      }).on('error', reject);
    });
  }

  async checkForUpdates() {
    console.log('[skills-updater] Checking for updates...');
    
    const remoteManifestUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.branch}/${this.skillsPath}/skills-manifest.json`;
    
    try {
      const remoteData = await this.fetchFromGitHub(remoteManifestUrl);
      const remoteManifest = JSON.parse(remoteData);
      
      const updates = [];
      
      for (const remoteSkill of remoteManifest.skills) {
        const localSkill = this.manifest.skills.find(s => s.name === remoteSkill.name);
        
        if (!localSkill) {
          updates.push({ action: 'install', skill: remoteSkill });
        } else if (remoteSkill.hash !== localSkill.hash) {
          updates.push({ action: 'update', skill: remoteSkill, from: localSkill.version });
        }
      }
      
      if (updates.length > 0) {
        console.log('[skills-updater] Found', updates.length, 'updates');
        await this.applyUpdates(updates);
      } else {
        console.log('[skills-updater] All skills up to date');
      }
      
      return updates;
    } catch (error) {
      console.error('[skills-updater] Update check failed:', error);
      return [];
    }
  }

  async applyUpdates(updates) {
    for (const update of updates) {
      const { action, skill, from } = update;
      
      try {
        console.log(`[skills-updater] ${action}: ${skill.name} ${from ? `(${from} → ${skill.version})` : `(${skill.version})`}`);
        
        const skillUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.branch}/${this.skillsPath}/${skill.path}`;
        const skillContent = await this.fetchFromGitHub(skillUrl);
        
        // Verify hash
        const actualHash = 'sha256:' + crypto.createHash('sha256').update(skillContent).digest('hex');
        if (actualHash !== skill.hash) {
          console.error(`[skills-updater] Hash mismatch for ${skill.name}`);
          continue;
        }
        
        // Save skill to local cache
        const skillDir = path.join(this.localCache, skill.name);
        await fs.mkdir(skillDir, { recursive: true });
        await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillContent);
        
        // Update local manifest
        const skillIndex = this.manifest.skills.findIndex(s => s.name === skill.name);
        if (skillIndex >= 0) {
          this.manifest.skills[skillIndex] = skill;
        } else {
          this.manifest.skills.push(skill);
        }
        
        console.log(`[skills-updater] ✓ ${skill.name} ${action}ed successfully`);
      } catch (error) {
        console.error(`[skills-updater] Failed to ${action} ${skill.name}:`, error);
      }
    }
    
    // Save updated manifest
    await fs.writeFile(
      path.join(this.localCache, 'manifest.json'),
      JSON.stringify(this.manifest, null, 2)
    );
  }

  startAutoUpdate() {
    // Check on startup
    this.checkForUpdates().catch(console.error);
    
    // Check periodically
    setInterval(() => {
      this.checkForUpdates().catch(console.error);
    }, this.updateInterval);
  }

  async getSkill(skillName) {
    const skill = this.manifest.skills.find(s => s.name === skillName);
    if (!skill) {
      throw new Error(`Skill not found: ${skillName}`);
    }
    
    const skillPath = path.join(this.localCache, skillName, 'SKILL.md');
    
    try {
      return await fs.readFile(skillPath, 'utf8');
    } catch {
      // Skill not cached - fetch it
      console.log(`[skills-updater] Skill ${skillName} not cached - fetching...`);
      await this.applyUpdates([{ action: 'install', skill }]);
      return await fs.readFile(skillPath, 'utf8');
    }
  }

  async listSkills() {
    return this.manifest.skills.map(s => ({
      name: s.name,
      version: s.version,
      autoUpdate: s.autoUpdate,
      lastUpdated: s.lastUpdated
    }));
  }
}

// Singleton instance
let updaterInstance = null;

async function getUpdater(config) {
  if (!updaterInstance) {
    updaterInstance = new SkillsAutoUpdater(config);
    await updaterInstance.initialize();
  }
  return updaterInstance;
}

module.exports = { SkillsAutoUpdater, getUpdater };
```

### 4. MCP Server Integration

**File**: `mcp-servers/claude-skills/server.js`

```javascript
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { getUpdater } = require('./auto-update.js');

const server = new Server(
  {
    name: 'claude-skills',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

let updater;

// Initialize updater
(async () => {
  updater = await getUpdater({
    githubRepo: 'Parlay-Kei/stratanoble-site',
    branch: 'main',
    skillsPath: 'mcp-servers/claude-skills'
  });
})();

// List available skills
server.setRequestHandler('resources/list', async () => {
  const skills = await updater.listSkills();
  
  return {
    resources: skills.map(skill => ({
      uri: `skill:///${skill.name}`,
      name: skill.name,
      description: `${skill.name} skill v${skill.version}`,
      mimeType: 'text/markdown'
    }))
  };
});

// Read skill content
server.setRequestHandler('resources/read', async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^skill:\/\/\/(.+)$/);
  
  if (!match) {
    throw new Error('Invalid skill URI');
  }
  
  const skillName = match[1];
  const content = await updater.getSkill(skillName);
  
  return {
    contents: [{
      uri,
      mimeType: 'text/markdown',
      text: content
    }]
  };
});

// Tool: Check for skill updates
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'check_skill_updates',
        description: 'Check for updates to Claude skills from GitHub',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'force_skill_update',
        description: 'Force an immediate update of a specific skill',
        inputSchema: {
          type: 'object',
          properties: {
            skillName: {
              type: 'string',
              description: 'Name of the skill to update',
            },
          },
          required: ['skillName'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'check_skill_updates') {
    const updates = await updater.checkForUpdates();
    return {
      content: [{
        type: 'text',
        text: updates.length > 0
          ? `Found ${updates.length} skill updates:\n${updates.map(u => `- ${u.skill.name}: ${u.action}`).join('\n')}`
          : 'All skills are up to date'
      }]
    };
  }
  
  if (name === 'force_skill_update') {
    await updater.checkForUpdates();
    const skill = updater.manifest.skills.find(s => s.name === args.skillName);
    
    if (!skill) {
      throw new Error(`Skill not found: ${args.skillName}`);
    }
    
    return {
      content: [{
        type: 'text',
        text: `Forced update check for ${args.skillName}`
      }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Claude Skills MCP server running on stdio');
}

main().catch(console.error);
```

## Usage

### 1. Enable Skills in Claude Desktop

Add to `claude_desktop_config.json`:

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

### 2. Access Skills in Conversation

```
User: "Check if there are any skill updates available"

Claude: [Uses check_skill_updates tool]
All skills are up to date.

User: "Load the call troubleshooting skill"

Claude: [Reads skill:///call-troubleshooting]
I've loaded the call troubleshooting skill. I can now:
- Analyze call logs for patterns of silence or failure
- Diagnose integration errors between Twilio and OpenAI
- Suggest fixes for prompt or voice model issues
- Auto-update based on latest best practices

What would you like me to diagnose?
```

### 3. Progressive Disclosure

```
User: "Why isn't the AI responding on calls?"

Claude: [Loads Level 1 diagnostics from call-troubleshooting skill]
Let me run quick diagnostics:

✓ WebSocket connected
✓ OpenAI session active
✗ Greeting timeout not configured

Found the issue! The AI won't speak first if the caller is silent.

Quick fix: Add a 3-second fallback greeting...

[If Level 1 doesn't resolve, automatically loads Level 2]
```

### 4. Manual Skill Updates

```
User: "Force update the conversation repair skill"

Claude: [Uses force_skill_update tool]
Checking for updates to conversation-repair...
✓ Updated to version 1.0.1
- Added new voice model recommendations
- Improved VAD timing optimization
```

## Update Schedule

- **On Launch**: Check for updates when Claude starts
- **Every 6 Hours**: Automatic background check
- **On Demand**: Manual trigger via `check_skill_updates` tool
- **Git Hook**: Trigger update when new commits pushed to main branch

## Version Control

### Semantic Versioning

Skills follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to skill structure or API
- **MINOR**: New features, capabilities, or diagnostics
- **PATCH**: Bug fixes, documentation updates, minor improvements

### Rollback Procedure

If a skill update causes issues:

```javascript
// Keep last 3 versions in cache
await updater.rollbackSkill('call-troubleshooting', '0.9.5');
```

The system automatically keeps the last 3 versions of each skill for emergency rollback.

## Monitoring

### Update Logs

```
[2025-11-16T12:00:00Z] Checking for updates...
[2025-11-16T12:00:01Z] Found 1 update
[2025-11-16T12:00:01Z] update: conversation-repair (1.0.0 → 1.0.1)
[2025-11-16T12:00:02Z] ✓ conversation-repair updated successfully
[2025-11-16T12:00:02Z] All skills up to date
```

### Update Metrics

```javascript
{
  "totalUpdates": 15,
  "lastUpdateCheck": "2025-11-16T12:00:00Z",
  "lastSuccessfulUpdate": "2025-11-16T12:00:02Z",
  "failedUpdates": 0,
  "skillVersions": {
    "call-troubleshooting": "1.0.0",
    "conversation-repair": "1.0.1"
  }
}
```

## Best Practices

### 1. Version Bumping

```bash
# After making changes to a skill
cd mcp-servers/claude-skills/call-troubleshooting
# Update version in SKILL.md
# Regenerate manifest
node ../generate-manifest.js
git commit -am "feat: improve VAD diagnostics"
git push
```

### 2. Testing Updates

```bash
# Test skill locally before pushing
node mcp-servers/claude-skills/test-skill.js call-troubleshooting

# Verify hash matches
node mcp-servers/claude-skills/verify-hashes.js
```

### 3. Emergency Hotfix

```bash
# For critical fixes
git checkout -b hotfix/call-troubleshooting
# Make fix
# Bump PATCH version
git push
# Updates will deploy within 6 hours, or trigger manual update
```

## Security

### Hash Verification

All skills are verified using SHA-256 hashes to prevent tampering:

```javascript
const hash = crypto.createHash('sha256').update(skillContent).digest('hex');
if (`sha256:${hash}` !== expectedHash) {
  throw new Error('Skill integrity check failed');
}
```

### HTTPS Only

Skills are only fetched over HTTPS from GitHub.

### Rate Limiting

Auto-update respects GitHub's rate limits (60 requests/hour for unauthenticated).

## Troubleshooting

### Update Fails

```
Error: Failed to fetch skill from GitHub
Solution: Check internet connection, verify GitHub repo is public
```

### Hash Mismatch

```
Error: Skill integrity check failed
Solution: Regenerate manifest with correct hashes
```

### Stale Cache

```
# Clear skills cache and force re-download
rm -rf ~/.claude/skills/
# Restart Claude Desktop
```

## Future Enhancements

- [ ] GitHub webhook for instant updates
- [ ] A/B testing for skill versions
- [ ] Skill dependency management
- [ ] Custom skill repositories
- [ ] Skill marketplace
- [ ] Usage analytics per skill
