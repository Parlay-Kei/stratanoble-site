# Smoke Test Checklist: Revenue-First Revamp

**Purpose:** Manual validation of critical user flows on preview/production deployment
**Tester:** [Your Name]
**Environment:** [ ] Preview | [ ] Production
**Test Date:** _________________
**Base URL:** _________________________________

---

## Pre-Test Setup

- [ ] Clear browser cache and cookies
- [ ] Open browser DevTools (Network + Console tabs)
- [ ] Have Supabase dashboard open (LeadIntake table)
- [ ] Have email client open (for notification testing)
- [ ] Document test user details:
  - Test email: _______________________________
  - Test phone: _______________________________
  - Test business name: _______________________

---

## Test 1: Lead Leak Check (Homepage)

**Location:** Homepage hero section
**Expected behavior:** Lead capture form submits to `/api/intake/lead-leak-check`, creates record, sends notification

### Steps

1. **Navigate to homepage**
   - [ ] URL: `[base-url]/`
   - [ ] Page loads without errors
   - [ ] New hero section visible (if flag enabled)
   - [ ] Lead Leak Check form visible

2. **Inspect form**
   - [ ] Email field present
   - [ ] Submit button present
   - [ ] No console errors

3. **Submit form with valid data**
   - [ ] Enter test email: _______________________
   - [ ] Click submit button
   - [ ] Network request to `/api/intake/lead-leak-check` returns 200
   - [ ] Success message displayed: "Thanks! We'll analyze your lead flow..."
   - [ ] Form resets or shows thank-you state

4. **Verify database record**
   - [ ] Open Supabase dashboard > LeadIntake table
   - [ ] Find record with `source = "lead-leak-check"`
   - [ ] Verify `formData` contains submitted email
   - [ ] Verify `ipAddress` populated
   - [ ] Verify `userAgent` populated
   - [ ] Verify `createdAt` timestamp is recent

5. **Verify email notification**
   - [ ] Admin notification email received at `ADMIN_NOTIFICATION_EMAIL`
   - [ ] Email subject: "New Lead: Lead Leak Check"
   - [ ] Email body contains submitted data
   - [ ] Email sent from verified SES address

6. **Test idempotency (duplicate prevention)**
   - [ ] Submit same email again immediately
   - [ ] Request returns 200 (no error shown to user)
   - [ ] Check Supabase: Only ONE record exists (no duplicate)
   - [ ] Note: Idempotency window is 5 minutes

7. **Test rate limiting**
   - [ ] Submit form 3 times rapidly (within 30 seconds)
   - [ ] After 3rd submission, see rate limit error
   - [ ] Error message: "Too many requests. Please try again in a minute."
   - [ ] Wait 60 seconds
   - [ ] Form submission works again

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Test 2: Lead Rescue Application Form

**Location:** `/lead-rescue` page
**Expected behavior:** Application form submits to `/api/intake/lead-rescue`, creates record, sends notification

### Steps

1. **Navigate to Lead Rescue page**
   - [ ] URL: `[base-url]/lead-rescue`
   - [ ] Page loads without errors
   - [ ] Page title: "48-Hour Lead Rescue | Strata Noble"
   - [ ] Form visible on right sidebar (desktop) or below content (mobile)

2. **Inspect form fields**
   - [ ] Name field present
   - [ ] Email field present
   - [ ] Business name field present
   - [ ] Message/details textarea present
   - [ ] Submit button present and enabled
   - [ ] No console errors

3. **Submit form with valid data**
   - Test data:
     - Name: "Test User"
     - Email: _______________________
     - Business: "Test Business LLC"
     - Message: "I need help with lead follow-up"
   - [ ] Fill all fields
   - [ ] Click "Request Lead Rescue" button
   - [ ] Network request to `/api/intake/lead-rescue` returns 200
   - [ ] Success message displayed
   - [ ] Form shows thank-you state or resets

4. **Verify database record**
   - [ ] Open Supabase dashboard > LeadIntake table
   - [ ] Find record with `source = "lead-rescue"`
   - [ ] Verify `formData` JSON contains:
     - `name: "Test User"`
     - `email: [submitted email]`
     - `businessName: "Test Business LLC"`
     - `message: "I need help with lead follow-up"`
   - [ ] Verify `ipAddress` populated
   - [ ] Verify `userAgent` populated
   - [ ] Verify `createdAt` timestamp is recent

