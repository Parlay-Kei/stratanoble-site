# Project Overlay Allowed List

**Document ID**: ANX-OVERLAY-ALLOW-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS
**Status**: CANONICAL - Defines ONLY what is permitted in project .claude/

---

## Purpose

This document defines the COMPLETE list of what is ALLOWED in a project's `.claude/` directory. Anything not explicitly listed here is **FORBIDDEN**.

---

## Quick Reference

```
{project}/.claude/
├── settings.json          ✓ ALLOWED - Project-level Claude Code settings
├── settings.local.json    ✓ ALLOWED - Personal/machine-specific settings
├── mcp.json               ✓ ALLOWED - Local MCP server configuration
├── commands/              ✓ ALLOWED - Local slash commands
│   └── *.md               ✓ ALLOWED - Command definitions
├── context/               ✓ ALLOWED - Project-specific context files
│   └── *.md               ✓ ALLOWED - Context documents
├── workflows/             ✓ ALLOWED - Local workflow triggers
│   └── *.json             ✓ ALLOWED - Workflow definitions
└── hooks/                 ✓ ALLOWED - Local hook scripts
    └── *.sh               ✓ ALLOWED - Hook implementations
```

---

## Allowed Files (Exhaustive)

### 1. Settings Files

| File | Purpose | Format | Example |
|------|---------|--------|---------|
| `settings.json` | Project-level Claude Code configuration | JSON | Model preferences, context limits |
| `settings.local.json` | Personal/machine-specific overrides | JSON | API keys, local paths |

**Allowed content:**
```json
{
  "model": "claude-opus-4-5-20251101",
  "contextLimit": 200000,
  "allowedTools": ["Read", "Write", "Bash"],
  "permissions": {}
}
```

### 2. MCP Configuration

| File | Purpose | Format |
|------|---------|--------|
| `mcp.json` | Local MCP server definitions | JSON |

**Allowed content:**
```json
{
  "mcpServers": {
    "project-specific-server": {
      "command": "node",
      "args": ["./mcp-server.js"]
    }
  }
}
```

### 3. Local Commands

| Directory | Purpose | Allowed Files |
|-----------|---------|---------------|
| `commands/` | Project-specific slash commands | `*.md` |

**Allowed content:**
- Slash command definitions
- Project-specific shortcuts
- NOT agent definitions (forbidden)

### 4. Context Directory

| Directory | Purpose | Allowed Files |
|-----------|---------|---------------|
| `context/` | Project-specific context | `*.md`, `*.json` |

**Allowed content:**
- Project documentation references
- Architecture context
- Team conventions
- Technology stack notes
- NOT agent behaviors or routing rules

### 5. Workflows Directory

| Directory | Purpose | Allowed Files |
|-----------|---------|---------------|
| `workflows/` | Local workflow triggers | `*.json`, `*.yaml` |

**Allowed content:**
- Trigger definitions
- Workflow orchestration
- MUST invoke global agents (not define them)

### 6. Hooks Directory

| Directory | Purpose | Allowed Files |
|-----------|---------|---------------|
| `hooks/` | Local hook scripts | `*.sh`, `*.ps1`, `*.js` |

**Allowed content:**
- Pre-commit hooks
- Post-push hooks
- Notification scripts
- NOT governance enforcement (that's global)

---

## Forbidden Content

The following are **NEVER** allowed in project `.claude/`:

### Forbidden Directories

| Directory | Why Forbidden |
|-----------|---------------|
| `agents/` | Agent definitions must be global in .claude-anx |
| `policies/` | Policies must be global in .claude-anx |
| `gates/` | Gates must be global in .claude-anx |
| `prompts/` | Global prompts must be in .claude-anx |
| `governance/` | Governance must be global in .claude-anx |
| `proofs/templates/` | Proof schemas must be global |

### Forbidden Files

| File Pattern | Why Forbidden |
|--------------|---------------|
| `ROSTER.md` | Agent roster must be global |
| `INTAKE.md` | Intake rules must be global |
| `*-agent.md` | Agent definitions must be global |
| `*-policy.md` | Policies must be global |
| `*-gate.md` | Gates must be global |

### Detection Patterns

```
FORBIDDEN PATTERNS (regex):
  /\.claude/agents/.*\.md$/
  /\.claude/policies/.*\.md$/
  /\.claude/gates/.*\.md$/
  /\.claude/prompts/(?!context/).*\.md$/
  /\.claude/ROSTER\.md$/
  /\.claude/INTAKE\.md$/
  /\.claude/governance/.*$/
  /\.claude/proofs/templates/.*$/
```

---

## Validation Checklist

When auditing a project `.claude/` directory:

```
OVERLAY VALIDATION:
[ ] Only contains allowed directories (settings, mcp, commands, context, workflows, hooks)
[ ] No agents/ directory exists
[ ] No policies/ directory exists
[ ] No gates/ directory exists
[ ] No prompts/ directory exists (except as context/)
[ ] No ROSTER.md file exists
[ ] No INTAKE.md file exists
[ ] No *-agent.md files exist
[ ] Settings files are valid JSON

RESULT:
  ALL PASS → Overlay compliant
  ANY FAIL → Migration required
```

---

## Migration Path

If a project has forbidden content:

1. **Inventory**: List all files in project `.claude/`
2. **Classify**: Mark each as ALLOWED or FORBIDDEN
3. **Move**: Transfer FORBIDDEN files to `.claude-anx/`
4. **Delete**: Remove FORBIDDEN files from project `.claude/`
5. **Verify**: Run overlay validation

See: [DRIFT_DETECTOR_RULES.md](./DRIFT_DETECTOR_RULES.md) for automated detection.

---

## Examples

### Compliant Project .claude/

```
myproject/.claude/
├── settings.json          ✓
├── settings.local.json    ✓
├── mcp.json               ✓
├── commands/
│   └── deploy.md          ✓
├── context/
│   └── architecture.md    ✓
└── workflows/
    └── ci-trigger.json    ✓
```

### Non-Compliant Project .claude/

```
myproject/.claude/
├── settings.json          ✓
├── agents/                ✗ FORBIDDEN
│   └── my-agent.md        ✗ FORBIDDEN
├── policies/              ✗ FORBIDDEN
│   └── security.md        ✗ FORBIDDEN
└── ROSTER.md              ✗ FORBIDDEN
```

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-06 | Initial allowed list |

---

**Classification**: GOVERNANCE POLICY
**Enforcement**: HARD - Non-compliant overlays cause mission failure
