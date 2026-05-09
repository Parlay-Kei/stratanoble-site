# Invoice PDF template spec — Strata Noble

**Template root:** `proofs/strata-noble/OCS-SN-INVOICE-BRAND-STANDARD-0001/template/`  
**Shared CSS:** `invoice-base.css`  
**Render script:** `render-pdfs.mjs` (Puppeteer → Letter PDF)

---

## Reusable data fields

| Field | Description |
|-------|-------------|
| `company.legalName` | e.g. Strata Noble LLC |
| `company.displayName` | e.g. Strata Noble |
| `company.address` | Mailing / remit block (optional lines) |
| `invoice.number` | Immutable string (e.g. SN-030429) |
| `invoice.date` | Issue date |
| `invoice.dueDate` | Due date |
| `client.name` | Client name and optional attention line |
| `service.statement` | Long-form statement of services |
| `lineItems[]` | `description`, `amount` (numeric for formatting) |
| `totals.subtotal` | Sum of lines |
| `totals.total` | Total |
| `status.mode` | `paid` \| `open` \| `overdue` \| `partial` |
| `status.balance` | Money (outstanding; 0 when paid) |
| `status.amountDue` | Money (for open/overdue; omit or null when paid) |
| `paymentRecord[]` | `date`, `amount`, `notes` — **paid** and **partial** |
| `paymentInstructions` | Rich text / HTML block — **open** / **overdue** |
| `terms` | Short legal / payment terms |
| `footer.meta` | Optional extra footer lines |

---

## Layout sections (order)

1. **Header:** Brand (icon + display + legal), document title “Invoice”, metadata (number, invoice date, due date).
2. **Status band:** Single payment-status model (see below).
3. **Two column:** Issued by | Client.
4. **Statement of services** (callout block).
5. **Line items** table.
6. **Totals** (subtotal, total; tax lines if later required).
7. **Payment record** *or* **Payment instructions** (mutually exclusive by default).
8. **Terms** (short paragraph when needed).
9. **Footer** (company, invoice #, date).

---

## Status logic

### Paid (`status.mode = paid`)

- Status band: label **Payment status** → value **Paid**; second column **Balance** → **$0.00** (or currency).
- **Do not** show “Amount due” in the band.
- Include **Payment record** section (at least one row when payment is known).

### Open / not overdue (`open`)

- Status band: **Payment status** → **Payment due**; **Amount due** → money.
- **One** amount treatment only (no “DUE” stack).
- Show **Payment instructions** + **Terms**.

### Overdue

- Same structure as open; optional: status value **Overdue**; **Amount due** unchanged; **only in this state** use stronger emphasis (e.g. fault amber `#C8852A` or controlled red) — not used in current sample PDFs.

### Partial payment

- Status band: **Payment status** → **Partially paid**; **Amount due** → remaining balance.
- **Payment record** lists all remittances to date; totals must reconcile.

---

## Payment record section

- Table: **Date | Amount | Notes**
- Use for **paid** and **partial**; omit for **open** if no payments yet.

## Terms section

- Short, plain language: due date, reference to invoice number, how to ask questions.
- Do not restate the full MSA; reference agreement by name only if source invoice does.

## Footer standard

- `Strata Noble LLC` | `Invoice {number}` | `Issued {date}`

---

## Generation notes

- HTML + print CSS is the **source of truth** for layout; PDF is a render target.
- External fonts: load Inter + Playfair from Google Fonts in template head (Puppeteer uses network for first render).
