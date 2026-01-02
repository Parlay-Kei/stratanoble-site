# Intake Route 500 Error Diagnosis

**Issue**: All intake form submissions return HTTP 500  
**Impact**: Revenue leak - leads are not being captured  
**Priority**: CRITICAL - Must fix before Step 5 (lead capture proof)

---

## Step 1: Prove It's Not the Test Script

**Action**: Submit Lead Leak Check form from live UI at `https://stratanoble.com`

**Test URL**: `https://stratanoble.com/lead-leak-check` (or wherever the form is)

**Expected Outcomes**:
- ✅ **Browser submit works**: Script payload/headers are wrong → Fix script
- ❌ **Browser submit also 500s**: Real production issue → Continue to Step 2

**Result**: ⏳ PENDING

---

## Step 2: Pull Exact Error from Netlify Logs

**Action**: Get the actual error message from Netlify

**Where to Look**:
1. Netlify Dashboard → Site → Functions → `___netlify-server-handler` → Logs
2. OR: Netlify Dashboard → Deploys → Latest deploy → Logs → Filter by `/api/intake/lead-leak-check`

**What to Look For**:

### A) Prisma Database Connection Error

**Fingerprints**:
- `P1001`: Can't reach database server
- `P1017`: Server has closed the connection
- `Can't reach database server`
- `Connection timeout`
- `ECONNREFUSED`

**Fix Checklist**:
- [ ] Verify `DATABASE_URL` exists in Production environment variables
- [ ] Check Neon (or DB provider) connection settings
- [ ] Verify database is awake and reachable
- [ ] Check IP allowlist/network settings

---

### B) Table Does Not Exist (MOST LIKELY - CONFIRMED)

**Fingerprints**:
- `relation "leadIntake" does not exist`
- `column "idempotencyKey" does not exist`
- `table "leadIntake" does not exist`
- `relation "public.LeadIntake" does not exist`
- `P2002`: Unique constraint failed
- `P2025`: Record not found (when table doesn't exist)

**Why This Happens**:
- ✅ **CONFIRMED**: Build runs `prisma generate` but does NOT run `prisma migrate deploy`
- Current build command: `prisma generate && next build`
- `LeadIntake` model exists in schema (apps/website/prisma/schema.prisma:175-192)
- But table was never created in production database

**Fix Options**:

**Option 1: Add migrations to build (RECOMMENDED - DO THIS)**
```toml
# netlify.toml - Update build command
[build]
  base = "apps/website"
  command = "npm ci --no-audit --no-fund --legacy-peer-deps && npx prisma migrate deploy && npm run build --verbose"
```

**Option 2: Run migrations manually once (QUICK FIX)**
```bash
# Set production DATABASE_URL from Netlify
export DATABASE_URL="your-production-connection-string"
cd apps/website
npx prisma migrate deploy
```

**Option 3: Check migration status**
```bash
cd apps/website
npx prisma migrate status
# Will show which migrations are pending
```

---

### C) Email/SES Failure Causing 500

**Fingerprints**:
- `AWS SES authentication failed`
- `Missing region`
- `Invalid "From" address`
- `AccessDenied`
- `The request signature we calculated does not match`

**Fix**:
- [ ] Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in Production
- [ ] Verify `AWS_REGION` is set
- [ ] Verify SES "from" address is verified in AWS
- [ ] Wrap `notifyNewIntake()` in try/catch (should already be done, but verify)

**Code Check**:
```typescript
// Should already be wrapped, but verify:
try {
  await notifyNewIntake({...});
} catch (error) {
  console.error('[Lead Leak Check] SES notification failed:', error);
  // Continue - notification failure shouldn't block the request
}
```

---

### D) Body Parsing or Validation Crash

**Fingerprints**:
- `Unexpected end of JSON input`
- `Cannot read property 'email' of undefined`
- `body is not iterable`
- `SyntaxError: Unexpected token`

**Fix**:
- [ ] Ensure script sends `Content-Type: application/json`
- [ ] Ensure body is valid JSON
- [ ] Add error handling for `request.json()` failures

**Code Check**:
```typescript
let body;
try {
  body = await request.json();
} catch (error) {
  return NextResponse.json(
    { error: 'Invalid JSON' },
    { status: 400 }
  );
}
```

---

## Step 3: Apply Fix and Re-test

**After Fix Applied**:
1. Re-run intake form from browser
2. Verify HTTP 200 or 429 (not 500)
3. Check database for new row
4. Check email notification

**Then Re-run Rate Limit Test**:
```powershell
.\scripts\test-rate-limiting.ps1
```

**Expected**:
- Requests 1-10: HTTP 200
- Request 11: HTTP 429
- Request 12: HTTP 429

---

## Error Log Template

**Paste actual error here**:
```
[Paste Netlify error log lines here - 10-20 lines is enough]
```

**Diagnosis**: [Will be filled after error is provided]

**Fix**: [Will be filled after error is provided]

---

## Current Status

- [ ] Step 1: Browser test completed (test from live UI)
- [ ] Step 2: Error logs retrieved (paste 10-20 lines from Netlify)
- [ ] Step 3: Fix applied (based on actual error, not assumption)
- [ ] Step 4: Re-test passed
- [ ] Rate limit test re-run

**Current Assumption** (NOT PROOF):
- ❌ Assuming it's missing migrations (common pattern, but not proven)
- ✅ Need actual Netlify error logs to confirm

**Fix Prepared** (NOT COMMITTED YET):
- `netlify.toml` updated with `npx prisma migrate deploy`
- Waiting for proof before committing

**Blockers**: 
- Need actual error logs from Netlify to diagnose correctly
