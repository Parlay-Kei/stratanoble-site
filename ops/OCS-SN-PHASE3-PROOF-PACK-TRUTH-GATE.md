# DEV TASK: Phase 3 — Proof Pack + Truth Gate

**Mission ID:** `OCS-SN-INTERNAL-QSUITE-DOGFOOD-ROLLOUT-0001` (Phase 3)  
**Priority:** P1  
**Blocked on:** Q-ICMS seed script executed against live Supabase + at least 1 real invoice in Q-ARI  
**Codebase:** `C:\Dev\10_products\StrataNoble` (website) + `C:\Dev\10_products\Q SUITE` (modules)  

---

## PREREQUISITES (Manual — Steve)

Before any coding agent can execute Phase 3, these must be true:

| Gate | What | How to verify |
|------|------|---------------|
| G1 | Q-ICMS seed script has been run against production/staging Supabase | Log into Q-ICMS, navigate to CRM → see SN org, Direct Cuts & DSLV accounts, 3 engagements, 2 leads |
| G2 | At least 1 real invoice exists in Q-ARI with a comms log entry | Log into Q-ARI → Receivables → open an invoice → see CommsSection with at least 1 logged communication |
| G3 | Q-CC dashboard/admin is accessible with SN data | Log into Q-CC → admin or dashboard view shows operational data |
| G4 | Q-VAULT has at least 1 credential stored | Log into Q-VAULT → credentials list shows at least 1 entry (masked) + audit log shows the creation event |

**Do NOT proceed to Task 3.1 until all four gates are green.**

---

## TASK 3.1 — Proof Pack Screenshot Capture

**Objective:** Capture real screenshots of StrataNoble operating on Q Suite modules. These screenshots serve two purposes: (1) internal proof of dogfood adoption, (2) future use on the website in ProofSection or marketing materials.

### Screenshots Required

| # | Module | Screen | What it must show | Filename |
|---|--------|--------|-------------------|----------|
| 1 | Q-ICMS | CRM / Pipeline view | SN org context, pipeline with lead stages populated, at least 1 lead visible | `proof-icms-pipeline.png` |
| 2 | Q-ICMS | Client detail | Direct Cuts or DSLV account record with engagement(s) listed | `proof-icms-client.png` |
| 3 | Q-ARI | Receivable detail | An invoice with amount, status, and CommsSection showing at least 1 communication log entry | `proof-ari-receivable.png` |
| 4 | Q-ARI | Aging report | Aging view or receivables list showing active AR | `proof-ari-aging.png` |
| 5 | Q-CC | Admin dashboard | Admin or dashboard view with operational data visible (leads, engagements, or review notes) | `proof-cc-dashboard.png` |
| 6 | Q-VAULT | Credentials list | At least 1 credential entry with value masked (showing `••••••••`) | `proof-vault-credentials.png` |
| 7 | Q-VAULT | Audit log | Audit trail showing credential creation event with timestamp | `proof-vault-audit.png` |

### Execution Method

Use the Chrome MCP browser automation tools:
1. Navigate to each Q Suite module URL
2. Log in as SN admin
3. Navigate to the target screen
4. Capture screenshot
5. Save to `C:\Dev\10_products\StrataNoble\proof-packs\qsuite-dogfood\`

### Redaction Rules
- **DO redact:** Real dollar amounts on invoices (replace with representative values), API key values (should already be masked by Q-VAULT), email addresses of non-SN contacts
- **DO NOT redact:** Module names, SN org name, client account names (Direct Cuts, DSLV are real SN clients), pipeline stage labels, engagement names

### Output
All screenshots saved to: `C:\Dev\10_products\StrataNoble\proof-packs\qsuite-dogfood\`

Create an index file:

**File:** `C:\Dev\10_products\StrataNoble\proof-packs\qsuite-dogfood\INDEX.md`

```markdown
# Q Suite Dogfood Proof Pack
**Generated:** [DATE]
**Mission:** OCS-SN-INTERNAL-QSUITE-DOGFOOD-ROLLOUT-0001

## Screenshots
| # | Module | Screen | File | Verified |
|---|--------|--------|------|----------|
| 1 | Q-ICMS | Pipeline | proof-icms-pipeline.png | ☐ |
| 2 | Q-ICMS | Client detail | proof-icms-client.png | ☐ |
| 3 | Q-ARI | Receivable + Comms | proof-ari-receivable.png | ☐ |
| 4 | Q-ARI | Aging report | proof-ari-aging.png | ☐ |
| 5 | Q-CC | Dashboard | proof-cc-dashboard.png | ☐ |
| 6 | Q-VAULT | Credentials | proof-vault-credentials.png | ☐ |
| 7 | Q-VAULT | Audit log | proof-vault-audit.png | ☐ |

