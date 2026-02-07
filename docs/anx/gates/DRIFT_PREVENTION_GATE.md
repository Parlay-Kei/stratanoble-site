# QAG Gate: Drift Prevention Gate

**Gate ID**: QAG-GATE-DRIFT-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS / QAG
**Enforcement**: AUTOMATED (CI + Pre-commit)

---

## Overview

The Drift Prevention Gate ensures .claude-anx remains the sole source of truth for agent definitions, policies, and governance rules. It blocks any attempt to introduce forbidden files into project `.claude/` directories.

---

## Gate Triggers

| Trigger | Enforcement Point | Blocking |
|---------|-------------------|----------|
| Staged changes include `.claude/agents/**/*.md` | Pre-commit hook | **YES** |
| Staged changes include `.claude/ROSTER.md` | Pre-commit hook | **YES** |
| Staged changes include `.claude/INTAKE.md` | Pre-commit hook | **YES** |
| PR/Push includes forbidden `.claude/` files | CI workflow | **YES** |
| Full repo scan detects CRITICAL violations | CI workflow | **YES** |

---

## Rules Enforced

### CRITICAL (Blocking)

| Rule | Pattern | Gate Response |
|------|---------|---------------|
| DRIFT-001 | `.claude/agents/` directory exists with .md files | **HARD_FAIL** |
| DRIFT-002 | `.claude/policies/` directory exists | **HARD_FAIL** |
| DRIFT-003 | `.claude/gates/` directory exists | **HARD_FAIL** |
| DRIFT-010 | `.claude/ROSTER.md` exists | **HARD_FAIL** |
| DRIFT-011 | `.claude/INTAKE.md` exists | **HARD_FAIL** |
| DRIFT-014 | `.claude/agents/*.md` (direct children) | **HARD_FAIL** |
| DRIFT-014a | `.claude/agents/**/*.md` (nested) | **HARD_FAIL** |

### HIGH (Warning in pre-commit, Blocking in CI)

| Rule | Pattern | Gate Response |
|------|---------|---------------|
| DRIFT-015 | `*-agent.md` anywhere in `.claude/` | **SOFT_FAIL** → **HARD_FAIL** (CI) |
| DRIFT-016 | `*-policy.md` anywhere in `.claude/` | **SOFT_FAIL** → **HARD_FAIL** (CI) |
| DRIFT-017 | `*-gate.md` anywhere in `.claude/` | **SOFT_FAIL** → **HARD_FAIL** (CI) |

---

## Allowed Exceptions

### Overlay Stub (DRIFT-014 Exception)

A file named `OVERLAY_STUB.md` in `.claude/agents/` is allowed **ONLY IF**:

1. Filename is exactly `OVERLAY_STUB.md`
2. Contains header: `# Overlay Stub - DO NOT DEFINE AGENTS HERE`
3. Contains reference: `See .claude-anx/agents/`
4. Does NOT contain agent definition patterns (`**ID**:`, `**Role**:`)

---

## Override Mechanism

### Explicit Operator Override

To bypass the pre-commit guard (REQUIRES JUSTIFICATION):

```bash
git commit --no-verify -m "DRIFT-OVERRIDE: [specific justification]"
```

**INVARIANT**: `--no-verify` commits are logged and reviewed in CI. Unjustified overrides trigger escalation.

### CI Override (Emergency Only)

Add to commit message:

```
DRIFT-EMERGENCY-OVERRIDE: [justification]
Approved-By: [operator name]
Ticket: [link to approval ticket]
```

**INVARIANT**: Emergency overrides require post-hoc review within 24 hours.

---

## Proof Pack Generation

When a gate failure occurs, the following evidence is generated:

```
proofs/drift/drift-scan-YYYYMMDD-HHMMSS.json
```

### Proof Pack Schema

```json
{
  "timestamp": "2026-02-06T10:30:00Z",
  "project_root": "/path/to/repo",
  "summary": {
    "critical": 1,
    "high": 0,
    "medium": 0,
    "total": 1
  },
  "violations": [
    {
      "rule": "DRIFT-014",
      "severity": "CRITICAL",
      "file": ".claude/agents/my-agent.md",
      "description": "Forbidden agent definition in local .claude/agents/"
    }
  ],
  "verdict": "FAIL"
}
```

---

## Implementation

### Pre-commit Hook

Location: `.husky/pre-commit` or `.githooks/pre-commit`

```bash
# Drift Guard - Fast pre-commit check
./scripts/drift/drift-guard.sh || exit 1
```

### CI Workflow

Location: `.github/workflows/drift-detection.yml`

Runs:
- On push to `main`, `develop`
- On all pull requests
- Scans changed files AND full repository

---

## Rollback Plan

If drift guard causes issues:

1. **Disable pre-commit guard temporarily**:
   ```bash
   git config core.hooksPath /dev/null
   ```

2. **Re-enable after fix**:
   ```bash
   git config --unset core.hooksPath
   ```

3. **Disable CI check temporarily**:
   - Set repository variable: `DRIFT_CHECK_DISABLED=true`
   - Creates audit trail of disabled period

---

## Attestation

This gate was established to enforce:

- [x] .claude-anx as the sole source of truth
- [x] Zero local agent definitions in project repos
- [x] Automated blocking at commit and CI stages
- [x] Explicit override mechanism with audit trail
- [x] Path-level evidence in proof packs

---

**Classification**: QAG GATE DEFINITION
**Enforcement**: AUTOMATED
**Override**: EXPLICIT OPERATOR INTENT REQUIRED
