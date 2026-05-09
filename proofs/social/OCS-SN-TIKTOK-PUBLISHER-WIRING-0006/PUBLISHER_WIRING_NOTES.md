# Publisher Wiring Notes

Mission ID: OCS-SN-TIKTOK-PUBLISHER-WIRING-0006  

## Summary

`postToTikTok` in `mcp-servers/social-ops/index.js` now delegates to **`TikTokPoster.upload()`**. **Mock TikTok post URLs are removed** from the publish path. Receipts use **`queueSourcePath`** pointing at `docs/social/tiktok/STRATA_NOBLE_TIKTOK_POSTING_QUEUE_001.md`.

## Queue loader

- **`mcp-servers/social-ops/strata-queue-loader.js`** reads the markdown queue table and returns Posts **1 through 14**.
- **MCP tool:** `load_strata_noble_tiktok_queue` returns parsed rows (no secrets).
- **CLI:** `npm run validate-queue` exits **0** when **14** posts load.

## Execution modes

| Mode | Behavior |
|------|----------|
| **dry_run** | Default when `DRY_RUN_MODE=true` **or** `executionMode` is `dry_run`. Uses `TikTokPoster` validation path only; **no browser**, **no mock URL**. |
| **draft** | Requires `TIKTOK_EXECUTION_APPROVED=true`, non-empty cookies, `DRY_RUN_MODE=false`. Attempts draft UI click after caption (selectors may need QA tuning). |
| **schedule** | Blocked in code with explicit error until scheduling selectors exist. |
| **publish** | Same gates as draft plus **`TIKTOK_LIVE_PUBLISH_APPROVED=true`**. |

## Environment gates (`.env.template` updated)

- `TIKTOK_EXECUTION_MODE` (default `dry_run`)
- `TIKTOK_EXECUTION_APPROVED` must be `true` for any non-dry browser run
- `TIKTOK_LIVE_PUBLISH_APPROVED` must be `true` for **publish** mode
- `TIKTOK_SKIP_PUBLISH_CONFIRMATION` optional (dangerous; skips stdin confirm in poster)

## MCP tool `publish_tiktok_video`

Optional arguments: `executionMode`, `hashtags`, `scheduleAt`, `privacy`.

## TikTokPoster changes

- **`executionMode`** branches before Post: **draft** tries labeled buttons; **schedule** returns structured error; **publish** continues existing upload flow.
- **`clickFirstButtonMatchingLabels`** helper for draft discovery.

## Dependencies

`npm install` was run under `mcp-servers/social-ops/` to execute smoke tests; **`package-lock.json`** may appear as a new file for commit policy review.
