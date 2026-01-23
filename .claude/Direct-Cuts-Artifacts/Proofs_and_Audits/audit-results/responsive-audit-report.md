# Responsive Design Audit Report

**Date:** 12/15/2025, 8:35:57 AM
**Base URL:** http://localhost:5174

## Summary

- **Total Pages Tested:** 38
- **Viewport Sizes:** 4
- **Total Tests:** 152
- **Total Issues:** 484

### Issues by Severity

- **High:** 8
- **Medium:** 300
- **Low:** 176

### Issues by Type

- **layout-break:** 304
- **touch-target:** 146
- **navigation:** 34

## Recommendations

### Layout: Layout breaks detected

Review CSS for fixed-width elements and ensure proper use of responsive units (%, vw, rem). Add max-width constraints and use flexbox/grid with proper breakpoints.

### Touch Targets: Touch targets too small

Ensure all interactive elements are at least 44px (iOS) or 48px (Android) in both dimensions. Add padding to increase touch target size without changing visual appearance.

### Navigation: Navigation usability issues

Implement mobile-first navigation with hamburger menu for mobile/tablet. Consider bottom navigation for mobile devices. Ensure navigation is always accessible and visible.


## Detailed Results

### /

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 12 elements with fixed widths found

🟡 **touch-target** - Insufficient spacing between interactive elements
   - Severity: medium
   - Details: 1 pairs of elements with spacing < 8px

![Screenshot](.\audit-results\responsive-screenshots\__mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 9 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\__tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 9 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\__desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 9 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\__large.png)

### /login

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_login_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_login_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_login_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_login_large.png)

### /signup

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 25 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_signup_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_signup_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 18 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_signup_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 10 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_signup_large.png)

### /reset-password

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 7 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Insufficient spacing between interactive elements
   - Severity: medium
   - Details: 1 pairs of elements with spacing < 8px

![Screenshot](.\audit-results\responsive-screenshots\_reset-password_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_reset-password_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_reset-password_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_reset-password_large.png)

### /privacy

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 16 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 10 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

🟡 **navigation** - No mobile navigation pattern found
   - Severity: medium
   - Details: No hamburger menu or visible navigation links detected

![Screenshot](.\audit-results\responsive-screenshots\_privacy_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 9 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

![Screenshot](.\audit-results\responsive-screenshots\_privacy_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 6 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 5 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

![Screenshot](.\audit-results\responsive-screenshots\_privacy_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 5 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

![Screenshot](.\audit-results\responsive-screenshots\_privacy_large.png)

### /terms

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 19 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 10 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

🟡 **navigation** - No mobile navigation pattern found
   - Severity: medium
   - Details: No hamburger menu or visible navigation links detected

![Screenshot](.\audit-results\responsive-screenshots\_terms_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 9 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

![Screenshot](.\audit-results\responsive-screenshots\_terms_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 11 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 5 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

![Screenshot](.\audit-results\responsive-screenshots\_terms_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 6 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 5 elements with fixed widths found

🔴 **navigation** - Navigation not visible
   - Severity: high
   - Details: No visible navigation found. Found 0 nav elements, 0 headers.

![Screenshot](.\audit-results\responsive-screenshots\_terms_large.png)

### /home

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_home_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_home_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_large.png)

### /home/nearby

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_home_nearby_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_home_nearby_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_nearby_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_nearby_large.png)

### /home/appointments

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_home_appointments_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_home_appointments_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_appointments_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_appointments_large.png)

### /home/favorites

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_home_favorites_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_home_favorites_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_favorites_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_favorites_large.png)

### /home/profile

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_home_profile_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_home_profile_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_profile_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_home_profile_large.png)

### /profile/edit

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_edit_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_edit_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_edit_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_edit_large.png)

### /profile/addresses

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_addresses_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_addresses_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_addresses_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_addresses_large.png)

### /profile/payments

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_payments_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_payments_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_payments_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_payments_large.png)

### /profile/settings

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_settings_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_profile_settings_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_settings_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_profile_settings_large.png)

### /messages

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_messages_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_messages_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_messages_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_messages_large.png)

### /products

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_products_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_products_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_products_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_products_large.png)

### /loyalty

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_loyalty_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_loyalty_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_loyalty_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_loyalty_large.png)

### /rewards

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_rewards_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_rewards_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_rewards_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_rewards_large.png)

### /barber

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_large.png)

### /barber/appointments

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_appointments_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_appointments_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_appointments_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_appointments_large.png)

### /barber/availability

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_availability_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_availability_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_availability_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_availability_large.png)

### /barber/profile

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_profile_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_profile_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_profile_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_profile_large.png)

### /barber/services

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_services_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_services_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_services_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_services_large.png)

### /barber/earnings

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_earnings_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_earnings_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_earnings_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_earnings_large.png)

### /barber/settings

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_settings_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_settings_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_settings_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_settings_large.png)

### /barber/loyalty

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_loyalty_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_loyalty_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_loyalty_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_loyalty_large.png)

### /barber/cancellation-policy

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_cancellation-policy_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_cancellation-policy_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_cancellation-policy_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_cancellation-policy_large.png)

### /barber/addons

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_addons_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_addons_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_addons_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_addons_large.png)

### /barber/payout-setup

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_payout-setup_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_payout-setup_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_payout-setup_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_payout-setup_large.png)

### /barber/payouts

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_payouts_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_payouts_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_payouts_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_payouts_large.png)

### /barber/products

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_products_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_products_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_products_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_products_large.png)

### /barber/referrals

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_referrals_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_referrals_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_referrals_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_referrals_large.png)

### /barber/subscribers

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_subscribers_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_subscribers_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_subscribers_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_subscribers_large.png)

### /barber/milestones

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_barber_milestones_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_barber_milestones_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_milestones_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_barber_milestones_large.png)

### /admin/monitoring

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_admin_monitoring_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_admin_monitoring_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_admin_monitoring_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_admin_monitoring_large.png)

### /admin/ambassadors

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_admin_ambassadors_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_admin_ambassadors_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_admin_ambassadors_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_admin_ambassadors_large.png)

### /admin/geofences

#### mobile (375x667)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 12 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 11 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 327x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟢 **navigation** - No bottom navigation detected on mobile
   - Severity: low
   - Details: Bottom navigation is recommended for app-style mobile interfaces

![Screenshot](.\audit-results\responsive-screenshots\_admin_geofences_mobile.png)

#### tablet (768x1024)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

🟡 **touch-target** - Touch target too short: 384x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

🟡 **touch-target** - Touch target too short: 60x24px
   - Severity: medium
   - Details: Height 24px is below 36px minimum
   - Element: LABEL.block

![Screenshot](.\audit-results\responsive-screenshots\_admin_geofences_tablet.png)

#### desktop (1024x768)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 4 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_admin_geofences_desktop.png)

#### large (1440x900)

🟡 **layout-break** - Elements overflowing viewport
   - Severity: medium
   - Details: 1 elements found outside viewport

🟢 **layout-break** - Fixed-width elements may cause issues
   - Severity: low
   - Details: 7 elements with fixed widths found

![Screenshot](.\audit-results\responsive-screenshots\_admin_geofences_large.png)

