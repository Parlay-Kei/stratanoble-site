# Strata Noble - Marketing Restructure Export

**Exported:** 2025-12-21
**Total Files:** 293+
**Stack:** Next.js 15 (App Router) + TypeScript
**Backend:** Supabase + Prisma + PostgreSQL
**Deployment:** Vercel + Netlify

---

## CRITICAL CONTEXT

This is a **B2B Consulting-as-a-Service (CaaS) platform** with:
- Multi-tier subscription offerings (Builder, Prosperity)
- AI-powered cold calling system (Twilio + OpenAI Realtime)
- CRM and lead management
- Achievery companion app/platform
- DocuSign NDA integration
- Calendly scheduling integration

**Brand Identity:**
- Primary Color: `#003366` (Navy)
- Secondary: `#047857` (Emerald)
- Accent: `#C0C0C0` (Silver)
- Fonts: Inter (sans), Bitter (serif)
- Professional B2B consulting aesthetic

---

## 1. ROUTING & PAGES (src/app/)

### Entry Points
- `src/app/layout.tsx` - Root layout (Header, Footer, Analytics, Schema.org)
- `src/app/page.tsx` - Homepage
- `src/app/globals.css` - Global styles

### Marketing/Public Pages
| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` | Homepage (Hero, Mission, Services, CTA) |
| `/about` | `about/page.tsx` | Company story |
| `/solutions` | `solutions/page.tsx` | Services/offerings grid |
| `/platform` | `platform/page.tsx` | Technology/platform features |
| `/pricing` | `pricing/page.tsx` | Tier comparison |
| `/contact` | `contact/page.tsx` | Contact form |
| `/get-started` | `get-started/page.tsx` | Onboarding flow |
| `/discovery` | `discovery/page.tsx` | Discovery questionnaire |
| `/cold-calling` | `cold-calling/page.tsx` | AI calling feature page |
| `/workshops` | `workshops/page.tsx` | Workshop listings |
| `/schedule` | `schedule/page.tsx` | Calendly scheduling |

### Compliance/Legal Pages
| Route | File | Purpose |
|-------|------|---------|
| `/privacy` | `privacy/page.tsx` | Privacy policy |
| `/terms` | `terms/page.tsx` | Terms of service |
| `/cookies` | `cookies/page.tsx` | Cookie policy |
| `/accessibility` | `accessibility/page.tsx` | Accessibility statement |
| `/sitemap` | `sitemap/page.tsx` | HTML sitemap |

### Conversion/Lead Capture Pages
| Route | File | Purpose |
|-------|------|---------|
| `/early-access` | `early-access/page.tsx` | Early access signup |
| `/achievery-early-access` | `achievery-early-access/page.tsx` | Achievery waitlist |
| `/achievery-preview` | `achievery-preview/page.tsx` | Achievery preview |
| `/success` | `success/page.tsx` | Post-purchase success |
| `/thanks` | `thanks/page.tsx` | Thank you page |
| `/checkout` | `checkout/page.tsx` | Checkout flow |

### Authentication Routes (src/app/auth/)
| Route | File |
|-------|------|
| `/auth/signin` | `auth/signin/page.tsx` |
| `/auth/signup` | `auth/signup/page.tsx` |
| `/auth/verify-request` | `auth/verify-request/page.tsx` |
| `/auth/error` | `auth/error/page.tsx` |

### Dashboard/App Routes
| Route | File |
|-------|------|
| `/dashboard` | `dashboard/page.tsx` |
| `/dashboard/analytics` | `dashboard/analytics/page.tsx` |

### Admin Routes
| Route | File |
|-------|------|
| `/admin-login` | `admin-login/page.tsx` |
| `/admin/agents` | `admin/agents/page.tsx` |
| `/admin/devops` | `admin/devops/page.tsx` |
| `/admin/vault` | `admin/vault/page.tsx` |

### Utility Pages
| Route | File |
|-------|------|
| `/dnc` | `dnc/page.tsx` | Do Not Call management |
| `/vault` | `vault/page.tsx` | Secrets vault |
| `/campaigns` | `campaigns/page.tsx` | Campaign management |
| `/transcripts` | `transcripts/page.tsx` | Call transcripts |

---

## 2. API ROUTES (src/app/api/)

### Authentication
| Endpoint | Purpose |
|----------|---------|
| `/api/auth/[...nextauth]` | NextAuth.js handler |

### Contact & Forms
| Endpoint | Purpose |
|----------|---------|
| `/api/contact` | Contact form submission |
| `/api/waitlist` | Waitlist signup |
| `/api/csrf` | CSRF token generation |

### Stripe Payments
| Endpoint | Purpose |
|----------|---------|
| `/api/stripe/checkout` | Create checkout session |
| `/api/stripe/customer-portal` | Customer billing portal |
| `/api/stripe/webhook` | Stripe webhook handler |
| `/api/stripe/connect/onboard` | Connect onboarding |
| `/api/stripe/kickoff-email` | Post-purchase email |

### CRM & Leads
| Endpoint | Purpose |
|----------|---------|
| `/api/crm/leads` | Lead CRUD |
| `/api/crm/leads/[id]` | Single lead operations |
| `/api/crm/leads/[id]/assign-task` | Task assignment |
| `/api/crm/email-sequences` | Email sequences |
| `/api/leads/import` | Bulk lead import |
| `/api/leads/sync` | Lead synchronization |

### Voice & Calling (Cold Calling System)
| Endpoint | Purpose |
|----------|---------|
| `/api/voice/call` | Initiate call |
| `/api/voice/conversation` | Conversation handler |
| `/api/voice/status` | Call status callback |
| `/api/voice/twiml` | TwiML generation |
| `/api/media-stream` | WebSocket media stream |
| `/api/cron/execute-calls` | Scheduled call execution |

### Campaign Management
| Endpoint | Purpose |
|----------|---------|
| `/api/campaigns/window` | Campaign windows |
| `/api/cold-calling/campaigns` | Campaign CRUD |

### DNC (Do Not Call)
| Endpoint | Purpose |
|----------|---------|
| `/api/dnc/add` | Add to DNC list |
| `/api/dnc/list` | List DNC entries |
| `/api/dnc/remove` | Remove from DNC |

### Email
| Endpoint | Purpose |
|----------|---------|
| `/api/email/send` | Send email |
| `/api/email/early-access` | Early access email |
| `/api/health/email` | Email health check |

### NDA/DocuSign
| Endpoint | Purpose |
|----------|---------|
| `/api/nda/initiate` | Start NDA signing |
| `/api/nda/callback` | DocuSign callback |

### Vault/Secrets
| Endpoint | Purpose |
|----------|---------|
| `/api/vault/create` | Create secret |
| `/api/vault/list-public` | List public secrets |
| `/api/vault/verify` | Verify secret |
| `/api/vault/[id]/rotate` | Rotate secret |

### Analytics & Admin
| Endpoint | Purpose |
|----------|---------|
| `/api/analytics/overview` | Dashboard overview |
| `/api/analytics/customers` | Customer analytics |
| `/api/analytics/performance` | Performance metrics |
| `/api/admin/agents/activity` | Agent activity |
| `/api/admin/devops/health` | System health |
| `/api/admin/devops/heal` | Self-healing trigger |

### Integrations
| Endpoint | Purpose |
|----------|---------|
| `/api/calendly/upcoming` | Calendly events |
| `/api/deliverables/deliver` | Deliverable delivery |
| `/api/provision` | Service provisioning |
| `/api/validate-idea` | Idea validation |

---

## 3. COMPONENTS (src/components/)

### Navigation & Layout
| File | Purpose |
|------|---------|
| `Header.tsx` | Main navigation header |
| `HeaderFixed.tsx` | Fixed/sticky header |
| `HeaderSimple.tsx` | Simplified header |
| `ClientHeader.tsx` | Client-side header wrapper |
| `Footer.tsx` | Main footer |
| `Logo.tsx` | Logo component |

### Hero & Landing Sections
| File | Purpose |
|------|---------|
| `HeroSection.tsx` | Primary hero |
| `HeroSectionOptimized.tsx` | Performance-optimized hero |
| `HeroSectionAligned.tsx` | Current aligned hero |
| `CompactHeroSection.tsx` | Compact variant |

### Marketing Sections
| File | Purpose |
|------|---------|
| `CtaSection.tsx` | Call-to-action section |
| `MissionSection.tsx` | Mission/vision statement |
| `MarketRealitySection.tsx` | Market problem section |
| `OpportunityInsightSection.tsx` | Opportunity section |
| `ServicesSection.tsx` | Services overview |
| `InnovativeServicesGrid.tsx` | Services grid |
| `WhyStrataNobleGrid.tsx` | Why us grid |
| `WhatWeDoFlow.tsx` | Process flow |
| `WhatIsStrataNoble.tsx` | About section |
| `TechnologyStack.tsx` | Tech stack showcase |
| `ArchitectureDiagram.tsx` | Architecture visual |
| `DocumentationAuthority.tsx` | Documentation section |
| `EnterpriseDevelopmentMethodology.tsx` | Methodology section |
| `TransformationFlow.tsx` | Transformation visual |

### Feature Components
| File | Purpose |
|------|---------|
| `SmartConsultingBar.tsx` | AI consulting bar |
| `UrgencyBar.tsx` | Urgency/scarcity bar |
| `ClientLogoStrip.tsx` | Client logos |
| `FounderCard.tsx` | Founder profile |
| `TestimonialCard.tsx` | Testimonial display |
| `OfferingCard.tsx` | Pricing tier card |
| `WorkshopCard.tsx` | Workshop card |

### Conversion Components
| File | Purpose |
|------|---------|
| `CalendlyModal.tsx` | Calendly scheduling modal |
| `CalendlyWidget.tsx` | Embedded Calendly |
| `CheckoutModal.tsx` | Checkout modal |
| `WaitlistModal.tsx` | Waitlist signup modal |
| `WaitlistFallback.tsx` | Waitlist fallback |
| `SubscriptionManager.tsx` | Subscription management |

### Forms
| File | Purpose |
|------|---------|
| `ContactFormClient.tsx` | Contact form |
| `ContactPageClient.tsx` | Contact page wrapper |

### UI Components (src/components/ui/)
| File | Purpose |
|------|---------|
| `button.tsx` | Button component |
| `card.tsx` | Card component |
| `badge.tsx` | Badge component |
| `input.tsx` | Input component |
| `dialog.tsx` | Dialog/modal |
| `select.tsx` | Select dropdown |
| `separator.tsx` | Separator |
| `tabs.tsx` | Tab navigation |
| `chart.tsx` | Chart component |
| `container.tsx` | Container wrapper |
| `toast.tsx` | Toast notifications |
| `SafeHTML.tsx` | Safe HTML renderer |

### Page Client Components (src/components/pages/)
- `PricingPageClient.tsx`
- `DiscoveryPageClient.tsx`
- `GetStartedPageClient.tsx`
- `SchedulePageClient.tsx`
- `ColdCallingPageClient.tsx`
- `EarlyAccessPageClient.tsx`
- `SuccessPageClient.tsx`
- `ThanksPageClient.tsx`
- `VaultPageClient.tsx`
- `DncPageClient.tsx`
- `AuthSigninPageClient.tsx`
- `AuthSignupPageClient.tsx`
- `DashboardAnalyticsPageClient.tsx`
- `AdminVaultPageClient.tsx`
- `VoiceTestPageClient.tsx`
- `AchieveryAuthPageClient.tsx`

### Achievery Components (src/components/achievery/)
| File | Purpose |
|------|---------|
| `CrossPlatformIntegration.tsx` | Cross-platform info |
| `ImagePreloader.tsx` | Image preloading |
| `MobileAppPromotion.tsx` | Mobile app promo |
| `SmartAppBanner.tsx` | App banner |
| `SubscriptionGate.tsx` | Subscription gating |

### Admin Components (src/components/admin/)
| File | Purpose |
|------|---------|
| `DevOpsMonitor.tsx` | DevOps monitoring |
| `AgentActivity.tsx` | Agent activity display |

### Utility Components
| File | Purpose |
|------|---------|
| `Analytics.tsx` | Analytics wrapper |
| `ErrorBoundary.tsx` | Error boundary |
| `RouteGuard.tsx` | Route protection |
| `LazyComponents.tsx` | Lazy loading |
| `MetricsEmptyState.tsx` | Empty state |
| `AccessDenied.tsx` | Access denied |
| `CustomHead.tsx` | Custom head tags |
| `OptimizedImage.tsx` | Optimized images |

---

## 4. CONTENT & DATA (src/data/)

| File | Purpose |
|------|---------|
| `offerings.ts` | Pricing tiers & offerings |
| `services.ts` | Service descriptions |
| `faqs.ts` | FAQ content |
| `testimonials.ts` | Customer testimonials |
| `workshops.ts` | Workshop listings |
| `aiBreadcrumbs.ts` | AI navigation breadcrumbs |

---

## 5. THEME & STYLES

### Tailwind Configuration (tailwind.config.js)

**Brand Colors:**
```js
navy: {
  DEFAULT: '#003366',
  50-900: // Full palette
}
emerald: {
  DEFAULT: '#047857',
  50-900: // Full palette
}
silver: {
  DEFAULT: '#C0C0C0',
  50-900: // Full palette
}
// Accent colors
'dark-purple': '#30232d'
'accent-red': '#d55053'
'accent-gold': '#f1c095'
'accent-cream': '#fae9d7'
```

**Semantic Colors:**
```js
primary: '#003366' (navy)
accent: '#047857' (emerald)
neutral: '#C0C0C0' (silver)
```

**Fonts:**
- Sans: Inter (--font-inter)
- Serif: Bitter (--font-bitter)

**Gradients:**
- `gradient-primary`: Navy to Emerald
- `gradient-accent`: Emerald to Navy
- `gradient-neutral`: Silver to White

### Global Styles
- `src/app/globals.css` - Global CSS with Tailwind
- `postcss.config.js` - PostCSS configuration

---

## 6. LIB & UTILITIES (src/lib/)

### Core Utilities
| File | Purpose |
|------|---------|
| `utils.ts` | General utilities |
| `logger.ts` | Logging |
| `cache.ts` | Caching |
| `env.ts` | Environment variables |
| `public-config.ts` | Public configuration |

### Authentication
| File | Purpose |
|------|---------|
| `auth.ts` | Auth utilities |
| `auth-guard.ts` | Auth guard middleware |
| `csrf.ts` | CSRF protection |
| `validators.ts` | Validation schemas |

### Analytics
| File | Purpose |
|------|---------|
| `analytics.ts` | Analytics tracking |
| `analytics-dashboard.ts` | Dashboard analytics |
| `useAnalytics.ts` | Analytics hook |
| `useScrollToSection.ts` | Scroll tracking |

### Integrations
| File | Purpose |
|------|---------|
| `supabase.ts` | Supabase client |
| `stripe.ts` | Stripe utilities |
| `stripe-server.ts` | Server-side Stripe |
| `twilio.ts` | Twilio integration |
| `openai-realtime.ts` | OpenAI Realtime API |
| `mailchimp.ts` | Mailchimp integration |
| `docusign.ts` | DocuSign/NDA |
| `s3.ts` | AWS S3 utilities |

### Email
| File | Purpose |
|------|---------|
| `email.ts` | Email service |
| `mailer.ts` | Mailer utilities |
| `send-validation-email.ts` | Email validation |

### Business Logic
| File | Purpose |
|------|---------|
| `deliverables.ts` | Deliverables management |
| `call-evaluator.ts` | Call evaluation |
| `call-manager.ts` | Call management |
| `campaign-scheduler.ts` | Campaign scheduling |
| `conversation-config.ts` | Voice conversation config |
| `cta-labels.ts` | CTA label mappings |
| `lead-sync.ts` | Lead synchronization |
| `qstash.ts` | Upstash QStash |
| `prisma.ts` | Prisma client |
| `self-healing-agent.ts` | Self-healing system |

### Calling System
| File | Purpose |
|------|---------|
| `calling/dnc-checker.ts` | DNC checking |
| `core/phone-utils.ts` | Phone utilities |

---

## 7. DATABASE (prisma/)

### Schema (prisma/schema.prisma)

**Models:**
- `User` - NextAuth users
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification
- `Client` - Business clients
- `Offering` - Pricing tiers
- `Invoice` - Payment invoices
- `MetricFeed` - Analytics metrics
- `NDA` - NDA signing records
- `LeadSync` - CRM lead sync

---

## 8. PUBLIC ASSETS (public/)

### Logos & Icons
- `favicon.svg`
- `strata_noble_logo.svg`
- `stratanoble_logoICON.svg`
- `img/logo.svg`

### PWA
- `manifest.json` - PWA manifest
- `sw.js` - Service worker

### Images
- `images/achievery/` - Achievery app screenshots
- `images/entrepreneurs/` - Entrepreneur imagery
- `img/steve-hubbard.jpg` - Founder photo

---

## 9. BRANDING (branding/)

| File | Purpose |
|------|---------|
| `strata_noble_logo.svg` | Primary logo |
| `stratanoble_logoICON.svg` | Icon/mark |
| `strata_noble_brand_demo.html` | Brand demo page |
| `strata_noble_figma_brand_sheet.json` | Figma design tokens |
| `tailwind.config.js` | Brand Tailwind config |

---

## 10. ENVIRONMENT VARIABLES

### Frontend Variables (NEXT_PUBLIC_ prefix)
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BASE_URL` | Base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID` | Builder tier price |
| `NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID` | Prosperity tier price |
| `NEXT_PUBLIC_ACHIEVERY_URL` | Achievery app URL |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics |

### Server-Side Secrets
| Secret | Purpose |
|--------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing |
| `NEXTAUTH_SECRET` | NextAuth encryption |
| `NEXTAUTH_URL` | Auth callback URL |
| `DATABASE_URL` | PostgreSQL connection |

### OAuth Providers
| Secret | Purpose |
|--------|---------|
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth |
| `AZURE_AD_CLIENT_ID/SECRET/TENANT_ID` | Azure AD |

### Email (AWS SES)
| Secret | Purpose |
|--------|---------|
| `SES_FROM_EMAIL` | From address |
| `AWS_ACCESS_KEY_ID` | AWS key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret |
| `AWS_REGION` | AWS region |

### Voice/Calling
| Secret | Purpose |
|--------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account |
| `TWILIO_AUTH_TOKEN` | Twilio auth |
| `TWILIO_PHONE_NUMBER_PRIMARY` | Calling number |
| `OPENAI_API_KEY` | OpenAI for AI voice |
| `CRON_SECRET` | Cron job auth |

### Monitoring (Optional)
| Secret | Purpose |
|--------|---------|
| `SENTRY_DSN` | Error tracking |
| `QSTASH_TOKEN` | Background jobs |
| `REDIS_URL` | Rate limiting |
| `VAULT_ENCRYPTION_KEY` | Secrets encryption |

---

## 11. FOLDER STRUCTURE

```
marketing-restructure-export/
├── middleware.ts              # Root middleware
├── next.config.js             # Next.js config
├── tailwind.config.js         # Tailwind theme
├── postcss.config.js          # PostCSS config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
├── .env.example               # Website env template
├── .env.example.root          # Root env template
├── branding/                  # Brand assets
│   ├── strata_noble_logo.svg
│   ├── strata_noble_figma_brand_sheet.json
│   └── tailwind.config.js
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── favicon.svg
│   ├── strata_noble_logo.svg
│   └── images/                # Marketing images
└── src/
    ├── app/                   # Next.js App Router
    │   ├── layout.tsx         # Root layout
    │   ├── page.tsx           # Homepage
    │   ├── globals.css        # Global styles
    │   ├── api/               # API routes
    │   └── [routes]/          # Page routes
    ├── components/            # React components
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── HeroSection*.tsx
    │   ├── ui/                # UI primitives
    │   ├── pages/             # Page client components
    │   ├── achievery/         # Achievery components
    │   └── admin/             # Admin components
    ├── data/                  # Content data
    │   ├── offerings.ts
    │   ├── services.ts
    │   ├── faqs.ts
    │   └── testimonials.ts
    ├── hooks/                 # React hooks
    ├── lib/                   # Utilities & integrations
    └── types/                 # TypeScript types
