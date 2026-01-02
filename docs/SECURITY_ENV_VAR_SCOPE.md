# Environment Variable Scope Security - Upstash Redis

**Date**: January 2, 2026  
**Issue**: Upstash Redis secrets are currently available in Deploy Previews  
**Risk**: Secrets exposed in preview logs and tooling  
**Recommendation**: Remove Upstash vars from Deploy Previews (safer option)

## Current State

**Upstash Environment Variables**:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Current Scope**: All contexts (production + deploy previews)

**Code Protection**: ✅ Already implemented
- Middleware checks `CONTEXT === 'deploy-preview'` and skips rate limiting
- Rate limiting code gracefully handles missing env vars

## Security Concern

Even though the code doesn't use Upstash in previews, the secrets are still:
1. **Present in preview environment** - accessible via Netlify dashboard
2. **Visible in preview logs** - if any code accidentally logs env vars
3. **Exposed to preview tooling** - any third-party integrations
4. **Risk of accidental use** - future code changes might not check context

## Recommended Solution: Remove from Deploy Previews

### Option A: Safer (Recommended)

**Action**: Remove Upstash vars from Deploy Preview scope

**Steps**:
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Find `UPSTASH_REDIS_REST_URL`
3. Edit scope: Change from "All contexts" to "Production & branch deploys"
4. Repeat for `UPSTASH_REDIS_REST_TOKEN`
5. Deploy Previews will not have these vars (code already handles this)

**Benefits**:
- ✅ Secrets not exposed in preview environments
- ✅ Zero risk of accidental logging/leakage
- ✅ Code already handles missing vars gracefully
- ✅ No code changes needed

**Drawbacks**:
- ⚠️ Can't test rate limiting in previews (but that's fine - test in production)

### Option B: Separate Preview Database

**Action**: Create separate Upstash DB for previews

**Steps**:
1. Create new Upstash Redis database for previews
2. Add preview-specific env vars:
   - `UPSTASH_REDIS_REST_URL_PREVIEW`
   - `UPSTASH_REDIS_REST_TOKEN_PREVIEW`
3. Update code to use preview vars when `CONTEXT === 'deploy-preview'`

**Benefits**:
- ✅ Can test rate limiting in previews
- ✅ Production secrets not exposed

**Drawbacks**:
- ⚠️ More complex (requires code changes)
- ⚠️ Additional Upstash database cost
- ⚠️ More maintenance

## Recommendation

**Choose Option A (Remove from Deploy Previews)**

**Rationale**:
- Code already exempts previews from rate limiting
- No need to test rate limiting in previews (test in production)
- Simpler and safer
- Zero code changes needed
- Follows principle of least privilege

## Implementation Steps

1. **Netlify Dashboard**:
   - Site Settings → Environment Variables
   - Edit `UPSTASH_REDIS_REST_URL`: Change scope to "Production & branch deploys"
   - Edit `UPSTASH_REDIS_REST_TOKEN`: Change scope to "Production & branch deploys"

2. **Verify**:
   - Create a test deploy preview
   - Check that rate limiting is disabled (expected behavior)
   - Confirm no errors in preview logs

3. **Document**:
   - Update deployment docs
   - Note that previews don't have Upstash vars (by design)

## Verification

After implementation:

- [ ] Upstash vars only in Production & branch deploys scope
- [ ] Deploy previews work without Upstash vars
- [ ] No errors in preview logs
- [ ] Rate limiting still works in production
- [ ] Documentation updated
