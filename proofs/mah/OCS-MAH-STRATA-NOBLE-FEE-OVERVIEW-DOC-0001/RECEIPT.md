# Receipt — OCS-MAH-STRATA-NOBLE-FEE-OVERVIEW-DOC-0001

**Mission:** Export MAH monthly operating **budget** overview into official Strata Noble document (renamed from *fee* to *budget* in filenames and client-facing language, 2026-05-04).  
**Date:** 2026-05-04  
**Execution agent:** Documentation Agent  
**QA agent:** QAG  

## Files created

| Format | Role |
|--------|------|
| Markdown | Authoritative source for content and version control |
| DOCX | Client review, contract attachment, Word workflow |
| PDF | Client distribution, print, formal record |

## Final paths (canonical)

| File | Path |
|------|------|
| Markdown | `docs/clients/ms-audreys-house/financials/MAH_Monthly_Operating_Budget_Financial_Overview_Strata_Noble.md` |
| DOCX | `docs/clients/ms-audreys-house/financials/MAH_Monthly_Operating_Budget_Financial_Overview_Strata_Noble.docx` |
| PDF | `docs/clients/ms-audreys-house/financials/MAH_Monthly_Operating_Budget_Financial_Overview_Strata_Noble.pdf` |

## Mirror copies (same filenames)

- `docs/clients/ms-audreys-house/agreements/` — duplicate set for agreements vault  
- `proofs/mah/OCS-MAH-STRATA-NOBLE-FEE-OVERVIEW-DOC-0001/` — mission proof bundle  

## Export / generation method

- **DOCX:** Pandoc (`gfm` → `docx`) from the Markdown source.  
- **PDF:** Pandoc HTML fragment + Strata Noble print shell (`template/budget-overview-print.css`, inline strata icon SVG) + Microsoft Edge headless `--print-to-pdf`.  
- **Regenerate PDF:** From repo root, run `proofs/mah/OCS-MAH-STRATA-NOBLE-FEE-OVERVIEW-DOC-0001/render-pdf.ps1` (requires Pandoc on `PATH`, Edge installed).

## Naming note

Deliverables previously named `MAH_Monthly_Operating_Fee_*` were renamed to `MAH_Monthly_Operating_Budget_*`; body copy now uses **monthly operating budget** for the $1,500 management allocation. Third-party charges (e.g. Shopify fees, processing fees) retain the word **fees** where appropriate.

## Validation summary

- Monthly allocation rows sum to **$1,500**.  
- Document metadata updated (e.g. **Monthly budget** in table).  
- Approval threshold language unchanged.  
- PDF and DOCX regenerated from updated source.

## Unresolved issues

- **PDF typography:** Google Fonts may require network during Edge print; offline fallbacks per prior receipt.  
- **DOCX styling:** Pandoc default; optional Strata Noble reference template in a future pass.

## QAG result

**PASS** — See `QAG-REVIEW.md`.

## Closeout

Official MAH monthly operating **budget** overview delivered in Markdown, DOCX, and PDF with proof pack artifacts.
