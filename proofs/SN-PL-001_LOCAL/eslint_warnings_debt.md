# ESLint Warnings - Known Debt

**Created:** 2026-01-03
**Status:** Open
**Priority:** Low

## Warnings (4 total)

- [ ] `src/app/layout.tsx:33` - Prefer `next/script` for GA inline script
- [ ] `src/components/achievery/AnalyticsDashboard.tsx:53` - useEffect missing dep `fetchAnalyticsData`
- [ ] `src/components/achievery/CoachDashboard.tsx:64` - useEffect missing dep `loadSharedUsers`  
- [ ] `src/components/providers/SessionProvider.tsx:60` - useEffect missing dep `loadUserData`

## Resolution Options

### GA Script (1 warning)
Migrate inline GA script to `next/script` component with `strategy="afterInteractive"`.

### useEffect Dependencies (3 warnings)
Options per case:
1. Add function to dependency array + wrap in useCallback
2. Move function inside useEffect
3. Disable rule with `// eslint-disable-next-line` + comment explaining why

## Acceptance Criteria
- [ ] All 4 warnings resolved
- [ ] `npm run lint` returns 0 warnings
- [ ] No regressions in affected components
