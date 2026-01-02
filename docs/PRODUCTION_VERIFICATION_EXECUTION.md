# Production Verification Execution Guide

**Date**: January 2, 2026  
**Commit**: `6021a9e` (Edge crypto fix + verification docs)  
**Purpose**: Prove behavior in real production environment

---

## Step 1: Edge Crypto Warning Check (Netlify Logs)

### Action
Open production deploy for commit `6021a9e` in Netlify dashboard → Deploys → View build log

### Search Terms
- `Edge Runtime`
- `not supported in the Edge Runtime`
- `rate-limit-buckets.ts`
- `crypto`

### ✅ Pass Condition
**No Edge Runtime warnings about Node crypto**

### ❌ Failure Diagnosis
**If warnings appear:**
- Something still imports Node crypto (directly or indirectly)
- **Fix**: Ensure only Web Crypto is used in code that middleware touches
- **Fix**: Verify no shared file used by middleware drags in Node modules

---

## Step 2: Run QA Script Against Production

### Action
```powershell
.\scripts\test-rate-limiting.ps1
```

### ✅ Pass Conditions

**Intake Rate Limiting:**
- ✅ 429 on attempt 11+ within 60 seconds
- ✅ Error message: "Too many submissions. Try again in a minute."

**Auth Rate Limiting:**
- ✅ 429 on attempt 6 within 60 seconds
- ✅ Delay present (300-800ms) - fail-soft working
- ✅ Error message: "Try again shortly."

**Benign Endpoints:**
- ✅ All 50 requests succeed
- ✅ No rate limiting triggered
- ✅ No errors (no 500s)

### ❌ Failure Diagnosis

**If intake does NOT return 429:**
- Rate limiting not firing
- **Usual causes:**
  1. Middleware matcher not catching the routes you think it is
  2. IP extraction not producing a stable key
  3. Upstash env vars missing in production scope

**If benign endpoints get 429:**
- Targeting is too broad
- **Impact**: Breaks UX because NextAuth session polling is constant
- **Fix**: Narrow middleware route matching to exclude `/api/auth/session`, `/api/auth/providers`, `/api/auth/csrf`

---

## Step 3: Tighten Upstash Env Var Scope in Netlify

### Action
1. Go to Netlify → Site settings → Environment variables
2. Edit `UPSTASH_REDIS_REST_URL`:
   - ✅ Keep: **Production** and **Branch deploys**
   - ❌ Remove: **Deploy previews**
3. Edit `UPSTASH_REDIS_REST_TOKEN`:
   - ✅ Keep: **Production** and **Branch deploys**
   - ❌ Remove: **Deploy previews**

### ✅ Pass Conditions

**Deploy Preview Test:**
- ✅ Deploy preview builds successfully
- ✅ Deploy preview functions normally (no errors)
- ✅ Rate limiting disabled (code exemption working)

**Branch Deploy Test:**
- ✅ Branch deploy has Upstash creds available
- ✅ Rate limiting works on branch deploy
- ✅ Test intake endpoint - should rate limit after 10 requests

### ❌ Failure Diagnosis

**If deploy previews break:**
- Deploy-preview exemption is not early enough
- **OR** code path still tries Upstash before exemption logic
- **Fix**: Verify `CONTEXT === 'deploy-preview'` check happens before any Upstash calls

---

## Step 4: Lead Capture End-to-End Proof

### Action
Submit one clean submission per form in production:

1. **Lead Leak Check** - `/lead-rescue` page
2. **Lead Rescue** - `/lead-rescue` page
3. **Phase 3** - `/phase-3` page
4. **Resource Download** - Any resource download form
5. **Contact** - `/contact` page

### ✅ Pass Conditions (per form)

**Database Verification:**
- ✅ Row exists in production `leadIntake` table
- ✅ `source` field matches form type (e.g., `LEAD_LEAK_CHECK`, `LEAD_RESCUE`, `PHASE_3`, `RESOURCE_DOWNLOAD`, `CONTACT`)
- ✅ `name`, `email`, `businessName` populated correctly
- ✅ `payload` contains full form data
- ✅ `status` = 'NEW'
- ✅ `idempotencyKey` is set

**Email Notification Verification:**
- ✅ SES email arrives within 1-2 minutes
- ✅ Email subject/body matches intake type
- ✅ Email contains correct lead information

**Duplicate Prevention Test:**
- ✅ Submit same form twice rapidly (within 5 seconds)
- ✅ First submission: `{ success: true, duplicate: false }`
- ✅ Second submission: `{ success: true, duplicate: true }`
- ✅ Only ONE database row created

### ❌ Failure Diagnosis

**If DB works but email does NOT:**
- SES integration or env vars in production are wrong
- **OR** notification call is failing silently
- **Impact**: Revenue is leaking even though the site "works"
- **Fix**: Check SES credentials, verify `notifyNewIntake()` is being called, check error logs

**If duplicate prevention fails:**
- Idempotency key generation is not working
- **Fix**: Verify `generateIdempotencyKey()` produces stable keys

---

## Step 5: Launch Gate Decision

### Engineering Complete ✅ (when Steps 1-4 pass)
- ✅ No Edge warnings
- ✅ Rate limiting passes QA
- ✅ Env vars scoped correctly
- ✅ Every intake form writes to DB and sends email reliably

**Status**: "Engineering complete for intake + auth protection"

### Operationally Complete ⚠️ (requires operational processes)
- ✅ Single monitored inbox or queue for leads
- ✅ Follow-up habit with timestamps (even if just one person)
- ✅ Daily check that confirms the pipe is not clogged

**Status**: "Operationally complete"

**Current State**: System is a locked front door with a working doorbell. The business only starts when someone answers the bell every time.

---

## Test Output Analysis

**If you paste the PowerShell test output here, I can diagnose:**
- What passed
- What failed
- Likely root cause based on the pattern

**Common patterns:**
- All 200s → Rate limiting not active
- 500s → Upstash connection issue or code error
- Inconsistent 429s → IP extraction or key generation issue
- Benign endpoints 429 → Middleware targeting too broad
