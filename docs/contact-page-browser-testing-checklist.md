# Contact Page Browser Testing Checklist

## 1. Browsers to Test

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest, on Mac)

**Mobile:**
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Samsung Internet (Android, optional)
- [ ] Firefox Mobile (optional)

---

## 2. What to Test in Each Browser
- [ ] Page loads without errors or layout issues
- [ ] Contact form works (validation, submission, feedback)
- [ ] Carousel swipes smoothly and snaps on mobile
- [ ] Cards are accessible and focusable
- [ ] Calendly section displays or is gated as expected
- [ ] All colors, fonts, and spacing look correct
- [ ] No console errors or warnings

---

## 3. How to Test Responsiveness
- Use browser DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M) to simulate mobile/tablet/desktop.
- Manually resize the browser window to check breakpoints.
- Test on real devices if possible for touch/swipe feel.

---

## 4. Accessibility Testing
- Use keyboard navigation (Tab, Enter, Space) in each browser.
- Use built-in accessibility tools:
  - Chrome: Lighthouse (DevTools > Lighthouse > Accessibility)
  - Firefox: Accessibility Inspector
  - Edge: Accessibility Insights
  - Safari: VoiceOver (on Mac)
- Try a screen reader if available.

---

## 5. Automated Cross-Browser Testing Tools (Optional)
- [BrowserStack](https://www.browserstack.com/) (paid, free trial): Test on real devices/browsers in the cloud.
- [Sauce Labs](https://saucelabs.com/) (paid, free trial)
- [Lambdatest](https://www.lambdatest.com/) (paid, free trial)

---

## 6. Checklist for Each Browser/Device
- [ ] All UI elements render correctly
- [ ] No horizontal scroll on mobile
- [ ] Carousel and dot indicators work
- [ ] Form validation and feedback work
- [ ] Calendly section behaves as expected
- [ ] No accessibility blockers

---

**Tip:**
Take screenshots of any issues and note the browser/device/version for easy debugging. 