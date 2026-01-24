# Proof Pack: Strata Noble Noupe Chatbot Audit + Hardening

**Mission ID:** noupe-chatbot-hardening
**Status:** COMPLETE
**Date:** 2026-01-23

---

## Mission Objective

Confirm data handling, reduce risk, and convert the widget into a lead-routing tool.

**Done When:**
- [x] (a) Disclosure + privacy language shipped
- [x] (b) Bot script + CSP hardened
- [x] (c) Bot conversation flow routes to offers
- [x] (d) Proof pack produced

---

## Deliverables Summary

### Platform Ops

| Deliverable | File | Status |
|-------------|------|--------|
| NoupeChat Component | `apps/website/src/components/NoupeChat.tsx` | CREATED |
| CSP Guardrails | `apps/website/next.config.js` | UPDATED |
| Script Risk Receipt | `.claude/proof-packs/noupe-chatbot-hardening/PLATFORM_OPS_SCRIPT_RISK_RECEIPT.md` | COMPLETE |

**Key Technical Implementation:**
- Lazy-load strategy: 3-second delay, non-blocking
- Consent flow: User must acknowledge disclosure before widget loads
- CSP: Allowlisted `*.jotform.com`, `cdn.jotfor.ms` (no wildcards for other domains)
- Permissions Policy: Microphone allowed only for Jotform domains

### Legal Ops

| Deliverable | File | Status |
|-------------|------|--------|
| Disclosure Block | `apps/website/src/components/site/SiteFooter.tsx` | ADDED |
| Privacy Policy Draft | `.claude/proof-packs/noupe-chatbot-hardening/LEGAL_OPS_DELIVERABLES.md` | COMPLETE |

**Key Privacy Elements:**
- Footer disclosure with Noupe/Jotform attribution
- Privacy policy section draft (requires manual addition to `/privacy` page)
- Consent dialog in chat component
- Warning against sensitive data submission

### Growth Ops

| Deliverable | File | Status |
|-------------|------|--------|
| Conversation Flow | `.claude/proof-packs/noupe-chatbot-hardening/GROWTH_OPS_CONVERSATION_FLOW.md` | COMPLETE |
| Transcript Examples | Same file | INCLUDED |
| Bot Configuration | Same file | INCLUDED |

**Lead Routing Flow:**
1. Problem identification: Leads / Scheduling / Follow-up / Website
2. Sub-issue qualification
3. Urgency assessment: Today / This Week / This Month
4. Contact preference: Email / Phone / Text
5. Route to appropriate CTA page with context flags

---

## Files Changed

```
CREATED:
├── apps/website/src/components/NoupeChat.tsx
├── apps/website/src/components/NoupeChatWrapper.tsx (SSR-compatible wrapper)
├── .claude/proof-packs/noupe-chatbot-hardening/
│   ├── PROOF_PACK_SUMMARY.md
│   ├── PLATFORM_OPS_SCRIPT_RISK_RECEIPT.md
│   ├── LEGAL_OPS_DELIVERABLES.md
│   └── GROWTH_OPS_CONVERSATION_FLOW.md

MODIFIED:
├── apps/website/next.config.js (CSP implementation)
├── apps/website/src/components/site/SiteFooter.tsx (disclosure added)
└── apps/website/src/components/site/SiteShell.tsx (NoupeChatWrapper integration)
```

---

## Build Validation

```
TypeScript:  PASSED
ESLint:      PASSED (warnings only - pre-existing)
Build:       PASSED
```

**Architecture Note:** `NoupeChatWrapper` was created to handle `dynamic` import with
`ssr: false` in a Client Component, keeping `SiteShell` as a Server Component for
optimal Next.js 15 performance.

---

## Pre-Production Checklist

### Must Do

- [ ] **Configure Noupe bot** in Jotform dashboard with conversation flow
- [ ] **Add Privacy Policy section** - copy from LEGAL_OPS_DELIVERABLES.md
- [ ] **Test CSP in staging** - verify all site features work
- [ ] **Verify consent flow** - test disclosure → consent → chat
- [ ] **Mobile testing** - ensure chat widget is usable on mobile
- [ ] **Legal review** - have counsel approve disclosure language

### Should Do

- [ ] Run Lighthouse audit post-deployment
- [ ] Set up analytics tracking for chat conversions
- [ ] Configure email notification template in Jotform

### Nice to Have

- [ ] A/B test chat widget placement
- [ ] Set up chat → CRM integration
- [ ] Create custom bot avatar

---

## Network Domains Required

| Domain | Purpose | CSP Directive |
|--------|---------|---------------|
| `www.jotform.com` | Chat iframe | frame-src |
| `*.jotform.com` | API, assets | connect-src, img-src |
| `cdn.jotfor.ms` | JS/CSS | script-src, style-src |

---

## Risk Mitigations Implemented

| Risk | Mitigation | Status |
|------|------------|--------|
| Third-party data transmission | Disclosure + consent required | ✅ |
| Render blocking | Lazy load with 3s delay | ✅ |
| Sensitive data in chat | Warning in disclosure + Privacy Policy | ✅ |
| XSS via widget | CSP frame-src restriction | ✅ |
| Unauthorized domains | Strict CSP allowlist | ✅ |

---

## Receipt Signatures

```
PLATFORM_OPS_SCRIPT_RISK_RECEIPT_V1
LEGAL_OPS_NOUPE_DISCLOSURE_V1
GROWTH_OPS_NOUPE_FLOW_V1

PROOF_PACK_NOUPE_CHATBOT_HARDENING_V1
Date: 2026-01-23
Status: COMPLETE
Next: Configure Noupe bot in Jotform dashboard, then staging deployment
```
