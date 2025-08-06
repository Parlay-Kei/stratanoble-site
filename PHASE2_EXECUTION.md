# Strata Noble – Phase 2 Execution Dev Doc  
**Audit Response & Fast-Track Execution Plan**  
**Current Status:** 65% complete  
**Goal:** ≥95% launch-ready in 4 weeks

---

## 1. Immediate "Block-and-Tackle" Actions (48 hours)

| Action | Why it matters | Owner | ETA |
|--------|----------------|-------|-----|
| **Flip `CALENDLY_ENABLED` to `true` and redeploy** | Restores friction-free scheduling on Contact and Workshop pages | DevOps | Day 1 |
| **Pick email provider (SendGrid) and add API key to env variables** | Enables all contact/discovery notifications and lays groundwork for lead-nurture automations | DevOps | Day 1 |
| **Create `/api/sendMail.ts` using SendGrid SDK + schema validation** | Powers Contact & Discovery forms (HTML + text templates) | Dev | Day 2 |
| **Smoke-test Stripe checkout again after redeploy** | Confirms payment flow remains intact post-env change | QA | Day 2 |

**Dev Notes:**
- `CALENDLY_ENABLED` is in `src/app/contact/page.tsx` (set to `true`).
- Add `SENDGRID_API_KEY` to `.env.local` and production env.
- `/api/sendMail.ts` should use Zod for validation, support both HTML and text, and be reusable for all transactional emails.
- After redeploy, run a full Stripe checkout test (use test card).

---

## 2. Critical Content Sprint (Week 1)

| Deliverable | Key Elements | Owner | Due |
|-------------|--------------|-------|-----|
| **About page** | 250-word origin story, mission/values list, 3 team bios w/ headshots | Content + Design | Day 4 |
| **Case-study set (×3)** | Template: problem → approach → outcome (KPIs). Include pull-quote and before/after metric graphic. | Content | Day 6 |
| **Upload assets to CMS (`/data/caseStudies.ts`) and link on Services pages** |  | Dev | Day 6 |
| **Email templates** | Contact thank-you, Discovery booked, Payment success | Content | Day 6 |
| **QA pass – mobile/dark mode for new pages** |  | QA | Day 7 |

**Dev Notes:**
- About page: update `src/app/about/page.tsx` and add images to `/public/img/team/`.
- Case studies: create `src/data/caseStudies.ts` and update `src/app/case-studies/page.tsx` to render from data.
- Email templates: store in `/emails/` or as template strings in `/lib/emailTemplates.ts`.
- Ensure all new content is responsive and dark-mode compatible.

---

## 3. User-Flow Completion (Week 2)

| Feature | Tasks | Owner |
|---------|-------|-------|
| **Workshop Resource Vault** | - Create Supabase table `workshop_resources`<br>- Gate Next.js route `/vault` by user email + Stripe webhook<br>- Upload starter assets (slides, worksheet PDFs) | Dev + Ops |
| **KPI Dashboard Demo (Data & Ops service)** | - Build static Tableau-like mock in React (e.g., recharts) or Loom video embed<br>- Add "Request Live Walk-through" CTA | Design + Dev |
| **NDA Workflow** | - Store Mutual NDA PDF in S3<br>- Embed DocuSign modal trigger on Data & Ops page<br>- Zapier action: on sign, send copy to both parties | Ops |
| **Automated Lead-Nurture** | - Mailchimp journey: Day 0 thank-you, Day 2 case-study email, Day 5 consultation offer<br>- Sync new leads via Supabase webhook → Mailchimp list | Marketing |

**Dev Notes:**
- Vault: create `/src/app/vault/page.tsx`, use Supabase row-level security for access, and Stripe webhook for entitlement.
- KPI Demo: use `recharts` for static dashboard or embed Loom video; add CTA button.
- NDA: S3 for storage, DocuSign React modal, Zapier for automation.
- Lead-nurture: set up Supabase function/webhook to push new leads to Mailchimp.

---

## 4. Advanced Feature Roadmap (Month 2)

| Feature | Goal |
|---------|------|
| **Blog System** | MDX-powered `/posts` with tag filtration, SEO schema |
| **User Accounts** | Next-Auth credentials + Supabase storage |
| **Analytics Dashboard** | Plausible → LookerStudio weekly email |
| **A/B Testing** | Vercel Experiments for headline/CTA variants |

