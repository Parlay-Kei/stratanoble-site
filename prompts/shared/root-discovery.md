# ANX Root Discovery Logic

**Document ID**: PROMPT-SHARED-ROOTDISC-001
**Version**: 1.1.0
**Authority**: OCS
**Enforcement**: MANDATORY - All agents MUST use this algorithm

---

## Purpose

Shared logic for resolving ANX_ROOT across all agents and missions.
This file defines the **canonical discovery algorithm** that ensures identical governance regardless of which project invokes it.

---

## Core Invariant

```
INVARIANT: Running the same mission from ANY repo root resolves to the SAME ANX_ROOT

  Project A ─┐
             ├──► resolve(ANX_ROOT) ──► C:\Dev\.claude-anx ──► SAME roster
  Project B ─┘                                              ──► SAME gates
                                                            ──► SAME rules
```

This guarantees project-independent governance.

---

## Discovery Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│                    ANX_ROOT Discovery                        │
└─────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────────────────────┐
│ Check: $env:ANX_ROOT exists?            │
└─────────────────────────────────────────┘
  │
  ├── YES ──► Validate path ──► Valid? ──► RETURN env.ANX_ROOT
  │                              │
  │                              └── Invalid ──► Continue to next
  │
  ▼
┌─────────────────────────────────────────┐
│ Check: ./.anx-root file exists?         │
└─────────────────────────────────────────┘
  │
  ├── YES ──► Read content ──► Validate ──► Valid? ──► RETURN path
  │                                           │
  │                                           └── Invalid ──► Continue
  │
  ▼
┌─────────────────────────────────────────┐
│ Use fallback: C:\Dev\.claude-anx        │
└─────────────────────────────────────────┘
  │
  └── Validate ──► Valid? ──► RETURN fallback
                    │
                    └── Invalid ──► HARD_FAIL
```

---

## Validation Rules

A path is valid ANX_ROOT if ALL conditions met:

| Rule | Check | Error if Fail |
|------|-------|---------------|
| Exists | Directory exists | BOOT-005 |
| Has bootstrap | `bootstrap/ANX.md` exists | BOOT-002 |
| Readable | Can read bootstrap file | BOOT-002 |
| Not circular | .anx-root doesn't point to self | BOOT-004 |

---

## Pointer File Format

The `.anx-root` file specification:

```
┌────────────────────────────────────┐
│ .anx-root File Format              │
├────────────────────────────────────┤
│ Line 1: Absolute path to ANX_ROOT  │
│ (No additional lines)              │
│ (No comments)                      │
│ (No metadata)                      │
└────────────────────────────────────┘
```

### Valid Examples
```
C:\Dev\.claude-anx
```

```
/home/user/.claude-anx
```

### Invalid Examples
```
# This is a comment - INVALID
C:\Dev\.claude-anx
```

```
..\..\.claude-anx    # Relative path - INVALID
```

```
ANX_ROOT=C:\Dev\.claude-anx    # Key-value format - INVALID
```

---

## Cross-Platform Notes

| Platform | Path Format | Fallback |
|----------|-------------|----------|
| Windows | `C:\Dev\.claude-anx` | `C:\Dev\.claude-anx` |
| macOS | `/Users/{user}/.claude-anx` | `~/.claude-anx` |
| Linux | `/home/{user}/.claude-anx` | `~/.claude-anx` |

The pointer file should always use the native path format for the platform.

---

## Implementation Reference

### PowerShell
```powershell
function Resolve-AnxRoot {
    # Priority 1: Environment variable
    if ($env:ANX_ROOT -and (Test-Path $env:ANX_ROOT)) {
        return $env:ANX_ROOT
    }

    # Priority 2: .anx-root file
    $pointerFile = ".\.anx-root"
    if (Test-Path $pointerFile) {
        $path = (Get-Content $pointerFile -Raw).Trim()
        if ([System.IO.Path]::IsPathRooted($path) -and (Test-Path $path)) {
            return $path
        }
    }

    # Priority 3: Fallback
    $fallback = "C:\Dev\.claude-anx"
    if (Test-Path $fallback) {
        return $fallback
    }

    throw "ANX_ROOT resolution failed"
}
```

### Bash
```bash
resolve_anx_root() {
    # Priority 1: Environment variable
    if [[ -n "$ANX_ROOT" && -d "$ANX_ROOT" ]]; then
        echo "$ANX_ROOT"
        return 0
    fi

    # Priority 2: .anx-root file
    if [[ -f ".anx-root" ]]; then
        local path=$(cat .anx-root | tr -d '\n\r')
        if [[ "$path" = /* && -d "$path" ]]; then
            echo "$path"
            return 0
        fi
    fi

    # Priority 3: Fallback
    local fallback="$HOME/.claude-anx"
    if [[ -d "$fallback" ]]; then
        echo "$fallback"
        return 0
    fi

    echo "ERROR: ANX_ROOT resolution failed" >&2
    return 1
}
```

---

## Usage

Include in any agent or script that needs ANX_ROOT:

```markdown
@include {CURRENT_DIR}/prompts/shared/root-discovery.md
```

Or reference for implementation:
```
See: prompts/shared/root-discovery.md for ANX_ROOT resolution
```

---

## Enforcement: Resolution Order is STRICT

The resolution order (env → pointer → fallback) is **non-negotiable**:

| Priority | Source | Override Allowed |
|----------|--------|------------------|
| 1 | `$env:ANX_ROOT` | YES - Explicit operator intent |
| 2 | `.anx-root` pointer file | YES - Per-project configuration |
| 3 | Fallback `C:\Dev\.claude-anx` | NO - Built-in default |

**CRITICAL**: Agents MUST NOT:
- Skip to fallback without checking env and pointer
- Cache ANX_ROOT across sessions (always re-resolve)
- Accept relative paths in any source
- Accept paths without `bootstrap/ANX.md`

---

## Post-Resolution Validation

After resolving ANX_ROOT, validate governance files exist:

```
VALIDATION CHECKLIST:
[ ] {ANX_ROOT}/bootstrap/ANX.md exists
[ ] {ANX_ROOT}/agents/ROSTER.md exists (or governance/ROSTER.md)
[ ] {ANX_ROOT}/governance/INTAKE.md exists (or equivalent)
```

If any validation fails → HARD_FAIL with BOOT-002.

---

## Cross-Reference

| Document | Purpose |
|----------|---------|
| [ANX_BOOTSTRAP_CONTRACT.md](../../docs/anx/ANX_BOOTSTRAP_CONTRACT.md) | Bootstrap invariants |
| [ROOT_INVARIANT_GATE.md](../../docs/anx/ROOT_INVARIANT_GATE.md) | Gate enforcement |
| [ROSTER.md](../../governance/ROSTER.md) | Agent definitions |
| [INTAKE.md](../../governance/INTAKE.md) | Routing rules |

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.1.0 | 2026-02-06 | Added enforcement section, validation checklist, cross-references |
| 1.0.0 | 2026-02-06 | Initial algorithm |

---

**Classification**: SHARED LOGIC - MANDATORY
**Consumers**: All agents, CI/CD, scripts
**Enforcement**: Resolution order is strict and non-negotiable
