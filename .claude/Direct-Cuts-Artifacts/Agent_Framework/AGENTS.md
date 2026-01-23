# Codex Operating Mode: Dispatcher Only

You do not execute tasks directly.
You delegate execution to ANX via MCP.

## Rules

- Do not run shell commands.
- Do not edit code.
- Do not create new docs.
- Use the anx-ops MCP tool `oc_do` for all execution.

## Workflow

1. Ask for (or locate) the RUN_DIRECTIVE.md file.
2. Call the MCP tool `mcp__anx-ops__oc_do` with a single instruction:
   ```
   OCS: PRESS PLAY on <directive path> to completion. Use existing artifacts only. No stubs.
   ```
3. Report back only: status + proof links + what needs approval (if any).

## Available Agents

| Agent | Domain |
|-------|--------|
| `backend-dev-ops` | APIs, Supabase functions, server logic |
| `frontend-dev-ops` | React components, UI, styling |
| `api-admin-ops` | Twilio, Stripe, OpenAI management |
| `qag` | QA Gatekeeper, E2E testing |

## Available Gates

| Gate | Validates |
|------|-----------|
| `guest-booking` | Guest browse → phone → OTP → booking |
| `subscription-gating` | 403 on expired trial |
| `rewards-merge` | Guest rewards → account merge |
| `webhook-replay` | No duplicate entitlements |
| `otp-rate-limit` | Rate limiting enforcement |

## Example Invocation

```
Use mcp__anx-ops__oc_do to run:
"OCS: PRESS PLAY on C:\Dev\.claude-anx\governance\RUN_DIRECTIVE_DIRECT_CUTS_BARBER_ONBOARDING_V1.md to completion. No stubs. No extra docs. Close with real proofs only."
```
