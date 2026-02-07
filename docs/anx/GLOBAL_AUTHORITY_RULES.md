# ANX Global Authority Rules

**Document ID**: ANX-GLOBAL-AUTH-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS
**Enforcement**: HARD - Violations cause mission failure

---

## Executive Summary

**`.claude-anx` is the ONLY global source of truth.**

Project `.claude/` directories are **overlays only**. They may contain local settings and project-specific context, but NEVER agents, policies, global prompts, or proof schemas.

---

## 60-Second Decision Guide

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHERE DOES THIS FILE BELONG?                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  IS IT...                          THEN IT GOES IN...                       │
│  ───────────────────────────────   ───────────────────────────────────────  │
│                                                                              │
│  Agent definition (*.md)           .claude-anx/agents/                      │
│  Policy document                   .claude-anx/policies/                    │
│  Gate definition                   .claude-anx/gates/                       │
│  Global system prompt              .claude-anx/prompts/                     │
│  Proof schema/template             .claude-anx/proofs/templates/            │
│  Bootstrap rules                   .claude-anx/bootstrap/                   │
│  Governance (ROSTER, INTAKE)       .claude-anx/governance/                  │
│                                                                              │
│  Local settings.json               {project}/.claude/settings.json          │
│  Local settings.local.json         {project}/.claude/settings.local.json    │
│  MCP server config (local)         {project}/.claude/mcp.json               │
│  Project-specific context          {project}/.claude/context/               │
│  Local workflow triggers           {project}/.claude/workflows/             │
│                                                                              │
│  NEVER in project .claude:                                                   │
│  ✗ agents/*.md                                                              │
│  ✗ policies/*.md                                                            │
│  ✗ gates/*.md                                                               │
│  ✗ prompts/*.md (global)                                                    │
│  ✗ ROSTER.md                                                                │
│  ✗ INTAKE.md                                                                │
│  ✗ proof schemas                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Principles

### Principle 1: Single Source of Truth

```
INVARIANT: .claude-anx is the ONLY location for global governance artifacts

  .claude-anx/
  ├── agents/           ← ALL agent definitions (ROSTER.md + individual)
  ├── bootstrap/        ← ALL bootstrap rules (ANX.md)
  ├── gates/            ← ALL gate definitions
  ├── policies/         ← ALL policies
  ├── governance/       ← ROSTER.md, INTAKE.md
  └── prompts/          ← ALL global/shared prompts
```

### Principle 2: Project Overlay is Additive Only

```
INVARIANT: Project .claude/ may ADD context, never REPLACE governance

  {project}/.claude/
  ├── settings.json         ← Local Claude Code settings (ALLOWED)
  ├── settings.local.json   ← Personal settings (ALLOWED)
  ├── mcp.json              ← Local MCP servers (ALLOWED)
  ├── context/              ← Project-specific context (ALLOWED)
  └── workflows/            ← Local workflow triggers (ALLOWED)

  FORBIDDEN in project .claude/:
  ✗ agents/                 ← VIOLATION: agents must be global
  ✗ policies/               ← VIOLATION: policies must be global
  ✗ gates/                  ← VIOLATION: gates must be global
  ✗ prompts/                ← VIOLATION: prompts must be global
  ✗ ROSTER.md               ← VIOLATION: roster must be global
  ✗ INTAKE.md               ← VIOLATION: intake must be global
```

### Principle 3: Bootstrap Enforces Global First

```
INVARIANT: ANX bootstrap ALWAYS loads .claude-anx before project overlay

  LOAD ORDER (strict):
  1. Resolve .claude-anx location
  2. Load .claude-anx/bootstrap/ANX.md
  3. Load .claude-anx/agents/ROSTER.md
  4. Load .claude-anx/governance/INTAKE.md
  5. Load .claude-anx/gates/*.md
  6. Load .claude-anx/policies/*.md
  7. THEN load project .claude/ overlay (additive only)
```

---

## Authority Matrix

| Artifact Type | Canonical Location | Project Override | Enforcement |
|---------------|-------------------|------------------|-------------|
| **Agent Roster** | `.claude-anx/agents/ROSTER.md` | **FORBIDDEN** | HARD FAIL |
| **Agent Definitions** | `.claude-anx/agents/*.md` | **FORBIDDEN** | HARD FAIL |
| **Intake Rules** | `.claude-anx/governance/INTAKE.md` | **FORBIDDEN** | HARD FAIL |
| **Bootstrap** | `.claude-anx/bootstrap/ANX.md` | **FORBIDDEN** | HARD FAIL |
| **Gates** | `.claude-anx/gates/*.md` | **FORBIDDEN** | HARD FAIL |
| **Policies** | `.claude-anx/policies/*.md` | **FORBIDDEN** | HARD FAIL |
| **Global Prompts** | `.claude-anx/prompts/*.md` | **FORBIDDEN** | HARD FAIL |
| **Proof Templates** | `.claude-anx/proofs/templates/*.md` | **FORBIDDEN** | HARD FAIL |
| **Local Settings** | `{project}/.claude/settings.json` | ALLOWED | - |
| **Personal Settings** | `{project}/.claude/settings.local.json` | ALLOWED | - |
| **MCP Config** | `{project}/.claude/mcp.json` | ALLOWED | - |
| **Project Context** | `{project}/.claude/context/*.md` | ALLOWED | - |

---

## Violation Definitions

### V1: Local Agent Definition

```
VIOLATION: LOCAL_AGENT_DEFINITION
─────────────────────────────────
Evidence: File exists at {project}/.claude/agents/*.md
Severity: CRITICAL
Action: HARD FAIL - Mission terminates

Resolution:
1. Move agent definition to .claude-anx/agents/
2. Delete local copy
3. Verify bootstrap loads from .claude-anx
```

### V2: Local Roster Override

```
VIOLATION: LOCAL_ROSTER_OVERRIDE
─────────────────────────────────
Evidence: File exists at {project}/.claude/ROSTER.md
         OR {project}/.claude/agents/ROSTER.md
Severity: CRITICAL
Action: HARD FAIL - Mission terminates

Resolution:
1. Delete local ROSTER.md
2. Ensure .claude-anx/agents/ROSTER.md is canonical
```

### V3: Local Policy Override

```
VIOLATION: LOCAL_POLICY_OVERRIDE
─────────────────────────────────
Evidence: File exists at {project}/.claude/policies/*.md
Severity: CRITICAL
Action: HARD FAIL - Mission terminates

Resolution:
1. Move policy to .claude-anx/policies/
2. Delete local copy
```

### V4: Local Gate Override

```
VIOLATION: LOCAL_GATE_OVERRIDE
─────────────────────────────────
Evidence: File exists at {project}/.claude/gates/*.md
Severity: CRITICAL
Action: HARD FAIL - Mission terminates

Resolution:
1. Move gate to .claude-anx/gates/ (if new)
2. Delete local copy (if duplicate)
```

### V5: Local Global Prompt

```
VIOLATION: LOCAL_GLOBAL_PROMPT
─────────────────────────────────
Evidence: File exists at {project}/.claude/prompts/*.md
         AND file is not in context/ subdirectory
Severity: CRITICAL
Action: HARD FAIL - Mission terminates

Resolution:
1. Move prompt to .claude-anx/prompts/
2. Delete local copy
```

---

## Bootstrap Enforcement

The bootstrap sequence MUST:

1. **Resolve .claude-anx FIRST**
   ```
   ANX_ROOT = resolve_anx_root()  # env → pointer → fallback
   ```

2. **Load global before local**
   ```
   load(ANX_ROOT/bootstrap/ANX.md)      # Global bootstrap
   load(ANX_ROOT/agents/ROSTER.md)      # Global roster
   load(ANX_ROOT/governance/INTAKE.md)  # Global intake
   # THEN
   load(PROJECT/.claude/settings.json)   # Local overlay only
   ```

3. **Reject local governance**
   ```
   if exists(PROJECT/.claude/agents/):
       HARD_FAIL("Local agent definitions forbidden")
   if exists(PROJECT/.claude/ROSTER.md):
       HARD_FAIL("Local roster forbidden")
   if exists(PROJECT/.claude/policies/):
       HARD_FAIL("Local policies forbidden")
   ```

---

## Verification Protocol

Before any mission execution:

```
GLOBAL_AUTHORITY_GATE CHECK:

[ ] ANX_ROOT resolved to .claude-anx
[ ] .claude-anx/bootstrap/ANX.md exists
[ ] .claude-anx/agents/ROSTER.md exists
[ ] .claude-anx/governance/INTAKE.md exists
[ ] Project .claude/ contains NO agents/ directory
[ ] Project .claude/ contains NO ROSTER.md
[ ] Project .claude/ contains NO policies/ directory
[ ] Project .claude/ contains NO gates/ directory
[ ] Project .claude/ contains NO prompts/ (except context/)

ALL PASS → PROCEED
ANY FAIL → HARD FAIL
```

---

## Cross-Reference

| Document | Purpose |
|----------|---------|
| [PROJECT_OVERLAY_ALLOWED_LIST.md](./PROJECT_OVERLAY_ALLOWED_LIST.md) | What IS allowed in project .claude/ |
| [DRIFT_DETECTOR_RULES.md](./DRIFT_DETECTOR_RULES.md) | Automated detection rules |
| [ROOT_INVARIANT_GATE.md](./ROOT_INVARIANT_GATE.md) | Gate enforcement |
| [ANX_BOOTSTRAP_CONTRACT.md](./ANX_BOOTSTRAP_CONTRACT.md) | Bootstrap invariants |

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-06 | Initial global authority rules |

---

**Classification**: GOVERNANCE POLICY - MANDATORY
**Enforcement**: HARD - Violations cause mission termination