```

---

## 12. SEO & ANALYTICS

### Metadata (Root Layout)
- Title: "Strata Noble - Your CaaS Platform"
- Description: Consulting-as-a-Service
- Keywords: business strategy, startup consulting, etc.
- OpenGraph: Configured with OG image
- Twitter Cards: Configured
- Robots: Index, Follow

### Analytics
- Google Analytics: `G-0TGKD1S1HB`
- Plausible Analytics: Optional
- Custom `Analytics.tsx` component

### PWA
- `manifest.json` configured
- Service worker enabled
- Deep linking support

### Schema.org
- Organization schema in root layout
- Contact info, services, addresses

---

## POSITIONING NOTES

**Current value prop:**
> "Your CaaS Platform" / "Consulting-as-a-Service"

**Who it's for:**
- Entrepreneurs turning passion into profit
- Startups needing strategic consulting
- Businesses seeking AI-powered growth tools

**Revenue streams:**
- Subscription tiers (Builder, Prosperity)
- One-time services
- Achievery platform subscriptions
- Workshops

**Key differentiators:**
- AI-powered cold calling system
- Integrated CRM
- DocuSign NDA automation
- Self-healing DevOps
- Achievery companion platform

---

## WHAT'S NOT INCLUDED

1. **node_modules/** - Install via `npm install`
2. **.next/** - Build output
3. **Server-side voice scripts** - Located in `/server` (not copied)
4. **Test files** - Located in `/__tests__` and `/tests`
5. **Database migrations** - Run `npx prisma migrate`

---

*This package contains everything needed to restructure the marketing site while preserving the existing design system, conversion flows, and brand identity.*
