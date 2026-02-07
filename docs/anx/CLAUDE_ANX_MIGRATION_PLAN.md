# .claude-anx Migration Plan

**Document ID**: ANX-MIGRATE-PLAN-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS + Platform Ops
**Status**: ACTIVE

---

## Executive Summary

This plan migrates all global governance artifacts from project `.claude/` directories into the canonical `.claude-anx` location. After migration, project `.claude/` will contain only approved overlay files.

---

## Migration Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MIGRATION PHASES OVERVIEW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: INVENTORY          PHASE 2: CLASSIFY                              │
│  ────────────────────        ─────────────────                              │
│  • Scan all repos            • Mark as GLOBAL vs LOCAL                      │
│  • List all .claude/ files   • Identify duplicates                          │
│  • Produce CSV               • Flag conflicts                               │
│                                                                              │
│  PHASE 3: MOVE               PHASE 4: DELETE                                │
│  ────────────────            ─────────────────                              │
│  • Copy GLOBAL to .claude-anx • Quarantine forbidden files                  │
│  • Merge if needed           • Delete after verification                    │
│  • Preserve history          • Clean project .claude/                       │
│                                                                              │
│  PHASE 5: VERIFY                                                            │
│  ────────────────                                                           │
│  • Run drift detector        • QAG validation                               │
│  • Confirm compliance        • Update .anx-root pointers                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Inventory

**Owner**: Platform Ops
**Duration**: 1 session
**Output**: `proofs/platops/CLAUDE_DIR_INVENTORY.csv`

### Actions

