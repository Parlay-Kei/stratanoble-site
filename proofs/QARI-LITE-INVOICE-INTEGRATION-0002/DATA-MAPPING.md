# Data mapping — Q-ARI receivable → Strata Noble invoice HTML

| Template field | Q-ARI source | Fallback / notes |
|----------------|--------------|------------------|
| Invoice number | `receivables.reference` | First 8 chars of `receivables.id` (uppercase) |
| Invoice date (long) | `invoice_issue_date` → `opened_at` (date part) → `due_date` | Long US locale string |
| Due date (long) | `receivables.due_date` | Long US locale string |
| Client name | `receivables.customer_name` | — |
| Client detail | Optional API/hydration `billToDetail` | Not populated by default |
| Statement of services | `receivables.notes` | `"Professional services"`; `[LITE-INV-AUDREY]` markers stripped for PDF |
| Line qty / rate / amount | Single line: qty `1`, rate = `amount_total`, amount = line total | Multi-line AR not modeled (document gap) |
| Subtotal / Total | From `amount_total` | Single-line invoice |
| Payment status band | Derived: `resolveInvoicePresentation(status, balance, due_date)` | `balance = amount_total − Σ(allocations)` |
| Balance vs amount due (band) | Paid → **Balance** $0.00; Open/Partial/Overdue → **Amount due** (remaining) | Matches INVOICE-PDF-TEMPLATE-SPEC |
| Payment record rows | `receivable_allocations` join `finance_events` | Date from `occurred_at` or `applied_at`; notes from `description` / `event_type` |
| Payment instructions | Request body override `paymentInstructions[]` or defaults | Does not invent bank numbers |
| Terms | Paid vs open paragraph | Defaults in `build-invoice-pdf-data.ts` |
| Issued by block | Fixed **Strata Noble LLC** + United States | Strata Noble–branded PDF path |

## Documented gaps (do not invent financial facts)

- No multi-line receivable detail (single aggregate line).
- No persisted `customer_email` on receivable (bill-to email not shown unless passed as `billToDetail`).
- No separate tax line (template supports future extension).
