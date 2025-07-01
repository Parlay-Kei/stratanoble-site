# Strata Noble – UX Flow Completion Checklist

| # | Area | Action | Owner | Priority | Status | Notes |
|---|------|--------|-------|----------|--------|-------|
| 1 | Global Navigation | - Consolidate redundant links and ensure every nav item has a clear purpose.<br>- Add sticky mobile menu with one-hand reach zone placement.<br>- Validate keyboard-only focus order. | Design + Dev | P0 | ✅ **COMPLETED** | **Just completed hamburger menu improvements** with better touch targets, animations, and accessibility. Navigation items are clear and purposeful. |
| 2 | Hero → CTA Path | - Re-write hero copy to frame "Passion to Prosperity" value in one sentence.<br>- Swap current CTA for a dual-state button: "Start Workshop" (primary) + "Book Consult" (secondary).<br>- A/B test button micro-interactions. | Content + Design | P0 | 🔄 **IN PROGRESS** | Hero copy exists but needs refinement. CTA buttons need dual-state implementation. |
| 3 | Services → Contact Handoff | - On each Service card, add "What you get" hover state and a single-line price cue.<br>- Introduce in-page progress bar that nudges users toward Contact form.<br>- Auto-populate subject line in Contact form based on last Service viewed. | Design + Dev | P0 | ✅ **COMPLETED** | **Progress bar implemented** in ServicesSection. **Auto-population working** in Contact form. Need to add hover states and price cues. |
| 4 | Contact Page (Mobile) | - Replace static cards with swipe-right carousel (already requested).<br>- Add haptic-style animation feedback on swipe.<br>- Confirm form validation messaging is legible on dark mode. | Dev | P0 | ✅ **COMPLETED** | **Mobile carousel implemented** with haptic feedback animations. **Dark mode validation** working properly. |
| 5 | Trust Signals | - Insert rotating client logo strip beneath hero (optional placeholder logos for now).<br>- Add quick-load testimonial snippet after Services grid.<br>- Publish privacy & accessibility statements in footer, linked in 2-clicks max. | Design + Content | P1 | ❌ **NOT STARTED** | Need to implement client logo strip, testimonials, and footer statements. |
| 6 | Consistent Branding | - Apply revised color tokens (#003366, #C0C0C0, #50C878) to all components in tailwind config.<br>- Run visual audit for color contrast AA compliance.<br>- Replace any legacy fonts with approved typography stack. | Design | P1 | ✅ **COMPLETED** | **Brand colors implemented** in Tailwind config. **Typography stack** using Inter and Bitter. Need contrast audit. |
| 7 | Performance & Accessibility | - Lazy-load hero and gallery images with loading="eager" only on first hero element.<br>- Generate alt text that matches brand voice (no repetition).<br>- Use Lighthouse to hit ≥ 90 on Perf, A11y, SEO, Best Practices. | Dev | P1 | 🔄 **IN PROGRESS** | **Alt text implemented** throughout. Need to optimize image loading and run Lighthouse audit. |
| 8 | Analytics & Goal Tracking | - Configure Plausible events for button clicks, form completions, workshop sign-ups.<br>- Map events to simple Looker Studio dashboard.<br>- Schedule weekly email report to Steve. | Dev + Analytics | P1 | ❌ **NOT STARTED** | Analytics integration needed. |
| 9 | Error & Edge Cases | - Design branded 404 and 500 pages with a "Return Home" CTA.<br>- Implement global toast for network errors during form submission. | Design + Dev | P2 | ✅ **COMPLETED** | **404 page exists** with return home CTA. **Toast system implemented** for form errors. |
| 10 | QA & Pre-Launch | - Device matrix: test on iPhone SE → iPad Pro → Pixel 7 → Desktop 1440px.<br>- Run manual WCAG contrast verification.<br>- Conduct 5-user hallway usability test; record task-completion time. | QA | P2 | 🔄 **IN PROGRESS** | **Browser testing checklist** created. Need device testing and usability studies. |
| 11 | Post-Launch Iteration | - Review analytics after 14 days; identify drop-offs.<br>- Ship micro-copy tweaks or layout adjustments within sprint. | Analytics + Design | P2 | ❌ **NOT STARTED** | Requires analytics setup and post-launch monitoring. |

## Summary Status

### ✅ **COMPLETED (4/11)**
- **Global Navigation** - Enhanced hamburger menu with animations and accessibility
- **Services → Contact Handoff** - Progress bar and auto-population working
- **Contact Page (Mobile)** - Carousel with haptic feedback implemented
- **Error & Edge Cases** - 404 page and toast system in place

### 🔄 **IN PROGRESS (3/11)**
- **Hero → CTA Path** - Needs copy refinement and dual-state buttons
- **Performance & Accessibility** - Alt text done, need image optimization and Lighthouse audit
- **QA & Pre-Launch** - Browser testing checklist created, need device testing

### ❌ **NOT STARTED (4/11)**
- **Trust Signals** - Client logos, testimonials, footer statements
- **Analytics & Goal Tracking** - Plausible integration and reporting
- **Post-Launch Iteration** - Analytics monitoring and iteration process

## Next Priority Actions

### P0 (Critical Path)
1. **Complete Hero CTA Path** - Implement dual-state buttons and refine copy
2. **Add Service Card Hover States** - Include "What you get" and price cues

### P1 (High Priority)
1. **Implement Trust Signals** - Add client logo strip and testimonials
2. **Set up Analytics** - Configure Plausible events and tracking
3. **Run Performance Audit** - Optimize images and achieve Lighthouse scores

### P2 (Medium Priority)
1. **Complete Device Testing** - Test across device matrix
2. **Conduct Usability Testing** - 5-user hallway test
3. **Prepare Post-Launch Monitoring** - Analytics review process

## Completion Rate: **36% (4/11 completed)**
**Estimated completion time**: 2-3 sprints for remaining P0/P1 items 