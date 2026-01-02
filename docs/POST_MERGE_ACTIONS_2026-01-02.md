# Post-Merge Actions - Brand Freeze 2026-01-02

**Date:** 2026-01-02  
**PR Merged:** #28 - Brand Freeze 2026-01-02

---

## ✅ Completed

- Brand freeze documentation created
- TypeScript error fixed (system_heartbeat)
- Deprecated swcMinify option removed
- Netlify Deploy Preview validated
- All brand checks passing

---

## 🔴 Immediate Ops List (Priority)

### 1. Rate Limiting Configuration

**Issue:** Rate limiting is disabled in production
```
[rate-limit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not configured. Rate limiting disabled.
```

**Risk:** Public endpoints (waitlist, contact, intake) are vulnerable to abuse without rate limiting.

**Action Required:**
- [ ] Configure Upstash Redis in Netlify environment variables
  - Add `UPSTASH_REDIS_REST_URL`
  - Add `UPSTASH_REDIS_REST_TOKEN`
- [ ] OR implement alternate throttling/captcha for all public endpoints
- [ ] Verify rate limiting is active after configuration

**Affected Endpoints:**
- `/api/waitlist`
- `/api/contact`
- `/api/intake/*`
- Any other public API routes

---

## ⚠️ Performance Optimization (Next Sprint)

### Lighthouse Performance Score: 49

**Current State:** Homepage is heavy, which can hurt conversion.

**Focused Performance Pass (Do NOT spiral into refactors):**

1. **Fix Largest LCP Offender**
   - [ ] Identify hero image/font/script causing slow LCP
   - [ ] Optimize or defer as appropriate
   - [ ] Target: LCP < 2.5s

2. **Remove Unused Client JS**
   - [ ] Audit client-side JavaScript on homepage
   - [ ] Remove unused imports/components
   - [ ] Use dynamic imports for non-critical components

3. **Defer Non-Critical Scripts**
   - [ ] Identify scripts that can be deferred
   - [ ] Move analytics/tracking to async/defer
   - [ ] Lazy load below-the-fold content

**Target:** Performance score > 70 (acceptable), > 90 (ideal)

**Approach:** Tight, focused fixes only. No architectural refactors.

---

## 📋 Notes

- Brand freeze is now active and enforced
- All future brand changes must align with `/brand/strata-noble/brand-spine.md`
- Run `npm run brand:check` before any brand-related PRs

---

**Next Review:** After rate limiting configuration and performance pass
