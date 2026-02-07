# Platform Ops: MPL Agent Diff Index

**Document ID**: PLATOPS-MPL-DIFF-2026-02-06
**Date**: 2026-02-06
**Agent**: Platform Ops
**Purpose**: Before/After inventory for MPL agent migration

---

## Diff Summary

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| MPL/.claude/agents/*.md | 7 | 0 | -7 |
| .claude-anx/agents/mpl/*.md | 0 | 7 | +7 |
| Total agent files | 7 | 7 | 0 |

**Result**: Zero files lost. All 7 files migrated successfully.

---

## Before State

### MPL/.claude/agents/ (7 files)

```
/c/Dev/10_products/MPL/.claude/agents/
└── kfc/
    ├── spec-design.md
    ├── spec-impl.md
    ├── spec-judge.md
    ├── spec-requirements.md
    ├── spec-system-prompt-loader.md
    ├── spec-tasks.md
    └── spec-test.md
```

### .claude-anx/agents/mpl/ (0 files)

```
(directory did not exist)
```

---

## After State

### MPL/.claude/agents/ (0 files)

```
(directory no longer exists - moved to quarantine)
```

### .claude-anx/agents/mpl/ (7 files)

```
/c/Dev/.claude-anx/agents/mpl/
└── kfc/
    ├── spec-design.md
    ├── spec-impl.md
    ├── spec-judge.md
    ├── spec-requirements.md
    ├── spec-system-prompt-loader.md
    ├── spec-tasks.md
    └── spec-test.md
```

---

## Quarantine State

### .claude-anx-quarantine/2026-02-06/MPL/.claude/agents/ (7 files)

```
/c/Dev/.claude-anx-quarantine/2026-02-06/MPL/.claude/agents/
└── kfc/
    ├── spec-design.md
    ├── spec-impl.md
    ├── spec-judge.md
    ├── spec-requirements.md
    ├── spec-system-prompt-loader.md
    ├── spec-tasks.md
    └── spec-test.md
```

---

## File-by-File Diff

| # | File | Before Location | After Location | Status |
|---|------|-----------------|----------------|--------|
| 1 | spec-design.md | MPL/.claude/agents/kfc/ | .claude-anx/agents/mpl/kfc/ | MIGRATED |
| 2 | spec-impl.md | MPL/.claude/agents/kfc/ | .claude-anx/agents/mpl/kfc/ | MIGRATED |
| 3 | spec-judge.md | MPL/.claude/agents/kfc/ | .claude-anx/agents/mpl/kfc/ | MIGRATED |
| 4 | spec-requirements.md | MPL/.claude/agents/kfc/ | .claude-anx/agents/mpl/kfc/ | MIGRATED |
| 5 | spec-system-prompt-loader.md | MPL/.claude/agents/kfc/ | .claude-anx/agents/mpl/kfc/ | MIGRATED |
| 6 | spec-tasks.md | MPL/.claude/agents/kfc/ | .claude-anx/agents/mpl/kfc/ | MIGRATED |
| 7 | spec-test.md | MPL/.claude/agents/kfc/ | .claude-anx/agents/mpl/kfc/ | MIGRATED |

---

## Compliance Impact

| Check | Before | After |
|-------|--------|-------|
| DRIFT-001: Local agents/ directory | **FAIL** | **PASS** |
| MPL compliance | **FAIL** | **PASS** |
| All repos compliant | 7/8 | **8/8** |

---

## .claude-anx Agent Structure (Final)

```
/c/Dev/.claude-anx/agents/
├── cfo-economics.md
├── eng-delivery-lead.md
├── orchestrator-agent.md
├── orchestrator-chief-of-staff.md
├── paralegal-admin.md
├── pm-lead.md
├── product-manager.md
├── qa-gatekeeper.md
├── release-manager.md
├── research-lead.md
├── supabase-admin.md
├── support-ticket-admin.md
├── direct-cuts/              # 43 files from Direct-Cuts
│   ├── *.md
│   ├── kfc/                  # Direct-Cuts KFC version (7 files)
│   ├── design-agent/
│   └── figma-mcp/
└── mpl/                      # 7 files from MPL
    └── kfc/                  # MPL KFC version (7 files)
        ├── spec-design.md
        ├── spec-impl.md
        ├── spec-judge.md
        ├── spec-requirements.md
        ├── spec-system-prompt-loader.md
        ├── spec-tasks.md
        └── spec-test.md
```

---

**Classification**: DIFF INDEX
**Status**: COMPLETE
