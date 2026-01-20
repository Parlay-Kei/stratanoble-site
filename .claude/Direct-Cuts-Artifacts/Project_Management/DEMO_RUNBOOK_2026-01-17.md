# Direct Cuts Demo Runbook
**Date:** 2026-01-17
**Version:** 1.0 - Demo Complete Release
**Status:** READY FOR DEMO

## 🎯 Demo Objectives

1. Show complete customer booking flow
2. Demonstrate barber dashboard and earnings
3. Validate subscription gating works
4. Prove system stability under test load

## ⚠️ E2E Gate Status: DEFERRED

**Current State:** E2E gates are in DEFERRED mode while specifications are being developed.

**What this means:**
- Tests are not yet implemented (placeholder only)
- CI/CD pipeline will pass with warnings
- Manual QA is required for critical paths
- Full automation coming by Jan 24, 2026

**Reason Codes:**
- `E2E_NOT_IMPLEMENTED`: Test file exists but contains only placeholders
- `E2E_ENV_MISSING`: Required environment variables not configured
- `E2E_FILE_NOT_FOUND`: Test specification file does not exist

**When DEFERRED is allowed:**
- During initial development (current phase)
- When specifications are being written
- For non-critical features under development

**When DEFERRED becomes FAIL:**
- Once test specifications are complete
- When actual test implementation begins
- After Jan 24, 2026 deadline

## 🔑 Critical Credentials

### Test Barber Account
```
Name: Steve The Hair Artist
UUID: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
Phone: +14045551234
Email: steve@directcuts.app
Password: Test123!@#
Location: Atlanta, GA (33.7490, -84.3880)
Subscription: TRIALING (30 days remaining)
```

### Test Customer Account
```
Email: customer@test.com
Password: Test123!@#
Phone: +14045555678
```

### Test Payment Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Expires: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

## 📋 Pre-Demo Checklist

### 30 Minutes Before Demo
```bash
# 1. Reset test barber to known good state
node complete_test_barber_setup.js

# 2. Verify staging environment
curl https://direct-cuts-staging.vercel.app/api/health

# 3. Check Stripe webhook status
# Go to: https://dashboard.stripe.com/test/webhooks
# Ensure endpoint is active

# 4. Clear browser cache
# Use incognito/private window for demo
```

### Emergency Recovery Script
```bash
# If barber data gets corrupted during demo
node fix_test_barber.js
```

## 🎬 Demo Script

### Act 1: Customer Discovery (5 min)
1. **Open:** https://direct-cuts-staging.vercel.app
2. **Show splash screen** with branding
3. **Click "Find a Barber"** → Redirects to nearby screen
4. **Map loads** showing Atlanta area
5. **Steve's pin appears** at correct location
6. **Click Steve's pin** → Profile preview appears

### Act 2: Barber Profile & Booking (7 min)
1. **Click "View Profile"** on preview card
2. **Show barber profile:**
   - Profile photo loads
   - Bio: "Premium barber specializing in modern cuts..."
   - Rating: 4.9 ⭐ (127 reviews)
   - 4 services displayed ($15-$40)
3. **Select "Premium Fade"** ($35, 45 min)
4. **Booking modal opens:**
   - Calendar shows next 7 days
   - Time slots: 9am-6pm
   - Select tomorrow, 2:00 PM
5. **Enter customer details:**
   - Name: John Demo
   - Phone: 404-555-5678
   - Email: john@demo.com
6. **Payment section:**
   - Card: 4242 4242 4242 4242
   - Exp: 12/25, CVC: 123, ZIP: 30301
7. **Click "Book Appointment"**
8. **Success modal:** "Appointment Confirmed!"
   - Shows confirmation code
   - Receipt sent to email

### Act 3: Barber Dashboard (5 min)
1. **Open new tab:** https://direct-cuts-staging.vercel.app/barber
2. **Login as Steve:**
   - Email: steve@directcuts.app
   - Password: Test123!@#
3. **Dashboard shows:**
   - Today's appointments (including John Demo)
   - Week earnings: $487
   - Month earnings: $2,145
   - Subscription status: Trialing (30 days left)
4. **Click "Appointments":**
   - See John Demo booking
   - Can mark as complete
5. **Click "Earnings":**
   - Transaction list
   - Payout schedule

### Act 4: Mobile Experience (3 min)
1. **Open Chrome DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M)
3. **Select iPhone 14 Pro**
4. **Repeat booking flow** on mobile
5. **Show responsive design:**
   - Bottom nav works
   - Map is touch-friendly
   - Booking modal is mobile-optimized

## ⚠️ Known Issues & Workarounds

### Issue 1: Map doesn't load
**Workaround:** Refresh page, wait 3 seconds

### Issue 2: Booking times show as unavailable
**Workaround:** Select a different day

### Issue 3: Payment fails with test card
**Workaround:** Use backup card: 5555 5555 5555 4444

### Issue 4: Barber login fails
**Workaround:** Clear cookies, try incognito mode

## 🚫 What NOT to Demo

1. **DO NOT** modify subscription status
2. **DO NOT** change barber prices during demo
3. **DO NOT** delete any appointments
4. **DO NOT** trigger refunds
5. **DO NOT** access admin/internal routes
6. **DO NOT** show production environment

## 📊 Success Metrics

✅ **Demo is successful if:**
- [ ] Customer can discover Steve on map
- [ ] Customer can view Steve's full profile
- [ ] Customer can complete booking with payment
- [ ] Steve receives booking notification
- [ ] Steve can view booking in dashboard
- [ ] Mobile experience works smoothly
- [ ] No critical errors in console

## 🔧 Post-Demo Cleanup

```bash
# 1. Reset test data for next demo
node complete_test_barber_setup.js

# 2. Clear test bookings if needed
node scripts/clear_test_bookings.js

# 3. Check system health
curl https://direct-cuts-staging.vercel.app/api/health
```

## 📞 Emergency Contacts

- **Tech Lead:** Via Slack #direct-cuts-support
- **Stripe Support:** Dashboard → Help → Chat
- **Vercel Status:** https://vercel.com/status

## 🎯 Key Talking Points

1. **Instant Discovery:** "Customers find barbers in seconds"
2. **Seamless Booking:** "Book and pay in under 60 seconds"
3. **Barber Empowerment:** "Full business management in one app"
4. **Mobile First:** "70% of bookings from mobile"
5. **Subscription Value:** "$29.99/month, pays for itself with 1 booking"

## 🚀 Advanced Features (If Time Permits)

- Guest checkout (no signup required)
- Service packages and combos
- Loyalty rewards program
- Real-time availability updates
- Multi-language support (Spanish)

---

**Remember:** Keep the demo under 20 minutes. Focus on the happy path. Have the emergency recovery script ready but don't mention it unless needed.

**Last Updated:** 2026-01-17 by Demo Team