## Acceptance
All boxes must be checked before Task 3.2 can proceed.
```

---

## TASK 3.2 — Truth Gate: Website Language Upgrade

**Blocked on:** Task 3.1 complete AND Steve confirms proof pack accuracy.

**Objective:** Replace the transitional "migrating" language in QSuiteSection with the full truth claim.

### File to Modify

**File:** `C:\Dev\10_products\StrataNoble\apps\website\src\components\revamp\QSuiteSection.tsx`

### Exact Change

**Find (current transitional text — the italic paragraph):**
```tsx
            <p className="text-sm text-muted-foreground/70 italic">
              Strata Noble is transitioning its own operations onto the same Q Suite
              framework used in client delivery.
            </p>
```

**Replace with (full truth claim — no longer italic, upgraded styling):**
```tsx
            <p className="text-sm text-muted-foreground font-medium">
              Every lead, every client, every invoice, every credential — managed
              through the same modules we deploy for clients.
            </p>
```

### Secondary Change — Body Copy Update

**Find (current body paragraph):**
```tsx
            <p className="text-lg text-muted-foreground leading-relaxed">
              Strata Noble runs its own operations on Q Suite — the same modular
              system we configure and deploy for clients. This isn&apos;t a demo.
              It&apos;s our actual operating environment.
            </p>
```

**Replace with (stronger, post-proof claim):**
```tsx
            <p className="text-lg text-muted-foreground leading-relaxed">
              Strata Noble runs its own company on Q Suite — the same modular
              system we configure and deploy for clients. This isn&apos;t a demo.
              It&apos;s our operating backbone.
            </p>
```

### Why Two Changes
1. The italic transitional disclaimer was intentionally cautious. Once proof exists, it becomes a liability — it undercuts the claim.
2. "runs its own operations" → "runs its own company" is a subtle but meaningful escalation. Operations implies back-office. Company implies everything.
3. "operating environment" → "operating backbone" is more structural and confident.

---

## TASK 3.3 — ProofSection Enhancement (Optional)

**Only if proof pack screenshots are high enough quality for public use.**

If the screenshots from Task 3.1 are clean enough, add a visual proof element to ProofSection.

**File:** `C:\Dev\10_products\StrataNoble\apps\website\src\components\revamp\ProofSection.tsx`

**Add below the proof cards grid (before the bottom text):**

```tsx
        {/* Internal operation screenshots - optional visual proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <p className="text-center text-sm text-muted-foreground mb-6">
            Real screenshots from our internal Q Suite deployment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border shadow-sm">
              <Image
                src="/images/proof/proof-icms-pipeline.png"
                alt="StrataNoble pipeline managed in Q-ICMS"
                width={600}
                height={400}
                className="w-full h-auto"
              />
              <p className="text-xs text-muted-foreground p-3 bg-gray-50">
                Lead pipeline — Q-ICMS
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border shadow-sm">
              <Image
                src="/images/proof/proof-ari-receivable.png"
                alt="Invoice with communications log in Q-ARI"
                width={600}
                height={400}
                className="w-full h-auto"
              />
              <p className="text-xs text-muted-foreground p-3 bg-gray-50">
                Invoice + comms log — Q-ARI
              </p>
            </div>
          </div>
        </motion.div>
```

**Prerequisites for this task:**
- Copy selected proof pack screenshots to `apps/website/public/images/proof/`
- Only use the 2 best screenshots (pipeline + receivable) — don't overload
- Add `import Image from 'next/image';` to the ProofSection imports

**This task is OPTIONAL and deferred to Steve's judgment on screenshot quality.**

---

## EXECUTION ORDER

```
Prerequisites (Steve manual)
  Run Q-ICMS seed → Verify G1
  Create real invoice in Q-ARI + log comms → Verify G2
  Verify Q-CC access → G3
  Store credential in Q-VAULT → G4

Task 3.1 — Screenshot capture (agent, after all gates green)
Task 3.2 — Truth gate language swap (agent, after 3.1 verified)
Task 3.3 — ProofSection screenshots (optional, Steve's call)
```

---

## FILE MANIFEST

### New Files
| File | Task |
|------|------|
| `proof-packs/qsuite-dogfood/INDEX.md` | 3.1 |
| `proof-packs/qsuite-dogfood/proof-icms-pipeline.png` | 3.1 |
| `proof-packs/qsuite-dogfood/proof-icms-client.png` | 3.1 |
| `proof-packs/qsuite-dogfood/proof-ari-receivable.png` | 3.1 |
| `proof-packs/qsuite-dogfood/proof-ari-aging.png` | 3.1 |
| `proof-packs/qsuite-dogfood/proof-cc-dashboard.png` | 3.1 |
| `proof-packs/qsuite-dogfood/proof-vault-credentials.png` | 3.1 |
| `proof-packs/qsuite-dogfood/proof-vault-audit.png` | 3.1 |
| `apps/website/public/images/proof/*.png` | 3.3 (optional) |

### Modified Files
| File | Task | Change |
|------|------|--------|
| `src/components/revamp/QSuiteSection.tsx` | 3.2 | Swap transitional → truth language |
| `src/components/revamp/ProofSection.tsx` | 3.3 | Add screenshot grid (optional) |
