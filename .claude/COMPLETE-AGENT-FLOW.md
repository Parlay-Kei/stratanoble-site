# ANX Complete Agent Architecture & Flow
**Version:** 3.0
**Updated:** January 4, 2026
**Owner:** Steve @ ANX

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        C:\Dev\.claude-anx\                              │
│                     (UNIVERSAL AGENT REPOSITORY)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   AGENTS     │  │   SKILLS     │  │ MCP SERVERS  │  │  COMMANDS   │ │
│  │  (41 total)  │  │  (20 total)  │  │  (4 total)   │  │  (custom)   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │        │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
              │   DSLV    │  │ StrataNoble│  │Direct-Cuts│  ... (12 projects)
              │  .claude/ │  │  .claude/  │  │  .claude/ │
              │ (symlink) │  │ (symlink)  │  │ (junction)│
              └───────────┘  └────────────┘  └───────────┘
```

---

## Directory Structure

```
C:\Dev\
├── .claude-anx\                          ← MASTER REPOSITORY
│   │
│   ├── agents\                           ← 41 AGENT DEFINITIONS
│   │   ├── *.md                          ← Prompt-based agents
│   │   ├── github-ops\                   ← Node.js MCP agent
│   │   │   ├── src\
│   │   │   │   ├── agent.js              ← Main orchestrator
│   │   │   │   ├── mcp\server.js         ← MCP server
│   │   │   │   ├── cli\index.js          ← CLI interface
│   │   │   │   └── tools\                ← API tools
│   │   │   ├── package.json
│   │   │   └── .env
│   │   ├── design-agent\                 ← TypeScript agent
│   │   ├── figma-mcp\                    ← Figma MCP agent
│   │   └── kfc\                          ← Spec workflow agents
│   │
│   ├── skills\                           ← 20 SKILL MODULES
│   │   ├── api-admin-ops\
│   │   ├── backend-dev-ops\
│   │   ├── frontend-dev-ops\
│   │   ├── github-ops\
│   │   ├── supabase-ops\
│   │   ├── project-orchestrator-ops\
│   │   └── [14 more...]
│   │
│   ├── commands\                         ← CUSTOM COMMANDS
│   │   └── youtube-transcript.md
│   │
│   ├── mcp-configs\                      ← MCP CONFIGURATIONS
│   │   ├── google-drive-mcp.json
│   │   └── notion-mcp.json
│   │
│   ├── settings\                         ← SHARED SETTINGS
│   │   └── kfc-settings.json
│   │
│   ├── scripts\                          ← UTILITY SCRIPTS
│   │   └── project-setup\
│   │       ├── setup-all-junctions.bat
│   │       ├── setup-new-project.bat
│   │       └── auto-monitor.py
│   │
│   ├── specs\                            ← TECHNICAL SPECS
│   ├── analysis\                         ← ANALYSIS REPORTS
│   ├── autonomous-tasks\                 ← TASK QUEUES
│   │
│   ├── manifest.json                     ← CENTRAL REGISTRY
│   ├── mcp.json                          ← MCP SERVER CONFIG
│   ├── settings.json                     ← GLOBAL SETTINGS
│   ├── settings.local.json               ← LOCAL OVERRIDES
│   └── README.md
│
├── DSLV\.claude                          → symlink to .claude-anx
├── StrataNoble\.claude                   → symlink to .claude-anx
├── Direct-Cuts\.claude                   → junction to .claude-anx
└── [other projects]\.claude              → linked to .claude-anx
```

---

## Agents by Category (41 Total)

### Development (9 agents)
| Agent | File | Purpose |
|-------|------|---------|
| Backend Developer | `backend-dev.md` | Node.js, APIs, databases |
| Frontend Developer | `frontend-dev.md` | React, Next.js, Tailwind |
| Flutter SDK Ops | `flutter-sdk-ops.md` | Mobile development |
| Auth Flow | `auth-flow-agent.md` | Authentication flows |
| UI/UX Design Virtuoso | `ui-ux-design-virtuoso.md` | Premium UI design |
| Design Agent | `design-agent/` | Component analysis (MCP) |
| Figma MCP | `figma-mcp/` | Figma integration (MCP) |
| Codebase Admin | `codebase-admin.md` | Repository structure |
| Code Quality Testing | `code-quality-testing.md` | Testing standards |

### Operations & Infrastructure (9 agents)
| Agent | File | Purpose |
|-------|------|---------|
| GitHub Admin | `github-admin.md` | Repository management |
| GitHub Ops | `github-ops/` | GitHub MCP server (Node.js) |
| Infra Deployment | `infra-deployment-specialist.md` | Cloud deployments |
| CLI Deployment Monitor | `cli-deployment-monitor.md` | CI/CD monitoring |
| Network Operations | `network-ops.md` | CDN, DNS, load balancing |
| Supabase Admin | `supabase-admin.md` | Database management |
| Ops Monitor | `ops-monitor.md` | System health |
| File Monitor Ops | `file-monitor-ops.md` | File watching |
| Claude Skills Manager | `claude-skills-manager.md` | Skills management |

### Quality Assurance (4 agents)
| Agent | File | Purpose |
|-------|------|---------|
| Backend QA | `backend-qa-automation-tester.md` | API testing |
| Pre-Deployment Auditor | `pre-deployment-quality-auditor.md` | Release readiness |
| Web Automation Tester | `web-automation-tester.md` | E2E testing |
| Responsive Audit | `responsive-audit-agent.md` | Viewport testing |

### Security & Compliance (3 agents)
| Agent | File | Purpose |
|-------|------|---------|
| Security Auditor | `security-auditor.md` | OWASP, vulnerability scanning |
| Compliance Officer | `compliance-officer.md` | SOC 2, GDPR, CCPA |
| SaaS Security | `saas-security-auditor.md` | SaaS-specific security |

### Project Management (4 agents)
| Agent | File | Purpose |
|-------|------|---------|
| Project Orchestrator | `project-orchestrator.md` | Multi-agent coordination |
| Orchestrator Agent | `orchestrator-agent.md` | Sprint management |
| Documentation Admin | `documentation-admin.md` | Docs maintenance |
| Spec Workflow (KFC) | `kfc/*.md` | Requirements → Design → Tasks |

### Data & Analytics (2 agents)
| Agent | File | Purpose |
|-------|------|---------|
| Supabase Admin | `supabase-admin.md` | Data engineering |
| UX Research Analyst | `ux-research-analyst.md` | User analytics |

### Marketing & Growth (4 agents)
| Agent | File | Purpose |
|-------|------|---------|
| Social Media Manager | `social-media-manager.md` | Content strategy |
| Geofencing Marketing | `geofencing-marketing-agent.md` | Location-based marketing |
| Ambassador Program | `ambassador-program-agent.md` | Referral programs |
| Loyalty Retention | `loyalty-retention-agent.md` | Customer retention |

### Platform Operations (8 agents)
| Agent | File | Purpose |
|-------|------|---------|
| Customer Journey | `customer-journey.md` | Booking flow testing |
| Barber Portal | `barber-portal.md` | Barber dashboard testing |
| Checkr Verification | `checkr-verification-agent.md` | Background checks |
| Training Module | `training-module-agent.md` | Learning management |
| Earnings Payouts | `earnings-payouts-agent.md` | Payment processing |
| Subscription Agent | `subscription-agent.md` | Recurring billing |
| Payments Audit | `payments-audit-agent.md` | Stripe integration |
| Realtime Audit | `realtime-audit-agent.md` | WebSocket testing |
| Voice AI Calling | `voice-ai-calling-ops.md` | Twilio/OpenAI calling |
| Product Upsell | `product-upsell-agent.md` | Sales automation |

---

## Skills by Category (20 Total)

| Skill | Directory | Related Agent |
|-------|-----------|---------------|
| API Admin Ops | `api-admin-ops/` | Voice AI, integrations |
| Backend Dev Ops | `backend-dev-ops/` | Backend Developer |
| Frontend Dev Ops | `frontend-dev-ops/` | Frontend Developer |
| GitHub Ops | `github-ops/` | GitHub Admin |
| Supabase Ops | `supabase-ops/` | Supabase Admin |
| Codebase Admin Ops | `codebase-admin-ops/` | Codebase Admin |
| Deployment Ops | `deployment-ops/` | Infra Deployment |
| Monitoring Ops | `monitoring-ops/` | Ops Monitor |
| Testing Ops | `testing-ops/` | QA Agents |
| Docs Admin Ops | `docs-admin-ops/` | Documentation Admin |
| Environment Ops | `environment-ops/` | Infrastructure |
| Project Orchestrator Ops | `project-orchestrator-ops/` | Orchestrator |
| Cold Calling Ops | `cold-calling-ops/` | Voice AI |
| LinkedIn Ops | `linkedin-ops/` | Social Media |
| Paralegal Agent Ops | `paralegal-agent-ops/` | Contract drafting |
| Security Ops | `security-ops.md` | Security Auditor |
| Cost Risk Analyzer | `cost-risk-analyzer/` | Financial analysis |
| Funding Narrative | `funding-narrative/` | Investor relations |
| Unit Econ Forecaster | `unit-econ-forecaster/` | Financial modeling |
| Valuation Comps | `valuation-comps/` | Company valuation |

---

## MCP Servers

### Active MCP Servers

| Server | Type | Location | Purpose |
|--------|------|----------|---------|
| GitHub Ops | Node.js | `agents/github-ops/src/mcp/server.js` | GitHub API automation |
| Google Drive | NPM | `@isaacphi/mcp-gdrive` | Google Drive access |
| Supabase | HTTP | `mcp.supabase.com` | Database management |
| Figma MCP | TypeScript | `agents/figma-mcp/` | Figma design system |
| Design Agent | TypeScript | `agents/design-agent/` | Component analysis |

### Claude Desktop Config

Location: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "github-ops": {
      "command": "node",
      "args": ["C:/Dev/.claude-anx/agents/github-ops/src/mcp/server.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxx",
        "GITHUB_OWNER": "your-org",
        "GITHUB_REPO": "your-repo"
      }
    },
    "gdrive": {
      "command": "npx",
      "args": ["@isaacphi/mcp-gdrive"],
      "env": {
        "GDRIVE_OAUTH_PATH": "~/.gdrive-oauth.json",
        "GDRIVE_CREDENTIALS_PATH": "~/.gdrive-credentials.json"
      }
    },
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=${PROJECT_REF}",
      "headers": {
        "Authorization": "Bearer ${ACCESS_TOKEN}"
      }
    }
  }
}
```

---

## Agent Invocation Flow

### 1. Prompt-Based Agents (*.md files)
```
User Request
    │
    ▼
Claude reads agent definition from:
  C:\Dev\[Project]\.claude\agents\[agent-name].md
    │
    ▼
Claude adopts agent persona and capabilities
    │
    ▼
Agent executes using available tools
```

### 2. MCP-Based Agents (Node.js/TypeScript)
```
User Request
    │
    ▼
Claude invokes MCP tool via server
    │
    ▼
MCP Server (e.g., github-ops)
  C:\Dev\.claude-anx\agents\github-ops\src\mcp\server.js
    │
    ▼
Server calls external APIs (GitHub, etc.)
    │
    ▼
Results returned to Claude
```

### 3. Skill-Based Operations
```
User Request (e.g., "deploy to production")
    │
    ▼
Claude matches to skill:
  C:\Dev\[Project]\.claude\skills\deployment-ops\SKILL.md
    │
    ▼
Skill provides procedures at 3 levels:
  Level 1: Quick reference (0-2KB)
  Level 2: Detailed guide (2-5KB)
  Level 3: Complete reference (5KB+)
    │
    ▼
Claude executes appropriate procedures
```

---

## Project Integration

### Linked Projects (12)
| Project | Link Type | Primary Use Case |
|---------|-----------|------------------|
| DSLV | Symlink | Main platform (datasolutions.lv) |
| StrataNoble | Symlink | Business services platform |
| Direct-Cuts | Junction | Barber booking app |
| DC-2 | Junction | Direct Cuts v2 |
| Auth | Junction | Authentication services |
| flutter | Junction | Flutter SDK experiments |
| flutter-dc2-skill | Junction | DC2 mobile app |
| Household_Ticket | Junction | Home services app |
| Konjode | Junction | Educational platform |
| msaudreys-house | Junction | Client project |
| N8N-Data | Junction | Automation workflows |
| Trust-Spine-Sprint | Junction | Trust platform |

### Adding New Projects
```batch
# Option 1: Manual
cd C:\Dev\.claude-anx\scripts\project-setup
setup-new-project.bat NewProjectName

# Option 2: Automatic (run monitor in background)
python auto-monitor.py
# Then just create folders - junctions auto-created

# Option 3: Bulk setup
setup-all-junctions.bat
```

---

## Configuration Files

### manifest.json
Central registry of all agents, skills, and configurations.

### settings.json
Global settings applied to all projects.

### settings.local.json
Local overrides (not committed to git).

### mcp.json
MCP server configurations for Claude Desktop.

---

## Maintenance

### Update Agents
```bash
# All changes in .claude-anx propagate to all projects instantly
cd C:\Dev\.claude-anx\agents
# Edit any .md file
```

### Add New Agent
```bash
# Create agent definition
notepad C:\Dev\.claude-anx\agents\new-agent.md

# Create corresponding skill (optional)
mkdir C:\Dev\.claude-anx\skills\new-agent-ops
notepad C:\Dev\.claude-anx\skills\new-agent-ops\SKILL.md
```

### Add MCP Server
1. Create server code in `agents/[name]/`
2. Add to Claude Desktop config
3. Restart Claude Desktop

---

## Best Practices

1. **Single Source of Truth** - Only modify files in `.claude-anx`
2. **Never Edit Through Symlinks** - Changes propagate automatically
3. **Git Ignore .claude** - Add to each project's `.gitignore`
4. **Environment Variables** - Keep secrets in project-specific `.env` files
5. **Skill Levels** - Use progressive disclosure (Level 1→2→3)
6. **Agent Naming** - Use `[domain]-[role].md` format

---

## Quick Reference

### Common Commands
```bash
# Check agent
cat C:\Dev\.claude-anx\agents\github-admin.md

# Run GitHub CLI
cd C:\Dev\.claude-anx\agents\github-ops
npm run cli -- status

# Test MCP server
node src/mcp/server.js

# Verify junction
fsutil reparsepoint query "C:\Dev\DSLV\.claude"
```

### File Locations
| Resource | Path |
|----------|------|
| All Agents | `C:\Dev\.claude-anx\agents\` |
| All Skills | `C:\Dev\.claude-anx\skills\` |
| MCP Config | `C:\Dev\.claude-anx\mcp.json` |
| Settings | `C:\Dev\.claude-anx\settings.json` |
| Scripts | `C:\Dev\.claude-anx\scripts\` |
| This Doc | `C:\Dev\.claude-anx\COMPLETE-AGENT-FLOW.md` |

---

**Maintained by:** Steve @ ANX
**Last Updated:** January 4, 2026
