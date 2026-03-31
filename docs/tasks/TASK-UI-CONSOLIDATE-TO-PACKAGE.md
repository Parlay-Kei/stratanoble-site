# TASK-UI-CONSOLIDATE-TO-PACKAGE

**Mission:** OCS-SN-SITE-REVAMP-001  
**Scope:** Consolidate `apps/website/src/components/ui/` into `packages/ui`; website switches to `@strata-noble/ui` imports  
**Branch:** `refactor/consolidate-ui-to-package`  
**Prerequisite:** Phase 6D token alignment complete (both `packages/ui` and `apps/website/src/components/ui/` are on brand tokens)

---

## Problem

The monorepo has two independent copies of the same UI primitives:

1. `packages/ui/src/` — shared package (`@strata-noble/ui`), consumed by `apps/platform`
2. `apps/website/src/components/ui/` — local copies, consumed by `apps/website`

Both are now token-aligned after Phase 6D, but maintaining two copies creates drift risk. Any future design token or component change must be applied twice. This task eliminates the duplication by making `packages/ui` the single source of truth.

---

## Pre-Work Investigation Summary

### Component inventory

| Component | `packages/ui` | Website local | Match status |
|---|---|---|---|
| `badge.tsx` | ✅ | ✅ | Identical (both on brand tokens after 6D) |
| `button.tsx` | ✅ | ✅ | Identical (both on brand tokens after 6D) |
| `card.tsx` | ✅ | ✅ | Identical (both have `CardDescription` after 6D) |
| `chart.tsx` | ✅ | ✅ | Identical (trivial type cast difference — `Record<string,string>` vs `any`) |
| `container.tsx` | ✅ | ✅ | Identical |
| `dialog.tsx` | ✅ | ✅ | Identical |
| `input.tsx` | ✅ | ✅ | Identical (both on brand tokens after 6D) |
| `SafeHTML.tsx` | ✅ | ✅ | Identical |
| `select.tsx` | ✅ | ✅ | Identical |
| `tabs.tsx` | ✅ | ✅ | Identical |
| `toast.tsx` | ✅ | ✅ | **DIVERGED** — website uses brand tokens for success style; shared uses `emerald` |
| `ClientToastProvider.tsx` | ❌ | ✅ | Website-only (Next.js `dynamic()` SSR wrapper) |
| `separator.tsx` | ❌ | ✅ | Website-only (Radix separator) |
| `__tests__/SafeHTML.test.tsx` | ✅ | ✅ | Both have tests |

### Import paths

- All matched components differ only in `cn` import: `@/lib/utils` (website) vs `@strata-noble/utils` (package)
- The `cn` function is identical in both locations
- `separator.tsx` imports `cn` from `@/lib/utils` — needs rewrite to `@strata-noble/utils`

### Dependency status

- `@strata-noble/ui` is **NOT** in `apps/website/package.json` — must be added
- `@radix-ui/react-separator` is in `apps/website/package.json` but **NOT** in `packages/ui/package.json` — must be added to shared package

### Consumers in `apps/website` that import from `@/components/ui/`

Files confirmed to import from `@/components/ui/*`:
- `src/components/CheckoutModal.tsx` — dialog, button
- `src/components/ErrorBoundary.tsx` — button
- `src/components/AccessDenied.tsx` — card, button
- `src/components/SubscriptionManager.tsx` — button, toast
- `src/components/pages/DashboardAnalyticsPageClient.tsx` — card, badge, button, select, tabs, chart
- `src/components/ui/ClientToastProvider.tsx` — toast (dynamic import)
- `src/app/layout.tsx` — toast (ToastProvider)

**Agent must grep the full codebase for the complete list.** The pattern to search:
```bash
grep -rn "from '@/components/ui/" apps/website/src/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".next"
```

---

## Tasks (execute in order)

### Step 1 — Promote website-only components to `packages/ui`

#### 1A: `toast.tsx` — update shared to match website (brand tokens)

The website version has the correct styles. Update `packages/ui/src/toast.tsx`:

**Current (shared, broken):**
```tsx
const toastStyles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
```
```tsx
const iconStyles = {
  success: 'text-emerald-500',
```

**Target (match website):**
```tsx
const toastStyles = {
  success: 'bg-field-sage/10 border-forest-green/25 text-forest-green',
```
```tsx
const iconStyles = {
  success: 'text-forest-green',
```

Also update import organization to match website (move `createContext`/`useCallback`/`useContext` into the top-level React import, remove the mid-file import block). And update `.substr(2, 9)` to `.substring(2, 11)` (matches website, avoids deprecated method).

#### 1B: Add `separator.tsx` to `packages/ui`

Create `packages/ui/src/separator.tsx`:
```tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@strata-noble/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```

#### 1C: Add `ClientToastProvider.tsx` to `packages/ui`

Create `packages/ui/src/ClientToastProvider.tsx`:
```tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ToastProviderInner = dynamic(
  () => import('./toast').then(mod => ({ default: mod.ToastProvider })),
  {
    ssr: false,
    loading: () => null
  }
);

export function ClientToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastProviderInner>{children}</ToastProviderInner>;
}
```

