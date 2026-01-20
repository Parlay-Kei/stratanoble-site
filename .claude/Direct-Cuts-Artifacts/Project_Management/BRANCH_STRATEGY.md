# Branch Strategy & Deployment Guide

## Branch Purpose

| Branch | Purpose | Deployment Target | Root Route (`/`) |
|--------|---------|-------------------|------------------|
| `main` | Production app | directcuts.app (Vercel) | `WelcomePage` |
| `marketing` | Marketing site | direct-cuts.com | `LandingPage` |

## Critical Rules

### 1. Never merge marketing → main without reviewing App.tsx

The `marketing` branch has different routing:
- **marketing**: `<Route path="/" element={<LandingPage />} />`
- **main**: `<Route path="/" element={<WelcomePage />} />`

If you merge marketing changes to main, you **must** ensure App.tsx still has:
```tsx
<Route path="/" element={<WelcomePage />} />
```

### 2. Marketing-specific files to exclude from main merges

These files should remain different between branches:

| File | main | marketing |
|------|------|-----------|
| `src/App.tsx` | WelcomePage at `/` | LandingPage at `/` |
| `src/pages/LandingPage.tsx` | Not imported | Imported and used |
| `src/content/landing.ts` | May differ | Marketing copy |
| `src/content/answerBlocks.ts` | May not exist | AEO answer blocks |
| `src/components/marketing/*` | May not exist | Marketing components |

### 3. Safe merge procedure: marketing → main

```bash
# 1. Checkout main and pull latest
git checkout main
git pull origin main

# 2. Create a merge branch
git checkout -b merge/marketing-to-main

# 3. Merge marketing
git merge marketing

# 4. CRITICAL: Check App.tsx routing
# Ensure root route is WelcomePage, NOT LandingPage
git diff main -- src/App.tsx

# 5. If App.tsx was changed incorrectly, restore it
git checkout main -- src/App.tsx

# 6. Build and test
npm run build

# 7. Create PR for review
git push origin merge/marketing-to-main
gh pr create --title "Merge marketing updates" --body "..."
```

### 4. Files that CAN be safely merged

These files typically don't cause routing conflicts:
- `src/components/marketing/Schema.tsx` (schema markup)
- `public/marketing/*` (marketing images)
- Legal pages (`PrivacyPolicy.tsx`, `TermsOfService.tsx`)

## Deployment Verification

After any deployment to main, verify:

1. **https://directcuts.app/** shows the app WelcomePage (not marketing)
2. **https://directcuts.app/login** shows login form
3. **https://directcuts.app/home** shows customer home (after auth)

## Recovery Procedure

If marketing page appears on directcuts.app:

```bash
# Quick fix
git checkout main
git checkout HEAD~1 -- src/App.tsx  # Restore from previous commit

# Or manually edit App.tsx to use WelcomePage
# Then commit and push
git add src/App.tsx
git commit -m "fix: restore WelcomePage as app entry point"
git push origin main
```

## Preventing Future Issues

1. **PR Reviews**: Always check App.tsx changes in PRs that touch routing
2. **CI Check**: Consider adding a CI check that validates root route
3. **Separate Repos**: Long-term, consider separate repos for app vs marketing
