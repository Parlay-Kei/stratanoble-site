# Global Agent Access Setup

**Date:** December 26, 2025  
**Status:** ✅ Complete

## Overview

All consolidated coding agents and skills from `StrataNoble` have been set up for **global access** across all projects in `C:\Dev`. Agents can now be invoked from any project without needing to copy them individually.

## Global Agent Locations

### Agents
```
C:\Users\[YourUsername]\.claude\agents\
```

### Skills
```
C:\Users\[YourUsername]\.claude\skills\
```

## What Was Deployed

### Agents (124 total)
- **StrataNoble Core Agents** (91 agents)
  - All main agents from `.claude/agents/`
  - Organized by department (design, engineering, marketing, etc.)
  - Includes specialized agents (documentation-admin, github-admin, etc.)

- **Consolidated Agents** (33 unique agents from other projects)
  - Direct-Cuts: 11 agents (auth-flow, barber-portal, etc.)
  - DSLV: 12 agents (production ops, guides, etc.)
  - Household_Ticket: 6 agents (build system agents)
  - Konjode: 1 agent (DocuSmith)
  - msaudreys-house: 4 agents (content, QA, Shopify, theme)
  - .claude (root): 3 agents (backend-dev, frontend-dev, project-orchestrator)

### Skills (21 total)
- **MCP Server Skills** (6 skills)
  - Auto-update system
  - Deployment summary
  - Call troubleshooting
  - Conversation repair
  - And more...

- **Consolidated Skills** (15 unique skills)
  - Direct-Cuts: 4 skills (design-copilot, docs-admin-ops, etc.)
  - DSLV: 10 skills (analytics-ops, carrier-integration-ops, etc.)

## How It Works

Claude Desktop/Code automatically loads agents from:
1. **Global location:** `~/.claude/agents/` (available to all projects)
2. **Project-specific:** `.claude/agents/` (project-specific agents)

When you invoke an agent in any project, Claude will:
1. First check the project's `.claude/agents/` directory
2. Then check the global `~/.claude/agents/` directory
3. Use the first matching agent found

## Using Global Agents

### From Any Project

Simply mention the agent name in your conversation:

```
"Use the documentation-admin agent to audit this project's docs"
"Run the github-admin agent to check repository status"
"Invoke the codebase-admin agent to analyze the codebase"
```

### Available Agent Categories

#### Core Development
- `documentation-admin` - Documentation management and auditing
- `codebase-admin` - Codebase analysis and management
- `github-admin` - GitHub repository management
- `supabase-admin` - Supabase database management

#### Engineering
- `backend-architect` - Backend system design
- `frontend-developer` - Frontend development
- `devops-automator` - DevOps automation
- `ai-engineer` - AI/ML integration

#### Design
- `ui-designer` - UI design
- `ux-researcher` - UX research
- `brand-guardian` - Brand consistency

#### Testing & QA
- `web-automation-tester` - Web testing automation
- `backend-qa-automation-tester` - Backend QA
- `test-writer-fixer` - Test generation

#### Project-Specific Agents
- `auth-flow-agent` (from Direct-Cuts)
- `barber-portal` (from Direct-Cuts)
- `build-coordinator` (from Household_Ticket)
- `DocuSmith` (from Konjode)
- And many more...

## Keeping Agents Updated

### Manual Sync

Run the sync script to update global agents from StrataNoble:

```powershell
cd C:\Dev\StrataNoble
powershell -ExecutionPolicy Bypass -File setup-global-agents.ps1
```

### Automatic Sync (Recommended)

Add to your project's build/deployment scripts or run periodically:

```powershell
# Add to your CI/CD or run weekly
.\setup-global-agents.ps1
```

## Directory Structure

```
C:\Users\[YourUsername]\.claude\
├── agents\
│   ├── [All StrataNoble core agents]
│   ├── design\
│   ├── engineering\
│   ├── marketing\
│   ├── product\
│   ├── testing\
│   └── consolidated\
│       ├── Direct-Cuts\
│       ├── DSLV\
│       ├── Household_Ticket\
│       ├── Konjode\
│       ├── msaudreys-house\
│       └── .claude\
└── skills\
    ├── mcp-servers\
    └── consolidated\
        ├── Direct-Cuts\
        └── DSLV\
```

## Verification

### Check Global Agents

```powershell
# List all global agents
Get-ChildItem -Path "$env:USERPROFILE\.claude\agents" -Recurse -Filter "*.md" | Select-Object Name, Directory

# Count agents
(Get-ChildItem -Path "$env:USERPROFILE\.claude\agents" -Recurse -Filter "*.md").Count
```

### Test Agent Access

1. Open any project in `C:\Dev`
2. Open Claude Desktop/Code
3. Try invoking an agent:
   ```
   "Use the documentation-admin agent"
   ```
4. Claude should recognize and use the agent

## Troubleshooting

### Agents Not Loading

1. **Restart Claude Desktop/Code**
   - Agents are loaded at startup
   - Close and reopen the application

2. **Check File Permissions**
   ```powershell
   # Ensure you have read access
   Test-Path "$env:USERPROFILE\.claude\agents"
   ```

3. **Verify Agent Files**
   ```powershell
   # Check if agents exist
   Get-ChildItem -Path "$env:USERPROFILE\.claude\agents" -Filter "*.md" | Select-Object -First 5
   ```

### Agent Not Found

- Check if the agent exists in the global directory
- Verify the agent name spelling
- Some agents may be project-specific (check project's `.claude/agents/`)

### Sync Issues

- Ensure StrataNoble's `.claude/agents/` directory is accessible
- Run sync script with administrator privileges if needed
- Check for file locks or permission issues

## Benefits

✅ **Single Source of Truth** - All agents managed in StrataNoble  
✅ **Global Access** - Available from any project  
✅ **Easy Updates** - Sync script keeps everything current  
✅ **No Duplication** - One copy, accessible everywhere  
✅ **Organized** - Clear structure with consolidated agents separated  

## Next Steps

1. **Restart Claude Desktop/Code** to load the new agents
2. **Test agent invocation** from a different project
3. **Set up periodic sync** (weekly/monthly) to keep agents updated
4. **Explore consolidated agents** from other projects

## Maintenance

### Adding New Agents

1. Add agent to `StrataNoble/.claude/agents/`
2. Run `setup-global-agents.ps1` to sync
3. Restart Claude Desktop/Code

### Updating Existing Agents

1. Update agent in `StrataNoble/.claude/agents/`
2. Run sync script
3. Restart Claude Desktop/Code

### Removing Agents

1. Remove from `StrataNoble/.claude/agents/`
2. Run sync script (will preserve existing global copy)
3. Manually remove from global directory if needed

---

**Setup Complete** ✅  
All agents are now globally accessible from any project in `C:\Dev`!

