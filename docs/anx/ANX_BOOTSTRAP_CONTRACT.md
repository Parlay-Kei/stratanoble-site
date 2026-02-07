# ANX Bootstrap Contract

**Document ID**: ANX-BOOT-CONTRACT-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS (Operational Control System)
**Status**: ACTIVE

---

## Purpose

This contract defines the **invariant bootstrap behavior** for all ANX-governed missions. Any mission, regardless of project root, MUST resolve to the same canonical ANX_ROOT and load the same agent roster.

---

## Core Invariant

```
INVARIANT: ANX_ROOT resolution is DETERMINISTIC and PROJECT-INDEPENDENT
```

Given any two projects A and B running the same mission:
- `resolve(ANX_ROOT, A) == resolve(ANX_ROOT, B)`
- `load(AGENT_ROSTER, A) == load(AGENT_ROSTER, B)`
- `gates(A) == gates(B)`

**Local repositories CANNOT override:**
- Agent roles or responsibilities
- Gate thresholds or approval requirements
- Core routing rules
- Department prefixes

---

## ANX_ROOT Resolution Order

Resolution proceeds in strict priority order. First match wins:

| Priority | Method | Example |
|----------|--------|---------|
| 1 | `ANX_ROOT` environment variable | `$env:ANX_ROOT = "C:\Dev\.claude-anx"` |
| 2 | `.anx-root` pointer file in repo root | File contains absolute path |
| 3 | Fallback default | `C:\Dev\.claude-anx` |

### Resolution Algorithm

```
function resolve_anx_root():
    # Priority 1: Environment variable
    if env.ANX_ROOT exists and is_valid_directory(env.ANX_ROOT):
        return env.ANX_ROOT

    # Priority 2: .anx-root pointer file
    if file_exists("./.anx-root"):
        pointer_path = read_file("./.anx-root").trim()
        if is_absolute_path(pointer_path) and is_valid_directory(pointer_path):
            return pointer_path

    # Priority 3: Fallback
    fallback = "C:\Dev\.claude-anx"
    if is_valid_directory(fallback):
        return fallback

    # Hard fail - cannot proceed without ANX_ROOT
    HARD_FAIL("ANX_ROOT resolution failed. Cannot locate agent roster.")
```

---

## Load Order

After ANX_ROOT resolution, loading proceeds:

### Phase 1: Global Bootstrap
```
ANX_ROOT/
├── bootstrap/
│   └── ANX.md              # MUST load - core routing rules
├── agents/
│   └── ROSTER.md           # MUST load - agent definitions
├── policies/
│   └── *.md                # Load all global policies
└── gates/
    └── *.md                # Load all global gates
```

### Phase 2: Local Overlay (Additive Only)
```
{PROJECT_ROOT}/
├── .claude/
│   └── anx-local/
│       ├── extensions/     # Local extensions (additive)
│       └── context/        # Project-specific context
└── docs/
    └── anx/
        └── *.md            # Project documentation (read-only context)
```

**Critical Rule**: Local overlay is ADDITIVE ONLY. Local files cannot:
- Redefine agents from ROSTER.md
- Modify gate thresholds
- Override routing rules
- Change department prefixes

---

## Hard Fail Conditions

Mission bootstrap MUST hard fail (terminate immediately) if:

| Condition | Error Code | Message |
|-----------|------------|---------|
| ANX_ROOT not resolvable | `BOOT-001` | "ANX_ROOT resolution failed" |
| `bootstrap/ANX.md` missing | `BOOT-002` | "Core bootstrap file not found" |
| Agent roster not loadable | `BOOT-003` | "Agent roster load failed" |
| Circular pointer in .anx-root | `BOOT-004` | "Circular ANX_ROOT reference" |
| Pointer to non-existent path | `BOOT-005` | "ANX_ROOT pointer invalid" |

---

## .anx-root File Specification

### Format
```
{ABSOLUTE_PATH_TO_ANX_ROOT}
```

### Rules
1. Single line only
2. Must be absolute path (not relative)
3. Must point to existing directory
4. No trailing newline required (but tolerated)
5. No comments or metadata in file

