# Revenue-First Revamp - Manual QA Checklist

**Sprint**: QA Sprint (Sprint 5)
**Branch**: `revamp/revenue-nav-2026`
**Feature Flag**: `NEXT_PUBLIC_REVAMP_ENABLED=true`

## Prerequisites

Before testing, ensure:
- [ ] All previous sprints (0-4) have been completed
- [ ] Feature flag is set: `NEXT_PUBLIC_REVAMP_ENABLED=true`
- [ ] Development server is running: `npm run dev`
- [ ] All environment variables are configured (see `.env.example`)

---

## Mobile Layout Testing (375px width)

**Device**: iPhone SE / Small Mobile
**Tool**: Browser DevTools or actual device

- [ ] **Homepage**
  - [ ] Hero section readable, no text cutoff
  - [ ] No horizontal scroll
  - [ ] CTAs full-width and tappable (min 44px height)
  - [ ] Images scale properly
  - [ ] Navigation menu button visible

- [ ] **Lead Rescue Page** (`/lead-rescue`)
  - [ ] Form fields full-width and usable
  - [ ] All inputs accessible (no overlap)
  - [ ] Submit button tappable
  - [ ] No horizontal scroll
  - [ ] Content readable without zooming

- [ ] **Phase 3 Page** (`/phase-3`)
  - [ ] Form fields full-width and usable
  - [ ] All inputs accessible (no overlap)
  - [ ] Submit button tappable
  - [ ] No horizontal scroll
  - [ ] Content readable without zooming

- [ ] **Support Pages** (`/platform`, `/resources`, `/studio`, `/about`)
  - [ ] No horizontal scroll on any page
  - [ ] CTAs visible and tappable
  - [ ] Content readable
  - [ ] Navigation works

---

## Desktop Layout Testing (1920px width)

- [ ] Homepage displays correctly
- [ ] Navigation items properly spaced
- [ ] CTAs prominent but not overwhelming
- [ ] Content centered and readable
- [ ] Forms have appropriate max-width (not stretched)

---

## Lighthouse Performance Testing

**Tool**: Chrome DevTools > Lighthouse
**Mode**: Mobile, Navigation (simulated throttling)

Run Lighthouse on each page and record scores:

### Homepage (`/`)
- [ ] Performance score > 80 (Target: 90+)
- [ ] Accessibility score > 90 (Target: 95+)
- [ ] Best Practices score > 90
- [ ] SEO score > 90

**Issues found**:
-
-

### Lead Rescue Page (`/lead-rescue`)
- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

**Issues found**:
-
-

### Phase 3 Page (`/phase-3`)
- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

**Issues found**:
-
-

---

## Form Submission Testing

### Lead Leak Check (Homepage)

**Test Case**: Valid submission
- [ ] Form submits successfully
- [ ] Success message displays
- [ ] User receives confirmation (visual feedback)
- [ ] No console errors

**Test Case**: Invalid submission
- [ ] Email validation works
- [ ] Required fields show errors
- [ ] Error messages are clear

### Lead Rescue Form (`/lead-rescue`)

**Test Case**: Valid submission
- [ ] Fill all required fields
- [ ] Submit form
- [ ] Success state displays correctly
- [ ] Form clears or redirects to thank you page
- [ ] No console errors

**Test Data**:
```
Name: Test User
Email: test@example.com
Business Name: Test Business Inc
Lead Channel: Social Media
Tools: Notion (checkbox)
Urgency: This week
```

**Test Case**: Invalid submission
- [ ] Empty form shows validation errors
- [ ] Invalid email format rejected
- [ ] Required fields highlighted
- [ ] Error messages user-friendly

### Phase 3 Application Form (`/phase-3`)

**Test Case**: Valid submission
- [ ] Fill all required fields
- [ ] Submit form
- [ ] Success state displays correctly
- [ ] Form clears or redirects
- [ ] No console errors

