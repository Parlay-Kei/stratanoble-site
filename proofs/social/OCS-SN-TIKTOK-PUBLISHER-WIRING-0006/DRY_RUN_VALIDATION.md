# Dry-Run Validation

Mission ID: OCS-SN-TIKTOK-PUBLISHER-WIRING-0006  

## Commands run

From `mcp-servers/social-ops/`:

1. **`npm run validate-queue`**  
   - **Result:** PASS. Output: `OK: 14 posts from approved queue` and resolved path to `STRATA_NOBLE_TIKTOK_POSTING_QUEUE_001.md`.

2. **`npm test`** (`node smoke-test.js`, `DRY_RUN_MODE=true` forced in smoke test)  
   - **Result:** TikTok dry-run path **PASS** (`TikTok Dry Run Upload`). One unrelated failure: Notion fetch when API not configured.

## Copy unchanged

Queue file was **not** edited for this mission. Loader confirms **14** rows for Posts **1 through 14**.

## Mock URL removal

`postToTikTok` **no longer** returns placeholder `https://tiktok.com/@user/video/...`. Dry-run responses come from **`TikTokPoster.upload()`** preview object only.

## Secrets

Command output contained **no** cookie values or session payloads.

## Smoke test caveat

Full MCP server `postToTikTok` was not invoked via stdio in this run; wiring was validated by code review plus **`TikTokPoster` dry run** in smoke test and queue loader.
