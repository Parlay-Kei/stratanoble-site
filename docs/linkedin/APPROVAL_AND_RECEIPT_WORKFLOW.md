# LinkedIn Approval and Receipt Workflow

**Mission ID:** ANX-LINKEDIN-MGMT-0001  
**Policy:** Approval-first for personal profile posting.

## Workflow Overview

1. Draft creation (agent)
2. Steve approval (required)
3. Publish execution (approved/compliant method only)
4. Verification + receipt capture
5. Weekly analytics note update

## Approval States

- `DRAFTED` - Created, not reviewed
- `PENDING_STEVE_APPROVAL` - Waiting Steve sign-off
- `APPROVED_TO_POST` - Approved for posting window
- `POSTED_PENDING_RECEIPT` - Posted, verification in progress
- `POSTED_VERIFIED` - URL and evidence captured
- `BLOCKED` - Missing input/approval/access

## Personal Profile Posting Rule

- Use safe approval-first workflow by default.
- Use automated posting only when compliant and explicitly approved.
- If compliant personal-post method is unavailable, route to manual assist with prebuilt post packet.

## Company Page API Rule

- Official LinkedIn Community Management/Page Management APIs may be used only if approved credentials and app scope are available.
- If app scope/token is missing, mark `BLOCKED` with exact requirement.

## Receipt Requirements (Per Published Post)

Each post receipt must include:
- Post ID
- Final approved copy
- Publish date/time
- Target profile confirmation (Steve identity)
- Post URL/permalink
- Screenshot link(s)
- Early metrics snapshot (24h)
- Notes on quality of engagement

## Blocked Access Logging Standard

When blocked, log exact missing item:
- Missing API app approval
- Missing token scope
- Missing Steve approval
- Missing identity verification
- Missing posting window confirmation

Do not use vague "access issue" language.

## Operating Controls

- No posting without explicit approval record
- No posting if identity gate fails
- No receipt omission after publish
- No unsupported claims in published copy
- No prohibited/private terms in public post