### Example
```
C:\Dev\.claude-anx
```

### Validation
```
function validate_anx_root_file(content):
    path = content.trim()

    # Must be absolute
    if not is_absolute_path(path):
        fail("Path must be absolute")

    # Must exist
    if not directory_exists(path):
        fail("Path does not exist: " + path)

    # Must contain bootstrap
    if not file_exists(path + "/bootstrap/ANX.md"):
        fail("Not a valid ANX_ROOT: missing bootstrap/ANX.md")

    return path
```

---

## Agent Roster Invariant

The agent roster at `ANX_ROOT/agents/ROSTER.md` is the single source of truth for:

- Agent identifiers
- Agent roles
- Agent triggers
- Agent permissions

**No local file can modify roster entries.**

Local repos may only:
- Add project-specific context for agents to consider
- Define project-specific workflows that invoke agents
- Extend agent capabilities through MCP tools (registered globally)

---

## Gate Invariant

Gates defined in `ANX_ROOT/gates/` are immutable from local repos.

| Gate Type | Location | Override Allowed |
|-----------|----------|------------------|
| Approval gates | `ANX_ROOT/gates/` | NO |
| Solution type gates | `ANX_ROOT/gates/` | NO |
| Custom project gates | `{PROJECT}/gates/` | Only additive |

---

## Verification Protocol

Before any mission execution, verify bootstrap integrity:

```
VERIFICATION_CHECKLIST:
[ ] ANX_ROOT resolved successfully
[ ] bootstrap/ANX.md loaded
[ ] Agent roster loaded from ANX_ROOT (not local)
[ ] All global policies loaded
[ ] No local override detected for protected resources
[ ] Load order: global first, local second
```

---

## Cross-Reference

| Document | Purpose |
|----------|---------|
| [bootstrap-global.md](../../../prompts/ocs/bootstrap-global.md) | OCS bootstrap prompt |
| [root-discovery.md](../../../prompts/shared/root-discovery.md) | Shared discovery logic |
| [ROOT_INVARIANT_GATE.md](../../../policies/ROOT_INVARIANT_GATE.md) | Gate enforcement |
| [.anx-root template](../../../templates/.anx-root) | Pointer file template |

---

## Project Independence Guarantee

Running the SAME mission from ANY repository root:
- Resolves to the SAME ANX_ROOT
- Loads the SAME agent roster
- Applies the SAME gates
- Uses the SAME routing rules

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROJECT INDEPENDENCE VERIFICATION                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Project A (StrataNoble)     Project B (Direct-Cuts)                    │
│       │                            │                                     │
│       └──────────────┬─────────────┘                                     │
│                      │                                                   │
│                      ▼                                                   │
│            ┌─────────────────┐                                          │
│            │  ANX_ROOT       │  ← Single canonical source               │
│            │  C:\Dev\.claude-anx                                        │
│            └────────┬────────┘                                          │
│                     │                                                    │
│         ┌──────────┴──────────┐                                         │
│         │                      │                                         │
│         ▼                      ▼                                         │
│   agents/ROSTER.md       gates/*.md                                     │
│   (SAME roles)           (SAME thresholds)                              │
│                                                                          │
│   RESULT: Identical governance regardless of project                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Integration with ROOT_INVARIANT_GATE

Before any mission execution, the ROOT_INVARIANT_GATE validates:

1. ANX_ROOT resolved from canonical sources
2. Agent roster loaded from ANX_ROOT (not local project)
3. No local ROSTER.md shadowing global
4. No local gates overriding global gates
5. Routing rules from ANX_ROOT only

See: [ROOT_INVARIANT_GATE.md](./ROOT_INVARIANT_GATE.md)

---

## Changelog

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.1.0 | 2026-02-06 | OCS | Added project independence guarantee |
| 1.0.0 | 2026-02-06 | OCS | Initial contract |

---

**Classification**: SYSTEM POLICY - IMMUTABLE
**Enforcement**: HARD - Violations cause mission failure
