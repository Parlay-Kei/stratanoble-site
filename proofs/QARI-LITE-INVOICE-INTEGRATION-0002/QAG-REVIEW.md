# QAG review — OCS-QARI-LITE-INVOICE-INTEGRATION-0002

**Verdict: PASS** (subject to deployment/runtime caveat below)

## Verification notes

| Acceptance gate | Evidence |
|-----------------|----------|
| PDF from receivable data | `loadReceivableInvoicePdfData` → `buildInvoicePdfData` → HTML → Playwright PDF |
| Approved visual standard | `invoice-base.css` + HTML structure aligned to OCS-SN templates; strata SVG from standard package |
| No fake monogram | Uses approved SVG from brand-standard HTML |
| No stacked due labels | Vitest `strata-noble-invoice-html.test.ts`; totals omit separate “Amount due” row |
| Paid invoice payment record | `showPaymentRecord` when allocations exist and presentation is paid/partial |
| Unpaid instructions + terms | Default Zelle lines + open terms; seed SN-030429 exercises open |
| INVOICE_SENT comms | Send route inserts `comms_log`; summary prefixed `INVOICE_SENT` with ids |
| Linkage | `receivable_id` column + structured summary (`receivableId`, `invoiceRef`, `pdf=`) |
| Operator PDF access | Existing Download PDF on `/receivables/[id]` |
| Payment accuracy | Balance from `amount_total` − sum(allocations); status kind from balance + due date |
| Scope | Thin invoice + comms only |

## Caveat

- **Playwright** requires Chromium installed where the API runs (`pnpm exec playwright install chromium`). Serverless deploy may need an alternate Chromium packaging strategy; **not verified on Vercel** in this mission.

## Signed outcome

**PASS** — Ready for Release Ops / deploy planning with runtime validation.
