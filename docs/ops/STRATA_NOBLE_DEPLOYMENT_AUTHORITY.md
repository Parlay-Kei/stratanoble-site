# Strata Noble Deployment Authority

**Missions:** OCS-STRATA-NOBLE-REPO-AUTHORITY-CLEANUP-0001 · OCS-STRATA-NOBLE-DEPLOYMENT-AUTHORITY-VERIFY-0003 · OCS-STRATA-NOBLE-AUTHORITY-FINALIZATION-0004 · **OCS-STRATA-NOBLE-REMOTE-SYNC-AND-NETLIFY-VERIFY-0006** (push + publish verification attempt, 2026-05-01)  
**Canonical local codebase:** `C:\Dev\10_products\StrataNoble`  
**Canonical Git remote:** `https://github.com/Strata-Noble/stratanoble-site` (same repo Netlify builds from)

## Authoritative production (Netlify — dashboard verified)

| Item | Value |
| --- | --- |
| **Host** | **Netlify** |
| **Production URL** | **`https://stratanoble.com`** |
| **Netlify team** | Parlay-Kei’s team |
| **Team slug** | `parlay-kei` |
| **Team ID** | `67f5ee9336dfcdd59cd4773a` |
| **Site / project name** | `stratanoble` |
| **Site ID** | `4e5f1885-511a-49cf-af9f-631665a3f43e` |
| **Current deploy ID** | `69e8d7dec0680c0009eb5c44` |
| **Deploy state** | `ready` |
| **Published at (UTC)** | `2026-04-22T14:18:21.238Z` |
| **Production deploy commit (Git)** | `c6c5b19666fe448ef38655c20df0fe50681eaf33` |
| **Commit title** | `fix(legal): add Strata Noble Publisher disclosures to Privacy Policy and Terms` |
| **Commit URL** | `https://github.com/Strata-Noble/stratanoble-site/commit/c6c5b19666fe448ef38655c20df0fe50681eaf33` |
| **GitHub repo feeding production** | **`Strata-Noble/stratanoble-site`** |
| **Production branch (expected)** | **`main`** |

### Live response header check (supplementary)

HTTPS `HEAD` to `https://stratanoble.com/` returns `Server: Netlify`, `X-Nf-Request-Id`, and `Cache-Status` including `Netlify Edge` (session 2026-05-01).

## Production source alignment

| Topic | Status |
| --- | --- |
| **Git repo vs canonical folder** | Same remote: `Strata-Noble/stratanoble-site`. Canonical **local path** is `C:\Dev\10_products\StrataNoble` — not a different repository. |
| **Commit recency** | **Follow-up:** Production was pinned to `c6c5b19…` at publish time. Local `main` may be ahead until pushed and Netlify publishes a newer deploy. See **`docs/ops/STRATA_NOBLE_PRODUCTION_SOURCE_ALIGNMENT.md`**. |

## Build contract in canonical repo

Root **`netlify.toml`**: monorepo install, build `apps/website` with `@netlify/plugin-nextjs`, `publish = "apps/website/.next"`, redirects for `stratanoble.com`.

## Non-authoritative references

| Item | Notes |
| --- | --- |
| **Vercel for `stratanoble.com`** | Not production per live headers and repo layout; see mission 0003 notes. `docs/ops/deployment-ops.md` may still read “Vercel” for historical/generic flows — treat as non-authoritative for this site until revised. |
| **`apps/platform/netlify.toml`** | Separate Netlify-oriented config for the **platform** app artifact, not the primary marketing-site root contract. |

## Inspection scope

Evidence: repo `netlify.toml`, `.github/workflows/*`, Netlify dashboard fields supplied by principal (0004), live headers (0003).

## Follow-up

1. After each push to `main`, confirm Netlify **stratanoble** shows a new published deploy and update the “Current deploy” rows in this file if the team wants a running audit trail.  
2. Optionally align `docs/ops/deployment-ops.md` with Netlify-first reality for `apps/website`.

## 0006 remote sync + publish verification attempt

| Item | Result |
| --- | --- |
| **GitHub push from canonical repo** | **Succeeded** — `main` pushed to `origin/main` (latest synced SHA: `dce7454b120c0a1f05cad2167ef606e1c1ad8cc3`). |
| **Netlify API/CLI verification in agent runtime** | **Blocked** — DNS resolution failed for `api.netlify.com` and `registry.npmjs.org`; local `netlify` command in this runtime is not a usable CLI binary. |
| **Production URL check in agent runtime** | **Blocked** — DNS resolution failed for `stratanoble.com` during 0006 execution window. |
| **Latest confirmed production deploy (rollback reference)** | `69e8d7dec0680c0009eb5c44` (`ready`) on `https://stratanoble.com`, commit `c6c5b19666fe448ef38655c20df0fe50681eaf33`. |
| **New deploy after push** | **Pending external verification** once Netlify API/UI is reachable from an environment with working DNS. |

## Verification receipt — OCS-STRATA-NOBLE-AUTHORITY-FINALIZATION-0004

- **Netlify team / site / deploy:** Recorded in table above (dashboard-sourced).  
- **Production commit on Netlify:** `c6c5b19666fe448ef38655c20df0fe50681eaf33`  
- **Alignment record:** `docs/ops/STRATA_NOBLE_PRODUCTION_SOURCE_ALIGNMENT.md`  
