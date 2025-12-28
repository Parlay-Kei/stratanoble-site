# Post-Deploy Monitoring: Revenue-First Revamp

**Purpose:** Track system health and user impact for 24 hours after go-live
**Monitoring Window:** First 24 hours post-deployment
**Escalation Contact:** [Project lead / DevOps engineer]

---

## Overview

This document provides a structured monitoring plan for the first 24 hours after deploying the Revenue-First Revamp to production. The goal is to catch critical issues early and validate that all systems are functioning as expected.

---

## Monitoring Schedule

### Hour 0-1 (Immediate Post-Deploy)

**Frequency:** Every 5 minutes
**Focus:** Critical errors, deployment validation

- [ ] Site is accessible at primary domain
- [ ] No 500 errors in application logs
- [ ] Database connection successful
- [ ] All API routes responding
- [ ] Feature flag state confirmed (ON or OFF as intended)

### Hour 1-6 (Active Monitoring)

**Frequency:** Every 30 minutes
**Focus:** User flows, form submissions, error rates

- [ ] Homepage loads successfully
- [ ] New pages render (`/lead-rescue`, `/phase-3`)
- [ ] Form submissions working
- [ ] Email notifications delivering
- [ ] No spike in error logs

### Hour 6-24 (Passive Monitoring)

**Frequency:** Every 2-4 hours
**Focus:** Trends, performance, user feedback

- [ ] Review aggregated metrics
- [ ] Check for performance degradation
- [ ] Monitor user feedback channels
- [ ] Review email delivery stats

---

## Monitoring Checklist (First 24 Hours)

### 1. Application Error Monitoring

**Tool:** Sentry / Application logs / Platform logs

**Metrics to track:**

- [ ] **Error rate:** < 1% of total requests
- [ ] **Critical errors:** 0 in first hour
- [ ] **Error types:**
  - 500 Internal Server Errors
  - API route failures (`/api/intake/*`)
  - Database connection errors
  - Prisma query failures

**Actions:**
- Set up Sentry alert for error rate > 1%
- Filter errors by route: `/api/intake/lead-leak-check`, `/api/intake/lead-rescue`, `/api/intake/phase-3`
- Check error stack traces for new issues

**Monitoring Commands:**
```bash
# Netlify logs (example)
netlify logs --follow

# Vercel logs (example)
vercel logs [deployment-url] --follow

# Check Sentry dashboard
# Visit: https://sentry.io/[your-org]/[project]/issues/
```

**Escalation Trigger:**
- More than 5 critical errors in first hour
- Error rate > 5% sustained for 10+ minutes
- Any error impacting form submissions

---

### 2. Form Submission Monitoring

**Tool:** Supabase dashboard + Application logs

**Metrics to track:**

- [ ] **Submission success rate:** > 95%
- [ ] **Total submissions (first 24h):** _________
- [ ] **Breakdown by source:**
  - Lead Leak Check: _________
  - Lead Rescue: _________
  - Phase 3: _________

**Validation queries:**

```sql
-- Total submissions in last 24 hours
SELECT source, COUNT(*) as total
FROM "LeadIntake"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY source;

-- Submissions in last hour
SELECT source, COUNT(*) as total
FROM "LeadIntake"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY source;

-- Check for duplicate submissions (idempotency failures)
SELECT email, COUNT(*) as duplicates
FROM (
  SELECT formData->>'email' as email
  FROM "LeadIntake"
  WHERE "createdAt" > NOW() - INTERVAL '24 hours'
) AS emails
GROUP BY email
HAVING COUNT(*) > 1;
```

**Expected behavior:**
- New records appear in real-time
- `source` field correctly set for each form
- `formData` JSON contains expected fields
- `ipAddress` and `userAgent` populated
- No duplicate submissions for same email within 5 minutes

**Escalation Trigger:**
- Submission success rate < 90%
- Any form not creating database records
- Idempotency failures (duplicates appearing)

---

### 3. Email Notification Monitoring

**Tool:** AWS SES Dashboard + Email client

**Metrics to track:**

- [ ] **Email delivery rate:** > 98%
- [ ] **Emails sent (first 24h):** _________
- [ ] **Bounce rate:** < 2%
- [ ] **Complaint rate:** < 0.1%

**SES Dashboard checks:**

1. **Navigate to AWS SES Console**
   - Region: `us-east-1` (or configured region)
   - Go to: SES > Sending Statistics

