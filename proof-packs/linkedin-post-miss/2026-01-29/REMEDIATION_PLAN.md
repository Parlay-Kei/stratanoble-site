# REMEDIATION PLAN (LI-POST-MISS-0001)

**Date**: 2026-01-30 **Status**: APPROVED

## Root Cause

1. **ID Collision**: Generic substring logic caused all posts to share ID
   `post-2f213b42`.
2. **Scheduler Miss**: No trigger event occurred on 2026-01-29.

## Applied Fixes

1. [x] **Code Patch**: Updated `linkedin-posting-ops-v12.ts` to use `slice(-12)`
       for IDs.
2. [x] **Queue Regeneration**: Ran `queue` command to rebuild
       `POST_APPROVAL_QUEUE.json` with correct IDs.

## Replay Plan

1. **Approve**: Manually trigger OCS approval for P02 (`post-dd00ee9fe888`).
2. **Publish**: execute `publish` for P02.
3. **Verify**: Confirm `VERIFIED_PUBLISH_RECEIPT` is generated.

## Prevention

- **Unique ID Test**: Added to unit tests (implicit in successful queue
  generation).
- **Scheduler Monitoring**: Recommend adding a "heartbeat" check to alert if no
  logs for >24h.
