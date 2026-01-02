# Brand Freeze 2026-01-02

**Effective Date:** 2026-01-02  
**Status:** ACTIVE - All brand references must align with this freeze

---

## Canonical Domain

**StrataNoble.com** (case-sensitive in brand materials, lowercase in URLs)

---

## Canonical One-Liner

> Strata Noble builds and operates revenue-producing digital infrastructure for service businesses and early-stage ventures, including websites, portals, marketplaces, and the systems that run them.

**Usage:**
- Meta descriptions
- Social media bios
- Email signatures
- About page hero text
- Any "what we do" summaries

---

## Source of Truth

**Location:** `/brand/strata-noble/`

**Key Files:**
- `brand-spine.md` - Core brand definition, one-liner, proof anchors
- `messaging/snippets.md` - Reusable messaging components
- `visual/logo/` - Logo assets

**Rule:** All brand references across the codebase must align with `/brand/strata-noble/brand-spine.md`. If you find a discrepancy, update the code to match the brand spine, not the other way around.

---

## Validation

**Command:** `npm run brand:check`

This script scans the entire codebase for forbidden brand terms and ensures consistency. It will fail if:
- Old brand references (StrataNova, stratanova.com) are found outside allowed paths
- Brand inconsistencies are detected

**Allowed Paths (historical references only):**
- `/docs/archive/` - Historical documentation
- `/brand/strata-noble/proofs/` - Proof materials may contain old references
- `/marketing-restructure-export/` - Legacy export folder
- `/docs/BRAND_FREEZE_2026-01-02.md` - This documentation file (contains examples of forbidden terms)

---

## "Do Not Claim" List

Strata Noble does NOT claim:
- Legal services
- Tax services
- Guaranteed funding outcomes

**Enforcement:** Any marketing copy, landing pages, or sales materials that imply these services must be removed or rewritten.

---

## Netlify Validation Checklist

Before merging any PR that touches brand assets or metadata:

1. **Build Configuration**
   - Base directory: `apps/website`
   - Publish directory: `build` (Next.js output)
   - Verify in Netlify Deploy Preview settings

2. **Homepage Metadata**
   - Title: "Strata Noble" (not "Strata Noble - Your CaaS Platform" or variants)
   - Meta description: Must match canonical one-liner exactly
   - OpenGraph title: "Strata Noble"
   - OpenGraph description: Must match canonical one-liner
   - Twitter card title: "Strata Noble"
   - Twitter card description: Must match canonical one-liner

3. **Domain Behavior**
   - `http://stratanoble.com` → redirects to `https://stratanoble.com`
   - `StrataNoble.com/*` → resolves cleanly to `stratanoble.com/*` (case normalization)
   - Primary domain setting in Netlify UI is the enforcement mechanism

4. **Build Success**
   - Netlify preview deploy must succeed
   - TypeScript compilation must pass (`npm run build` in `apps/website`)
   - No build warnings that affect production

**Merge Standard:** Only merge if Netlify preview deploy succeeds AND homepage metadata is correct.

---

## PR Discipline

When opening a PR that includes brand changes:

**Required PR Description Fields:**
- Canonical domain: `StrataNoble.com`
- Canonical one-liner: (paste from brand-spine.md)
- Files added: `brand/strata-noble/*`
- Guardrail: `npm run brand:check`
- Netlify base/publish change summary: (if changed)

**Merge Requirements:**
1. Netlify preview deploy succeeds
2. Homepage metadata verified correct
3. `npm run brand:check` passes
4. TypeScript build passes (`npm run build` in `apps/website`)

---

## Folder Structure Rationale

The repo contains multiple parallel folders that may reference brand:
- `marketing-restructure-export/` - Legacy export (allowed for historical reference)
- `branding/` - Legacy folder (should be archived or removed)
- `root/` - Documentation (must align with brand spine)
- `src/` - Source code (must align with brand spine)
- `apps/website/` - Production website (must align with brand spine)

**Authority:** `/brand/strata-noble/` is the single source of truth. All other folders are either:
- Consumers of the brand spine (must reference it, not redefine it)
- Historical archives (allowed to contain old references)

---

## Future Agent Instructions

If you are an AI agent or developer working on this codebase:

1. **Before making brand-related changes:**
   - Read `/brand/strata-noble/brand-spine.md`
   - Run `npm run brand:check`
   - Verify your changes align with the canonical one-liner

2. **If you find brand inconsistencies:**
   - Update the code to match `/brand/strata-noble/brand-spine.md`
   - Do NOT update the brand spine to match the code
   - Document any intentional exceptions in this file

3. **If you need to add new brand materials:**
   - Add them to `/brand/strata-noble/`
   - Update this freeze document if new validation rules are needed
   - Run `npm run brand:check` to ensure no conflicts

4. **Do NOT:**
   - Create new brand definitions outside `/brand/strata-noble/`
   - Use old brand names (StrataNova, stratanova.com) in new code
   - Claim services we don't provide (legal, tax, guaranteed funding)
   - Modify the brand spine without explicit approval

---

## Enforcement

This brand freeze is enforced by:
- `npm run brand:check` script (automated)
- Netlify build validation (automated)
- TypeScript build checks (automated)
- PR review process (manual)

**Violations:** If brand inconsistencies are found, the PR will be blocked until fixed.

---

**Last Updated:** 2026-01-02  
**Maintained By:** Strata Noble Development Team
