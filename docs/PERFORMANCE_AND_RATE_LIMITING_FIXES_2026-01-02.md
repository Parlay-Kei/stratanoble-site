# Performance and Rate Limiting Fixes - January 2, 2026

## Summary

Fixed performance regression (analytics strategy), added fail-open guards for rate limiting, and added environment scoping to prevent blocking QA.

## ✅ Fixes Applied

### A) Analytics Strategy Reverted ✅

**Issue**: Changed from `lazyOnload` → `afterInteractive` which pulls analytics onto critical path, hurting Lighthouse scores.

**Fix**: Reverted to `lazyOnload` for both Google Analytics and Plausible.

**Files Modified**:
- `apps/website/src/app/layout.tsx`

**Rationale**: Analytics should not block page load. `lazyOnload` defers until after page is interactive, which is better for performance.

### B) Rate Limiting Fail-Open Guards ✅

**Issue**: Contact/intake forms could be blocked if Upstash Redis has transient outages.

**Fix**: Added try-catch blocks around rate limiting calls in intake routes with fail-open behavior.

**Files Modified**:
- `apps/website/src/app/api/intake/lead-leak-check/route.ts`
- `apps/website/src/app/api/intake/lead-rescue/route.ts`
- `apps/website/src/app/api/intake/phase-3/route.ts`
- `apps/website/src/app/api/intake/resource-download/route.ts`

**Behavior**:
- If rate limiting fails (Redis down, network error, etc.), log error but allow request through
- Marketing pages should not be blocked by infrastructure failures
- Rate limiting protects against abuse when available, but doesn't break legitimate submissions

### C) Environment Scoping for Rate Limiting ✅

**Issue**: Deploy Previews could be blocked by rate limiting due to shared Netlify IP ranges.

**Fix**: Added check to disable rate limiting on Deploy Previews.

**Files Modified**:
- `apps/website/src/middleware.ts`

**Logic**:
```typescript
// Disable rate limiting on Deploy Previews
if (process.env.CONTEXT === 'deploy-preview' || process.env.NETLIFY_DEV) {
  return NextResponse.next();
}
```

**Rationale**: QA/testing should not be blocked by rate limits. Production and branch deploys still get rate limiting protection.

### D) Redirect Rules Verification ✅

**Status**: Redirects are correctly configured with no loops.

**Rules in `netlify.toml`**:
1. `http://stratanoble.com/*` → `https://stratanoble.com/:splat` (301)
2. `http://StrataNoble.com/*` → `https://stratanoble.com/:splat` (301) 
3. `https://StrataNoble.com/*` → `https://stratanoble.com/:splat` (301)

**Analysis**:
- All redirects point TO `https://stratanoble.com` (lowercase)
- No redirect loops possible
- Rule #2 is redundant (http://StrataNoble.com would be caught by rule #1), but harmless

**Note**: Rule #2 could be removed for simplicity, but keeping it is fine.

### E) Metadata Verification ✅

**JSON-LD Description**: ✅ Matches meta description
- Both say: "Strata Noble builds and operates revenue-producing digital infrastructure..."

**Placeholder Removal**: ✅ Complete
- `google-site-verification` - Commented out (not in production)
- `ACHIEVERY_APP_ID` - Conditional (only renders if env var set)

## Rate Limiting Architecture

### Fail-Open Behavior

**Middleware Level**:
- If Redis not configured → allow requests (logged as warning)
- If rate limiting throws error → allow requests (logged as error)
- If Deploy Preview → skip rate limiting entirely

**Route Level** (Intake Forms):
- If rate limiting throws error → log error, allow request through
- Prevents blocking legitimate form submissions during Redis outages

### Environment Scoping

- **Production**: Rate limiting active (if Upstash configured)
- **Branch Deploys**: Rate limiting active (if Upstash configured)
- **Deploy Previews**: Rate limiting disabled (QA/testing)
- **Development**: Rate limiting disabled (unless `SKIP_RATE_LIMITING=false`)

## Performance Impact

### Analytics Loading
- **Before**: `afterInteractive` (blocks critical path)
- **After**: `lazyOnload` (deferred until after page interactive)
- **Expected**: Better Lighthouse Performance score

### Rate Limiting
- **Before**: Could block forms if Redis down
- **After**: Fail-open, forms work even if Redis unavailable
- **Trade-off**: Less protection during outages, but better UX

## Testing Checklist

- [x] Analytics reverted to lazyOnload
- [x] Fail-open guards added to intake routes
- [x] Environment scoping added for Deploy Previews
- [x] Redirect rules verified (no loops)
- [x] JSON-LD description matches meta description
- [x] Placeholder metadata removed/conditional
- [ ] Deploy and verify redirects work (curl tests)
- [ ] Test rate limiting with Upstash configured
- [ ] Test fail-open behavior (simulate Redis outage)
- [ ] Run Lighthouse audit (expect improvement)

## Next Steps

1. **Deploy changes** - Push to production
2. **Run Lighthouse** - Measure performance improvement
3. **Test redirects** - Use curl to verify no extra hops
4. **Monitor rate limiting** - Check logs after Upstash setup
5. **Verify fail-open** - Test form submission during simulated outage

## Notes

- Analytics should stay on `lazyOnload` unless there's data proving otherwise
- Rate limiting fail-open is intentional - marketing pages should not break
- Deploy Preview exemption prevents QA from being blocked
- All changes maintain backward compatibility
