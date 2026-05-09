# TikTok Access Requirement

Mission ID: OCS-SN-TIKTOK-ACCESS-ENABLEMENT-0004  
Account: https://www.tiktok.com/@strata.noble  
Purpose: Resolve publishing access only. No new content strategy.

## Selected Path (Lowest Friction In This Repo)

**Option C (primary): Controlled browser session for TikTok web upload**

The in-repo Social Ops MCP (`mcp-servers/social-ops`) is designed to post TikTok video via **Puppeteer** to `https://www.tiktok.com/upload` using **`TIKTOK_SESSION_COOKIES`** loaded from **`mcp-servers/social-ops/.env`**.

Evidence:

- `tiktok-poster.js` parses `sessionCookies` JSON and calls `page.setCookie(...)` before hitting the upload URL.
- `index.js` loads `process.env.TIKTOK_SESSION_COOKIES` into `config.tiktok.sessionCookies` (with `dotenv` from `.env` in the social-ops directory).
- README documents cookie export from a logged-in browser session.

**Note:** `postToTikTok` in `index.js` currently returns a mock post URL in non-dry-run paths; full end-to-end wiring to `TikTokPoster.upload()` should be verified before relying on automation. Session cookie format and login check remain the correct prerequisite either way.

## Option Evaluation (Platform Ops)

| Option | Workspace finding |
|--------|-------------------|
| **A** Approved scheduler with TikTok Business publishing | **Not verifiable from git.** No evidence of Buffer, Later, Hootsuite, or similar linked to Strata Noble in this repository. Confirm with Steve or finance or marketing tooling inventory outside the repo. |
| **B** TikTok Business Center or TikTok Studio | **Not verifiable from git.** Confirm whether `@strata.noble` is already a Business account and who holds Admin or Content Operator in Business Center. |
| **C** Browser session credentials | **Supported by codebase** once `.env` exists with valid cookies for the correct TikTok account. |
| **D** Steve request | Required only if no vault path and no delegate can place credentials or Business roles. |

## Minimum Credential Formats

### a. Session cookies (recommended for Social Ops MCP)

- **Variable:** `TIKTOK_SESSION_COOKIES`
- **Format:** Single-line JSON **array** of cookie objects compatible with Puppeteer `setCookie` (name, value, domain, path, and related fields as exported for `tiktok.com`).
- **Source:** Log into TikTok as `@strata.noble` in a supported browser, export cookies per org policy (approved extension or devtools workflow), store in vault, copy into `.env` on an approved machine only. **Do not commit `.env`.**

### b. Access token

- **Variable:** `TIKTOK_ACCESS_TOKEN` exists in `.env.template`.
- **Code status:** `TikTokAPIClient` class exists in `tiktok-poster.js`, but **`index.js` does not load `TIKTOK_ACCESS_TOKEN` into the TikTok posting path** today. Treat API token posting as **future or manual wiring**, not the default enabled path without engineering follow-up.

### c. Scheduler login

- **Format:** Whatever the chosen vendor requires (OAuth to TikTok Business, API key, etc.).
- **Workspace:** Not defined in-repo. Lowest friction is whichever scheduler Strata Noble already pays for and that Steve authorizes for `@strata.noble`.

### d. Business Center role invite

- **Minimum:** Role that can upload or schedule content for the Strata Noble TikTok identity (exact role name follows TikTok UI).
- **Deliverable to Steve if chosen:** One invite to the correct Business Center asset tied to `@strata.noble`.

## Exact Authorization Needed To Unblock

**One of:**

1. **Operational:** Valid `TIKTOK_SESSION_COOKIES` for `@strata.noble` placed in `mcp-servers/social-ops/.env` on an approved operator machine (never committed), **or**
2. **Delegated:** Confirmed third-party scheduler or TikTok Business workflow with a named person (ANX or delegate) allowed to create drafts or schedule.

Until one of these exists, **publishing remains blocked** even though Posts 1 through 14 stay queued.

## Steve Request (Single Item, Use Only If No Repo Or Vault Path)

**Steve:** Please authorize exactly one of: (a) placement of `@strata.noble` TikTok session material into approved credential storage for Social Ops MCP, or (b) a Business Center or scheduler role for the designated publisher.

No additional scope.
