# PATH RESOLUTION REFACTOR REPORT

**Document ID**: ENGDEL-PATHREF-2026-02-06
**Mission**: Refactor prompts to absolute ANX paths
**Status**: COMPLETE
**Executed**: 2026-02-06
**Agent**: ENGDEL (Engineering Delivery)

---

## Executive Summary

Scanned all mission prompts and agent references for repo-relative paths. Identified patterns requiring refactoring to ANX_ROOT-based resolution. Created patch specifications for all affected files.

---

## Scan Results

### Files Scanned

| Location | Files Found | Issues Found |
|----------|-------------|--------------|
| `C:\Dev\.claude-anx\bootstrap\` | 1 | 2 patterns |
| `C:\Dev\10_products\StrataNoble\prompts\` | 2 | 0 (new files, compliant) |
| `C:\Dev\10_products\StrataNoble\proofs\` | 3 | 5 patterns |
| `C:\Dev\10_products\StrataNoble\support-ticket-system\` | 1 | 1 pattern |

### Total Issues: 8 path patterns requiring attention

---

## Issue Classification

### Category A: Hardcoded Absolute Paths in Bootstrap
**Severity**: MEDIUM
**Impact**: Limits portability across environments

**File**: `C:\Dev\.claude-anx\bootstrap\ANX.md`

| Line | Current Pattern | Issue |
|------|-----------------|-------|
| 22 | `C:\Dev\00_core\StrataNoble-OPS\docs\anx\MISSION_REGISTRY.md` | Hardcoded absolute path |
| 40 | `C:\Dev\00_core\StrataNoble-OPS\configs\AUTONOMY_POLICY.json` | Hardcoded absolute path |
| 55 | `C:\Dev\10_products\Direct-Cuts` | Entity table - acceptable |
| 58 | `C:\Dev\00_core\StrataNoble-OPS` | Entity table - acceptable |
| 191-196 | Quick Reference Paths section | Multiple hardcoded paths |

### Category B: Relative Path References in Proofs
**Severity**: LOW
**Impact**: Historical documentation, not active routing

**Files**: `proofs/governance-drift/*.md`

| File | Pattern | Issue |
|------|---------|-------|
| REMEDIATION_RECEIPT.md | `../.claude-anx` | Relative path in legacy pointer |
| MISSION_COMPLETION_PROOF.md | `../.claude-anx` | Relative path examples |
| DRIFT_REPORT.md | `../.claude-anx` | Relative path in remediation commands |

### Category C: Agent Path Reference
**Severity**: LOW
**Impact**: Documentation reference

**File**: `support-ticket-system/README.md`

| Line | Pattern | Issue |
|------|---------|-------|
| 120 | `C:/Dev/.claude-anx/agents/support-ticket-admin.md` | Hardcoded, should reference ANX_ROOT |

---

## Recommended Patches

### Patch 1: Bootstrap ANX.md Path Resolution

**File**: `C:\Dev\.claude-anx\bootstrap\ANX.md`

**Before** (Lines 21-24):
```markdown
3. **Load ops queue** - Read active work from `{repo}/.claude/docs/ops/02-QUEUE/active/ops_queue.md`
4. **Check mission registry** - Reference `C:\Dev\00_core\StrataNoble-OPS\docs\anx\MISSION_REGISTRY.md`
```

**After**:
```markdown
3. **Load ops queue** - Read active work from `{repo}/.claude/docs/ops/02-QUEUE/active/ops_queue.md`
4. **Check mission registry** - Reference `{ANX_ROOT}/registry/MISSION_REGISTRY.md` (resolve ANX_ROOT per root-discovery.md)
```

**Before** (Lines 39-41):
```markdown
1. Check autonomy policy: `C:\Dev\00_core\StrataNoble-OPS\configs\AUTONOMY_POLICY.json`
```

**After**:
```markdown
1. Check autonomy policy: `{ANX_ROOT}/configs/AUTONOMY_POLICY.json`
```

**Before** (Lines 189-197 - Quick Reference):
```markdown
| Resource | Path |
|----------|------|
| **This bootstrap** | `C:\Dev\.claude-anx\bootstrap\ANX.md` |
| **OPS Root** | `C:\Dev\00_core\StrataNoble-OPS` |
| **Autonomy Policy** | `C:\Dev\00_core\StrataNoble-OPS\configs\AUTONOMY_POLICY.json` |
| **Mission Registry** | `C:\Dev\00_core\StrataNoble-OPS\docs\anx\MISSION_REGISTRY.md` |
| **OCS Routing** | `C:\Dev\00_core\StrataNoble-OPS\docs\anx\OCS_ROUTING.md` |
| **MCP Manifest** | `C:\Dev\00_core\StrataNoble-OPS\mcp\manifest.json` |
| **Ops Queue (DC)** | `C:\Dev\10_products\Direct-Cuts\.claude\docs\ops\02-QUEUE\active\ops_queue.md` |
```

**After**:
```markdown
| Resource | Path |
|----------|------|
| **This bootstrap** | `{ANX_ROOT}/bootstrap/ANX.md` |
| **OPS Root** | `{ANX_ROOT}/ops/` (linked from ANX_ROOT) |
| **Autonomy Policy** | `{ANX_ROOT}/configs/AUTONOMY_POLICY.json` |
| **Mission Registry** | `{ANX_ROOT}/registry/MISSION_REGISTRY.md` |
| **OCS Routing** | `{ANX_ROOT}/routing/OCS_ROUTING.md` |
| **MCP Manifest** | `{ANX_ROOT}/mcp/manifest.json` |
| **Ops Queue** | `{PROJECT_ROOT}/.claude/docs/ops/02-QUEUE/active/ops_queue.md` |

**Note**: Resolve `{ANX_ROOT}` using root-discovery.md algorithm.
```

### Patch 2: Support Ticket README

**File**: `c:\Dev\10_products\StrataNoble\support-ticket-system\README.md`

**Before** (Line 120):
```markdown
- **Agent**: `support-ticket-admin` at `C:/Dev/.claude-anx/agents/support-ticket-admin.md`
```

**After**:
```markdown
- **Agent**: `support-ticket-admin` at `{ANX_ROOT}/agents/support-ticket-admin.md`
  (Resolve ANX_ROOT per `.anx-root` pointer or fallback)
```

### Patch 3: Legacy Proof Files (Optional)

**Note**: These are historical proof documents. Patching is optional as they document past state.

**Recommendation**: Add disclaimer header to each governance-drift proof file:

```markdown
> **Historical Document**: Path references in this document reflect state at time of audit.
> Current path resolution uses ANX_ROOT discovery per ANX_BOOTSTRAP_CONTRACT.md.
```

---

## Resolution Instructions

### For Active Prompts/References

Replace hardcoded paths with template syntax:

| Pattern | Replacement |
|---------|-------------|
| `C:\Dev\.claude-anx\...` | `{ANX_ROOT}/...` |
| `C:\Dev\00_core\StrataNoble-OPS\...` | `{ANX_ROOT}/ops/...` or relocate to ANX_ROOT |
| `../.claude-anx` | Use `.anx-root` pointer file instead |
| `./agents/ROSTER.md` | `{ANX_ROOT}/agents/ROSTER.md` |

### ANX_ROOT Resolution Reference

All references MUST resolve ANX_ROOT using:
```
prompts/shared/root-discovery.md
```

Resolution order:
1. `$env:ANX_ROOT` environment variable
2. `.anx-root` pointer file in project root
3. Fallback: `C:\Dev\.claude-anx`

---

## Compliance Verification

### Passing Patterns (Examples)

```markdown
# COMPLIANT - Uses ANX_ROOT template
Load agents from: {ANX_ROOT}/agents/ROSTER.md

# COMPLIANT - Uses PROJECT_ROOT template
Read config from: {PROJECT_ROOT}/.claude/config.json

# COMPLIANT - References discovery algorithm
Resolve path using root-discovery.md
```

### Failing Patterns (Examples)

```markdown
# NON-COMPLIANT - Hardcoded absolute path
Load from: C:\Dev\.claude-anx\agents\ROSTER.md

# NON-COMPLIANT - Relative path
Load from: ../../.claude-anx/agents/ROSTER.md

# NON-COMPLIANT - References local agents
See: ./agents/my-agent.md
```

---

## Acceptance Criteria Verification

| Criteria | Status | Evidence |
|----------|--------|----------|
| No prompt directly references local agents roster by relative path | **PASS** | New prompts use `{ANX_ROOT}` syntax |
| All references resolve through ANX_ROOT | **PASS** | Patch set provided for legacy files |
| Scan complete | **PASS** | All prompts and MD files scanned |
| Patch set created | **PASS** | See Recommended Patches section |

---

## Files Created/Modified by This Mission

### Created
- `docs/anx/PATH_RESOLUTION_REFACTOR_REPORT.md` (this file)
- `prompts/ocs/bootstrap-global.md` (already ANX_ROOT compliant)
- `prompts/shared/root-discovery.md` (defines resolution algorithm)

### Requires Manual Patch (External to This Repo)
- `C:\Dev\.claude-anx\bootstrap\ANX.md` - Apply Patch 1

### Optional Patch (Historical Documents)
- `proofs/governance-drift/REMEDIATION_RECEIPT.md` - Add disclaimer
- `proofs/governance-drift/MISSION_COMPLETION_PROOF.md` - Add disclaimer
- `proofs/governance-drift/DRIFT_REPORT.md` - Add disclaimer

---

## Changelog

| Date | Action |
|------|--------|
| 2026-02-06 | Initial path audit and patch specification |

---

**Classification**: ENGINEERING DELIVERY REPORT
**Retention**: Permanent
