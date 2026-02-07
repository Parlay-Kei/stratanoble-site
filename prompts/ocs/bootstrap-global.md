# OCS Bootstrap Global Prompt

**Document ID**: PROMPT-OCS-BOOT-001
**Version**: 2.0.0
**Authority**: OCS
**Enforcement**: MANDATORY - All sessions MUST complete bootstrap

---

## System Prompt

You are operating under ANX governance. Before executing any mission, you MUST complete the bootstrap sequence.

**CRITICAL**: `.claude-anx` is the ONLY global source of truth. Project `.claude/` directories are overlays only. Bootstrap MUST load from `.claude-anx` FIRST and REJECT any local governance overrides.

---

## Bootstrap Sequence

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ANX BOOTSTRAP SEQUENCE v2.0                               │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: Resolve ANX_ROOT (.claude-anx)
──────────────────────────────────────
Priority order (STRICT - first valid wins):

  1. Environment: $env:ANX_ROOT
     → If set and valid directory with bootstrap/ANX.md, USE IT

  2. Pointer file: ./.anx-root (current repo root)
     → Read absolute path, validate, USE IT

  3. Fallback: C:\Dev\.claude-anx
     → If exists and valid, USE IT

  4. HARD FAIL if none resolve

STEP 2: Validate ANX_ROOT
─────────────────────────
Confirm ANX_ROOT (.claude-anx) contains:

  REQUIRED:
  [ ] bootstrap/ANX.md           # Core bootstrap - MUST exist
  [ ] agents/ROSTER.md           # Global agent roster - MUST exist
  [ ] governance/INTAKE.md       # Global intake rules - MUST exist

  OPTIONAL:
  [ ] policies/*.md              # Global policies
  [ ] gates/*.md                 # Global gates
  [ ] prompts/*.md               # Global prompts

  If ANY REQUIRED file missing → HARD FAIL (BOOT-002)

STEP 3: Scan Project for Drift (BLOCKING)
─────────────────────────────────────────
Before loading ANY local content, detect governance drift:

  FORBIDDEN in {PROJECT}/.claude/:
  ✗ agents/              → HARD FAIL if exists
  ✗ policies/            → HARD FAIL if exists
  ✗ gates/               → HARD FAIL if exists
  ✗ prompts/             → HARD FAIL if exists (except context/)
  ✗ governance/          → HARD FAIL if exists
  ✗ ROSTER.md            → HARD FAIL if exists
  ✗ INTAKE.md            → HARD FAIL if exists

  If ANY forbidden content detected → HARD FAIL (DRIFT-xxx)
  See: docs/anx/DRIFT_DETECTOR_RULES.md

STEP 4: Load Global Context FIRST
─────────────────────────────────
Read from ANX_ROOT (.claude-anx) ONLY:

  1. {ANX_ROOT}/bootstrap/ANX.md         # Core routing rules
  2. {ANX_ROOT}/agents/ROSTER.md         # Agent definitions (10 agents)
  3. {ANX_ROOT}/governance/INTAKE.md     # Intake routing rules
  4. {ANX_ROOT}/policies/*.md            # All policies
  5. {ANX_ROOT}/gates/*.md               # All gates
  6. {ANX_ROOT}/prompts/*.md             # Global prompts

  INVARIANT: All governance loaded from .claude-anx, NEVER from project

STEP 5: Load Local Overlay (Additive ONLY)
──────────────────────────────────────────
If exists, read ONLY allowed files from {PROJECT}/.claude/:

  ALLOWED:
  ✓ settings.json            # Project settings
  ✓ settings.local.json      # Personal settings
  ✓ mcp.json                 # Local MCP servers
  ✓ commands/*.md            # Local slash commands
  ✓ context/*.md             # Project context
  ✓ workflows/*.json         # Local workflows
  ✓ hooks/*.sh               # Local hooks

  Local content CANNOT override global definitions.
  Local content is ADDITIVE context only.

STEP 6: Verify Invariants
─────────────────────────
Confirm:

  [ ] Agent roster loaded from ANX_ROOT (not project .claude/)
  [ ] Intake rules loaded from ANX_ROOT (not project .claude/)
  [ ] Gates unchanged from global definitions
  [ ] Routing rules from global bootstrap
  [ ] No local agent definitions active
  [ ] No local policy overrides active

  If ANY invariant violated → HARD FAIL
```

---

## Hard Fail Conditions

| Code | Condition | Action |
|------|-----------|--------|
| `BOOT-001` | ANX_ROOT cannot be resolved | Terminate - cannot proceed without governance |
| `BOOT-002` | Required file missing from ANX_ROOT | Terminate - governance incomplete |
| `BOOT-003` | Agent roster not loadable | Terminate - cannot route without agents |
| `BOOT-004` | Circular pointer in .anx-root | Terminate - configuration error |
| `BOOT-005` | ANX_ROOT pointer invalid | Terminate - configuration error |
| `DRIFT-001` | Local agents/ directory exists | Terminate - migrate to .claude-anx |
| `DRIFT-010` | Local ROSTER.md exists | Terminate - delete local roster |
| `DRIFT-011` | Local INTAKE.md exists | Terminate - delete local intake |

---

## Example Resolution Log

```
[BOOT] ═══════════════════════════════════════════════════════════════
[BOOT] ANX Bootstrap v2.0.0 - Starting
[BOOT] ═══════════════════════════════════════════════════════════════
[BOOT]
[BOOT] STEP 1: Resolving ANX_ROOT
[BOOT] ─────────────────────────────────────────────────────────────────
[BOOT]   Checking $env:ANX_ROOT... not set
[BOOT]   Checking ./.anx-root... found
[BOOT]   Reading pointer: C:\Dev\.claude-anx
[BOOT]   ✓ ANX_ROOT resolved: C:\Dev\.claude-anx
[BOOT]
[BOOT] STEP 2: Validating ANX_ROOT
[BOOT] ─────────────────────────────────────────────────────────────────
[BOOT]   ✓ bootstrap/ANX.md exists
[BOOT]   ✓ agents/ROSTER.md exists
[BOOT]   ✓ governance/INTAKE.md exists
[BOOT]
[BOOT] STEP 3: Drift Detection
[BOOT] ─────────────────────────────────────────────────────────────────
[BOOT]   Scanning: C:\Dev\10_products\StrataNoble\.claude
[BOOT]   ✓ No agents/ directory
[BOOT]   ✓ No policies/ directory
[BOOT]   ✓ No gates/ directory
[BOOT]   ✓ No ROSTER.md
[BOOT]   ✓ No INTAKE.md
[BOOT]   ✓ DRIFT CHECK PASSED
[BOOT]
[BOOT] STEP 4: Loading Global Context
[BOOT] ─────────────────────────────────────────────────────────────────
[BOOT]   Loading: bootstrap/ANX.md (core routing)
[BOOT]   Loading: agents/ROSTER.md (10 agents)
[BOOT]   Loading: governance/INTAKE.md (routing rules)
[BOOT]   Loading: policies/*.md (3 files)
[BOOT]   Loading: gates/*.md (2 files)
[BOOT]   ✓ Global context loaded from .claude-anx
[BOOT]
[BOOT] STEP 5: Loading Local Overlay
[BOOT] ─────────────────────────────────────────────────────────────────
[BOOT]   Loading: .claude/settings.json
[BOOT]   Loading: .claude/settings.local.json
[BOOT]   ✓ Local overlay loaded (additive only)
[BOOT]
[BOOT] STEP 6: Verifying Invariants
[BOOT] ─────────────────────────────────────────────────────────────────
[BOOT]   ✓ Roster source: .claude-anx (not local)
[BOOT]   ✓ Intake source: .claude-anx (not local)
[BOOT]   ✓ No local overrides detected
[BOOT]
[BOOT] ═══════════════════════════════════════════════════════════════
[BOOT] BOOTSTRAP COMPLETE - Ready for mission
[BOOT] ═══════════════════════════════════════════════════════════════
```

---

## Drift Detection Failure Example

```
[BOOT] STEP 3: Drift Detection
[BOOT] ─────────────────────────────────────────────────────────────────
[BOOT]   Scanning: C:\Dev\10_products\Direct-Cuts\.claude
[BOOT]   ✗ VIOLATION: agents/ directory exists
[BOOT]   ✗ Found 25 agent definitions in local .claude/agents/
[BOOT]
[BOOT] ═══════════════════════════════════════════════════════════════
[BOOT] HARD FAIL: DRIFT-001
[BOOT] ═══════════════════════════════════════════════════════════════
[BOOT]
[BOOT] Local agent definitions are FORBIDDEN.
[BOOT] Agents must be defined in .claude-anx/agents/ only.
[BOOT]
[BOOT] Resolution:
[BOOT]   1. Run: Platform Ops migration to move agents to .claude-anx
[BOOT]   2. Delete: C:\Dev\10_products\Direct-Cuts\.claude\agents\
[BOOT]   3. Re-run bootstrap
[BOOT]
[BOOT] See: docs/anx/DRIFT_DETECTOR_RULES.md
[BOOT]
[BOOT] Mission TERMINATED
```

---

## Integration Points

### With root-discovery.md
Resolution algorithm defined at:
`{PROJECT}/prompts/shared/root-discovery.md`

### With GLOBAL_AUTHORITY_RULES.md
Authority rules defined at:
`{PROJECT}/docs/anx/GLOBAL_AUTHORITY_RULES.md`

### With DRIFT_DETECTOR_RULES.md
Detection rules defined at:
`{PROJECT}/docs/anx/DRIFT_DETECTOR_RULES.md`

### With ROOT_INVARIANT_GATE.md
Enforcement gate at:
`{PROJECT}/docs/anx/ROOT_INVARIANT_GATE.md`

---

## Usage

This prompt is consumed by:
- OCS at session initialization
- All agents at mission start
- CI/CD validation pipelines
- Pre-commit hooks

Include in agent system prompt via:
```
@include {ANX_ROOT}/prompts/ocs/bootstrap-global.md
```

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 2.0.0 | 2026-02-06 | Added drift detection step, explicit .claude-anx authority |
| 1.0.0 | 2026-02-06 | Initial bootstrap prompt |

---

**Classification**: SYSTEM PROMPT - MANDATORY
**Enforcement**: All ANX-governed sessions
