# CI Gate Integration Receipts

**Date:** 2026-01-16
**Purpose:** Validation evidence for CI gate integration

---

## Receipt Summary

| Item | Status | Evidence |
|------|--------|----------|
| Gate runner writes to proofs/latest | COMPLETE | run-gates.js updated |
| Preflight script with typed exit codes | COMPLETE | preflight.js created |
| CI workflow updated with gate-check job | COMPLETE | ci.yml updated |
| Artifact upload on pass AND fail | COMPLETE | `if: always()` in workflow |
| Makefile targets added | COMPLETE | `make gates`, `make preflight` |
| Doc index updated | COMPLETE | MVP_DELTA_AND_DOC_INDEX.md |

---

## 1. CI Workflow Configuration

**File:** `.github/workflows/ci.yml`

**New Job:** `gate-check`

```yaml
gate-check:
  runs-on: ubuntu-latest
  needs: ci
  if: github.ref == 'refs/heads/main' || github.base_ref == 'main'
```

**Key Features:**
- Runs only on main branch or PRs targeting main
- Runs preflight first, then gates
- Uploads artifacts on BOTH pass and fail (`if: always()`)
- Typed failure codes in final check step

---

## 2. Preflight Typed Exit Codes

**File:** `scripts/gates/preflight.js`

| Exit Code | Error Code | Meaning |
|-----------|------------|---------|
| 0 | - | All checks passed |
| 1 | ENV_MISSING | Required environment variable missing |
| 2 | SUPABASE_UNREACHABLE | Cannot connect to Supabase |
| 3 | STRIPE_UNREACHABLE | Cannot connect to Stripe |
| 4 | SUPABASE_AUTH_FAILED | Supabase auth check failed |
| 5 | STRIPE_AUTH_FAILED | Stripe API key invalid |

**Example Output (ENV_MISSING):**
```
╔════════════════════════════════════════════════════════════╗
║              PREFLIGHT DEPENDENCY SANITY                   ║
╚════════════════════════════════════════════════════════════╝

📋 Checking environment variables...

  ❌ VITE_SUPABASE_URL (MISSING)
  ❌ VITE_SUPABASE_ANON_KEY (MISSING)
  ❌ VITE_STRIPE_PUBLISHABLE_KEY (MISSING)

═════════════════════════════════════════════════════════════
PREFLIGHT SUMMARY
═════════════════════════════════════════════════════════════

❌ PREFLIGHT FAILED

Error Code: ENV_MISSING
Message: Required environment variables are missing

Exit Code: 1
```

---

## 3. Gate Summary Output

**File:** `docs/receipts/gate-proofs/latest/gate-summary.json`

**Example Content:**
```json
{
  "runId": "2026-01-16T12-30-45-123Z",
  "totalGates": 5,
  "passed": 4,
  "failed": 1,
  "gates": [
    {
      "gate": "guest-booking",
      "passed": true,
      "duration": 12345,
      "artifacts": [
        { "name": "screenshot-booking-form.png", "exists": true },
        { "name": "screenshot-otp-entry.png", "exists": true },
        { "name": "screenshot-confirmation.png", "exists": true }
      ]
    }
  ],
  "overallPass": false,
  "gitCommit": "abc123def456",
  "gitRef": "refs/heads/main",
  "ciRunId": "12345678",
  "ciRunUrl": "https://github.com/org/repo/actions/runs/12345678"
}
```

---

## 4. Artifact Upload

**Artifact Name Pattern:** `gate-proofs-{run_id}`

**Contents:**
```
gate-proofs-12345678/
├── latest/
│   ├── gate-summary.json
│   ├── preflight-result.json
│   ├── guest-booking/
│   │   ├── result.json
│   │   ├── screenshot-booking-form.png
│   │   ├── screenshot-otp-entry.png
│   │   └── screenshot-confirmation.png
│   └── subscription-gating/
│       ├── result.json
│       └── ...
└── run-2026-01-16T12-30-45-123Z/
    └── ... (same structure)
```

