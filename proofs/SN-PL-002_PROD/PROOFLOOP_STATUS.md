# ProofLoop Status: Strata Noble (SN-PL-002_PROD)
Date: [PENDING]
Production URL: [YOUR_PROD_URL]
Scope: **Production runtime verification**

## Verdict
Status: **PENDING**

## Prerequisites
- SN-PL-001_LOCAL is COMPLETE
- Code deployed to production
- Supabase connection active
- Email service configured

## Proof Index (minimum required)
- [ ] deploy_receipt.txt (deploy ID + timestamp + URL)
- [ ] dns_guard_receipt.txt (`./scripts/dns-guard.sh` output)
- [ ] prod_health_receipt.txt (curl output)
- [ ] auth_signup_receipt.png
- [ ] auth_confirm_email_receipt.png (**must show confirm link domain resolves**)
- [ ] auth_login_receipt.png
- [ ] auth_password_reset_receipt.png
- [ ] auth_session_persistence_receipt.png
- [ ] auth_ssr_session_read_receipt.txt
- [ ] error_monitoring_receipt.png (**must show: release version visible + events arriving**)
- [ ] prod_smoke_test_receipts.md

## Production Health Receipts

### Endpoints
| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| / | 302 → /auth | | ⏳ |
| /auth | 200 | | ⏳ |
| /dashboard | 200 | | ⏳ |
| /api/onboarding/status | 200 | | ⏳ |

## Live Auth Flow Receipts

### 1. Signup
- [ ] POST /api/auth with new email
- [ ] User created in Supabase
- [ ] Confirmation email received
- **Result:** ⏳

### 2. Confirm Email (CRITICAL)
- [ ] Email received with confirm link
- [ ] **Confirm link domain resolves** (not NXDOMAIN)
- [ ] Click link → redirect to app
- [ ] User email_confirmed = true in Supabase
- **Result:** ⏳

### 3. Login
- [ ] POST credentials
- [ ] Session cookie set (sb-*-auth-token)
- [ ] Redirect to /dashboard
- **Result:** ⏳

### 4. Password Reset
- [ ] Request reset for email
- [ ] Reset email received
- [ ] **Reset link domain resolves**
- [ ] Click link, set new password
- [ ] Login with new password works
- **Result:** ⏳

### 5. Session Persistence
- [ ] Refresh page while logged in
- [ ] Still logged in (cookie persists)
- [ ] No re-auth required
- **Result:** ⏳

### 6. SSR Session Read
- [ ] Load /dashboard (server render)
- [ ] Server reads session from cookie
- [ ] Page renders with user data (not loading state)
- **Result:** ⏳

## Differences from SN-PL-001_LOCAL
| Item | Local | Prod | Notes |
|------|-------|------|-------|
| | | | |

## Verdict Criteria
COMPLETE when:
- All 6 auth flows pass
- Email confirm link domain resolves (no NXDOMAIN)
- Error monitoring is active

---

## REPRO Commands

```bash
# 1. DNS guard (run first - fails fast if domains broken)
./scripts/dns-guard.sh YOUR_PROD_DOMAIN YOUR_AUTH_LINK_DOMAIN | tee dns_guard_receipt.txt

# 2. Health receipt
curl -i https://YOUR_DOMAIN/api/onboarding/status | tee prod_health_receipt.txt

# 3. Verify email domain resolves manually (backup check)
nslookup YOUR_EMAIL_LINK_DOMAIN

# 4. Error monitoring - take screenshot showing:
#    - Release/version tag visible
#    - Recent events arriving (not empty)
#    Save as: error_monitoring_receipt.png
```

---

## Scope Guard

This run proves production works. It does NOT expand to:
- Performance testing
- Load testing
- Accessibility audit
- SEO audit

New requirements become SN-PL-003+ only when they prevent **revenue, onboarding, or trust**.

---

**Run immediately after deploy. Capture email confirm link domain as first-class receipt.**
