# Platform Ops: .claude-anx Migration Receipt

**Document ID**: PLATOPS-MIGRATE-001
**Date**: 2026-02-06
**Agent**: Platform Ops
**Status**: INVENTORY COMPLETE - MIGRATION PENDING APPROVAL

---

## Executive Summary

Scanned all project repositories under `C:\Dev\` for `.claude/` directories. Identified **56 global artifacts** that require migration to `.claude-anx` and **3 local overlay files** that are compliant.

**Primary Violation**: `Direct-Cuts/.claude/agents/` contains 56 agent definitions that should be global.

---

## Inventory Summary

| Repository | GLOBAL Files | LOCAL Files | Status |
|------------|--------------|-------------|--------|
| StrataNoble-OPS | 0 | 1 | COMPLIANT |
| Direct-Cuts | 56 | 2 | **VIOLATION** |
| DSLV | 0 | 0 | COMPLIANT (empty .claude/) |
| MPL | 0 | 0 | COMPLIANT |
| Q-REIL | 0 | 1 | COMPLIANT |
| StrataNoble | 0 | 1 | COMPLIANT |
| CREA | 0 | 1 | COMPLIANT |
| flutter | 0 | 0 | COMPLIANT (empty .claude/) |
| **TOTAL** | **56** | **6** | - |

---

## Detailed Inventory

### Direct-Cuts Agent Definitions (VIOLATION)

The following 56 files in `Direct-Cuts/.claude/agents/` require migration:

| # | File | Target Location |
|---|------|-----------------|
| 1 | ambassador-program-agent.md | .claude-anx/agents/direct-cuts/ |
| 2 | auth-flow-agent.md | .claude-anx/agents/direct-cuts/ |
| 3 | backend-dev.md | .claude-anx/agents/direct-cuts/ |
| 4 | backend-qa-automation-tester.md | .claude-anx/agents/direct-cuts/ |
| 5 | barber-portal.md | .claude-anx/agents/direct-cuts/ |
| 6 | browser-automation.md | .claude-anx/agents/direct-cuts/ |
| 7 | cfo-economics.md | .claude-anx/agents/direct-cuts/ |
| 8 | checkr-verification-agent.md | .claude-anx/agents/direct-cuts/ |
| 9 | claude-skills-manager.md | .claude-anx/agents/direct-cuts/ |
| 10 | cli-deployment-monitor.md | .claude-anx/agents/direct-cuts/ |
| 11 | code-quality-testing.md | .claude-anx/agents/direct-cuts/ |
| 12 | codebase-admin.md | .claude-anx/agents/direct-cuts/ |
| 13 | customer-journey.md | .claude-anx/agents/direct-cuts/ |
| 14 | design-agent/README.md | .claude-anx/agents/direct-cuts/design-agent/ |
| 15 | documentation-admin.md | .claude-anx/agents/direct-cuts/ |
| 16 | earnings-payouts-agent.md | .claude-anx/agents/direct-cuts/ |
| 17 | eng-delivery-lead.md | .claude-anx/agents/direct-cuts/ |
| 18 | figma-mcp/README.md | .claude-anx/agents/direct-cuts/figma-mcp/ |
| 19 | file-monitor-ops.md | .claude-anx/agents/direct-cuts/ |
| 20 | flutter-sdk-ops.md | .claude-anx/agents/direct-cuts/ |
| 21 | frontend-dev.md | .claude-anx/agents/direct-cuts/ |
| 22 | geofencing-marketing-agent.md | .claude-anx/agents/direct-cuts/ |
| 23 | github-admin.md | .claude-anx/agents/direct-cuts/ |
| 24 | infra-deployment-specialist.md | .claude-anx/agents/direct-cuts/ |
| 25 | kfc/spec-design.md | .claude-anx/agents/kfc/ |
| 26 | kfc/spec-impl.md | .claude-anx/agents/kfc/ |
| 27 | kfc/spec-judge.md | .claude-anx/agents/kfc/ |
| 28 | kfc/spec-requirements.md | .claude-anx/agents/kfc/ |
| 29 | kfc/spec-system-prompt-loader.md | .claude-anx/agents/kfc/ |
| 30 | kfc/spec-tasks.md | .claude-anx/agents/kfc/ |
| 31 | kfc/spec-test.md | .claude-anx/agents/kfc/ |
| 32 | loyalty-retention-agent.md | .claude-anx/agents/direct-cuts/ |
| 33 | mobile-notifications-ops.md | .claude-anx/agents/direct-cuts/ |
| 34 | ops-monitor.md | .claude-anx/agents/direct-cuts/ |
| 35 | orchestrator-agent.md | .claude-anx/agents/direct-cuts/ |
| 36 | orchestrator-chief-of-staff.md | .claude-anx/agents/ocs/ |
| 37 | paralegal-admin.md | .claude-anx/agents/direct-cuts/ |
| 38 | payments-audit-agent.md | .claude-anx/agents/direct-cuts/ |
| 39 | PHASE-1.1-AGENT-REGISTRY.md | .claude-anx/agents/registry/ |
| 40 | pm-lead.md | .claude-anx/agents/direct-cuts/ |
| 41 | pre-deployment-quality-auditor.md | .claude-anx/agents/direct-cuts/ |
| 42 | product-manager.md | .claude-anx/agents/direct-cuts/ |
| 43 | product-upsell-agent.md | .claude-anx/agents/direct-cuts/ |
| 44 | qa-gatekeeper.md | .claude-anx/agents/qag/ |
| 45 | realtime-audit-agent.md | .claude-anx/agents/direct-cuts/ |
| 46 | release-manager.md | .claude-anx/agents/direct-cuts/ |
| 47 | research-lead.md | .claude-anx/agents/direct-cuts/ |
| 48 | responsive-audit-agent.md | .claude-anx/agents/direct-cuts/ |
| 49 | saas-security-auditor.md | .claude-anx/agents/secops/ |
| 50 | subscription-agent.md | .claude-anx/agents/direct-cuts/ |
| 51 | supabase-admin.md | .claude-anx/agents/platops/ |
| 52 | support-ticket-admin.md | .claude-anx/agents/direct-cuts/ |
| 53 | training-module-agent.md | .claude-anx/agents/direct-cuts/ |
| 54 | ui-ux-design-virtuoso.md | .claude-anx/agents/direct-cuts/ |
| 55 | voice-ai-calling-ops.md | .claude-anx/agents/direct-cuts/ |
| 56 | web-automation-tester.md | .claude-anx/agents/direct-cuts/ |

### Additional MCP Tooling in Direct-Cuts

The following MCP server implementations exist in `Direct-Cuts/.claude/`:

| Directory | Contents | Recommendation |
|-----------|----------|----------------|
| `mcp-servers/skills-server/` | Node.js MCP server + node_modules | EVALUATE - May remain as local tool |
| `agents/design-agent/` | TypeScript project + src/ | MOVE agent MD, keep implementation local |
| `agents/figma-mcp/` | TypeScript project + src/ | MOVE agent MD, keep implementation local |

### Compliant Local Files (KEEP)

| Repository | File | Classification |
|------------|------|----------------|
| StrataNoble-OPS | settings.local.json | LOCAL - KEEP |
| Direct-Cuts | settings.json | LOCAL - KEEP |
| Direct-Cuts | settings.local.json | LOCAL - KEEP |
| Q-REIL | settings.local.json | LOCAL - KEEP |
| StrataNoble | settings.local.json | LOCAL - KEEP |
| CREA | settings.local.json | LOCAL - KEEP |

---

## Migration Actions Required

### Phase 1: Create Target Structure

```bash
mkdir -p /c/Dev/.claude-anx/agents/direct-cuts
mkdir -p /c/Dev/.claude-anx/agents/kfc
mkdir -p /c/Dev/.claude-anx/agents/ocs
mkdir -p /c/Dev/.claude-anx/agents/qag
mkdir -p /c/Dev/.claude-anx/agents/platops
mkdir -p /c/Dev/.claude-anx/agents/secops
mkdir -p /c/Dev/.claude-anx/agents/registry
```

### Phase 2: Move Agent Definitions

```bash
# Move Direct-Cuts agents to .claude-anx
cp /c/Dev/10_products/Direct-Cuts/.claude/agents/*.md /c/Dev/.claude-anx/agents/direct-cuts/

# Move KFC specs
cp -r /c/Dev/10_products/Direct-Cuts/.claude/agents/kfc/* /c/Dev/.claude-anx/agents/kfc/

# Move shared agents (OCS, QAG, etc.)
mv .../orchestrator-chief-of-staff.md .claude-anx/agents/ocs/
mv .../qa-gatekeeper.md .claude-anx/agents/qag/
mv .../supabase-admin.md .claude-anx/agents/platops/
mv .../saas-security-auditor.md .claude-anx/agents/secops/
```

### Phase 3: Quarantine Original Files

```bash
mkdir -p /c/Dev/.claude-anx-quarantine/2026-02-06/Direct-Cuts
mv /c/Dev/10_products/Direct-Cuts/.claude/agents /c/Dev/.claude-anx-quarantine/2026-02-06/Direct-Cuts/
```

### Phase 4: Verify

```bash
# Run drift detector
./scripts/drift-detector.sh /c/Dev/10_products/Direct-Cuts
./scripts/drift-detector.sh /c/Dev/10_products/StrataNoble
# ... for all repos
```

---

## Quarantine Manifest

**Location**: `C:\Dev\.claude-anx-quarantine\2026-02-06\`

| Original Location | Quarantine Location | Files | Rollback Command |
|-------------------|---------------------|-------|------------------|
| Direct-Cuts/.claude/agents/ | quarantine/Direct-Cuts/.claude/agents/ | 56 | `mv quarantine/... original/...` |

**Retention**: 30 days
**Delete After**: 2026-03-08

---

## Current State vs Target State

### Before Migration

```
C:\Dev\.claude-anx\
├── bootstrap\
│   └── ANX.md                    ✓ Exists
└── Direct-Cuts-Artifacts\        (legacy artifacts)

C:\Dev\10_products\Direct-Cuts\.claude\
├── agents\                       ✗ VIOLATION - 56 agent files
│   ├── *.md                      (need to migrate)
│   ├── kfc\                      (need to migrate)
│   ├── design-agent\             (MCP tool - evaluate)
│   └── figma-mcp\                (MCP tool - evaluate)
├── mcp-servers\                  (local MCP implementations)
├── settings.json                 ✓ COMPLIANT
└── settings.local.json           ✓ COMPLIANT
```

### After Migration

```
C:\Dev\.claude-anx\
├── bootstrap\
│   └── ANX.md
├── agents\
│   ├── ROSTER.md                 (canonical roster)
│   ├── direct-cuts\              (project-namespaced agents)
│   │   └── *.md                  (56 migrated agents)
│   ├── kfc\                      (KFC spec agents)
│   │   └── spec-*.md
│   ├── ocs\                      (orchestrator)
│   ├── qag\                      (QA gatekeeper)
│   ├── platops\                  (platform ops)
│   └── secops\                   (security ops)
├── governance\
│   ├── ROSTER.md
│   └── INTAKE.md
└── policies\
    └── *.md

C:\Dev\10_products\Direct-Cuts\.claude\
├── mcp-servers\                  ✓ LOCAL - keep
├── settings.json                 ✓ LOCAL - keep
└── settings.local.json           ✓ LOCAL - keep
```

---

## Attestation

Platform Ops confirms:

- [x] All repos under C:\Dev\ scanned for .claude/ directories
- [x] Inventory CSV produced: proofs/platops/CLAUDE_DIR_INVENTORY.csv
- [x] GLOBAL files identified: 56 (all in Direct-Cuts)
- [x] LOCAL files verified compliant: 6
- [x] Migration plan documented with target locations
- [x] Quarantine structure defined for rollback safety

---

## Next Steps

1. **Human Approval Required**: Execute migration commands above
2. **Create Quarantine**: Before deleting, move to quarantine folder
3. **Run Drift Detector**: Verify compliance after migration
4. **QAG Validation**: Produce final verdict

---

**Classification**: MIGRATION RECEIPT
**Status**: INVENTORY COMPLETE - AWAITING MIGRATION EXECUTION
