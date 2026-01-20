# ANX Skills Server v2.0

Production-grade MCP server for skill management with progressive disclosure, analytics, and hot reload.

## Features

- **Progressive Disclosure**: 3-level detail system (quick/standard/complete)
- **Dynamic Loading**: Auto-discovers skills from centralized registry
- **Usage Analytics**: Tracks skill usage and popularity
- **Context-Aware**: Recommends relevant skills based on problem context
- **Caching**: Efficient skill content caching
- **Hot Reload**: Detects manifest changes without restart
- **Versioning**: Maintains skill version history

## Architecture

```
mcp-servers/skills-server/
├── index.js              # Main server
├── validate.js           # Skill validation utility
├── package.json          # Dependencies
├── cache/                # Skill content cache
├── analytics.json        # Usage tracking
└── server.log           # Server logs
```

Skills are loaded from: `C:\Dev\.claude-anx\skills\`

## Installation

```bash
cd C:\Dev\.claude-anx\mcp-servers\skills-server
npm install
```

## Configuration

Add to Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "anx-skills": {
      "command": "node",
      "args": ["C:\\Dev\\.claude-anx\\mcp-servers\\skills-server\\index.js"]
    }
  }
}
```

## Tools

### `get_skill`
Get skill content with progressive disclosure.

**Parameters:**
- `skill_id` (required): Skill identifier (e.g., "frontend-dev-ops")
- `level` (optional, 1-3): Detail level
  - Level 1: Quick overview (~2000 chars)
  - Level 2: Standard detail (~5000 chars)
  - Level 3: Complete reference (full content)

**Example:**
```javascript
get_skill("frontend-dev-ops", level: 2)
```

### `list_skills`
List all available skills with capabilities.

**Parameters:**
- `filter` (optional): Filter by capability or keyword

**Example:**
```javascript
list_skills(filter: "api")
```

### `recommend_skills`
Get skill recommendations based on problem context.

**Parameters:**
- `context` (required): Problem description
- `max_results` (optional, default: 3): Max recommendations

**Example:**
```javascript
recommend_skills(context: "build authentication for mobile app", max_results: 3)
```

### `get_analytics`
View usage analytics.

**Parameters:**
- `skill_id` (optional): Get analytics for specific skill

**Example:**
```javascript
get_analytics()  // Overall stats
get_analytics(skill_id: "frontend-dev-ops")  // Specific skill
```

## Progressive Disclosure

Skills can define multiple detail levels in manifest.json:

```json
{
  "skills": {
    "frontend-dev-ops": {
      "levels": {
        "1": { 
          "maxSize": 2000, 
          "description": "Quick component patterns" 
        },
        "2": { 
          "maxSize": 5000, 
          "description": "Full patterns with state and API" 
        },
        "3": { 
          "maxSize": 12000, 
          "description": "Complete reference" 
        }
      }
    }
  }
}
```

## Usage Analytics

The server tracks:
- Total skill invocations
- Detail level usage
- Most popular skills
- Last access time

Analytics persist to `analytics.json` every 10 uses.

## Validation

Validate all skills before deployment:

```bash
npm run validate
```

Checks:
- Manifest completeness
- Skill file existence
- Progressive disclosure configuration
- Minimum content requirements

## Logs

Server logs to `server.log` with structured entries:

```json
{
  "timestamp": "2025-01-09T12:00:00.000Z",
  "level": "info",
  "message": "Skill loaded: frontend-dev-ops"
}
```

## Hot Reload

The manifest is reloaded automatically when:
- Skills are added/removed
- Manifest is updated
- Server detects file changes

## Development

Start with hot reload:

```bash
npm run dev
```

## Troubleshooting

### "Cannot load manifest"
- Verify manifest path: `C:\Dev\.claude-anx\skills\manifest.json`
- Check JSON syntax with `npm run validate`

### "Skill not found"
- Ensure skill directory exists in `C:\Dev\.claude-anx\skills\`
- Check skill ID matches directory name
- Verify `SKILL.md` exists

### "Failed to load skill content"
- Check file permissions
- Verify `SKILL.md` is valid UTF-8
- Look for errors in `server.log`

## Version History

### 2.0.0 (Current)
- Complete rewrite with progressive disclosure
- Usage analytics and caching
- Context-aware recommendations
- Hot reload support
- Production-grade error handling

### 1.0.0 (Legacy)
- Basic skill serving
- Manual disclosure
- No analytics

## License

MIT
