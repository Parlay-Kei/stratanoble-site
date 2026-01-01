# Global Agent System Setup Guide

## Overview

This guide explains the autonomous agent system configured for your development environment across Cursor with Claude Code, OpenAI Codex, and Amazon Q.

---

## Architecture

```
C:\Dev\.claude\                     # Global configuration
├── agents/                         # Agent definitions
│   ├── documentation-admin.md      # DocuForge - Documentation management
│   └── codebase-admin.md          # CodeKeeper - Codebase management
├── skills/                         # Skill definitions (MCP-loadable)
│   ├── manifest.json              # Skill registry and metadata
│   ├── docs-admin-ops/
│   │   └── SKILL.md               # Documentation operations skill
│   └── codebase-admin-ops/
│       └── SKILL.md               # Codebase operations skill
└── settings.local.json            # Local settings

C:\Users\MrSte\
├── .cursorrules                   # Global Cursor rules for all agents
└── AppData\Roaming\
    ├── Cursor\mcp_packages\
    │   └── mcp.json               # Cursor MCP configuration
    └── Claude\
        └── claude_desktop_config.json  # Claude Desktop MCP configuration
```

---

## What's Configured

### 1. Global Cursor Rules (`~/.cursorrules`)

Provides all AI agents in Cursor with:
- Knowledge of available admin agents
- Skill loading protocols
- Autonomous operation rules
- Multi-agent coordination patterns
- Code quality standards
- Safety protocols

### 2. MCP Servers

Both Cursor and Claude Desktop now have:
- **claude-skills**: Skill loading and management
- **filesystem**: Full C:\Dev access
- **supabase**: Database operations (Cursor only)

### 3. Admin Agents

**DocuForge (documentation-admin)**
- Documentation auditing
- Redundancy detection
- File consolidation
- README synchronization
- CHANGELOG management

**CodeKeeper (codebase-admin)**
- Project structure auditing
- Configuration management
- Dependency analysis
- File cleanup
- Pre-production audits

### 4. Skills System

Skills are loaded on-demand at 3 levels:
- **Level 1** (0-2KB): Quick reference, common fixes
- **Level 2** (2-5KB): Detailed workflows
- **Level 3** (5KB+): Complete documentation

---

## How to Use

### In Cursor (Claude Code, Codex, Amazon Q)

The `.cursorrules` file provides context to all agents. Simply ask:

```
"Audit the documentation in this project"
→ Agent loads docs-admin-ops skill, runs audit

"Clean up unused files and dependencies"
→ Agent loads codebase-admin-ops skill, performs cleanup

"Prepare this project for production"
→ Agent loads multiple skills, runs pre-prod checklist
```

### Trigger Phrases

| Task | Trigger Phrases |
|------|-----------------|
| Doc Audit | "audit docs", "check documentation", "review markdown files" |
| Doc Consolidation | "consolidate", "merge docs", "combine files" |
| Codebase Cleanup | "clean up", "remove unused", "organize project" |
| Dependency Check | "check dependencies", "unused packages", "npm audit" |
| Pre-Production | "pre-prod", "ready for production", "deployment check" |
| Config Audit | "check configs", "validate env", "audit settings" |

### MCP Skill Commands

When using Claude directly, you can call skills via MCP:

```typescript
// List available skills
claude-skills:list_skill_capabilities

// Load a skill at specific level
claude-skills:load_skill({ skillName: "docs-admin-ops", level: 2 })

// Smart load based on context
claude-skills:smart_load_skill({ 
  skillName: "codebase-admin-ops", 
  urgency: "high", 
  complexity: "moderate" 
})

// Load skills for problem type
claude-skills:load_skills_for_problem({ problemType: "pre-production" })
```

---

## Restart Required

After this setup, restart:
1. **Cursor** - To reload MCP configuration
2. **Claude Desktop** - To reload MCP configuration

---

## Adding Project-Specific Rules

For project-specific overrides, create `.cursorrules` in the project root:

```markdown
# Project-Specific Rules

## Framework
This is a React + Vite + TypeScript project using Tailwind CSS.

## Additional Agents
[Add project-specific agent instructions]

## Custom Standards
[Add project-specific coding standards]
```

---

## Adding New Skills

1. Create skill directory in `C:\Dev\.claude\skills\<skill-name>\`
2. Add `SKILL.md` with Level 1/2/3 sections
3. Update `manifest.json` with skill metadata
4. Restart Cursor/Claude to reload

---

## Troubleshooting

### Skills Not Loading

1. Check `C:\Dev\.claude\skills\manifest.json` exists
2. Verify skill directory has `SKILL.md`
3. Restart Cursor/Claude Desktop
4. Check MCP server logs

### Cursor Rules Not Applied

1. Verify `C:\Users\MrSte\.cursorrules` exists
2. Check file permissions
3. Restart Cursor completely

### MCP Connection Failed

1. Check `mcp.json` syntax (valid JSON)
2. Verify Node.js is installed
3. Check file paths use `\\` not `/`
4. Look at Cursor/Claude logs for errors

---

## File Locations Reference

| File | Purpose |
|------|---------|
| `C:\Dev\.claude\skills\` | Global skills directory |
| `C:\Dev\.claude\agents\` | Global agent definitions |
| `C:\Users\MrSte\.cursorrules` | Global Cursor rules |
| `C:\Users\MrSte\AppData\Roaming\Cursor\mcp_packages\mcp.json` | Cursor MCP config |
| `C:\Users\MrSte\AppData\Roaming\Claude\claude_desktop_config.json` | Claude MCP config |
| `C:\Dev\DSLV\agents\production-ops\src\mcp\skills-server.js` | MCP skills server |

---

## Next Steps

1. **Restart Cursor and Claude Desktop**
2. **Test skill loading**: Ask "list available skills"
3. **Run an audit**: "Audit the documentation in Direct-Cuts project"
4. **Add more skills**: Copy from project `skills/` folders to global

---

*Setup completed: November 28, 2025*