2. **Check metrics:**
   - [ ] Delivery rate: __________%
   - [ ] Bounce rate: __________%
   - [ ] Complaint rate: __________%
   - [ ] Emails sent: __________

3. **Verify notifications received:**
   - [ ] Test lead submission and confirm admin email received
   - [ ] Email subject correct: "New Lead: [Source]"
   - [ ] Email body contains all form data
   - [ ] Email sender matches `SES_FROM_EMAIL`

**Common issues:**

- **Emails not arriving:**
  - Check SES sending limits (sandbox mode?)
  - Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in env vars
  - Check email is verified in SES (if in sandbox)
  - Review CloudWatch logs for SES API errors

- **High bounce rate:**
  - Verify `SES_FROM_EMAIL` is valid
  - Check SPF/DKIM records
  - Ensure admin email (`ADMIN_NOTIFICATION_EMAIL`) is correct

**Escalation Trigger:**
- Email delivery rate < 95%
- Zero emails received after confirmed form submissions
- SES account suspended or rate limited

---

### 4. Rate Limiting Validation

**Tool:** Application logs + Manual testing

**Metrics to track:**

- [ ] **Rate limit triggers (legitimate blocks):** _________
- [ ] **False positives (users blocked incorrectly):** 0

**Validation:**

1. **Manual test rate limiting:**
   - [ ] Submit same form 3 times rapidly
   - [ ] 4th submission blocked with 429 error
   - [ ] Error message: "Too many requests. Please try again in a minute."
   - [ ] Wait 60 seconds
   - [ ] Submission works again

2. **Monitor for false positives:**
   - [ ] Check support requests about form blocking
   - [ ] Review logs for 429 errors from different IPs
   - [ ] Ensure normal users not affected

**Rate limit configuration:**

- **Window:** 1 minute (60 seconds)
- **Max requests:** 3 per IP per endpoint
- **Endpoints:**
  - `/api/intake/lead-leak-check`
  - `/api/intake/lead-rescue`
  - `/api/intake/phase-3`

**Expected behavior:**
- Rapid submissions from same IP blocked after 3 attempts
- Legitimate users (one submission) never rate limited
- Rate limit resets after 60 seconds

**Escalation Trigger:**
- Multiple reports of legitimate users blocked
- Rate limiting not functioning (spam getting through)

---

### 5. Page Load Performance

**Tool:** Google PageSpeed Insights / Lighthouse / Browser DevTools

**Metrics to track:**

- [ ] **Homepage load time (p95):** < 3 seconds
- [ ] **Lead Rescue page load time:** < 3 seconds
- [ ] **Phase 3 page load time:** < 3 seconds
- [ ] **Largest Contentful Paint (LCP):** < 2.5 seconds
- [ ] **First Input Delay (FID):** < 100ms
- [ ] **Cumulative Layout Shift (CLS):** < 0.1

**How to measure:**

1. **Google PageSpeed Insights:**
   - Visit: https://pagespeed.web.dev/
   - Test URLs:
     - `https://stratanoble.com/`
     - `https://stratanoble.com/lead-rescue`
     - `https://stratanoble.com/phase-3`
   - Record scores (Desktop + Mobile)

2. **Lighthouse (Chrome DevTools):**
   - Open DevTools > Lighthouse tab
   - Run audit for each page
   - Record Performance score (target: 90+)

3. **Real User Monitoring (if available):**
   - Check deployment platform analytics
   - Review p50, p75, p95 load times

**Performance targets:**

| Metric | Target | Current |
|--------|--------|---------|
| Homepage load (p95) | < 3s | _____ |
| Lead Rescue load | < 3s | _____ |
| Phase 3 load | < 3s | _____ |
| LCP | < 2.5s | _____ |
| FID | < 100ms | _____ |
| CLS | < 0.1 | _____ |

**Escalation Trigger:**
- Any page consistently loading > 5 seconds
- Performance score drops below 70
- Users reporting slow page loads

---

### 6. SEO & Crawl Monitoring

**Tool:** Google Search Console / Bing Webmaster Tools

**Metrics to track (first 24 hours):**

- [ ] **New crawl errors:** 0
- [ ] **404 errors:** No new 404s
- [ ] **Indexing status:** New pages submitted to index

**Validation steps:**

