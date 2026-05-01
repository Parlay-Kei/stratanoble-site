# Strata Noble Deployment Authority

**Mission:** OCS-STRATA-NOBLE-REPO-AUTHORITY-CLEANUP-0001  
**Date:** 2026-04-30  
**Executor:** Release Ops (evidence-based inference)

## Inspection results

| Check | OLD | NEW |
| --- | --- | --- |
| `.vercel/project.json` in git | Not present | Not present |
| Local `.vercel` | Not present | Present but no authoritative `project.json` surfaced in audit |
| CI/CD docs in repo | `docs/ops/deployment-ops.md` states GitHub → Vercel on merge to `main` | Same |

## Required conclusion

| Item | Value |
| --- | --- |
| **Active deployment source folder** | **`C:\Dev\10_products\StrataNoble`** (canonical clone for pushes; same remote as legacy) |
| **Active GitHub repo** | **`https://github.com/Strata-Noble/stratanoble-site`** |
| **Active Vercel project** | **Not verified in this audit** (no `project.json` in repo; dashboard / `vercel link` not run). Org hint from `AGENTS.md`: Sentry org `strata-noble` — treat Vercel naming as likely aligned but **confirm in Vercel UI**. |
| **Production domain** | **`stratanoble.com`** (canonical URLs in `apps/website` metadata, SEO helpers, Stripe callbacks) |
| **Production branch** | **`main`** (per `docs/ops/deployment-ops.md` and current NEW branch) |
| **Latest production deployment source commit** | **Not queried** (would require `vercel inspect` / dashboard with auth) |
| **Confidence level** | **Medium-high** for GitHub + domain + branch; **Medium** for exact Vercel project slug |
| **Evidence** | Same `origin/main` SHA on both clones after fetch; deployment ops doc; grep of `https://stratanoble.com` in `apps/website`; NEW is ahead on `main` with active 2026-04-30 work |

## Follow-up (human, 5 minutes)

1. Vercel Dashboard → Project linked to `Strata-Noble/stratanoble-site` → confirm production branch `main` and production domain `stratanoble.com`.
2. Optionally run `vercel link` from **canonical** folder and commit **only** if the team chooses to store `project.json` (often gitignored by policy).
