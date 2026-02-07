# ROOT INVARIANT GATE Policy

**Policy ID**: POLICY-ROOT-GATE-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS
**Enforcement**: HARD

---

## Policy Statement

The ANX_ROOT resolution and agent roster loading MUST be invariant across all project repositories. Local repositories are PROHIBITED from overriding core ANX governance structures.

---

## Protected Resources

The following resources are IMMUTABLE from local repository context:

| Resource | Location | Override Allowed |
|----------|----------|------------------|
| Agent Roster | `{ANX_ROOT}/agents/ROSTER.md` | **NO** |
| Core Bootstrap | `{ANX_ROOT}/bootstrap/ANX.md` | **NO** |
| Gate Definitions | `{ANX_ROOT}/gates/*.md` | **NO** |
| Department Prefixes | Defined in bootstrap | **NO** |
| Routing Rules | Defined in bootstrap | **NO** |
| Approval Thresholds | Defined in gates | **NO** |

---

## Gate Check Procedure

Before mission execution, perform ROOT_INVARIANT_GATE check:

```
ROOT_INVARIANT_GATE
───────────────────

Input: ANX_ROOT, PROJECT_ROOT
Output: PASS | FAIL

CHECKS:
1. [CHECK] ANX_ROOT resolved from canonical sources (env/pointer/fallback)
2. [CHECK] Agent roster loaded from ANX_ROOT (not PROJECT_ROOT)
3. [CHECK] No local ROSTER.md overriding global
4. [CHECK] No local gate files shadowing global gates
5. [CHECK] Routing rules from ANX_ROOT bootstrap only
6. [CHECK] Department prefixes unchanged

RESULT:
- All checks pass → GATE PASS → Proceed with mission
- Any check fails → GATE FAIL → HARD FAIL mission
```

---

## Violation Detection

### Signature: Local Roster Override
```
VIOLATION: Local agent roster detected

Evidence:
- File exists: {PROJECT_ROOT}/.claude/agents/ROSTER.md
- Or: {PROJECT_ROOT}/agents/ROSTER.md

Action: HARD FAIL
Message: "Local agent roster override detected. Remove local ROSTER.md."
```

### Signature: Local Gate Override
```
VIOLATION: Local gate shadowing global

Evidence:
- File exists: {PROJECT_ROOT}/gates/{GATE_NAME}.md
- Same filename as {ANX_ROOT}/gates/{GATE_NAME}.md

Action: HARD FAIL
Message: "Local gate shadows global gate: {GATE_NAME}. Remove local gate."
```

### Signature: Routing Rule Override
```
VIOLATION: Local routing rules detected

Evidence:
- File contains routing rule definitions
- File at: {PROJECT_ROOT}/.claude/routing.md (or similar)
- Rules conflict with {ANX_ROOT}/bootstrap/ANX.md

Action: HARD FAIL
Message: "Local routing rules override global. Remove local routing definitions."
```

---

## Allowed Local Extensions

Local repositories MAY add:

| Extension Type | Location | Constraint |
|----------------|----------|------------|
| Project context | `{PROJECT}/.claude/anx-local/context/` | Read-only reference |
| Workflow definitions | `{PROJECT}/.claude/anx-local/workflows/` | Must invoke global agents |
| Project documentation | `{PROJECT}/docs/anx/` | Informational only |
| Custom project gates | `{PROJECT}/gates/` | Must not shadow global |

### Example: Valid Local Extension
```markdown
# {PROJECT}/.claude/anx-local/context/PROJECT_CONTEXT.md

This project uses:
- Framework: Next.js 15
- Database: Supabase
- Deploy: Vercel

Note: This context is additive. Global routing rules apply.
```

### Example: Invalid Local Override (REJECTED)
```markdown
# {PROJECT}/agents/ROSTER.md  <-- VIOLATION

Agent: custom-local-agent
Role: Override OCS routing
```

---

## Enforcement Mechanism

### At Bootstrap
```
[BOOT] Checking ROOT_INVARIANT_GATE...
[GATE] Scanning for local overrides...
[GATE] ✓ No local ROSTER.md
[GATE] ✓ No shadowed gates
[GATE] ✓ No routing overrides
[GATE] ROOT_INVARIANT_GATE: PASS
```

### On Violation
```
[BOOT] Checking ROOT_INVARIANT_GATE...
[GATE] Scanning for local overrides...
[GATE] ✗ VIOLATION: Local ROSTER.md detected at ./agents/ROSTER.md
[GATE] ROOT_INVARIANT_GATE: FAIL
[BOOT] HARD FAIL - Cannot proceed with compromised governance
[BOOT] Resolution: Remove local override file and retry
```

---

## Rationale

This gate exists to ensure:

1. **Consistency**: All projects behave identically under ANX governance
2. **Auditability**: Single source of truth for agent definitions
3. **Security**: Prevents privilege escalation via local overrides
4. **Maintainability**: Changes to governance propagate uniformly

---

## Exception Process

There are NO exceptions to this gate.

If organizational changes require modified governance:
1. Propose changes to `{ANX_ROOT}` files
2. Changes reviewed by OCS
3. Changes applied globally (affecting all projects)
4. All projects inherit new governance simultaneously

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-06 | Initial policy |

---

**Classification**: HARD GATE - NO EXCEPTIONS
**Violation Response**: Mission termination
