# Legacy `stratanoble-site` Migration Notes

**Mission:** OCS-STRATA-NOBLE-REPO-AUTHORITY-CLEANUP-0001  
**Date:** 2026-04-30

## Outcome

**No files were copied** from `C:\Dev\00_core\stratanoble-site` into this repository during this mission.

## Rationale

1. After `git fetch` on both clones, **`origin/main` is bit-for-bit identical** in path inventory (2715 tracked files, same commit `c6c5b19666fe448ef38655c20df0fe50681eaf33`).
2. Apparent “only in OLD” paths came from comparing **different local branches** (legacy checkout on `fix/sn-stress-test-supabase-cli-install` vs canonical `main`), not from a second product codebase.
3. Copying branch-skew files would risk **regressing** the marketing restructure already represented on `main`.

## Actions taken outside git copy

- Legacy clone **`origin` URL sanitized** (removed embedded credential).
- **`README_LEGACY_DO_NOT_USE.md`** added at legacy root with quarantine instructions.

## If recovery is needed later

Authorized by OCS only: use **git** (`cherry-pick`, branch merge, or `git show rev:path`) — not raw folder copy. Never copy `.env`, secrets, `node_modules`, `.next`, or build artifacts.
