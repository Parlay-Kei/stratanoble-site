# OCS-QARI-WAVE-FINALIZE-0005 — minimal proof

**Target production runtime:** Q-ARI `apps/web` is a Next.js app with `vercel.json` (`framework: nextjs`) — **Vercel serverless** is the expected production target.

**Runtime change (this mission):** Playwright/Chromium PDF generation was **replaced** with `@react-pdf/renderer` in the Q-ARI monorepo so PDFs do not require a browser binary in the serverless function. **No new recurring cost.**

**SN-030429 pass case (data):** Seed `Q-ARI/supabase/seeds/lite_invoice_ms_audrey.sql` — open receivable, $3,000, `customer_name` includes `Audrey Liggins` + `Ms Audrey` (newline), notes cover MSA initial payment, May/June 2026, 12-month agreement effective May 1, 2026. Generic Zelle text comes from `defaultPaymentInstructions()` in the PDF, not from inventing account numbers in notes.

**Automated evidence:**

- `tests/invoices/strata-noble-invoice-pdf.test.ts` — `renderStrataNobleInvoicePdfBuffer` returns a buffer starting with `%PDF` for an SN-030429-style receivable.
- `tests/invoices/strata-noble-invoice-html.test.ts` — still validates single “amount due” treatment in HTML (layout contract).

**Operator evidence (one-time on deployed or local Q-ARI with auth + DB):**

1. Apply seed.
2. Open receivable **SN-030429** → **Download PDF** — file should open; client, ref, dates, $3,000, purpose text present.
3. **Record send** with channel (e.g. `email` or `manual_record`) — API returns `communicationLogId`.
4. In Supabase, `comms_log` row: `receivable_id`, summary with `INVOICE_SENT` + `invoiceRef=SN-030429` + `channel` + `pdf=Invoice-…`.

**New recurring cost:** None added by this work.

**Finance Ops:** Human confirmation that the PDF is acceptable to email to Ms Audrey (mission gate).
