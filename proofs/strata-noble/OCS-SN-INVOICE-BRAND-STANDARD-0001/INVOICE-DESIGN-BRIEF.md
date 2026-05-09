# Strata Noble — Invoice design brief

**Mission:** OCS-SN-INVOICE-BRAND-STANDARD-0001  
**Sources:** `SN-BCA-001` / `C:\Dev\.claude-anx\docs\governance\SN-BRAND-COMMERCIAL-ARCHITECTURE.md`; website tokens (`apps/website/tailwind.config.js`, `globals.css`); verified logo vectors under `branding/`.

---

## Brand assumptions — confirmed

| Assumption | Evidence |
|------------|----------|
| Strata Noble is a solutions and systems firm — voice should be direct and credible, not promotional | SN-BCA-001 §1 |
| Typography: **Playfair Display** (display / company identity), **Inter** (body) | Website `globals.css`, Tailwind theme |
| Color system includes command navy `#0E1A2B`, forest green `#2D6A4F`, field sage `#A8C5B0`, slate grey `#8A9BAE`, off-white paper `#F5F2EE` | `tailwind.config.js` |
| **Verified** mark: strata icon (concentric rings + three strata bars) from `stratanoble_logoICON.svg` / `strata_noble_logo.svg` — same graphic as `apps/website` `Logo.tsx` | `branding/*.svg` |
| Invoices are **serious business records** — paper-like light surface, strong hierarchy, minimal decoration | SN-BCA brand voice + mission constraints |

## Brand assumptions — rejected (per mission + prior rejection)

| Rejected | Reason |
|----------|--------|
| Invented “SN” monogram or unknown circular mark | Not a verified asset; prior design failed here |
| All-caps “STRATA NOBLE LLC” as the dominant display treatment | Read as off-brand / template-like; use title case name + restrained legal line |
| Stacked “DUE” / “BALANCE DUE” (or similar duplicate labels) | Redundant, amateur per review |
| Heavy ornament, gradient flyers, or “SaaS invoice” boilerplate | Conflicts with restrained, executive record |
| Loud red for normal due state | Reserved for overdue / collections only |
| Any new brand identity or net-new logo | Out of scope |

## Visual direction

- **Surface:** White / off-white document background; dark navy and green as **ink and accent**, not full-bleed marketing dark mode.
- **Header:** Verified icon at small fixed size + **“Strata Noble”** in display hierarchy + **“Strata Noble LLC”** as a single legal subline (small caps / label style), not a second competing logotype.
- **Title block:** “Invoice” as document title; invoice number, dates in a **scannable right column** (executive one-page clarity).
- **Status:** **One** status model per document (see template spec). No duplicate “due” language.
- **Line items:** Single clear table; no decorative chips.
- **Paid vs open:** Paid invoices use a **Payment record** table; open invoices use **Payment instructions** + **Terms** without duplicating amount in multiple competing bands.

## Layout rules

1. Company identity → document title → metadata → client / issuer → statement of services → line items → totals → (payment record | instructions) → terms → footer.
2. Consistent vertical rhythm; 1pt hairline rules; left accent on status band only (green for open; neutral when paid).
3. Invoice number and due date appear in **header metadata**, not buried in body copy.
4. No more than one primary callout for **amount due** (unpaid) or **balance** (paid).

## Typography and color (from existing brand, not invented)

- **Display / company name:** Playfair Display, semibold/bold, navy.
- **Body / tables:** Inter, 9.5–10.5pt effective.
- **Accent:** Forest green for structural emphasis (status band left border, optional); **not** used as heavy fill blocks.
- **Text:** Default ink on white; secondary labels in slate grey.

## Unresolved / none

- **Zelle account identifier** is intentionally not invented on the open invoice; text points to the “designated account” per source invoice language.