**Retention:** 30 days

---

## 5. Required GitHub Secrets

To enable gate-check job, add these secrets in GitHub repo settings:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox token | Optional |
| `VITE_ONESIGNAL_APP_ID` | OneSignal app ID | Optional |

**Path:** GitHub → Repo → Settings → Secrets and variables → Actions

---

## 6. Example: Successful Gate Run

**CI Run Link:** `https://github.com/{org}/{repo}/actions/runs/{run_id}`

**Console Output:**
```
╔════════════════════════════════════════════════════════════╗
║                    E2E GATE RUNNER                         ║
╚════════════════════════════════════════════════════════════╝

Run ID: 2026-01-16T12-30-45-123Z
Output: docs/receipts/gate-proofs/run-2026-01-16T12-30-45-123Z

────────────────────────────────────────────────────────────
GATE: guest-booking
DESC: Guest can browse, enter phone, verify OTP, and confirm booking
────────────────────────────────────────────────────────────

Result: ✅ PASS
Duration: 12345ms
Artifacts:
  ✓ screenshot-booking-form.png
  ✓ screenshot-otp-entry.png
  ✓ screenshot-confirmation.png

... (other gates)

════════════════════════════════════════════════════════════
GATE RUN SUMMARY
════════════════════════════════════════════════════════════
Total: 5
Passed: 5
Failed: 0

Overall: ✅ ALL GATES PASSED

Proof artifacts: docs/receipts/gate-proofs/run-2026-01-16T12-30-45-123Z
```

---

## 7. Example: Failed Gate Run with Preserved Artifacts

**CI Run Link:** `https://github.com/{org}/{repo}/actions/runs/{run_id}`

**Console Output:**
```
╔════════════════════════════════════════════════════════════╗
║                    E2E GATE RUNNER                         ║
╚════════════════════════════════════════════════════════════╝

Run ID: 2026-01-16T14-15-00-456Z
Output: docs/receipts/gate-proofs/run-2026-01-16T14-15-00-456Z

────────────────────────────────────────────────────────────
GATE: subscription-gating
DESC: Paid-only endpoints return 403 when trial expired
────────────────────────────────────────────────────────────

Result: ❌ FAIL
Duration: 8234ms
Artifacts:
  ✓ screenshot-trial-active.png
  ✗ screenshot-trial-expired-403.png

Error: Command failed: npx playwright test tests/e2e/subscription-gating.spec.ts
  Expected: 403
  Received: 200

════════════════════════════════════════════════════════════
GATE RUN SUMMARY
════════════════════════════════════════════════════════════
Total: 5
Passed: 4
Failed: 1

Overall: ❌ GATES FAILED

Proof artifacts: docs/receipts/gate-proofs/run-2026-01-16T14-15-00-456Z

⚠️  Gate failure blocks merge to main
```

**Artifact Contents (preserved on failure):**
```json
// latest/subscription-gating/result.json
{
  "gate": "subscription-gating",
  "description": "Paid-only endpoints return 403 when trial expired",
  "passed": false,
  "testPassed": false,
  "allArtifactsPresent": false,
  "artifacts": [
    { "name": "screenshot-trial-active.png", "exists": true },
    { "name": "screenshot-trial-expired-403.png", "exists": false }
  ],
  "duration": 8234,
  "timestamp": "2026-01-16T14:15:08.456Z",
  "error": "Command failed: Expected 403, Received 200"
}
```

---

## 8. Makefile Targets

```bash
# Run all E2E gates locally
make gates

# Run dependency sanity only
make preflight

# Run single gate
make gate-single GATE=guest-booking

# Full CI simulation
make ci-gates
```

---

## 9. Branch Protection Setup

To enforce gate-check as required:

1. Go to GitHub → Repo → Settings → Branches
2. Add branch protection rule for `main`
3. Enable "Require status checks to pass before merging"
4. Add `gate-check` to required status checks

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Engineer | Claude Code | 2026-01-16 |
| Reviewer | | |
