# ANX Skills Server - Quick Reference

## Setup (One-Time)
```batch
C:\Dev\.claude-anx\mcp-servers\skills-server\setup.bat
```
Then restart Claude Desktop.

## Core Commands

### Load Skills
```javascript
// Quick overview
get_skill("frontend-dev-ops", level: 1)

// Standard detail  
get_skill("frontend-dev-ops", level: 2)

// Full reference
get_skill("frontend-dev-ops", level: 3)
```

### Discovery
```javascript
// Show all skills
list_skills()

// Filter skills
list_skills(filter: "api")

// Get recommendations
recommend_skills(context: "build authentication")
```

### Analytics
```javascript
// Overall stats
get_analytics()

// Specific skill
get_analytics(skill_id: "frontend-dev-ops")
```

## Your Skills (14 Available)

| Skill ID | Name | Primary Use |
|----------|------|-------------|
| `project-orchestrator-ops` | Project Orchestrator | Multi-agent coordination |
| `frontend-dev-ops` | Frontend Dev | React, Next.js, Mobile |
| `backend-dev-ops` | Backend Dev | APIs, Node.js, Express |
| `supabase-ops` | Supabase | Database management |
| `api-admin-ops` | API Admin | Twilio, OpenAI, Stripe |
| `github-ops` | GitHub | CI/CD, releases |
| `docs-admin-ops` | Docs Admin | Documentation |
| `codebase-admin-ops` | Codebase Admin | Code health |
| `deployment-ops` | Deployment | Vercel, Railway |
| `cold-calling-ops` | Cold Calling | Voice AI |
| `paralegal-agent-ops` | Paralegal | Contracts |
| `linkedin-ops` | LinkedIn | Automation |
| `awin-ops` | AWIN | Affiliates |
| `monitoring-ops` | Monitoring | Health checks |

## Progressive Disclosure Levels

- **Level 1** (~2KB): Quick patterns, common commands
- **Level 2** (~5KB): Full workflows, detailed examples  
- **Level 3** (~15KB): Complete reference, all APIs

## Maintenance

### Validate Skills
```batch
cd C:\Dev\.claude-anx\mcp-servers\skills-server
npm run validate
```

### Analyze Usage
```batch
npm run analyze
```

### Check Logs
```batch
type server.log
```

### View Analytics
```batch
type analytics.json
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Could not attach to MCP server" | Run setup.bat, restart Claude |
| "Skill not found" | Check spelling with `list_skills()` |
| "Failed to load manifest" | Run `npm run validate` |
| Server not starting | Check `server.log` for errors |

## File Locations

```
C:\Dev\.claude-anx\
├── skills\                      # Your skills
│   └── manifest.json           # Registry
│
├── mcp-servers\skills-server\  # Server code
│   ├── index.js               # Main server
│   ├── server.log            # Runtime logs
│   └── analytics.json        # Usage data
│
└── mcp-configs\
    └── claude-desktop-config.json  # Claude config

%APPDATA%\Claude\
└── claude_desktop_config.json      # Active config
```

## Smart Recommendations

Server auto-recommends based on keywords:

| You Say | Server Suggests |
|---------|-----------------|
| "frontend", "ui" | frontend-dev-ops |
| "api", "backend" | backend-dev-ops |
| "database" | supabase-ops |
| "deploy" | deployment-ops, github-ops |
| "contract" | paralegal-agent-ops |

## Adding New Skills

1. Create directory: `C:\Dev\.claude-anx\skills\new-skill\`
2. Add SKILL.md file
3. Update manifest.json
4. Run `npm run validate`
5. No restart needed!

## Best Practices

✅ Start with Level 1 for quick reference
✅ Use Level 2 for normal workflows  
✅ Load Level 3 only for deep dives
✅ Use `recommend_skills()` when unsure
✅ Check analytics weekly to optimize

❌ Don't load Level 3 by default
❌ Don't skip validation before deploy
❌ Don't ignore unused skills
❌ Don't modify skills without validation

## Performance Tips

- First load: ~50ms (disk read)
- Cached loads: ~1ms (memory)
- Hot reload: Automatic on manifest change
- Analytics persist every 10 uses

## Support

- Logs: `C:\Dev\.claude-anx\mcp-servers\skills-server\server.log`
- Validation: `npm run validate`
- Analysis: `npm run analyze`
- Full docs: `SETUP_GUIDE.md`
