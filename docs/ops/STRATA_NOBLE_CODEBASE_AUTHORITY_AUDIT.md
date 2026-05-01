# Strata Noble Codebase Authority Audit

**Mission:** OCS-STRATA-NOBLE-REPO-AUTHORITY-CLEANUP-0001  
**Date:** 2026-04-30  
**Executor:** Platform Ops (automated audit)

## Memory pre-check (local repo)

Searched this repository for routing strings. No Graphiti MCP server was present in the Cursor workspace `mcps/` directory, so `search_nodes` / `search_memory_facts` were not executed here. Canonical routing is recorded in `CANONICAL_REPO.md`, `AGENTS.md`, and this audit.

## Summary conclusion

Both folders are **clones of the same GitHub repository** (`Strata-Noble/stratanoble-site`). After `git fetch` on both clones, **`origin/main` trees are identical** (2715 tracked paths, same tip commit `c6c5b19666fe448ef38655c20df0fe50681eaf33`). The **canonical active workspace** is `C:\Dev\10_products\StrataNoble`: newer local commits, current daily activity, and mission-owned changes. The **legacy** checkout at `C:\Dev\00_core\stratanoble-site` was on a **stale feature branch** with **last meaningful file timestamps ~2026-04-13** vs **2026-04-30** on the canonical tree.

**Security note:** The legacy clone previously had a **personal access token embedded in `remote.origin.url`**. During cleanup the URL was reset to `https://github.com/Strata-Noble/stratanoble-site.git`. **Rotate any PAT that may have been exposed** in shell history or logs.

## Required audit table

| Field | OLD: `C:\Dev\00_core\stratanoble-site` | NEW: `C:\Dev\10_products\StrataNoble` |
| --- | --- | --- |
| Exists | Yes (legacy; `README_LEGACY_DO_NOT_USE.md` added) | Yes |
| Git remote | `https://github.com/Strata-Noble/stratanoble-site.git` (sanitized during mission) | `https://github.com/Strata-Noble/stratanoble-site.git` |
| Current branch | `fix/sn-stress-test-supabase-cli-install` (at audit time) | `main` |
| Latest commit (local HEAD) | `7a2bdbc` — *fix(ci): skip Supabase CLI install…* (2026-04-01) | `9ce0f53` — *chore(ANX): task-executor run-53…* (2026-04-30) |
| `origin/main` tip | `c6c5b19666fe448ef38655c20df0fe50681eaf33` | Same |
| Dirty working tree | Yes (`M package.json` at audit time) | Yes (large WIP; ahead of `origin/main` by 3 commits at audit time) |
| Vercel project linked (repo) | No `.vercel/project.json` in git; no local `.vercel` dir detected | No `.vercel/project.json` in git; empty or non-project `.vercel` presence not used as authority signal |
| Package manager | `npm@10.8.2` | `npm@10.8.2` |
| Framework | Monorepo: Next.js 16 apps (`apps/platform`, `apps/website`, etc.) | Same structure |
| Build command (root) | `cd apps/platform && npm run build` | Same |
| Domain references | Same repo content; `stratanoble.com` in marketing/site code | Same; numerous `https://stratanoble.com` references under `apps/website` |
| Last modified activity | ~2026-04-13 (sample scan excluding `node_modules` / `.git`) | ~2026-04-30 |
| Unique files | **Branch skew:** 109 paths tracked on OLD local branch not in NEW **local** index (see delta report). **No** unique paths on OLD `origin/main` vs NEW `origin/main` after fetch. | 76 paths on NEW local index not on OLD local branch (WIP / branch difference) |
| Likely authority | **Legacy checkout** — same remote, older branch, older timestamps | **Canonical** — primary workspace, `main`, latest activity, mission target |

## Evidence commands (reproducible)

```powershell
git -C "C:\Dev\00_core\stratanoble-site" fetch origin
git -C "C:\Dev\10_products\StrataNoble" fetch origin
git -C "C:\Dev\00_core\stratanoble-site" rev-parse origin/main
git -C "C:\Dev\10_products\StrataNoble" rev-parse origin/main
```

## Quarantine status

Planned move to `C:\Dev\00_core\_archive\stratanoble-site_LEGACY_DO_NOT_USE` **failed** with *“item is in use”*. Legacy folder remains at the original path but is **marked** with `README_LEGACY_DO_NOT_USE.md` and sanitized `origin`. Complete the move when no process holds the directory (see README in legacy folder).