1. **Scan all repos** under `C:\Dev\` for `.claude/` directories
2. **Exclude** node_modules, archive, quarantine paths
3. **List** all files with full path, size, modification date
4. **Produce** CSV inventory

### Inventory Format

```csv
repo,relative_path,file_type,classification,action_needed
Direct-Cuts,/.claude/agents/auth-flow-agent.md,agent,GLOBAL,MOVE
Direct-Cuts,/.claude/settings.local.json,settings,LOCAL,KEEP
StrataNoble,/.claude/settings.local.json,settings,LOCAL,KEEP
MPL,/.claude/agents/kfc/spec-design.md,agent,GLOBAL,MOVE
```

### Classification Rules

| File Pattern | Classification | Action |
|--------------|----------------|--------|
| `agents/*.md` | GLOBAL | MOVE to .claude-anx |
| `policies/*.md` | GLOBAL | MOVE to .claude-anx |
| `gates/*.md` | GLOBAL | MOVE to .claude-anx |
| `prompts/*.md` | GLOBAL | MOVE to .claude-anx |
| `ROSTER.md` | GLOBAL | DELETE (canonical exists) |
| `INTAKE.md` | GLOBAL | DELETE (canonical exists) |
| `settings.json` | LOCAL | KEEP |
| `settings.local.json` | LOCAL | KEEP |
| `mcp.json` | LOCAL | KEEP |
| `commands/*.md` | LOCAL | KEEP |
| `context/*.md` | LOCAL | KEEP |
| `workflows/*.json` | LOCAL | KEEP |

---

## Phase 2: Classify

**Owner**: Platform Ops
**Duration**: 1 session
**Output**: Annotated inventory with conflict flags

### Actions

1. **Review** each inventory item
2. **Mark** classification (GLOBAL/LOCAL)
3. **Identify** duplicates across repos
4. **Flag** conflicts (same agent defined differently in multiple repos)

### Conflict Resolution

| Conflict Type | Resolution |
|---------------|------------|
| Same agent, identical content | Keep one, delete duplicates |
| Same agent, different content | Merge manually, note in receipt |
| Unique agent per project | Move to .claude-anx with project prefix |
| Project-specific agent | Evaluate if truly global or should be workflow |

---

## Phase 3: Move

**Owner**: Platform Ops
**Duration**: 1-2 sessions
**Output**: Files in `.claude-anx`, migration receipt

### Actions

1. **Create** target directories in `.claude-anx` if needed
2. **Copy** GLOBAL files to `.claude-anx`
3. **Preserve** git history if possible (git mv within repo)
4. **Update** references in moved files
5. **Document** each move in receipt

### Target Structure

```
C:\Dev\.claude-anx\
├── bootstrap/
│   └── ANX.md                    # Core bootstrap (exists)
├── agents/
│   ├── ROSTER.md                 # Global roster
│   ├── direct-cuts/              # Project-namespaced agents
│   │   ├── auth-flow-agent.md
│   │   ├── backend-dev.md
│   │   └── ...
│   ├── mpl/
│   │   └── kfc/
│   │       ├── spec-design.md
│   │       └── ...
│   └── shared/                   # Cross-project agents
│       └── ...
├── governance/
│   ├── ROSTER.md                 # Canonical roster
│   └── INTAKE.md                 # Canonical intake
├── policies/
│   └── *.md
├── gates/
│   └── *.md
└── prompts/
    ├── ocs/
    ├── shared/
    └── ...
```

### Move Receipt Format

```markdown
## Migration Receipt

| Source | Destination | Action | Notes |
|--------|-------------|--------|-------|
| Direct-Cuts/.claude/agents/auth-flow-agent.md | .claude-anx/agents/direct-cuts/auth-flow-agent.md | MOVE | |
| Direct-Cuts/.claude/agents/ROSTER.md | (deleted) | DELETE | Canonical exists |
```

---

## Phase 4: Delete

**Owner**: Platform Ops
**Duration**: 1 session
**Output**: Quarantine folder, deletion receipt

### Actions

1. **Create** quarantine folder for rollback safety
2. **Move** forbidden files to quarantine (not delete yet)
3. **Remove** empty directories from project `.claude/`
4. **Document** each deletion

### Quarantine Structure

```
C:\Dev\.claude-anx-quarantine\
├── {date}-migration\
│   ├── Direct-Cuts\
│   │   └── .claude\
│   │       └── agents\           # Original location preserved
│   │           └── *.md
│   ├── MPL\
│   │   └── .claude\
│   │       └── agents\
│   │           └── kfc\
│   │               └── *.md
│   └── QUARANTINE_MANIFEST.md
```

### Quarantine Manifest

```markdown
## Quarantine Manifest - 2026-02-06

Files quarantined for rollback safety.
These files have been migrated to .claude-anx.
Delete quarantine after 30 days if no issues.

| Original Path | Quarantine Path | Migration Target |
|---------------|-----------------|------------------|
| Direct-Cuts/.claude/agents/*.md | quarantine/Direct-Cuts/.claude/agents/*.md | .claude-anx/agents/direct-cuts/*.md |
```

---

## Phase 5: Verify

**Owner**: QAG
**Duration**: 1 session
**Output**: Compliance verdict

### Actions

1. **Run** drift detector on all repos
2. **Confirm** no forbidden content in project `.claude/`
3. **Validate** `.claude-anx` contains all canonical files
4. **Update** `.anx-root` pointers in each repo if needed
5. **Produce** QAG verdict

### Verification Checklist

```
POST-MIGRATION VERIFICATION:
[ ] All repos have .anx-root pointing to C:\Dev\.claude-anx
[ ] No repo has agents/ in .claude/
[ ] No repo has policies/ in .claude/
[ ] No repo has gates/ in .claude/
[ ] No repo has ROSTER.md in .claude/
[ ] No repo has INTAKE.md in .claude/
[ ] .claude-anx/agents/ROSTER.md exists and is canonical
[ ] .claude-anx/governance/INTAKE.md exists and is canonical
[ ] Drift detector passes on all repos
[ ] Bootstrap sequence completes without error on all repos
```

---

## Rollback Plan

If migration causes issues:

1. **Stop** all missions
2. **Restore** from quarantine folder
3. **Revert** .anx-root pointers
4. **Document** issue for resolution

Quarantine retention: 30 days post-migration

---

## Timeline

| Phase | Owner | Estimated Duration | Dependencies |
|-------|-------|-------------------|--------------|
| 1: Inventory | Platform Ops | 1 session | None |
| 2: Classify | Platform Ops | 1 session | Phase 1 complete |
| 3: Move | Platform Ops | 1-2 sessions | Phase 2 complete |
| 4: Delete | Platform Ops | 1 session | Phase 3 complete |
| 5: Verify | QAG | 1 session | Phase 4 complete |

**Total**: 5-6 sessions

---

## Success Criteria

1. **Zero** forbidden files in any project `.claude/`
2. **All** global agents in `.claude-anx/agents/`
3. **All** repos point to `.claude-anx` via `.anx-root`
4. **Bootstrap** completes without drift errors
5. **QAG** verdict is PASS

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-06 | Initial migration plan |

---

**Classification**: MIGRATION PLAN
**Status**: Ready for execution
