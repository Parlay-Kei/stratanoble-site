# Rate Limiting Bucket Policy Implementation - January 2, 2026

## Overview

Implemented a bucketed rate limiting system with different policies for intake (fail-open) and auth (fail-soft) routes.

## Bucket Policies

### Bucket 1: Intake (Forms, Lead Capture, Contact, Downloads)

**Goal**: Stop spam and bots while keeping conversions smooth.

**Limits**:
- Per IP: 10 requests / 1 minute
- Burst cushion: 60 requests / 1 hour (catches slow-drip abuse)

**Failure Mode**: Fail-open
- If Upstash is down, accept the lead and log it
- Marketing pages should not be blocked by infrastructure failures

**Response when blocked**:
- HTTP 429
- Message: "Too many submissions. Try again in a minute."

**Routes**:
- `/api/intake/lead-leak-check`
- `/api/intake/lead-rescue`
- `/api/intake/phase-3`
- `/api/intake/resource-download`
- `/api/contact`

### Bucket 2: Auth (Signin, Signup, Password Reset, Magic Links) ✅ IMPLEMENTED

**Goal**: Block brute force and account abuse.

**Limits** (stricter):
- Sign-in: 5 requests / 1 minute, 20 / 1 hour
- Sign-up: 3 / 1 hour per IP (bots love mass signup)
- Password reset: 3 / 15 minutes per IP
- Email verify / magic link request: 6 / 1 hour per IP

**Failure Mode**: Fail-soft
- If Upstash fails, return 429 with 300-800ms delay (fail-soft)
- Add friction: return 429 with "Try again shortly" and delay to slow brute force
- Prevents unlimited brute-force windows during Upstash outages

**Response when blocked**:
- HTTP 429
- Generic message: "Try again shortly." (no hints like "wrong password" vs "rate limited")
- 300-800ms random delay to slow brute force attempts

**Routes** (implemented in middleware):
- ✅ POST `/api/auth/callback/credentials` → `auth_signin` bucket
- ✅ POST `/api/auth/signin` → `auth_signin` bucket (credentials sign-in)
- ✅ POST `/api/auth/callback/email` → `auth_verify` bucket
- ✅ POST `/api/auth/signin/email` → `auth_verify` bucket

**Not rate limited** (benign endpoints):
- GET `/api/auth/session` (frequent polling)
- GET `/api/auth/providers` (UI needs this)
- GET `/api/auth/csrf` (form token)
- GET `/api/auth/error` (error page)
- GET `/api/auth/signin` (sign-in page)
- Keep it boring

**Implementation**: Middleware-based (Option A)
- Centralized policy in middleware
- No NextAuth internals touched
- Precise targeting (only high-risk endpoints)
- Deploy preview exemption maintained

## Implementation Details

### Key Design

**Stable Key Format**: `${bucket}:${clientIp}:${uaHash8}`

- Uses bucket name for isolation
- Uses client IP (extracted from Netlify headers)
- Optional: appends coarse user agent hash to reduce "one IP, many legit users" pain

**IP Extraction Priority** (Netlify-aware):
1. `x-nf-client-connection-ip` (Netlify-specific, most reliable)
2. `x-forwarded-for` (first IP is client)
3. `x-real-ip` (fallback)
4. `cf-connecting-ip` (Cloudflare fallback)
5. `127.0.0.1` (default)

### Environment Scoping

**Deploy Previews**: Rate limiting disabled
- Prevents blocking QA/testing due to shared Netlify IP ranges
- Check: `CONTEXT === 'deploy-preview'` or `NETLIFY_DEV`

**Production and Branch Deploys**: Rate limiting enabled
- Full protection when Upstash is configured

### Failure Behavior Per Bucket

**Intake (Fail-Open)**:
```typescript
try {
  const result = await rateLimit('intake', request);
  if (!result.success) {
    return 429;
  }
} catch (error) {
  // Log error but allow request through
  console.error('[RATE LIMIT ERROR]', error);
  // Continue processing request
}
```

