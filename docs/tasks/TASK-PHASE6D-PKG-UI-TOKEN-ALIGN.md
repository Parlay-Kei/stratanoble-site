# TASK-PHASE6D-PKG-UI-TOKEN-ALIGN

**Mission:** OCS-SN-SITE-REVAMP-001  
**Phase:** 6D remediation  
**Scope:** `packages/ui/src/` — shared monorepo UI primitives  
**Branch:** `feature/site-revamp-phase-6-design-tokens` (same branch as Phase 6 work)  
**Prerequisite:** Phase 6 changes already committed on working tree  

---

## Context

Phase 6D stated "UI primitives aligned with new tokens and flatter chrome." The **website-local copies** (`apps/website/src/components/ui/`) were correctly updated. The **shared monorepo copies** (`packages/ui/src/`) were not.

Currently `packages/ui` is consumed by:
- `apps/platform` (imports `@strata-noble/ui`)
- Potentially `apps/achievery-mobile`, `apps/mobile` (check imports before work)

The website app imports from `@/components/ui/` (local), so these changes do not affect the website build. They affect the platform app and any future consumer of the shared package.

---

## Design Token Reference

Source of truth: `apps/website/tailwind.config.js` (Phase 6B).

### Brand colors
| Token | Hex |
|---|---|
| `command-navy` | `#0E1A2B` |
| `forest-green` | `#2D6A4F` |
| `field-sage` | `#A8C5B0` |
| `slate-grey` | `#8A9BAE` |
| `void` | `#070F1A` |
| `fault-amber` | `#C8852A` |
| `off-white` | `#F5F2EE` |

### Semantic keys (shadcn-style)
`primary`, `secondary`, `accent`, `destructive`, `muted`, `card`, `popover`, `background`, `foreground`, `input`, `ring` — all mapped in Tailwind config.

### Design language
- `rounded-sm` (not `rounded-xl` or `rounded-lg`)
- `shadow-none` (no box shadows on cards)
- `transition-colors duration-200` (not `transition-all`)
- Focus rings: `focus:ring-forest-green focus:ring-offset-command-navy`
- No gradients, no glass, no blur

---

## Tasks

### 6D-R1 — `packages/ui/src/button.tsx`

**Current state (broken):**
```tsx
const baseClasses =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/30',
  secondary: 'bg-accent text-white hover:bg-accent/90 focus:ring-accent/30',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/30',
};
```

**Target state (match `apps/website/src/components/ui/button.tsx`):**
```tsx
const baseClasses =
  'inline-flex items-center justify-center rounded-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 focus:ring-offset-command-navy disabled:opacity-50 disabled:cursor-not-allowed';
const variants = {
  primary:
    'bg-forest-green text-white hover:bg-forest-green/90 focus:ring-forest-green/40',
  secondary:
    'bg-transparent text-white border border-slate-grey hover:border-forest-green hover:text-field-sage focus:ring-slate-grey/30',
  outline:
    'border-2 border-slate-grey text-white hover:border-forest-green hover:text-field-sage focus:ring-forest-green/30',
};
```

**Changes:**
- `rounded-xl` → `rounded-sm`
- `transition-all` → `transition-colors`
- `focus:ring-offset-2` → `focus:ring-forest-green focus:ring-offset-2 focus:ring-offset-command-navy`
- Primary: `bg-primary` → `bg-forest-green`, ring updated
- Secondary: generic `bg-accent` → `bg-transparent` with `border-slate-grey` and forest-green hover
- Outline: `border-primary text-primary` → `border-slate-grey text-white` with forest-green hover

**Also update import:** `@strata-noble/utils` → keep as-is (shared package correctly uses package import, not `@/lib/utils`)

---

### 6D-R2 — `packages/ui/src/card.tsx`

**Current state (broken):**
```tsx
className={cn('rounded-xl border border-neutral-200 bg-white shadow-sm', className)}
```

**Target state (match `apps/website/src/components/ui/card.tsx`):**
```tsx
className={cn('rounded-lg border border-slate-grey/30 bg-white text-command-navy shadow-none', className)}
```

**Changes:**
- `rounded-xl` → `rounded-lg`
- `border-neutral-200` → `border-slate-grey/30`
- Add `text-command-navy`
- `shadow-sm` → `shadow-none`

**Also add `CardDescription` export** — the website local copy exports it, but `packages/ui` does not. Add:
```tsx
type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-grey', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';
```

---

### 6D-R3 — `packages/ui/src/input.tsx`

**Current state (broken):**
```tsx
className={`
  flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
  ${className || ''}
`}
```

**Target state (match `apps/website/src/components/ui/input.tsx`):**
```tsx
className={`
  flex h-10 w-full rounded-sm border border-slate-grey/50 bg-white px-3 py-2 text-sm text-command-navy ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-grey focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
  ${className || ''}
`}
```

**Changes:**
- `rounded-md` → `rounded-sm`
- `border-gray-300` → `border-slate-grey/50`
- Add `text-command-navy`
- `placeholder:text-gray-500` → `placeholder:text-slate-grey`
- `focus:ring-blue-500` → `focus:ring-forest-green`

---

### 6D-R4 — `packages/ui/src/badge.tsx`

**Current state:** Already uses shadcn semantic keys (`bg-primary`, `text-primary-foreground`, etc.) which resolve to the new tokens. However, two details need alignment:

**Changes:**
- `rounded-full` → `rounded-sm` (match website local copy)
- Focus ring: `focus:ring-ring` → `focus:ring-forest-green focus:ring-offset-command-navy`
- `transition-colors` → `transition-colors duration-200` (add explicit duration)

---

## Verification

After all four files are updated:

1. **Ensure `packages/ui` types compile:**
   ```bash
   cd packages/ui && npx tsc --noEmit
   ```

2. **Ensure `apps/platform` builds** (primary consumer):
   ```bash
   cd apps/platform && npm run build
   ```
   If platform has its own Tailwind config that doesn't include the brand tokens, that config also needs the Phase 6B color palette added. Check `apps/platform/tailwind.config.*` before building.

3. **Ensure `apps/website` still builds** (should be unaffected since it uses local copies):
   ```bash
   cd apps/website && npm run build
   ```

4. **Grep for removed token references** across `packages/ui/src/`:
   - No `rounded-xl` remaining
   - No `border-neutral-200`, `border-gray-300`, `text-gray-500`, `ring-blue-500` remaining
   - No `shadow-sm` on card
   - No `transition-all` on button

---

## Commit

Single commit, all four files:
```
fix(ui): align packages/ui primitives with Phase 6 design tokens

- button: rounded-sm, forest-green palette, transition-colors
- card: rounded-lg, slate-grey border, shadow-none, add CardDescription
- input: rounded-sm, slate-grey/forest-green tokens, remove gray/blue
- badge: rounded-sm, explicit forest-green focus ring
```

---

## Note on `packages/ui` ↔ `apps/website/src/components/ui/` divergence

The monorepo currently has **two copies** of these primitives — the shared package and local website overrides. This is a known pattern from the original scaffold but creates drift risk. A future cleanup task should evaluate whether to:
- Consolidate to `packages/ui` only (website imports from `@strata-noble/ui`)
- Or keep local copies and deprecate `packages/ui` if the platform app also moves to local copies

This is a principal decision, not part of this task.
