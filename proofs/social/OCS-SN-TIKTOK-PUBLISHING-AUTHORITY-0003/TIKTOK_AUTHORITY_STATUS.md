# TikTok Authority Status

Mission ID: OCS-SN-TIKTOK-PUBLISHING-AUTHORITY-0003  
Account: https://www.tiktok.com/@strata.noble  
Prepared by: Platform Ops (workspace evidence scan)  
Date: 2026-05-08  

## Summary

**Publishing authority from this repository and workspace: not verified.**

No committed credential material suitable for live TikTok publishing was found. A **supported integration path exists in-repo** (Social Ops MCP) but requires credentials configured **outside** git in a local `.env`, which is not present or cannot be validated here.

## Option Assessment

| Option | Finding |
|--------|---------|
| **A** Direct TikTok login in approved credential storage | **Unknown.** Credential vaults (1Password, Hostinger panel, etc.) are not readable from this codebase. No TikTok password or cookie payload appears in tracked files. |
| **B** TikTok Business Center / scheduler | **Unknown.** No evidence in-repo of an active Business Center connection or export token for Strata Noble. |
| **C** Third-party scheduler connected | **Unknown.** No repo proof of Buffer, Later, Hootsuite, or similar with TikTok enabled for `@strata.noble`. |
| **D** No authorized agent-accessible path yet | **Applies until Platform Ops confirms A, B, or C.** |

## Repository Evidence (Technical)

1. **`mcp-servers/social-ops/.env.template`** defines optional TikTok automation via `TIKTOK_SESSION_COOKIES` (browser automation) or `TIKTOK_ACCESS_TOKEN` (API-style placeholder). This indicates **Option A-style** tooling **when** a filled `.env` exists on an approved operator machine. It does **not** prove Strata Noble production credentials are provisioned.
2. **`mcp-servers/social-ops/`** documentation describes manual login then automation (session-based). That still requires **human-approved** cookie or token handling outside the repo.
3. **Root `.env.example` / app env examples** were scanned at a high level; none substitute for TikTok posting secrets for this mission.

## Capability Matrix (If Credentials Were Confirmed)

Based on Social Ops MCP design (see `mcp-servers/social-ops/README.md` and security receipts), **when** valid TikTok session or API material is configured:

| Capability | Likely available |
|------------|------------------|
| Draft creation | Depends on implementation; upload flow targets publish path with dry-run mode |
| Scheduling | **Not inferred from template alone**; TikTok native scheduler typically requires app or creator tools |
| Direct publishing | Supported via `publish_tiktok_video` style flows when authenticated |
| Analytics review | **Not** via Social Ops template alone; use TikTok Analytics in app or Business Center |

**Important:** Exact capabilities must be confirmed by whoever holds the live `.env` or TikTok Business access.

## Authority Status Verdict

**STATUS: UNCONFIRMED. BLOCKING AUTOMATED SCHEDULE FROM THIS WORKSPACE**

- **Minimum missing item for agent-side publishing:** Verified TikTok posting path for `@strata.noble` (session cookies or official API/Business workflow approved by Steve and stored per org policy), plus confirmation whether scheduling is native TikTok or a connected scheduler.

## Recommended Platform Ops Next Step

1. Confirm where Strata Noble TikTok credentials or session material live (vault label and owner).  
2. Confirm whether posting is **native TikTok**, **Business Center**, or **third-party scheduler**.  
3. Record the chosen path in OCS runbooks (no secrets in git).  
4. After confirmation, ANX can execute Phase 4 scheduling or drafting per actual capability.

## Latest verification (Platform Ops)

Checked on this machine: `mcp-servers/social-ops/.env` **does not exist**. No populated `TIKTOK_SESSION_COOKIES` or `TIKTOK_ACCESS_TOKEN` is available to the Social Ops MCP path in this workspace.

## Execution Rule Compliance

No manual TikTok setup was requested from Steve in this document. If no vault entry exists, **only** the minimum missing access item should be requested (for example: “Enable TikTok login or scheduler delegate for ANX” or “Provide approved cookie rotation procedure for Social Ops MCP”), not a full DIY setup unless no path exists.
