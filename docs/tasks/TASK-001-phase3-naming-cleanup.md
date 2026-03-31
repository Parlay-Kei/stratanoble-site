# TASK-001: Kill "Phase 3" From All Public-Facing Copy

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 1, Item 3
**Priority:** P1 (blocks other work — naming must be consistent before new pages ship)
**Status:** READY

---

## Objective

Remove every instance of "Phase 3" from public-facing code and replace with "21-Day Pipeline Buildout" consistently. The route `/phase-3` stays as-is (no URL redirect needed yet), but all visible text must use the new name.

---

## Scope

### Files to modify

1. **`apps/website/src/components/site/SiteNav.tsx`**
   - Line in `offerCTAs` array: change `href: '/phase-3'` label from `'21-Day Pipeline Buildout'` (mobile) — already correct
   - Desktop nav button (line ~197): change text from `21-Day Pipeline` → `21-Day Pipeline Buildout`
   - No href change needed — `/phase-3` route stays

2. **`apps/website/src/components/site/SiteFooter.tsx`**
   - In `navigation.services` array: change `{ name: 'Pipeline Buildout', href: '/phase-3' }` → `{ name: '21-Day Pipeline Buildout', href: '/phase-3' }`

3. **`apps/website/src/app/(marketing)/phase-3/page.tsx`**
   - `<h1>` tag: `Phase 3: 21-Day Pipeline Buildout` → `21-Day Pipeline Buildout`
   - Metadata `title`: `'21-Day Pipeline Buildout | Strata Noble'` (already correct — verify)
   - JSON-LD `name`: `'Phase 3: 21-Day Pipeline Buildout'` → `'21-Day Pipeline Buildout'`
   - `Phase3FAQ` component, last FAQ answer: `"Lead Rescue is a 48-hour sprint focused on lead capture. Phase 3 is a 21-day buildout..."` → replace "Phase 3" with "The Pipeline Buildout"
   - `Phase3FAQ` component, last FAQ question: `"How is this different from Lead Rescue?"` — keep question, fix answer
   - `BottomCTA` component: `"Apply for Phase 3"` → `"Apply for the Pipeline Buildout"`
   - `<h2>` in form sidebar: `"Apply for Phase 3"` → `"Apply for the 21-Day Pipeline Buildout"`

4. **`apps/website/src/app/(marketing)/about/page.tsx`**
   - Bottom CTA link: `href="/phase-3"` with text `"Apply for Phase 3"` → `"Apply for the 21-Day Pipeline Buildout"`

5. **`apps/website/src/app/(marketing)/layout.tsx`**
   - Comment block lists `- /phase-3` — update comment to `- /phase-3 (21-Day Pipeline Buildout)`

### Grep verification

After changes, run:
```bash
cd apps/website
grep -rn "Phase 3" --include="*.tsx" --include="*.ts" src/
```

Expected result: **zero matches** in any user-facing text. Schema/component names like `Phase3ApplicationForm` and `Phase3FAQ` are internal and acceptable to leave.

---

## Validation

- [ ] Desktop nav shows "21-Day Pipeline Buildout" (not "21-Day Pipeline")
- [ ] Mobile nav shows "21-Day Pipeline Buildout"
- [ ] Footer shows "21-Day Pipeline Buildout" under Services
- [ ] `/phase-3` page h1 says "21-Day Pipeline Buildout" (no "Phase 3:" prefix)
- [ ] `/phase-3` page JSON-LD name has no "Phase 3"
- [ ] FAQ answer references "The Pipeline Buildout" not "Phase 3"
- [ ] Bottom CTA says "Apply for the Pipeline Buildout"
- [ ] About page CTA says "Apply for the 21-Day Pipeline Buildout"
- [ ] `grep -rn "Phase 3" src/` returns zero user-facing matches
- [ ] Site builds without errors: `pnpm build`
