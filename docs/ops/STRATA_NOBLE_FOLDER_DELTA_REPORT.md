# Strata Noble Folder Delta Report

**Mission:** OCS-STRATA-NOBLE-REPO-AUTHORITY-CLEANUP-0001  
**Date:** 2026-04-30  
**Executor:** Engineering Delivery (diff analysis)

## Method

1. **`origin/main` parity:** After `git fetch` on both clones, `git ls-tree -r --name-only origin/main` was compared. **Result: 2715 paths each, zero symmetric difference.** No missing tracked content on GitHub `main` in either direction between clones.
2. **Local branch skew:** `git ls-files` on OLD (feature branch) vs NEW (`main`) showed **109 paths only in OLD** and **76 only in NEW** — expected when comparing different branches, not a second product.
3. **Filesystem scan (non-git):** A naive recursive diff picked up local artifacts (`%SystemDrive%` cache paths, `.env`, `.netlify`, etc.). Those are **not** treated as product deltas.

## Interpretation

The “two folders” problem is **two checkouts of one repo**, not two codebases. OLD’s extra tracked paths (e.g. legacy `apps/website/src/app/cold-calling/page.tsx`) reflect **branch/restructure drift**; on `origin/main`, marketing/cold-calling content may live under other trees (e.g. `marketing-restructure-export/`) — **do not blindly copy OLD branch files into NEW.**

Full list of paths from the local **OLD vs NEW** `git ls-files` comparison is retained for QAG:

- `proofs/strata-noble/REPO-AUTHORITY-CLEANUP-0001/git-only-in-old.txt`
- `proofs/strata-noble/REPO-AUTHORITY-CLEANUP-0001/git-only-in-new.txt`

## Classification table (representative OLD-only paths from branch skew)

| File | Classification | Action |
| --- | --- | --- |
| `apps/achievery-mobile/*` | duplicate / superseded | **ignore** — removed or relocated in `main` / NEW workspace |
| `apps/website/src/app/platform/*`, `apps/website/src/app/solutions/*`, legacy marketing routes | stale vs current IA | **archive** (history in git); no copy into NEW |
| `apps/website/pnpm-lock.yaml` | stale | **ignore** — repo uses npm workspaces |
| `apps/website/localhost-response.html` | dev artifact | **ignore** |
| `apps/website/src/components/*` (legacy hero/footer set) | duplicate of earlier UI | **ignore** on `main` |
| `.env` / `.env.*` (if present untracked) | risky-env | **do not copy**; record only |
| Any remaining paths in `git-only-in-old.txt` | unknown → default | **hold** — treat as branch diff; resolve via normal PR flow if still needed |

**No `useful-doc` or `useful-code` port was required** for `origin/main` parity. If a future branch needs a specific page from OLD’s feature branch, **cherry-pick or open a PR from that branch** rather than filesystem copy.

## Duplicate / stale references

- **GitHub org:** Both remotes resolve to `Strata-Noble/stratanoble-site` (no evidence of a different “previous account” in remotes post-sanitization).
- **Docs/components:** Overlap is historical duplication inside git history, not a second canonical tree.

## Unresolved

- **Physical quarantine:** Rename to `_archive\...` pending (directory in use). See `docs/ops/STRATA_NOBLE_CODEBASE_AUTHORITY_AUDIT.md` and legacy `README_LEGACY_DO_NOT_USE.md`.
