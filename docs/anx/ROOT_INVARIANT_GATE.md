# ROOT INVARIANT GATE

**Document ID**: ANX-GATE-ROOT-001
**Version**: 1.1.0
**Effective**: 2026-02-06
**Authority**: OCS
**Enforcement**: HARD - No exceptions

---

## Gate Purpose

This gate ensures that ANX governance is **identical across all projects**. No local repository can modify, override, or shadow the canonical agent roster, gates, or routing rules.

---

## Core Invariant

```
INVARIANT: For any projects A and B running the same mission:

  resolve(ANX_ROOT, A) == resolve(ANX_ROOT, B)
  load(ROSTER, A) == load(ROSTER, B)
  apply(GATES, A) == apply(GATES, B)
```

---

## Protected Resources

| Resource | Canonical Location | Override Allowed |
|----------|-------------------|------------------|
| **Agent Roster** | `{ANX_ROOT}/agents/ROSTER.md` | **NEVER** |
| **Bootstrap** | `{ANX_ROOT}/bootstrap/ANX.md` | **NEVER** |
| **Gates** | `{ANX_ROOT}/gates/*.md` | **NEVER** |
| **Policies** | `{ANX_ROOT}/policies/*.md` | **NEVER** |
| **Department Prefixes** | Defined in bootstrap | **NEVER** |
| **Routing Rules** | Defined in bootstrap | **NEVER** |
| **Intake Rules** | `{ANX_ROOT}/governance/INTAKE.md` | **NEVER** |

---

## Gate Check Protocol

Execute this check at mission bootstrap:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROOT_INVARIANT_GATE CHECK                     │
└─────────────────────────────────────────────────────────────────┘

INPUT: ANX_ROOT (resolved), PROJECT_ROOT (current)

CHECKS:
┌─────┬────────────────────────────────────────────────┬──────────┐
│ #   │ Check                                          │ Status   │
├─────┼────────────────────────────────────────────────┼──────────┤
│ 1   │ ANX_ROOT resolved via canonical algorithm     │ [ ]      │
│ 2   │ {ANX_ROOT}/agents/ROSTER.md exists & readable │ [ ]      │
│ 3   │ No local ROSTER.md in PROJECT_ROOT            │ [ ]      │
│ 4   │ No local gates shadowing ANX_ROOT/gates/      │ [ ]      │
│ 5   │ No local routing.md overriding bootstrap      │ [ ]      │
│ 6   │ No local INTAKE.md overriding governance      │ [ ]      │
└─────┴────────────────────────────────────────────────┴──────────┘

RESULT:
  ALL PASS → GATE PASS → Proceed with mission
  ANY FAIL → GATE FAIL → HARD FAIL (terminate mission)
```

---

## Violation Signatures

### V1: Local Roster Override

```
VIOLATION DETECTED
─────────────────────
Type: LOCAL_ROSTER_OVERRIDE
Evidence: File exists at {PROJECT_ROOT}/[.claude/]agents/ROSTER.md

Action: HARD FAIL
Message: "Local agent roster detected. Global roster authority violated."
Resolution: Delete local ROSTER.md file
```

### V2: Local Gate Shadow

```
VIOLATION DETECTED
─────────────────────
Type: LOCAL_GATE_SHADOW
Evidence: {PROJECT_ROOT}/gates/{name}.md shadows {ANX_ROOT}/gates/{name}.md

Action: HARD FAIL
Message: "Local gate shadows global gate: {name}"
Resolution: Remove local gate file or rename to avoid collision
```

### V3: Local Routing Override

```
VIOLATION DETECTED
─────────────────────
Type: LOCAL_ROUTING_OVERRIDE
Evidence: {PROJECT_ROOT}/.claude/routing.md contains routing rules

Action: HARD FAIL
Message: "Local routing rules override global bootstrap"
Resolution: Remove local routing definitions
```

### V4: Local Intake Override

```
VIOLATION DETECTED
─────────────────────
Type: LOCAL_INTAKE_OVERRIDE
Evidence: {PROJECT_ROOT}/governance/INTAKE.md exists

Action: HARD FAIL
Message: "Local intake rules override governance"
Resolution: Remove local INTAKE.md; use docs/anx/ for local context only
```

---

## Allowed Local Extensions

Projects MAY add LOCAL CONTEXT that does NOT override governance:

| Type | Location | Constraint |
|------|----------|------------|
| Project context | `{PROJECT}/docs/anx/*.md` | Informational only |
| Local workflows | `{PROJECT}/.claude/anx-local/workflows/` | Must invoke global agents |
| Project gates | `{PROJECT}/gates/PROJECT_*.md` | Must not shadow global |

### Valid Example

```markdown
# {PROJECT}/docs/anx/PROJECT_CONTEXT.md

This project context is ADDITIVE. Global governance applies.

Project: StrataNoble
Framework: Next.js 15
Database: Supabase
```

### Invalid Example

```markdown
# {PROJECT}/agents/ROSTER.md  <-- VIOLATION

This file shadows the global roster.
```

---

## Enforcement Log Format

```
[GATE] ROOT_INVARIANT_GATE v1.1.0
[GATE] ANX_ROOT: C:\Dev\.claude-anx
[GATE] PROJECT_ROOT: C:\Dev\10_products\StrataNoble
[GATE] ───────────────────────────────────────
[GATE] Check 1: ANX_ROOT resolution... PASS
[GATE] Check 2: Roster exists... PASS
[GATE] Check 3: No local roster... PASS
[GATE] Check 4: No gate shadows... PASS
[GATE] Check 5: No routing override... PASS
[GATE] Check 6: No intake override... PASS
[GATE] ───────────────────────────────────────
[GATE] ROOT_INVARIANT_GATE: PASS
[GATE] Mission may proceed
```

---

## Exception Process

**There are NO exceptions to this gate.**

All governance changes MUST be made at the ANX_ROOT level:

1. Propose change to `{ANX_ROOT}` files
2. OCS reviews and approves
3. Change applied globally
4. All projects automatically inherit new governance

---

## Cross-Reference

| Document | Purpose |
|----------|---------|
| [ANX_BOOTSTRAP_CONTRACT.md](./ANX_BOOTSTRAP_CONTRACT.md) | Bootstrap invariants |
| [root-discovery.md](../../prompts/shared/root-discovery.md) | Resolution algorithm |
| [ROSTER.md](../../governance/ROSTER.md) | Agent definitions |
| [INTAKE.md](../../governance/INTAKE.md) | Routing rules |

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.1.0 | 2026-02-06 | Added intake override check, enhanced violation signatures |
| 1.0.0 | 2026-02-06 | Initial gate definition |

---

**Classification**: HARD GATE
**Enforcement**: Mission termination on violation