**Auth (Fail-Soft)**:
```typescript
try {
  const result = await rateLimit('auth_signin', request);
  if (!result.success) {
    // Add delay to slow brute force (300-800ms)
    await delay(300 + Math.random() * 500);
    return 429;
  }
} catch (error) {
  // Log error and return 429 (fail-soft)
  console.error('[RATE LIMIT ERROR]', error);
  await delay(300 + Math.random() * 500);
  return 429;
}
```

## Files Modified

### Core Rate Limiting
- `apps/website/src/lib/rate-limit-buckets.ts` - New bucketed rate limiting system

### Intake Routes (Fail-Open)
- `apps/website/src/app/api/intake/lead-leak-check/route.ts`
- `apps/website/src/app/api/intake/lead-rescue/route.ts`
- `apps/website/src/app/api/intake/phase-3/route.ts`
- `apps/website/src/app/api/intake/resource-download/route.ts`
- `apps/website/src/app/api/contact/route.ts`

### Auth Routes (Fail-Soft) ✅ IMPLEMENTED
- `apps/website/src/middleware.ts` - Auth rate limiting implemented in middleware (Option A)
  - Targeted to high-risk endpoints only
  - Fail-soft behavior with 300-800ms delay
  - Benign endpoints excluded (session, providers, csrf, error, GET signin)

## Environment Variables

**Required (Production)**:
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token

**Optional**:
- `RATE_LIMIT_ENABLED=true` - Enable/disable rate limiting (default: enabled if Upstash configured)
- `RATE_LIMIT_CONTEXT_ALLOW=production,branch-deploy` - Contexts where rate limiting is active

## QA Checklist

### Intake Route Testing
- [ ] Submit 12 times in 60 seconds from same browser
- [ ] Expect a 429 around attempt 11
- [ ] Verify fail-open: temporarily break Upstash env vars, intake should still accept

### Auth Route Testing
- [ ] Hit sign-in endpoint 6 times in 60 seconds
- [ ] Expect 429 on attempt 6
- [ ] Verify fail-soft: temporarily break Upstash env vars, auth should slow/429 (not silently accept)

### Deploy Preview Testing
- [ ] Confirm deploy-preview does not rate limit at all
- [ ] Verify `CONTEXT === 'deploy-preview'` disables rate limiting

### Response Headers
- [ ] Verify `X-RateLimit-Limit` header present
- [ ] Verify `X-RateLimit-Remaining` header present
- [ ] Verify `X-RateLimit-Reset` header present
- [ ] Verify `Retry-After` header present on 429 responses

## Testing Commands

### Test Intake Rate Limiting
```bash
# Submit 12 times in 60 seconds
for i in {1..12}; do
  curl -X POST https://stratanoble.com/api/intake/lead-leak-check \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","businessName":"Test","leadSource":"other","whatsBreaking":"Test"}'
  sleep 5
done
```

### Test Auth Rate Limiting
```bash
# Hit sign-in 6 times in 60 seconds
for i in {1..6}; do
  curl -X POST https://stratanoble.com/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  sleep 10
done
```

### Test Fail-Open (Intake)
```bash
# Temporarily remove Upstash env vars in Netlify
# Submit intake form - should still accept
curl -X POST https://stratanoble.com/api/intake/lead-leak-check \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","businessName":"Test","leadSource":"other","whatsBreaking":"Test"}'
```

### Test Fail-Soft (Auth)
```bash
# Temporarily remove Upstash env vars in Netlify
# Try sign-in - should return 429 with delay
curl -X POST https://stratanoble.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

## Notes

- Intake routes use fail-open to ensure conversions aren't blocked
- Auth routes use fail-soft to prevent abuse even during Redis outages
- Burst cushion (60/hour) catches slow-drip abuse patterns
- User agent hash reduces false positives for shared IPs
- Deploy preview exemption prevents QA from being blocked
- All changes maintain backward compatibility