---

## Technical Checklist

- [ ] `CALENDLY_ENABLED` set to `true` in codebase
- [ ] SendGrid API key in all environments
- [ ] `/api/sendMail.ts` implemented and tested
- [ ] Stripe checkout flow tested post-redeploy
- [ ] About and Case Studies pages populated and styled
- [ ] Email templates live and connected to forms
- [ ] Workshop Vault and KPI Demo routes gated and functional
- [ ] NDA workflow and lead-nurture automations live

---

## Owner Assignments

- **DevOps:** Env setup, redeploys, Supabase, S3, Stripe, Mailchimp
- **Dev:** Next.js, API routes, Vault, KPI Demo, DocuSign integration
- **Content:** About, Case Studies, Email templates
- **QA:** Mobile/dark mode, Stripe, forms, flows
- **Marketing:** Mailchimp journeys, lead sync

---

**For any blockers, escalate in Slack #launch or tag @lead-dev.  
Daily standups recommended for the next 2 weeks.**

---

## 🚀 LAUNCH ACCELERATION PLAN
**Status Update:** Fantastic push, team — you just vaulted from "proof-of-concept" to an almost-launchable product. With Phase 2 now 75% complete, here's a surgical plan to close the final 25% and ship on schedule.

### 1 · 48-Hour QA Blitz

| Track | What to verify | Owner | Notes |
|-------|----------------|-------|-------|
| **Email** | Deliverability (HTML + text), SPF/DKIM alignment, SendGrid bounce handling | QA | Use real inbox matrix: Gmail, Outlook, corporate |
| **Payments** | Stripe test mode → live keys toggle, webhook firing, receipt email | Dev / QA | Run $1 authorised charge, refund flow |
| **Responsiveness** | Mobile dark-mode, iOS Safari, Android Chrome, desktop Firefox | QA | Lighthouse ≥ 90 on A11y & Perf |
| **Content Proofing** | Broken links, image alt text, typo sweep | Content | Ship blockers as hotfix PRs |

### 2 · Week-2 Feature Finish (Work in Parallel)

#### **NDA Workflow**
- Upload master PDF to S3 → pre-signed URL
- Embed DocuSign modal; callback saves docuSignEnvelopeId to Supabase
- Auto-email fully executed NDA via SendGrid template

#### **Automated Lead-Nurture**
- Mailchimp list "SN-Leads" with three-email journey (D0 thank-you, D2 case-study, D5 consult CTA)
- Supabase trigger → Netlify Function → Mailchimp API (one-way sync)

#### **Production Infrastructure**
- Create `.env.production` with live keys
- Vercel → Prod project alias stratanoble.com
- Enable Vercel Analytics + 2 × alerts (build fail, 500 spike)

#### **Monitoring & Error Tracking**
- Add Sentry SDK (`NEXT_PUBLIC_SENTRY_DSN`)
- Capture server-side exceptions + client runtime errors

### 3 · Launch Readiness Scorecard (must all be ✅)

| Category | Metric | Target |
|----------|--------|--------|
| **Flows** | 100% completion of test script (12/12 steps) | ✅ |
| **Performance** | < 3s Time-to-Interactive on 4G | ✅ |
| **Emails** | < 1% bounce / 0 spam flags in pilot send | ✅ |
| **Security** | No critical issues on OWASP ZAP scan | ✅ |
| **Legal** | NDA, Privacy, ToS pages live & linked | ✅ |

### 4 · Soft-Launch Playbook (Week 3)

1. **Invite-only beta** – 10 trusted contacts, monitor Sentry + feedback form
2. **72-hour stabilization window** – fix any critical UX / copy bugs
3. **Public announcement** – LinkedIn post + email blast using Mailchimp segment
4. **Post-launch review (Day 7)** – check funnel analytics, compare to 5% conversion goal

### 5 · Looking Ahead (Month 2)

- **Blog MDX system** – seed with two founder essays to boost SEO
- **CRM hand-off** – pipe qualified leads from Mailchimp into HubSpot Lite
- **A/B headline testing** – Vercel Experiments on hero tagline

---

**Launch Timeline:** 2-3 weeks to production-ready  
**Success Metrics:** 5% conversion rate, <3s load time, 0 critical bugs  
**Next Review:** Daily standups until launch, then weekly 