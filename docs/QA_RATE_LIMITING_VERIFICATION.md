# Rate Limiting QA Verification Checklist

**Date**: January 2, 2026  
**Purpose**: Verify rate limiting is working correctly in production after Upstash env vars are applied

**See Also**: `docs/PRODUCTION_VERIFICATION_CHECKLIST.md` for complete verification steps

## Prerequisites

1. ✅ Fresh production deploy triggered (commit `01f1492` - Edge crypto fix)
2. ✅ Async/await verification complete (all `generateRateLimitKey` calls properly awaited)
3. ✅ Confirm deploy ID matches the newest production deploy
4. ✅ Verify build logs show no "Rate limiting disabled" warnings
5. ✅ Verify build logs show no Edge Runtime crypto warnings

## Test 1: Intake Rate Limiting (Fail-Open)

### Test Setup
- **Endpoint**: `https://stratanoble.com/api/intake/lead-leak-check`
- **Method**: POST
- **Expected Limit**: 10 requests / 1 minute, 60 / 1 hour

### Test Steps

1. **Rapid Fire Test (10 requests in 60 seconds)**
   ```bash
   # Using curl (run 12 times rapidly)
   for i in {1..12}; do
     curl -X POST https://stratanoble.com/api/intake/lead-leak-check \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","name":"Test User"}' \
       -w "\nRequest $i: HTTP %{http_code}\n" \
       -s -o /dev/null
     sleep 1
   done
   ```

2. **Expected Results**:
   - ✅ Requests 1-10: HTTP 200 (success)
   - ✅ Request 11: HTTP 429 (rate limited)
   - ✅ Request 12: HTTP 429 (rate limited)
   - ✅ Error message: "Too many submissions. Try again in a minute."

3. **Fail-Open Test (Upstash Down Simulation)**
   - Temporarily remove `UPSTASH_REDIS_REST_URL` in Netlify (test deploy only)
   - Submit intake form
   - ✅ Should still accept (HTTP 200)
   - ✅ Should log error but not block

## Test 2: Auth Rate Limiting (Fail-Soft)

### Test Setup
- **Endpoint**: `https://stratanoble.com/api/auth/callback/credentials`
- **Method**: POST
- **Expected Limit**: 5 requests / 1 minute, 20 / 1 hour

### Test Steps

1. **Brute Force Test (6 requests in 60 seconds)**
   ```bash
   # Using curl (run 6 times rapidly)
   for i in {1..6}; do
     curl -X POST https://stratanoble.com/api/auth/callback/credentials \
       -H "Content-Type: application/x-www-form-urlencoded" \
       -d "email=test@example.com&password=wrongpassword" \
       -w "\nRequest $i: HTTP %{http_code} (Time: %{time_total}s)\n" \
       -s -o /dev/null
     sleep 1
   done
   ```

2. **Expected Results**:
   - ✅ Requests 1-5: HTTP 200 or 401 (auth failed, but not rate limited)
   - ✅ Request 6: HTTP 429 (rate limited)
   - ✅ Error message: "Try again shortly."
   - ✅ Response time: 300-800ms delay (fail-soft behavior)

3. **Fail-Soft Test (Upstash Down Simulation)**
   - Temporarily remove `UPSTASH_REDIS_REST_TOKEN` in Netlify (test deploy only)
   - Attempt sign-in 6 times
   - ✅ Should return HTTP 429 with delay (not allow unlimited attempts)
   - ✅ Should not silently accept brute force

## Test 3: Deploy Preview Exemption

### Test Setup
- **Endpoint**: Deploy Preview URL (any preview branch)
- **Expected**: No rate limiting at all

### Test Steps

1. **Get Deploy Preview URL**
   - Create a test PR or use existing preview
   - Copy preview URL (e.g., `https://deploy-preview-123--stratanoble.netlify.app`)

2. **Spam Test on Preview**
   ```bash
   # Hit preview endpoint 20 times rapidly
   for i in {1..20}; do
     curl -X POST https://deploy-preview-123--stratanoble.netlify.app/api/intake/lead-leak-check \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","name":"Test User"}' \
       -w "\nRequest $i: HTTP %{http_code}\n" \
       -s -o /dev/null
     sleep 0.5
   done
   ```

3. **Expected Results**:
   - ✅ All requests: HTTP 200 (no rate limiting)
   - ✅ No 429 responses
   - ✅ No rate limit headers in response

## Test 4: Benign Endpoints (Not Rate Limited)

### Test Setup
- **Endpoints**:
  - `GET /api/auth/session`
  - `GET /api/auth/providers`
  - `GET /api/auth/csrf`
  - `GET /api/auth/error`
  - `GET /api/auth/signin`

### Test Steps

1. **Rapid Polling Test**
   ```bash
   # Poll session endpoint 50 times rapidly
   for i in {1..50}; do
     curl -X GET https://stratanoble.com/api/auth/session \
       -w "\nRequest $i: HTTP %{http_code}\n" \
       -s -o /dev/null
     sleep 0.1
   done
   ```

2. **Expected Results**:
   - ✅ All requests: HTTP 200 (no rate limiting)
   - ✅ No 429 responses
   - ✅ Smooth UX (no blocking)

## Verification Checklist

After running all tests, verify:

- [ ] Intake rate limiting works (429 on attempt 11)
- [ ] Intake fail-open works (accepts when Upstash down)
- [ ] Auth rate limiting works (429 on attempt 6)
- [ ] Auth fail-soft works (429 with delay when Upstash down)
- [ ] Deploy preview exemption works (no rate limiting)
- [ ] Benign endpoints not rate limited (session, providers, csrf)
- [ ] Error messages are correct ("Too many submissions" vs "Try again shortly")
- [ ] Response headers include rate limit info (`X-RateLimit-*`)

## Failure Scenarios

If any test fails, check:

1. **Build logs**: Look for "Rate limiting disabled" warnings
2. **Environment variables**: Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
3. **Deploy ID**: Confirm you're testing the newest production deploy
4. **Netlify context**: Check `CONTEXT` env var (should be `production` not `deploy-preview`)

## Next Steps

After verification:
1. ✅ Document results
2. ✅ Address any failures
3. ✅ Proceed to Step 3 (env var scope security)
4. ✅ Proceed to Step 4 (completeness gates)