**Note:** This component uses `next/dynamic`. Confirm `next` is a `peerDependency` of `packages/ui` or add it. Since `packages/ui` already imports from React and uses `'use client'`, and is consumed only by Next.js apps, this is acceptable.

#### 1D: Update `packages/ui/src/index.ts`

Add new exports:
```ts
export * from './separator';
export * from './ClientToastProvider';
```

#### 1E: Update `packages/ui/package.json`

Add `@radix-ui/react-separator` to dependencies:
```json
"@radix-ui/react-separator": "^1.1.7"
```

Add `next` to peerDependencies (for `ClientToastProvider`):
```json
"peerDependencies": {
  "next": ">=14.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

Run `npm install` / `pnpm install` from repo root after.

---

### Step 2 — Add `@strata-noble/ui` dependency to website

In `apps/website/package.json`, add to `dependencies`:
```json
"@strata-noble/ui": "file:../../packages/ui"
```

Run install from repo root after.

---

### Step 3 — Rewrite website imports

For **every file** in `apps/website/src/` that imports from `@/components/ui/*`, rewrite the import path to `@strata-noble/ui`.

**Pattern:**
```
// BEFORE
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ToastProvider } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast'
import { ClientToastProvider } from '@/components/ui/ClientToastProvider'
import { Separator } from '@/components/ui/separator'

// AFTER
import { Button } from '@strata-noble/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@strata-noble/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@strata-noble/ui'
import { ToastProvider } from '@strata-noble/ui'
import { useToast } from '@strata-noble/ui'
import { ClientToastProvider } from '@strata-noble/ui'
import { Separator } from '@strata-noble/ui'
```

**Or consolidate multiple imports from the same component into one line:**
```tsx
// BEFORE
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// AFTER
import { Button, Card, CardContent } from '@strata-noble/ui'
```

**Agent workflow:**
1. Run the grep from the investigation section to get the full file list
2. For each file, rewrite `from '@/components/ui/...'` to `from '@strata-noble/ui'`
3. Optionally consolidate multiple `@strata-noble/ui` imports into a single import line per file
4. Do NOT touch imports from `@/components/...` that are NOT under `ui/` (e.g., `@/components/ErrorBoundary` stays as-is)

---

### Step 4 — Delete local copies

Delete the entire `apps/website/src/components/ui/` directory:

```
apps/website/src/components/ui/badge.tsx
apps/website/src/components/ui/button.tsx
apps/website/src/components/ui/card.tsx
apps/website/src/components/ui/chart.tsx
apps/website/src/components/ui/ClientToastProvider.tsx
apps/website/src/components/ui/container.tsx
apps/website/src/components/ui/dialog.tsx
apps/website/src/components/ui/input.tsx
apps/website/src/components/ui/SafeHTML.tsx
apps/website/src/components/ui/select.tsx
apps/website/src/components/ui/separator.tsx
apps/website/src/components/ui/tabs.tsx
apps/website/src/components/ui/toast.tsx
```

Keep `apps/website/src/components/ui/__tests__/SafeHTML.test.tsx` — move it to `packages/ui/src/__tests__/` if a test directory exists there, or leave in place and update its import. (Check whether `packages/ui/src/__tests__/` already has tests.)

---

### Step 5 — Verify

1. **Packages type-check:**
   ```bash
   cd packages/ui && npx tsc --noEmit
   ```

2. **Website builds:**
   ```bash
   cd apps/website && npm run build
   ```
   Must exit 0. Watch for:
   - "Module not found" errors → missed an import rewrite
   - "Cannot find module '@strata-noble/ui'" → dependency not installed
   - Component type errors → export mismatch between old local and shared

3. **Platform still builds** (no regressions to existing consumer):
   ```bash
   cd apps/platform && npm run build
   ```

4. **Grep confirms no remaining local UI imports:**
   ```bash
   grep -rn "from '@/components/ui/" apps/website/src/ --include="*.tsx" --include="*.ts"
   ```
   Must return zero results.

5. **Grep confirms local ui directory is gone:**
   ```bash
   ls apps/website/src/components/ui/
   ```
   Should error or show only `__tests__/` if test was kept.

---

## Commits

Can be done as a single commit or split into two:

**Option A — Single commit:**
```
refactor(ui): consolidate website UI primitives into packages/ui

- Promote separator, ClientToastProvider to shared package
- Update toast brand tokens in shared package
- Rewrite all website imports from @/components/ui to @strata-noble/ui
- Delete apps/website/src/components/ui/ local copies
- Add @strata-noble/ui dependency to website
```

**Option B — Two commits (safer, easier to bisect):**
```
feat(ui): add separator, ClientToastProvider, fix toast tokens in packages/ui
```
```
refactor(website): switch UI imports to @strata-noble/ui, delete local copies
```

---

## Risk notes

- **`ClientToastProvider` uses `next/dynamic`** — this creates a soft coupling between `packages/ui` and Next.js. If a non-Next consumer ever needs this package, `ClientToastProvider` should be extracted. For now this is acceptable since all consumers are Next.js apps.
- **Test file location** — `SafeHTML.test.tsx` in the website's `__tests__` directory needs its import updated or relocated. Don't silently drop test coverage.
- **Import consolidation is optional** — multiple import lines from `@strata-noble/ui` work fine. Consolidation is cleaner but not required for correctness.
