# OCS Cleanup Proof Pack - 2026-01-19 (Updated)

## Executive Summary

This proofs the cleanup of the Direct Cuts repository, separating ANX artifacts
from product code.

## 1. Classification & Actions

### A. Direct Cuts Product Code (Retained)

- Core application files (`src/`, `public/`, `docs/`)
- Configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`,
  `tailwind.config.js`)
- Standard repository files (`README.md`, `.gitignore`)

### B. ANX Framework Artifacts (Moved)

Moved to `C:\Dev\.claude-anx\Direct-Cuts-Artifacts\`:

- **Agent Framework**: `.agent/`, `agents/`, `file-monitor/`
- **Agent Config**: `config/anx_drive_config.json`, `scripts/anx/`
- **Project Management**: `specs/`, `logo_conversion/`
- **Old Artifacts**: `artifacts/` (legacy `audit`, `plans`, `proofs`)
- **Mainteance Scripts**: 30+ root-level `.js`, `.sql`, `.bat`, `.sh` scripts
- **Receipts**: `proofs/` folder and `docs/receipts/` moved to
  `Proofs_and_Audits/`

### C. Accidental Noise (Deleted)

- `typecheck.log`
- `test.txt`
- `test-results/.last-run.json`
- `proofs/DC_CI_DEBUG_GUARD` (moved/retained in proofs archive)

## 2. Cleanliness Verification

### .gitignore Updates

Added the following patterns to prevent regression:

```gitignore
# ANX Artifacts
.agent/
artifacts/
agents/
PROOF_PACK/
```

### Git Status (Refined)

- **Moved**: `docs/receipts` and `proofs/` are removed from the working tree.
- **Modified**: `src/components/marketing/LandingHeader.tsx` is maintained as a
  pending change (product work).
- **Clean**: All ANX artifacts are staged for removal or removed.

## 3. Location of Moved Assets

All non-product assets are preserved in canonical storage:
`C:\Dev\.claude-anx\Direct-Cuts-Artifacts`

- `Agent_Framework/` (Core agents + configs)
- `Project_Management/` (Specs, PM docs)
- `Data_Room/` (Data room ingestion docs)
- `Legal/` (Legal policies generated)
- `Proofs_and_Audits/` (All proofs, receipts, audit results, screenshots)
- `Maintenance_Scripts/` (Utility scripts)
