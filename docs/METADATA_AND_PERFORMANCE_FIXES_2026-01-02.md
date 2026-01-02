# Metadata and Performance Fixes - January 2, 2026

## Summary

Fixed critical brand alignment, metadata placeholder issues, and performance optimizations identified in production audit.

## ✅ Issues Fixed

### 1. Brand Spine Mismatch ✅

**Problem**: Hero copy said "Stop Losing Leads" while metadata positioned Strata Noble as "digital infrastructure" - confusing mismatch.

**Fix**: Updated hero copy to align with brand spine while keeping CTAs:
- **H1**: "Revenue-producing digital infrastructure for service businesses."
- **Subhead**: "Websites, portals, and pipelines that turn leads into customers with trackable operations."
- **Primary CTA**: "Start with the 48-Hour Lead Rescue" (updated from "Get the 48-Hour Lead Rescue")
- **Secondary CTA**: "Apply for Phase 3 Buildout" (unchanged)

**Files Modified**:
- `apps/website/src/components/revamp/RevampedHero.tsx`

### 2. Placeholder Metadata Removed ✅

**Problem**: Placeholder values shipping to production:
- `google-site-verification = "your-google-verification-code"`
- `ACHIEVERY_APP_ID` placeholders

**Fix**:
- Removed `google-site-verification` (commented out, can be re-enabled with real value)
- Made `ACHIEVERY_APP_ID` conditional - only renders if `NEXT_PUBLIC_ACHIEVERY_APP_ID` env var is set
- Removed hardcoded placeholder values

**Files Modified**:
- `apps/website/src/app/layout.tsx`

### 3. JSON-LD Description Alignment ✅

**Problem**: Schema.org Organization description said "Consulting-as-a-Service platform..." while meta description said "revenue-producing digital infrastructure..."

**Fix**: Updated JSON-LD description to match meta description exactly:
- "Strata Noble builds and operates revenue-producing digital infrastructure for service businesses and early-stage ventures, including websites, portals, marketplaces, and the systems that run them."

**Files Modified**:
- `apps/website/src/app/layout.tsx`

### 4. Icon Placement ✅

**Status**: Icons are properly configured in Next.js metadata API:
- `icon: '/favicon.svg'`
- `apple: '/apple-touch-icon.svg'`

No icon-moving script found (either already removed or never existed). Icons render in `<head>` naturally via Next.js metadata.

### 5. Performance Optimizations ✅

**Problem**: Client components loading immediately, blocking initial render.

**Fix**: Lazy-loaded below-fold client components:
- `SmartConsultingBar` - lazy-loaded with `ssr: false`
- `WhatWeInstallSection` - lazy-loaded with `ssr: false`
- `PrinciplesSection` - lazy-loaded with `ssr: false`

**Files Modified**:
- `apps/website/src/app/page.tsx`

**Impact**:
- Reduced initial JavaScript bundle size
- Faster First Contentful Paint (FCP)
- Better Largest Contentful Paint (LCP)
- Hero section (above fold) loads immediately
- Below-fold sections load asynchronously

## Files Changed

1. `apps/website/src/components/revamp/RevampedHero.tsx`
   - Updated hero copy to brand-aligned version
   - Updated primary CTA text

2. `apps/website/src/app/layout.tsx`
   - Removed placeholder `google-site-verification`
   - Made `ACHIEVERY_APP_ID` conditional
   - Fixed JSON-LD description to match meta description

3. `apps/website/src/app/page.tsx`
   - Lazy-loaded `SmartConsultingBar`
   - Lazy-loaded `WhatWeInstallSection`
   - Lazy-loaded `PrinciplesSection`

## Expected Performance Improvements

### Before:
- All client components loaded immediately
- Placeholder metadata in production
- Brand messaging mismatch
- Lighthouse Performance: ~49

### After:
- Only hero section loads immediately
- Below-fold components lazy-load
- Clean metadata (no placeholders)
- Consistent brand messaging
- Expected Lighthouse Performance: 70+

## Environment Variables

### Optional (for app store links):
- `NEXT_PUBLIC_ACHIEVERY_APP_ID` - Only set if iOS app is published

### Optional (for Google verification):
- `GOOGLE_SITE_VERIFICATION` - Uncomment verification in layout.tsx if needed

## Testing Checklist

- [x] Hero copy updated and brand-aligned
- [x] Placeholder metadata removed
- [x] JSON-LD description matches meta description
- [x] Icons properly configured in metadata
- [x] Client components lazy-loaded
- [ ] Deploy to production
- [ ] Run Lighthouse audit (expect 70+)
- [ ] Verify no placeholder values in production HTML
- [ ] Test lazy-loading behavior (check Network tab)

## Notes

- Icon-moving script was not found (likely already fixed or never existed)
- All metadata is now clean and production-ready
- Performance optimizations follow Next.js best practices
- Brand messaging is now consistent across all touchpoints
