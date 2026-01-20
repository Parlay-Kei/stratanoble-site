# LinkedIn Operator Agent

**Type**: RPA Automation Agent (Playwright)
**Status**: Active
**Risk Level**: Medium (External service interaction)
**Skill File**: `C:\Dev\.claude-anx\skills\linkedin-operator-ops.md`

## Purpose

Internal ANX agent for managing LinkedIn Service Page updates and handling inbound service requests via browser automation.

## Capabilities

| Capability | Description | Risk |
|------------|-------------|------|
| Session Management | Cookie-based login session handling | Medium |
| Page Navigation | Navigate to Service Page admin view | Low |
| Overview Editing | Edit Overview section content | Medium |
| Services Tags | Manage Services Provided tags | Medium |
| Pricing Updates | Edit Pricing information | Medium |
| Work Samples | Upload images/PDFs | Medium |
| Proof Screenshots | Capture evidence for audit trail | Low |

## Runner Script

```bash
# Location
scripts/linkedin-operator.ts

# Usage
npx ts-node scripts/linkedin-operator.ts <command> [options]
```

## Safety Architecture

### 1. Dry Run Mode (DEFAULT)

**All operations default to dry-run mode.** The agent will:
- Navigate to pages normally
- Capture screenshots at each step
- Log all actions with timestamps
- **NOT** make any actual edits

To enable live edits, you must explicitly pass `--live`:

```bash
# Dry run (default) - safe
npx ts-node scripts/linkedin-operator.ts update-overview "New text"

# Live mode - actually edits
npx ts-node scripts/linkedin-operator.ts update-overview "New text" --live
```

### 2. Security Prompt Detection

The agent monitors for these security challenges:
- 2FA PIN prompts
- CAPTCHA challenges
- Checkpoint verification
- Login form (session expired)
- reCAPTCHA

**On detection**: Agent immediately stops, captures screenshot, and returns control to OCS (Operator Control Station).

### 3. Rate Limiting & Pacing

| Control | Value |
|---------|-------|
| Minimum wait between actions | 2-5 seconds (randomized) |
| Typing speed | 50ms per character |
| Browser slowMo | 500ms |
| Max actions per session | 10 |

### 4. Action Logging

Every action is logged to `proof-packs/<run-id>/action-log.json`:

```json
{
  "action": "update_overview_start",
  "timestamp": "2026-01-19T10:30:00.000Z",
  "data": {
    "dryRun": true
  }
}
```

### 5. Proof Screenshots

Screenshots captured at every state change:
- Session established
- Page loaded
- Before edit
- After edit
- On error
- On security prompt

## Commands

| Command | Description | Default Mode |
|---------|-------------|--------------|
| `dry-run <url>` | Navigate and screenshot only | N/A (always dry) |
| `status` | Check session status | N/A |
| `update-overview <text>` | Update overview section | Dry Run |
| `update-services <tags>` | Update service tags | Dry Run |
| `update-pricing <info>` | Update pricing | Dry Run |
| `upload <files>` | Upload work samples | Dry Run |
| `help` | Show usage | N/A |

## Options

| Option | Description |
|--------|-------------|
| `--live` | Enable actual edits (disables dry-run) |
| `--headless` | Run browser without GUI |
| `--url <url>` | LinkedIn Service Page URL |
| `--cookie-path <path>` | Custom session cookie file |

## Proof Pack Structure

```
proof-packs/
└── run-2026-01-19T10-30-00/
    ├── action-log.json           # Full audit trail
    ├── receipt.json              # Run summary
    ├── *_session-established.png
    ├── *_service-page-loaded.png
    ├── *_before-overview-edit.png
    ├── *_after-overview-typed.png
    └── *_overview-saved.png
```

## Error Handling

| Error Code | Meaning | Action |
|------------|---------|--------|
| `SECURITY_PROMPT` | 2FA/CAPTCHA detected | Return to OCS |
| `SESSION_EXPIRED` | Login required | Return to OCS |
| `NOT_LOGGED_IN` | No valid session | Return to OCS |
| `ELEMENT_NOT_FOUND` | UI element missing | Log and continue |
| `ACTION_LIMIT_EXCEEDED` | Too many actions | Return to OCS |
| `TIMEOUT` | Page load timeout | Retry or fail |

## Session Management

Sessions are stored in `./linkedin-session.json` (cookie-based).

**Initial Setup (Manual)**:
1. Run in non-headless mode: `--no-headless`
2. Log in manually when browser opens
3. Session cookies are saved automatically

**Session Refresh**:
- Sessions typically last 2-4 weeks
- On expiry, agent detects and returns to OCS
- Re-authenticate manually, then retry

## Integration Points

| System | Integration |
|--------|-------------|
| ANX Skills | `linkedin-operator-ops.md` skill file |
| Proof Packs | `./proof-packs/` directory |
| Session Store | `./linkedin-session.json` |
| Action Logs | JSON audit trail per run |

## Example Workflows

### 1. Safe Preview (Dry Run)

```bash
# Navigate and screenshot without editing
npx ts-node scripts/linkedin-operator.ts dry-run \
  "https://www.linkedin.com/services/your-page"
```

### 2. Update Overview (Live)

```bash
# First dry-run to verify
npx ts-node scripts/linkedin-operator.ts update-overview \
  "We provide premium barbering services..." \
  --url "https://linkedin.com/services/page"

# If satisfied, run live
npx ts-node scripts/linkedin-operator.ts update-overview \
  "We provide premium barbering services..." \
  --url "https://linkedin.com/services/page" \
  --live
```

### 3. Upload Work Samples

```bash
# Dry run
npx ts-node scripts/linkedin-operator.ts upload \
  "samples/haircut1.jpg,samples/fade.jpg"

# Live
npx ts-node scripts/linkedin-operator.ts upload \
  "samples/haircut1.jpg,samples/fade.jpg" \
  --live
```

## Security Considerations

1. **No Password Storage**: Agent uses cookie-based sessions only
2. **No Security Bypass**: Never attempts to bypass 2FA/CAPTCHA
3. **Audit Trail**: Every action logged with timestamp
4. **Human Oversight**: OCS return on any security challenge
5. **Rate Limiting**: Prevents detection as bot behavior

## Maintenance

### Clean Old Proof Packs
```bash
# Delete runs older than 30 days
find ./proof-packs -type d -name "run-*" -mtime +30 -exec rm -rf {} +
```

### Reset Session
```bash
rm ./linkedin-session.json
# Then run agent in non-headless mode to re-authenticate
```

## Compliance Notes

- Keep proof packs for 90 days minimum for audit compliance
- Do not commit `linkedin-session.json` to version control
- Add `proof-packs/` to `.gitignore` if containing sensitive data

## Success Criteria

- Zero security bypass attempts
- 100% action logging coverage
- Proof screenshot for every state change
- Dry-run mode functions correctly
- OCS return on all security prompts
- Rate limiting enforced

**Safe automation. Full audit trail. Human oversight preserved.**
