# OCS: PRESS PLAY — MAH Shopify Admin Execution (Web Operator) v1

**Objective:** Execute Phase 1–4 directly in Shopify Admin using an authenticated browser session. Build the Notion DB for submissions. Produce proof packs + receipts. No more planning docs.

## Operator Identity (required)

- **Shopify staff user (ACTIVE):** stratanoble.co+mah-ops@gmail.com
- **2FA:** OFF for collaborator (confirmed by owner)

## Targets

- **Shopify Admin:** https://admin.shopify.com/store/msaudreyshouse
- **Public site:** https://www.msaudreyshouse.net/
- **Notion parent page:** https://www.notion.so/Form-Submissions-2ee13b428aa7805b80e9f5e784adccf3

## Source-of-truth content files (use exactly)

- `c:\Dev\msaudreys-house\proofs\mah\truth-pass-v2\SHIPPING_POLICY_CONTENT.md`
- `c:\Dev\msaudreys-house\proofs\mah\truth-pass-v2\REFUND_POLICY_UPGRADED_CONTENT.md`
- `c:\Dev\msaudreys-house\proofs\mah\truth-pass-v2\AUDREY_SELECT_PAGE_CONTENT.md`
- `c:\Dev\msaudreys-house\proofs\mah\truth-pass-v2\EXECUTION_GUIDE_PHASE1_4.md`

## Non-negotiables

- Do not create more prep docs. Only receipts after real changes.
- Proof or it didn't happen. Screenshots required for every phase.
- Purchasing remains ENABLED (Hybrid positioning).

## Proof pack root

```
c:\Dev\msaudreys-house\proofs\mah\truth-pass-v2\proof-pack\
    phase0-before\
    phase1-after\
    phase3-checkout\
    phase4-final\
```

---

## Department Missions

### Mission A — Platform Ops (Web Operator) — Shopify Admin Execution (Owner)

#### Phase 0: BEFORE proofs
**Capture and save PNG screenshots:**
- Home hero + announcement area
- Header nav showing current "Catalog" link (or current state)
- Footer policy links area
- Product page showing current purchase language

**Save to:** `proof-pack\phase0-before\`

#### Phase 1: Critical changes

1. **Shipping Policy**
   - Create policy page using SHIPPING_POLICY_CONTENT.md and link it in footer navigation.

2. **Refund Policy Upgrade**
   - Update refund policy using REFUND_POLICY_UPGRADED_CONTENT.md and ensure footer link.

3. **Audrey Select Page**
   - Create /pages/audrey-select using AUDREY_SELECT_PAGE_CONTENT.md. Add Shopify native contact form section.

4. **Navigation Fix**
   - Remove or repoint dead "Catalog" placeholder. Add "Audrey Select" to main nav.

5. **Homepage Hero Update**
   - Replace generic hero messaging. Primary CTA → /pages/audrey-select. Secondary CTA → /collections/all.

**Capture AFTER screenshots for each item and save to:** `proof-pack\phase1-after\` (subfolders allowed)

**Receipt required:** `RECEIPT_PHASE1_TRUST_SPINE_AND_SERVICE_FIRST_V1.md`

### Mission B — Legal Ops — Content Validation (Fast)

Validate that the prepared Shipping/Refund policy content is operationally accurate. No rewrites unless there is a factual risk.

**Receipt:** Add a short approval note into `RECEIPT_PHASE1_TRUST_SPINE_AND_SERVICE_FIRST_V1.md` under "Legal Approval."

### Mission C — Product Ops — Service-first CTA + IA Confirmation

Confirm final hero copy and nav labels inside Shopify after Platform Ops executes.

**Receipt:** Add a short approval note into `RECEIPT_PHASE1_TRUST_SPINE_AND_SERVICE_FIRST_V1.md` under "Product Approval."

### Mission D — Research Ops — Notion DB Build

**Create inside provided Notion page:**

**Database name:** Audrey Select Requests

**Properties:**
- Request ID (Title)
- Name (Text)
- Email (Email)
- Phone (Phone, optional)
- Request Type (Select)
- Budget Range (Select)
- Size Notes (Text)
- Deadline (Date)
- Notes / Style Brief (Text)
- Source (Select)
- Status (Select: New, Contacted, In Curation, Quoted, Paid, Fulfilled, Closed)
- Assigned To (Person)
- Follow-up Due (Date)

**Views:**
- New Requests
- Pipeline (Board by Status)
- Follow-ups Due

**Proof:**
- Screenshot of DB inside page
- One test entry created (manual OK)

**Save proof to:** `proof-pack\phase1-after\notion-db\`

**Receipt:** `RECEIPT_NOTION_DB_CREATED_V1.md`

### Mission E — QA Gatekeeper — Checkout Proof Gate

**Run buyer-path proof:**
- Home → Audrey Select → submit test form → confirm success state
- Footer links → Shipping + Refund pages load
- Add product → cart → checkout reachable (no real charge)

**Capture:**
- 5 screenshots across checkout flow
- 30–60 sec screen recording (optional but preferred)

**Save to:** `proof-pack\phase3-checkout\`

**Receipt:** `RECEIPT_CHECKOUT_PROOF_V1.md`

## Phase 4 — Final Hybrid Live Confirmation

**Owner:** Platform Ops + QA Gatekeeper

**Confirm:**
- Purchasing remains enabled
- Audrey Select in nav and works
- Footer includes Shipping + Refund
- No dead links

**Save final screenshots to:** `proof-pack\phase4-final\`

**Receipt:** `RECEIPT_PHASE4_HYBRID_LIVE_STATE_V1.md`

## Completion Gate

Directive is COMPLETE only when:
- All receipts exist
- Proof pack folders contain screenshots
- Checkout proof is captured

---

## Minimal "press play" instruction

OCS: PRESS PLAY on `C:\Dev\.claude-anx\governance\delegations\RUN_DIRECTIVE_MAH_SHOPIFY_ADMIN_EXECUTION_WEBOP_V1.md` to completion. Use real Shopify Admin actions only. No stubs.