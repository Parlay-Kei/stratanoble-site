# Production Verification Steps - January 2, 2026

## Status: In Progress

This document tracks the verification steps needed to confirm Strata Noble is production-ready.

## Step 1: Force Env Vars to Take Effect ✅

**Action Taken**: Triggered fresh production deploy (commit `f8f65ce`)

**Next Steps**:
1. Wait for Netlify deploy to complete (~3-5 minutes)
2. Verify deploy ID matches newest production deploy
3. Check build logs for "Rate limiting disabled" warning (should NOT appear)

**Verification**:
- [ ] Deploy completed successfully
- [ ] Build logs show no "Rate limiting disabled" warnings
- [ ] Deploy ID confirmed as newest production deploy

## Step 2: Run QA Checklist ⏳

**Action Required**: Run comprehensive rate limiting tests

**Test Documentation**: See `docs/QA_RATE_LIMITING_VERIFICATION.md`

**Tests to Run**:
1. Intake rate limiting (fail-open)
2. Auth rate limiting (fail-soft)
3. Deploy preview exemption
4. Benign endpoints (not rate limited)

**Expected Results**:
- Intake: 429 on attempt 11, fail-open when Upstash down
- Auth: 429 on attempt 6, fail-soft when Upstash down
- Preview: No rate limiting at all
- Benign: No rate limiting (session, providers, csrf)

**Verification**:
- [ ] All tests passed
- [ ] Results documented
- [ ] Any failures addressed

## Step 3: Lock Down Env Var Scope ⏳

**Action Required**: Remove Upstash vars from Deploy Previews

**Documentation**: See `docs/SECURITY_ENV_VAR_SCOPE.md`

**Steps**:
1. Netlify Dashboard → Site Settings → Environment Variables
2. Edit `UPSTASH_REDIS_REST_URL`: Change scope to "Production & branch deploys"
3. Edit `UPSTASH_REDIS_REST_TOKEN`: Change scope to "Production & branch deploys"

**Rationale**: Code already exempts previews from rate limiting. No need to expose secrets in preview environments.

**Verification**:
- [ ] Upstash vars removed from Deploy Preview scope
- [ ] Previews still work (code handles missing vars)
- [ ] No errors in preview logs

## Step 4: Confirm "Complete" Gates ⏳

**Definition**: Complete = can take leads, follow up, and don't lose them

**Minimum Gates**:
1. **Contact and intake forms create lead records reliably**
   - [ ] Test `/api/contact` endpoint
   - [ ] Test `/api/intake/lead-leak-check`
   - [ ] Test `/api/intake/lead-rescue`
   - [ ] Test `/api/intake/phase-3`
   - [ ] Verify leads appear in database/CRM

2. **Email notifications or clear lead capture destination**
   - [ ] Check email notifications are sent
   - [ ] Verify lead destination (DB, inbox, CRM)
   - [ ] Test notification delivery

3. **Rate limiting proven in production**
   - [ ] Step 2 QA checklist completed
   - [ ] All tests passed

4. **Redirect rules proven with single hop**
   - [ ] `http://stratanoble.com` → `https://stratanoble.com` (301)
   - [ ] `https://StrataNoble.com` → `https://stratanoble.com` (301)
   - [ ] `https://stratanoble.com` → 200 (no extra hops)

5. **Metadata correct and consistent with brand spine**
   - [ ] Meta description matches hero copy
   - [ ] JSON-LD description matches meta description
   - [ ] No placeholder values in metadata

6. **No broken pages, no 500s, no auth lockouts**
   - [ ] Homepage loads correctly
   - [ ] All key pages accessible
   - [ ] No 500 errors in logs
   - [ ] Auth flows work correctly

**Verification**:
- [ ] All gates passed
- [ ] Site is "complete" by definition

## Step 5: Performance Sprint (Optional) ⏳

**Action**: Run Lighthouse on production after analytics revert

**Expected**: Performance score should improve (analytics on lazyOnload)

**If Performance Still Low**:
- Reduce dashboard bundle weight
- Delay non-critical scripts
- Audit third-party scripts
- Confirm no accidental client components on homepage

**Verification**:
- [ ] Lighthouse score improved
- [ ] Performance optimizations applied if needed

## Summary

**Completed**:
- ✅ Step 1: Fresh deploy triggered

**In Progress**:
- ⏳ Step 2: QA checklist (waiting for deploy, then test)
- ⏳ Step 3: Env var scope security
- ⏳ Step 4: Completeness gates
- ⏳ Step 5: Performance sprint

**Next Immediate Action**: 
1. Wait for deploy to complete
2. Run Step 2 QA checklist
3. Address Step 3 (env var scope) - can be done in parallel
