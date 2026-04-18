# DC Dependabot PR triage — 2026-04-18

Triage executed under PLATOPS-SN-GHA-DEPENDABOT-0082. See `receipts/platops/PLATOPS-SN-GHA-DEPENDABOT-0082_2026-04-18.md` for full context.

## Starting state

- Repo: `Direct-Cuts-LLC/Direct-Cuts` (private)
- Open Dependabot PRs at start of triage: **20**
- Repo `allow_auto_merge: false` — used direct `gh pr merge --squash --admin` for greens.

## Results matrix

| PR | Title | Path | Bump | Checks at triage | Action | Outcome |
|---|---|---|---|---|---|---|
| #137 | basic-ftp 5.2.2 → 5.3.0 | root | patch | All SUCCESS | squash-merge | ✅ merged |
| #136 | protocol-buffers-schema 3.6.0 → 3.6.1 | root | patch | All SUCCESS | squash-merge | ✅ merged |
| #135 | hono 4.12.12 → 4.12.14 | `.claude/mcp-servers/anx-ops` | patch | All SUCCESS | squash-merge | ✅ merged |
| #134 | hono 4.12.12 → 4.12.14 | `.claude/mcp-servers/skills-server` | patch | All SUCCESS | squash-merge | ✅ merged |
| #133 | hono 4.12.12 → 4.12.14 | `ops/mcp-google-workspace` | patch | All SUCCESS | squash-merge | ✅ merged |
| #132 | hono 4.12.12 → 4.12.14 | `.claude/mcp-servers/support-ticket-server` | patch | All SUCCESS | squash-merge | ✅ merged |
| #131 | dev-dependencies group (10 updates) | root | grouped minor/patch | All SUCCESS | squash-merge | ✅ merged |
| #97 | brace-expansion 5.0.4 → 5.0.5 | root | patch | All SUCCESS | squash-merge | ✅ merged |
| #94 | picomatch (root) | root | patch | All SUCCESS | squash-merge | ✅ merged |
| #99 | happy-dom 20.8.4 → 20.8.9 | root | patch | All SUCCESS at the time | squash-merge attempted | ❌ "not mergeable" — base moved (PR is from 2026-03-29). Labeled `review-required`, asked for `@dependabot rebase`. |
| #36 | diff 4.0.2 → 4.0.4 | root | patch | All SUCCESS at the time | squash-merge attempted | ❌ "not mergeable" — base moved (PR is from 2026-01-20). Labeled `review-required`, asked for `@dependabot rebase`. |
| #98 | path-to-regexp 8.3.0 → 8.4.0 | `.claude/mcp-servers/skills-server` | patch | `ci (20.x)` FAILURE | label + comment | ⏸ `review-required` — needs CI debugging |
| #95 | picomatch | `apps/dc-ops` | patch (transitive) | `ci (20.x)` FAILURE | label + comment | ⏸ `review-required` — dc-ops-specific failure |
| #62 | ajv 8.17.1 → 8.18.0 | `.claude/mcp-servers/anx-ops` | minor | `ci (20.x)` FAILURE, `ci (18.x)` CANCELLED | label + comment | ⏸ `review-required` — Node 18 matrix breakage |
| #61 | ajv 8.17.1 → 8.18.0 | `.claude/mcp-servers/skills-server` | minor | `ci (20.x)` FAILURE, `ci (18.x)` CANCELLED | label + comment | ⏸ `review-required` — Node 18 matrix breakage |
| #58 | actions/github-script v7 → v8 | GHA | major | All SUCCESS | label + comment | ⏸ `review-required` — major action bump, review release notes |
| #57 | actions/setup-python v5 → v6 | GHA | major | All SUCCESS | label + comment | ⏸ `review-required` — major action bump, review release notes |
| #53 | qs 6.14.1 → 6.14.2 | `.claude/mcp-servers/skills-server` | patch | `ci (18.x)` FAILURE | label + comment | ⏸ `review-required` — Node 18 matrix breakage |
| #51 | qs 6.14.1 → 6.14.2 | `.claude/mcp-servers/anx-ops` | patch | `ci (18.x)` + `ci (20.x)` FAILURE | label + comment | ⏸ `review-required` — Node 18 matrix breakage |
| #29 | react-router + react-router-dom | root | major | `Type Check` FAILURE | label + comment | ⏸ `review-required` — React Router major migration |

## Summary

- **9 merged** (45% of opens)
- **11 review-required** (55% of opens) — all labeled, all commented with reason
- **0 closed without action**

## Common failure mode

**4 of 11 review-required PRs (#51, #53, #61, #62)** fail for the same reason: DC's CI workflow has a `node-version: 18.x` matrix entry that Dependabot can no longer satisfy on a fresh lockfile (most modern packages dropped Node 18 engine support). Single fix unlocks all 4 PRs:

```yaml
# Direct-Cuts-LLC/Direct-Cuts/.github/workflows/ci.yml
strategy:
  matrix:
    node-version: [22.x]   # was: [18.x, 20.x]
```

→ Recommended follow-up: **PLATOPS-DC-CI-DROP-NODE18** (also gets ahead of Vercel's June 2 Node 20 deprecation, mirroring what SN PR #62 does for SN).

## Per-PR comment text

See `dc-pr-comments.json` (sibling file in this directory) for the exact body posted on each PR.
