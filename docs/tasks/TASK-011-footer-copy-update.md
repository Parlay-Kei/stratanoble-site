# TASK-011: Footer Copy Update — Align With New Positioning

**Mission:** OCS-SN-SITE-REVAMP-001 — Flagged item (not in original mission scope)
**Priority:** P3 (low urgency, high consistency value)
**Status:** READY
**Depends on:** None

---

## Objective

Update two footer text elements that still reflect the old "pipeline shop" framing instead of the new "operational infrastructure firm" positioning established in Phases 1–2.

---

## Changes

### File: `apps/website/src/components/site/SiteFooter.tsx`

#### 1. Logo description paragraph

**Current (line ~55):**
```tsx
<p className="text-sm leading-6 text-navy-300">
  Lead-to-customer pipelines for service businesses.
  Installed fast. Scope capped. You own it.
</p>
```

**New:**
```tsx
<p className="text-sm leading-6 text-navy-300">
  Operational infrastructure for service businesses.
  Scoped engagements. Delivered systems. You own it.
</p>
```

#### 2. Bottom tagline

**Current (near end of file):**
```tsx
<p className="text-xs text-navy-500">
  No branding. No website builds. Pipeline infrastructure only.
</p>
```

**New:**
```tsx
<p className="text-xs text-navy-500">
  Operational control systems for service businesses.
</p>
```

**Rationale:** "No branding. No website builds." is defensive/reactive — it tells people what we *don't* do. The new positioning is assertive — it tells people what we *are*. The constraint messaging was appropriate for the old pipeline shop framing but is out of place now that the site positions SN as an operational infrastructure firm.

#### 3. Footer comment block (cosmetic)

**Current:**
```tsx
/**
 * SiteFooter - Pipeline-focused footer
```

**New:**
```tsx
/**
 * SiteFooter - Operational infrastructure footer
```

---

## Validation

- [ ] Footer description reads "Operational infrastructure for service businesses."
- [ ] Bottom tagline reads "Operational control systems for service businesses."
- [ ] No "No branding. No website builds." language
- [ ] Comment updated
- [ ] `pnpm build` succeeds