1. **Google Search Console:**
   - [ ] Login to Search Console
   - [ ] Check "Coverage" report for errors
   - [ ] Verify no new "Page with redirect" or "Server error (5xx)" issues
   - [ ] Submit new URLs for indexing:
     - `https://stratanoble.com/lead-rescue`
     - `https://stratanoble.com/phase-3`

2. **Check sitemap:**
   - [ ] Verify sitemap includes new pages
   - [ ] Visit `https://stratanoble.com/sitemap.xml`
   - [ ] Confirm `/lead-rescue` and `/phase-3` listed
   - [ ] Submit sitemap to Google Search Console (if updated)

3. **Manual crawl test:**
   - [ ] Use "URL Inspection" tool in Search Console
   - [ ] Test new pages: `/lead-rescue`, `/phase-3`
   - [ ] Verify "Page is indexable" status
   - [ ] Check for mobile usability issues

4. **Verify robots.txt:**
   - [ ] Visit `https://stratanoble.com/robots.txt`
   - [ ] Ensure new pages NOT blocked
   - [ ] Verify sitemap reference included

**Expected behavior:**
- No new crawl errors
- New pages discoverable by search engines
- No duplicate content issues
- Mobile-friendly validation passes

**Escalation Trigger:**
- Spike in 404 errors (> 10 new errors)
- Pages blocked from indexing unintentionally
- Critical SEO regression (homepage de-indexed)

---

### 7. Database Health Monitoring

**Tool:** Supabase Dashboard / Database logs

**Metrics to track:**

- [ ] **Database connection uptime:** 100%
- [ ] **Query performance:** < 100ms average
- [ ] **Failed queries:** 0
- [ ] **Connection pool saturation:** < 80%

**Validation:**

1. **Supabase Dashboard:**
   - [ ] Login to Supabase dashboard
   - [ ] Navigate to project > Database > Logs
   - [ ] Check for connection errors
   - [ ] Review slow queries (> 500ms)

2. **Connection test:**
   ```bash
   # Run from local machine or deployment
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('✅ Connected')).catch(err => console.error('❌ Connection failed', err));"
   ```

3. **Table health check:**
   ```sql
   -- Verify LeadIntake table structure
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'LeadIntake';

   -- Check row count
   SELECT COUNT(*) FROM "LeadIntake";

   -- Check for orphaned records (if applicable)
   -- Add queries specific to your data integrity checks
   ```

**Escalation Trigger:**
- Database connection failures
- Query performance degradation (> 500ms average)
- Table structure issues
- Data corruption detected

---

### 8. User Feedback Monitoring

**Channels to monitor:**

- [ ] **Support email/chat:** Check for user-reported issues
- [ ] **Social media:** Monitor mentions/complaints
- [ ] **Internal team Slack/communication:** Watch for bug reports
- [ ] **Analytics:** Check for abnormal user behavior

**What to look for:**

- Users reporting form submission failures
- Confusion about new navigation/pages
- Broken links or missing content
- Slow performance complaints
- Accessibility issues

**Response protocol:**

1. **Categorize issue:**
   - Critical: Blocking user actions (forms broken)
   - High: Poor UX, confusion
   - Medium: Minor visual bugs
   - Low: Enhancement requests

2. **Log issue:**
   - Document in issue tracker
   - Assign severity
   - Notify relevant team members

3. **Respond to user:**
   - Acknowledge issue
   - Provide timeline for fix
   - Offer workaround if available

---

## Monitoring Dashboard Setup

### Recommended Tools

1. **Application Monitoring:**
   - Sentry (error tracking)
   - Netlify/Vercel analytics (platform metrics)

2. **Database Monitoring:**
   - Supabase dashboard (real-time)
   - Custom SQL queries (scheduled)

3. **Email Monitoring:**
   - AWS SES Console (delivery stats)
   - CloudWatch (SES logs)

4. **Performance Monitoring:**
   - Google PageSpeed Insights (manual)
   - Lighthouse CI (automated)
   - WebPageTest (detailed analysis)

5. **SEO Monitoring:**
   - Google Search Console
   - Bing Webmaster Tools

### Custom Monitoring Script (Optional)

Create a simple health check script:

```javascript
// health-check.js
const fetch = require('node-fetch');

const BASE_URL = 'https://stratanoble.com';

async function healthCheck() {
  const checks = [
    { name: 'Homepage', url: `${BASE_URL}/` },
    { name: 'Lead Rescue', url: `${BASE_URL}/lead-rescue` },
    { name: 'Phase 3', url: `${BASE_URL}/phase-3` },
  ];

  for (const check of checks) {
    try {
      const response = await fetch(check.url);
      const status = response.status;
      const time = response.headers.get('x-response-time');

      console.log(`✅ ${check.name}: ${status} (${time}ms)`);
    } catch (error) {
      console.error(`❌ ${check.name} FAILED:`, error.message);
    }
  }
}

healthCheck();
```

Run every 5 minutes during critical monitoring window:
```bash
# Using cron or systemd timer
*/5 * * * * node /path/to/health-check.js >> /var/log/health-check.log
```

---

## Incident Response Playbook

### Severity Levels

**P0 - Critical (Immediate Response Required):**
- Site down or inaccessible
- All form submissions failing
- Database connection lost
- Security breach

**P1 - High (Response within 1 hour):**
- One form failing
- Email notifications not sending
- Performance degradation (> 5s load times)
- SEO regression (homepage de-indexed)

**P2 - Medium (Response within 4 hours):**
- Visual bugs on key pages
- Non-blocking validation errors
- Minor performance issues
- User confusion reports

**P3 - Low (Response within 24 hours):**
- Enhancement requests
- Minor typos
- Non-critical UX improvements

### Response Steps

1. **Identify severity** using levels above
2. **Notify team** via primary communication channel
3. **Assess impact:** How many users affected?
4. **Decide on action:**
   - Immediate fix (hotfix)
   - Disable feature flag (rollback)
   - Full rollback (revert merge)
5. **Execute fix** following deployment protocol
6. **Verify resolution** using monitoring tools
7. **Document incident** for post-mortem

---

## 24-Hour Summary Report Template

After 24 hours, compile a summary report:

### Go-Live Summary Report

**Deployment Date:** _________________
**Monitoring Period:** [Start time] to [End time]
**Feature Flag Status:** [ ] ON | [ ] OFF

### Key Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Error Rate | < 1% | _____ | [ ] Pass / [ ] Fail |
| Form Submission Success | > 95% | _____ | [ ] Pass / [ ] Fail |
| Email Delivery | > 98% | _____ | [ ] Pass / [ ] Fail |
| Page Load Time (p95) | < 3s | _____ | [ ] Pass / [ ] Fail |
| SEO Errors | 0 | _____ | [ ] Pass / [ ] Fail |
| Critical Incidents | 0 | _____ | [ ] Pass / [ ] Fail |

### Form Submission Breakdown

- **Lead Leak Check:** _____ submissions
- **Lead Rescue:** _____ submissions
- **Phase 3:** _____ submissions
- **Total:** _____ submissions

### Incidents

**Total incidents:** _____
- P0 (Critical): _____
- P1 (High): _____
- P2 (Medium): _____
- P3 (Low): _____

**Resolved:** _____ | **Open:** _____

### Notable Issues

_____________________________________________________________________________
_____________________________________________________________________________

### User Feedback

_____________________________________________________________________________
_____________________________________________________________________________

### Recommendations

_____________________________________________________________________________
_____________________________________________________________________________

### Next Actions

- [ ] Continue monitoring for another 24 hours (lighter frequency)
- [ ] Schedule 1-week review meeting
- [ ] Address any open P2/P3 issues
- [ ] Document lessons learned

**Report Compiled By:** _______________________
**Date:** _________________

---

## Long-Term Monitoring (Week 1)

After initial 24 hours, continue lighter monitoring for 7 days:

**Daily checks (once per day):**
- [ ] Review error logs
- [ ] Check form submission totals
- [ ] Verify email delivery stats
- [ ] Monitor performance trends
- [ ] Review user feedback

**Weekly review (end of week 1):**
- [ ] Compile 7-day metrics summary
- [ ] Compare to 24-hour baseline
- [ ] Identify any emerging issues
- [ ] Plan optimizations or improvements

---

## Monitoring Contacts

**Application Errors:**
- Lead: [Name/Email]
- Escalation: [Name/Email]

**Database Issues:**
- Lead: [Name/Email]
- Supabase Support: support@supabase.io

**Email Delivery:**
- Lead: [Name/Email]
- AWS Support: (if enterprise)

**Performance/SEO:**
- Lead: [Name/Email]

**Business Impact:**
- Stakeholder: [Name/Email]

---

**Last Updated:** 2025-12-28
**Monitoring Plan Version:** 1.0
**Prepared by:** Project Orchestrator Agent