**Test Data**:
```
Name: Test Applicant
Email: applicant@example.com
Business Name: Test Corporation
Monthly Leads: 10-50
Offer Type: Professional consulting services
Close Process: Phone consultations and proposals
Decision Timeline: 1-2 weeks
Success Definition: Increase closed deals by 50%
```

**Test Case**: Invalid submission
- [ ] Empty form shows validation errors
- [ ] Invalid email format rejected
- [ ] Required fields highlighted
- [ ] Error messages user-friendly

---

## AWS SES Email Deliverability

**Prerequisites**: AWS SES configured, sender verified, sandbox mode exited (if applicable)

### Lead Leak Check Notification
- [ ] Submit Lead Leak Check form
- [ ] Admin notification email arrives within 2 minutes
- [ ] Email formatting is correct (HTML/text)
- [ ] Subject line is clear
- [ ] Sender is `info@stratanoble.com` (or configured sender)
- [ ] Reply-to is appropriate
- [ ] Email not in spam folder

**Email received at**: _______________
**Time to receive**: _______________

### Lead Rescue Notification
- [ ] Submit Lead Rescue form
- [ ] Admin notification email arrives within 2 minutes
- [ ] Email contains all form data
- [ ] Formatting is professional
- [ ] No rendering issues

**Email received at**: _______________
**Time to receive**: _______________

### Phase 3 Application Notification
- [ ] Submit Phase 3 form
- [ ] Admin notification email arrives within 2 minutes
- [ ] Email contains all application data
- [ ] Formatting is professional
- [ ] No rendering issues

**Email received at**: _______________
**Time to receive**: _______________

### Email Bounce/Error Handling
- [ ] Test with invalid email (if possible)
- [ ] Check error handling is graceful
- [ ] User gets appropriate feedback

---

## Sentry Error Monitoring

**Prerequisites**: Sentry DSN configured in `.env`

### Error Capture Test
1. Force a client-side error:
   - [ ] Open browser console
   - [ ] Trigger intentional error (e.g., submit form with broken endpoint)
   - [ ] Check Sentry dashboard for error capture
   - [ ] Verify error has proper context (URL, user agent, etc.)

2. Force a server-side error:
   - [ ] Trigger API error (e.g., invalid API route)
   - [ ] Check Sentry dashboard
   - [ ] Verify error details are captured

**Sentry Issues Found**:
- Issue ID: _______________
- Description: _______________
- Properly captured: [ ] Yes [ ] No

---

## Feature Flag Testing

### Flag OFF (`NEXT_PUBLIC_REVAMP_ENABLED=false`)
1. Set environment variable to `false`
2. Restart dev server
3. Test:
   - [ ] Old site displays correctly
   - [ ] No new revamp pages accessible
   - [ ] No console errors
   - [ ] Homepage shows original content
   - [ ] Navigation unchanged

### Flag ON (`NEXT_PUBLIC_REVAMP_ENABLED=true`)
1. Set environment variable to `true`
2. Restart dev server
3. Test:
   - [ ] New revamp displays
   - [ ] Lead Rescue page accessible
   - [ ] Phase 3 page accessible
   - [ ] Updated navigation shows
   - [ ] No console errors

---

## Rate Limiting Testing

**Prerequisites**: Sprint 4 rate limiting implementation complete

### Lead Rescue Rate Limiting
1. Submit form 5+ times rapidly with different emails
2. Check:
   - [ ] Rate limit triggers after X submissions
   - [ ] Error message is user-friendly
   - [ ] Message explains wait time
   - [ ] User can retry after cooldown

**Rate limit threshold**: _____ submissions
**Cooldown period**: _____ minutes

### Phase 3 Rate Limiting
1. Submit form 5+ times rapidly with different emails
2. Check:
   - [ ] Rate limit triggers appropriately
   - [ ] Error message is clear
   - [ ] Cooldown works correctly

---

## Navigation Testing