5. **Verify email notification**
   - [ ] Admin notification email received
   - [ ] Email subject: "New Lead: Lead Rescue Application"
   - [ ] Email body contains all submitted fields
   - [ ] Email formatted clearly (name, email, business, message)

6. **Test form validation**
   - [ ] Submit with empty email → validation error shown
   - [ ] Submit with invalid email format → validation error shown
   - [ ] Submit with empty name → validation error shown
   - [ ] Submit with empty business name → validation error shown
   - [ ] Validation errors clear when fields corrected

7. **Test idempotency**
   - [ ] Submit same data again (within 5 minutes)
   - [ ] Request succeeds but no duplicate record created
   - [ ] Check Supabase: Only ONE record exists

8. **Test rate limiting**
   - [ ] Submit form 3 times rapidly
   - [ ] 4th submission blocked with rate limit error
   - [ ] Error message clear and actionable
   - [ ] Wait 60 seconds, submission works again

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Test 3: Phase 3 Application Form

**Location:** `/phase-3` page
**Expected behavior:** Application form submits to `/api/intake/phase-3`, creates record, sends notification

### Steps

1. **Navigate to Phase 3 page**
   - [ ] URL: `[base-url]/phase-3`
   - [ ] Page loads without errors
   - [ ] Page title: "Phase 3 Buildout | Strata Noble"
   - [ ] Form visible on right sidebar (desktop)

2. **Inspect form fields**
   - [ ] Name field present
   - [ ] Email field present
   - [ ] Business name field present
   - [ ] Current lead volume field present (e.g., "10-25/month")
   - [ ] Message/details textarea present
   - [ ] Submit button present and enabled
   - [ ] No console errors

3. **Submit form with valid data**
   - Test data:
     - Name: "Test User 2"
     - Email: _______________________
     - Business: "Test Company Inc"
     - Lead Volume: "25-50 per month"
     - Message: "I need a full pipeline buildout"
   - [ ] Fill all required fields
   - [ ] Click "Apply for Phase 3" button
   - [ ] Network request to `/api/intake/phase-3` returns 200
   - [ ] Success message displayed
   - [ ] Form shows thank-you state

4. **Verify database record**
   - [ ] Open Supabase dashboard > LeadIntake table
   - [ ] Find record with `source = "phase-3"`
   - [ ] Verify `formData` JSON contains:
     - `name: "Test User 2"`
     - `email: [submitted email]`
     - `businessName: "Test Company Inc"`
     - `leadVolume: "25-50 per month"`
     - `message: "I need a full pipeline buildout"`
   - [ ] Verify metadata fields populated

5. **Verify email notification**
   - [ ] Admin notification email received
   - [ ] Email subject: "New Lead: Phase 3 Application"
   - [ ] Email body contains all submitted fields
   - [ ] Lead volume clearly shown
   - [ ] Message/details included

6. **Test form validation**
   - [ ] Submit with empty required fields → validation errors shown
   - [ ] Submit with invalid email → validation error shown
   - [ ] All validation messages clear and helpful

7. **Test idempotency**
   - [ ] Submit same email/business combo again
   - [ ] No duplicate record created
   - [ ] User sees success message (transparent to user)

8. **Test rate limiting**
   - [ ] Rapid submissions blocked after 3 attempts
   - [ ] Rate limit error shown
   - [ ] Normal behavior restored after 60 seconds

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Test 4: Cross-Browser Compatibility

Test on multiple browsers to ensure consistent behavior.

### Desktop Browsers

**Google Chrome:**
- [ ] Homepage renders correctly
- [ ] Lead Leak Check form works
- [ ] Lead Rescue page renders
- [ ] Phase 3 page renders
- [ ] Forms submit successfully
- [ ] No console errors

**Mozilla Firefox:**
- [ ] Homepage renders correctly
- [ ] Forms submit successfully
- [ ] No console errors

**Safari (macOS):**
- [ ] Homepage renders correctly
- [ ] Forms submit successfully
- [ ] No console errors

### Mobile Browsers

**Mobile Safari (iOS):**
- [ ] Homepage responsive layout works
- [ ] Navigation CTAs visible
- [ ] Forms render correctly
- [ ] Form submission works
- [ ] Virtual keyboard doesn't break layout

**Chrome Mobile (Android):**
- [ ] Homepage responsive layout works
- [ ] Forms render correctly
- [ ] Form submission works

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Test 5: Navigation & User Flow

Test the complete user journey from homepage to form submission.

### Journey 1: Homepage → Lead Leak Check

- [ ] Land on homepage
- [ ] See new hero section with clear value prop
- [ ] Lead Leak Check form prominently displayed
- [ ] Submit lead
- [ ] See thank-you message
- [ ] Clear next steps communicated

### Journey 2: Homepage → Lead Rescue Page

- [ ] Land on homepage
- [ ] Click "48-Hour Lead Rescue" in navigation
- [ ] Lead Rescue page loads
- [ ] Read offer details
- [ ] Submit application form
- [ ] See confirmation message

### Journey 3: Homepage → Phase 3 Page

- [ ] Land on homepage
- [ ] Click "Phase 3 Buildout" in navigation
- [ ] Phase 3 page loads
- [ ] Read deliverables and pricing
- [ ] Submit application form
- [ ] See confirmation message

### Journey 4: Mobile Navigation

- [ ] Open site on mobile
- [ ] Tap hamburger menu (if applicable)
- [ ] Navigation menu expands
- [ ] CTAs clearly visible
- [ ] Navigate to offer pages
- [ ] Forms work on mobile

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Test 6: Error Handling & Edge Cases

Test error scenarios to ensure graceful handling.

### Network Errors

- [ ] Disconnect internet before form submission
- [ ] Submit form → see network error message
- [ ] Reconnect internet
- [ ] Retry submission → works correctly

### Invalid Data

- [ ] Submit email with SQL injection attempt (e.g., `test'; DROP TABLE--`)
- [ ] Form sanitizes input, no error thrown
- [ ] Submit XSS attempt (e.g., `<script>alert('xss')</script>`)
- [ ] Form sanitizes input, no script executed

### Server Errors (if testable)

- [ ] (If possible) Trigger 500 error from API
- [ ] User sees friendly error message
- [ ] Error logged to monitoring system

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Test 7: Performance & Load Times

Measure page load performance.

### Homepage Performance

- [ ] Open DevTools > Network tab
- [ ] Clear cache
- [ ] Reload homepage
- [ ] Measure metrics:
  - Page load time: _______ seconds (target: < 3s)
  - Largest Contentful Paint: _______ seconds (target: < 2.5s)
  - First Input Delay: _______ ms (target: < 100ms)
  - Cumulative Layout Shift: _______ (target: < 0.1)

### Offer Pages Performance

- [ ] Test `/lead-rescue` load time: _______ seconds
- [ ] Test `/phase-3` load time: _______ seconds
- [ ] Both pages should load in < 3 seconds

### API Response Times

- [ ] Submit Lead Leak Check form → API response time: _______ ms (target: < 500ms)
- [ ] Submit Lead Rescue form → API response time: _______ ms (target: < 500ms)
- [ ] Submit Phase 3 form → API response time: _______ ms (target: < 500ms)

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Test 8: SEO & Metadata

Verify SEO elements on new pages.

### Lead Rescue Page

- [ ] View page source (`Ctrl+U` or `Cmd+U`)
- [ ] Verify `<title>` tag: "48-Hour Lead Rescue | Strata Noble"
- [ ] Verify meta description exists and is unique
- [ ] Verify Open Graph tags (`og:title`, `og:description`)
- [ ] Verify JSON-LD structured data (Service schema)
- [ ] No duplicate meta tags

### Phase 3 Page

- [ ] View page source
- [ ] Verify `<title>` tag: "Phase 3 Buildout | Strata Noble"
- [ ] Verify meta description exists and is unique
- [ ] Verify Open Graph tags
- [ ] Verify JSON-LD structured data (Service schema)
- [ ] No duplicate meta tags

### Indexing Control

- [ ] Preview URLs have `<meta name="robots" content="noindex">` (if applicable)
- [ ] Production URLs do NOT have noindex (allow indexing)

**Test Result:** [ ] PASS | [ ] FAIL

**Issues/Notes:**
_____________________________________________________________________________
_____________________________________________________________________________

---

## Final Smoke Test Summary

**Total Tests:** 8
**Passed:** _______
**Failed:** _______
**Overall Result:** [ ] PASS | [ ] FAIL

### Critical Issues (Must Fix Before Go-Live)

_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

### Non-Critical Issues (Can Fix Post-Launch)

_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

### Recommendations

_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Sign-Off

**Tester Name:** _______________________________
**Signature:** _________________________________
**Date:** ______________________________________

**Approved for Production:** [ ] YES | [ ] NO

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

**Last Updated:** 2025-12-28
**Checklist Version:** 1.0
**Prepared by:** Project Orchestrator Agent
