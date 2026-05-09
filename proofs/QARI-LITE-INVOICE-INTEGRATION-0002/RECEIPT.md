# RECEIPT — OCS-QARI-LITE-INVOICE-INTEGRATION-0002

**Mission:** Integrate approved Strata Noble invoice template into Q-ARI Lite (PDF generation, send/log, comms linkage).

**Workspace:** Implementation lives in the Q SUITE monorepo app  
`C:\Dev\10_products\Q SUITE\Q-ARI\apps\web`  
(StrataNoble repo holds this proof pack only.)

## Source design package (authoritative)

`C:\Dev\10_products\StrataNoble\proofs\strata-noble\OCS-SN-INVOICE-BRAND-STANDARD-0001\`

| Artifact | Role |
|----------|------|
| `template/invoice-base.css` | Copied into Q-ARI `lib/invoices/template/invoice-base.css` (+ overdue band accent) |
| `template/sn-020426.html` / `sn-030429.html` | Structure reference for HTML builder |
| `INVOICE-PDF-TEMPLATE-SPEC.md` | Status band, mutual exclusivity, no stacked “due” |
| `INVOICE-DESIGN-BRIEF.md` | Wordmark, typography, no fake monogram |

## What was implemented

1. **HTML/CSS render** — `lib/invoices/strata-noble-invoice-html.ts` builds a full document using embedded `invoice-base.css` and the approved strata SVG (design package), not a separate monogram.
2. **PDF** — `lib/invoices/render-strata-noble-invoice.ts` uses **Playwright** `chromium` to print Letter PDFs (replaces prior `@react-pdf/renderer` layout that did not match the approved template).
3. **Data mapping** — `lib/invoices/build-invoice-pdf-data.ts` maps `receivables` + `receivable_allocations` + `finance_events` into template fields; balances drive `paid` vs `open` vs `partial` vs `overdue` via `lib/invoices/invoice-status.ts`.
4. **APIs**
   - `POST /api/invoices/[id]/pdf?company_id=…` — returns PDF; `?meta=1` returns JSON metadata instead (same render path).
   - `POST /api/invoices/[id]/send?company_id=…` — ensures PDF render succeeds, updates `invoice_sent_at`, inserts **Q-ARI `comms_log`** with linkage fields in `summary`, returns `communicationLogId`.
5. **UI** — Existing receivable detail “Download PDF” / “Record send” kept; success toast includes comms log id when returned.
6. **Smoke seed** — `Q-ARI/supabase/seeds/lite_invoice_ms_audrey.sql` updated: SN-020426 marked `paid` after allocation; payment description aligned with bank-payment scenario.

## Files touched (Q-ARI)

- `apps/web/lib/invoices/template/invoice-base.css` *(new)*
- `apps/web/lib/invoices/strata-noble-invoice-html.ts` *(new)*
- `apps/web/lib/invoices/render-strata-noble-invoice.ts` *(new; replaces `.tsx`)*
- `apps/web/lib/invoices/build-invoice-pdf-data.ts`
- `apps/web/lib/invoices/load-receivable-invoice-bundle.ts`
- `apps/web/app/api/invoices/[id]/pdf/route.ts`
- `apps/web/app/api/invoices/[id]/send/route.ts`
- `apps/web/app/receivables/[id]/page.tsx`
- `apps/web/package.json` — `playwright` dependency; removed `@react-pdf/renderer`
- `apps/web/next.config.js` — externalize `playwright` for server bundle
- `apps/web/tests/invoices/strata-noble-invoice-html.test.ts` *(new)*
- `supabase/seeds/lite_invoice_ms_audrey.sql`
- Removed: `apps/web/components/invoices/StrataNobleInvoicePdf.tsx`, `lib/invoices/render-strata-noble-invoice.tsx`

## Build / test evidence

- `pnpm run build` in `Q-ARI/apps/web` — **success** (2026-05-04).
- `pnpm test` — **all unit tests pass**; integration suite `mission-0093-accountability.integration.test.ts` still fails without local Supabase service role env (pre-existing).

## PDF / API evidence (operator)

1. Apply seed (Supabase) for Ms Audrey receivables.
2. `POST` ` /api/invoices/{receivableId}/pdf?company_id=...` with session cookie — download PDF.
3. `POST` same URL with `?meta=1` — JSON: `invoiceReference`, `bytes`, `paymentKind`, `renderStatus`.
4. `POST` ` /api/invoices/{receivableId}/send?company_id=...` with body `{ "channel": "email" }` — response includes `communicationLogId` and `communicationSummary` containing `receivableId`, `invoiceRef`, `channel`, `pdf=…`.
5. In Supabase, `comms_log` row: `receivable_id` set; `summary` starts with `INVOICE_SENT receivableId=…`.

## Gaps / follow-ups (not in scope)

- Add `INVOICE_SENT` to Postgres `comms_type` enum for first-class typing (mission allows summary contract only in this route for now).
- Vercel/serverless: Playwright + Chromium may require a platform-specific strategy (`@sparticuz/chromium` or larger function size). Current path validated on **Node build + local/runtime with Playwright browsers installed** (`pnpm exec playwright install chromium`).

## Design compliance checklist (QAG-oriented)

| # | Criterion |
|---|-----------|
| 1 | PDF from live receivable data |
| 2 | Approved CSS + layout structure |
| 3 | No invented “SN” monogram; approved strata SVG from standard package |
| 4 | No stacked DUE / BALANCE DUE; totals = Subtotal + Total only |
| 5 | Paid path shows payment record table |
| 6 | Open path shows payment instructions + terms |
| 7 | Send route creates comms record with INVOICE_SENT linkage in summary |
| 8 | Summary encodes receivable + invoice ref + channel + pdf filename |
| 9 | Operator downloads PDF via existing UI |
| 10 | Balance/status from allocations vs `amount_total` |
| 11 | No accounting platform scope creep |

See `QAG-REVIEW.md` for formal verdict.