### Desktop Navigation
- [ ] All nav items visible
- [ ] Services link works
- [ ] Platform link works
- [ ] Resources link works
- [ ] Studio link works
- [ ] About link works
- [ ] Contact NOT in main nav header
- [ ] Logo links to homepage
- [ ] Active page highlighted (if applicable)

### Mobile Navigation
- [ ] Hamburger menu visible
- [ ] Menu opens on tap
- [ ] Menu closes on tap outside
- [ ] All nav items present in menu
- [ ] CTAs visible in mobile menu
- [ ] Links work correctly
- [ ] Menu animates smoothly

---

## Cross-Browser Testing

Test on multiple browsers:

### Chrome/Chromium (Latest)
- [ ] All features work
- [ ] No layout issues
- [ ] Forms submit correctly

### Firefox (Latest)
- [ ] All features work
- [ ] No layout issues
- [ ] Forms submit correctly

### Safari (Latest - Mac/iOS)
- [ ] All features work
- [ ] No layout issues
- [ ] Forms submit correctly
- [ ] Date pickers work (if applicable)

### Edge (Latest)
- [ ] All features work
- [ ] No layout issues
- [ ] Forms submit correctly

**Issues found**:
- Browser: _______________
- Issue: _______________
- Severity: [ ] Critical [ ] High [ ] Medium [ ] Low

---

## Accessibility Testing

**Tools**: axe DevTools, WAVE, or manual testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Skip to main content link present
- [ ] Form inputs accessible via keyboard
- [ ] Dropdowns/selects work with keyboard
- [ ] Modal/menu closes with ESC key

### Screen Reader Testing (Optional but recommended)
- [ ] Page structure makes sense
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Success messages announced

### Color Contrast
- [ ] Text has sufficient contrast (4.5:1 minimum)
- [ ] Links distinguishable from text
- [ ] Buttons have clear visual state

---

## Content Verification

### Messaging Accuracy
- [ ] "48-Hour Lead Rescue" messaging correct
- [ ] Phase 3 positioning clear
- [ ] No "preview platform" language
- [ ] Revenue-first positioning emphasized
- [ ] Services clearly described

### Copy Quality
- [ ] No typos or grammatical errors
- [ ] CTAs use action-oriented language
- [ ] Value propositions clear
- [ ] Contact information correct

---

## Security Testing

### Form Security
- [ ] CSRF protection enabled (if applicable)
- [ ] Input sanitization working
- [ ] No SQL injection vulnerabilities
- [ ] XSS protection in place

### API Security
- [ ] Rate limiting prevents abuse
- [ ] API keys not exposed in client
- [ ] HTTPS enforced (in production)

---

## Performance Testing

### Page Load Times (3G Slow)
**Tool**: Chrome DevTools > Network > Throttling

- [ ] Homepage loads in < 3 seconds
- [ ] Lead Rescue page loads in < 3 seconds
- [ ] Phase 3 page loads in < 3 seconds
- [ ] Images optimized and lazy-loaded

### Bundle Size
```bash
npm run build
```
- [ ] Main bundle < 200KB (gzipped)
- [ ] No duplicate dependencies
- [ ] Code splitting implemented

---

## Final Pre-Deployment Checks

- [ ] All Playwright tests pass: `npx playwright test`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] ESLint passes: `npx eslint apps/website/src`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors on any page
- [ ] No console warnings (except known third-party)
- [ ] All environment variables documented
- [ ] Feature flag default documented
- [ ] README updated with new pages
- [ ] Deployment instructions updated

---

## Known Issues / Tech Debt

Document any issues found during QA that are not blocking:

1. **Issue**: _______________
   - **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
   - **Sprint to fix**: _______________

2. **Issue**: _______________
   - **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
   - **Sprint to fix**: _______________

---

## Sign-Off

**QA Tester**: _______________
**Date**: _______________
**Status**: [ ] Pass [ ] Pass with issues [ ] Fail
**Ready for deployment**: [ ] Yes [ ] No

**Notes**:
