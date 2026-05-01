# Strata Noble Deployment Authority

**Missions:** OCS-STRATA-NOBLE-REPO-AUTHORITY-CLEANUP-0001 (baseline) · **OCS-STRATA-NOBLE-DEPLOYMENT-AUTHORITY-VERIFY-0003** (host verification, 2026-05-01)  
**Canonical codebase:** `C:\Dev\10_products\StrataNoble`  
**Executor:** Evidence from repo config + live production response headers (no legacy-tree inspection)

## Authoritative production (verified)

| Item | Value | How verified |
| --- | --- | --- |
| **Authoritative host** | **Netlify** | HTTPS `HEAD` to production returns `Server: Netlify`, `X-Nf-Request-Id`, and `Cache-Status` referencing `Netlify Edge` (session 2026-05-01). |
| **Production URL** | **`https://stratanoble.com/`** | Same live check; matches `netlify.toml` redirects and app metadata. |
| **Source repository (Git)** | **`https://github.com/Strata-Noble/stratanoble-site`** | Documented in prior authority work; unchanged. |
| **Production branch (expected)** | **`main`** | Aligns with CI triggers (`.github/workflows/ci.yml`) and historical ops notes; Netlify UI should show connected branch. |
| **Netlify site slug (repo + ops trail)** | **`stratanoble`** | Internal runbooks use `https://app.netlify.com/sites/stratanoble/deploys` (e.g. `docs/completion/NETLIFY_ENV_FIX_COMPLETE_2025-10-16.md`, `docs/HOW_TO_GET_NETLIFY_ERROR_LOGS.md`). |
| **Build contract in canonical repo** | Root **`netlify.toml`** | Builds monorepo deps then `apps/website` with `@netlify/plugin-nextjs`; `publish = "apps/website/.next"`; production domain redirects for `stratanoble.com`. |

## Not verified in this session (dashboard / API only)

| Item | Status | How to confirm |
| --- | --- | --- |
| **Netlify team / account display name** | Not in repo | Netlify UI → Team settings. |
| **Latest production deployment Git commit SHA** | Not queried | Netlify → Site **stratanoble** → **Deploys** → latest *Published* deploy → linked Git commit (or Netlify API with auth). |
| **Whether any other Netlify site attaches the same custom domain** | Not queried | Netlify domain management for `stratanoble.com` (should be single primary). |

## Non-authoritative or stale references (do not infer production)

| Item | Notes |
| --- | --- |
| **Vercel as “production” for `stratanoble.com`** | **Not supported by evidence.** No `vercel.json` in canonical tree; no checked-in `.vercel/project.json`. `docs/ops/deployment-ops.md` still describes a Vercel-oriented flow; treat that file as **generic / outdated for the public marketing site** until edited. A **stale or unused Vercel project is not production authority** without dashboard proof it serves this domain. |
| **`apps/platform/netlify.toml`** | Separate Netlify-oriented build for **platform** app (not the same artifact path as root site config). Production *marketing* authority for the main domain is the **root** `netlify.toml` + live headers above. |

## Inspection scope (mission 0003)

- **In-repo only:** `C:\Dev\10_products\StrataNoble` — root `netlify.toml`, `.github/workflows/*`, `apps/website`, internal ops docs citing Netlify URLs.  
- **Live check:** Response headers from `https://stratanoble.com/` (read-only).  
- **Excluded:** Legacy `stratanoble-site` tree; unauthenticated Vercel CLI guessing.

## Follow-up (human, short)

1. Netlify Dashboard → site **stratanoble** → confirm Git repo `Strata-Noble/stratanoble-site`, production branch `main`, and custom domain `stratanoble.com`.  
2. Copy the **latest published deploy** commit SHA into this file (table above) when known.  
3. Optionally align `docs/ops/deployment-ops.md` with Netlify-first reality for `apps/website`, or mark it explicitly as “other products / historical.”

## Verification receipt — OCS-STRATA-NOBLE-DEPLOYMENT-AUTHORITY-VERIFY-0003

- **Authoritative host:** Netlify  
- **Authoritative production URL:** `https://stratanoble.com/`  
- **Latest deployment reference (Git SHA):** *Pending — obtain from Netlify published deploy*  
- **Netlify site slug (documented trail):** `stratanoble`  
- **Non-authoritative without further proof:** Vercel (docs-only references; no live header proof for this domain)  
- **File updated:** `docs/ops/STRATA_NOBLE_DEPLOYMENT_AUTHORITY.md`  
