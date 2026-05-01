# Strata Noble — Production Source Alignment

**Mission:** OCS-STRATA-NOBLE-AUTHORITY-FINALIZATION-0004  
**Date:** 2026-05-01  
**Owner (follow-up):** Steve Hubbard (Netlify + GitHub admin); Release Ops / OCS for doc maintenance.

## Questions and answers

### 1. What repo/path is canonical for product work?

| Layer | Authority |
| --- | --- |
| **Canonical local checkout** | `C:\Dev\10_products\StrataNoble` — all implementation, docs, and deploy config edits for Strata Noble product work. |
| **Canonical Git remote** | **`https://github.com/Strata-Noble/stratanoble-site`** — same repository identity as production; local folder name is not the source of truth. |

Agents must not treat “folder name” and “GitHub repo name” as conflicting: the repo is `stratanoble-site`; the **approved working directory** on this machine is `10_products\StrataNoble`.

### 2. What repo/source currently feeds Netlify production?

| Item | Value |
| --- | --- |
| **Netlify site** | `stratanoble` |
| **Site ID** | `4e5f1885-511a-49cf-af9f-631665a3f43e` |
| **Connected GitHub repo** | **`Strata-Noble/stratanoble-site`** |
| **Current published deploy ID** | `69e8d7dec0680c0009eb5c44` |
| **Git commit deployed to production** | `c6c5b19666fe448ef38655c20df0fe50681eaf33` |
| **Commit title** | `fix(legal): add Strata Noble Publisher disclosures to Privacy Policy and Terms` |
| **Commit URL** | `https://github.com/Strata-Noble/stratanoble-site/commit/c6c5b19666fe448ef38655c20df0fe50681eaf33` |

### 3. Is Netlify production connected to the “correct” source?

**Yes for Git identity; reconcile for recency.**

- Production is wired to the **same GitHub repository** that the canonical clone uses (`Strata-Noble/stratanoble-site`). There is no second mystery repo.
- **Gap:** Local `main` has advanced with authority cleanup, deployment verification, and related commits **after** the SHA that Netlify last published (`c6c5b19…`, published 2026-04-22). Until `origin/main` is updated and Netlify builds a new production deploy, **live production may lag** local canonical work.

### 4. What exact action is needed if the production source is stale?

1. **Push** canonical local `main` to **`origin/main`** (`git push origin main`) from `C:\Dev\10_products\StrataNoble`.
2. **Confirm** Netlify auto-build triggers for site `stratanoble` on push to `main` (team **Parlay-Kei’s team**, slug `parlay-kei`).
3. **Verify** the new deploy in Netlify shows the expected commit at the tip of `main`.
4. If builds fail, use Netlify deploy logs; do not repoint production to a legacy folder.

### 5. Who owns the follow-up?

| Item | Owner |
| --- | --- |
| Push + confirm Netlify build | Steve Hubbard (principal) / whoever holds GitHub + Netlify access |
| Keeping this doc accurate after each prod deploy | Release Ops |
| Agent routing (canonical path) | Enforced in `AGENTS.md` + `CANONICAL_REPO.md` |

## Status

| Check | State |
| --- | --- |
| **Repo identity alignment** | **Aligned** — canonical clone and Netlify both use `Strata-Noble/stratanoble-site`. |
| **Commit recency alignment** | **Open** — production at `c6c5b19…` until superseded by a newer published deploy after push. |

## Related documents

- `docs/ops/STRATA_NOBLE_DEPLOYMENT_AUTHORITY.md` — Netlify host + deploy metadata.  
- `proofs/strata-noble/REPO-AUTHORITY-CLEANUP-0001/CLOSEOUT_ADDENDUM.md` — legacy archive path.  
- `AGENTS.md` — Hard limit #11 (canonical path + legacy archive).
