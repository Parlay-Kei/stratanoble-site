# Strata Noble Platform - Phase-by-Phase Insertion Plan

## Overview
Transforming the current marketing site into a full SaaS platform with dashboard analytics, subscription management, and automation tools.

## Phase Status
- ✅ **Phase 1 (Partial)**: Stripe products created, offerings.ts structure in place
- 🔄 **Phase 0**: Need to implement data model and repo structure
- 🔄 **Phase 1**: Complete productization with feature flags and UI updates

---

## Phase 0 · Data Model & Repo Split
**Timeline**: 1 day  
**Owner**: Development  
**Proof of completion**: Prisma can migrate & seed locally

### Tasks
- [x] ~~Fork strata-noble-site into sn-platform sub-repo~~ (Using existing repo)
- [ ] Create `packages/core-saas` folder with Prisma schema
- [ ] Define data models: Client, Offering, Invoice, MetricFeed
- [ ] Set up local database migration and seeding

### Data Models Required
```prisma
model Client {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  tier        String   // 'lite', 'growth', 'partner'
  stripeCustomerId String? @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  invoices    Invoice[]
  metricFeeds MetricFeed[]
}

model Offering {
  id          String @id @default(cuid())
  name        String
  tier        String @unique
  priceId     String
  features    Json
  active      Boolean @default(true)
}

model Invoice {
  id              String   @id @default(cuid())
  clientId        String
  stripeInvoiceId String   @unique
  amount          Int
  status          String
  createdAt       DateTime @default(now())
  
  client Client @relation(fields: [clientId], references: [id])
}

model MetricFeed {
  id        String   @id @default(cuid())
  clientId  String
  platform  String   // 'youtube', 'tiktok', etc.
  data      Json
  createdAt DateTime @default(now())
  
  client Client @relation(fields: [clientId], references: [id])
}
```

---

## Phase 1 · Productize Offerings
**Timeline**: 1 day  
**Owner**: Development  
**Proof of completion**: Cards render in dev with correct copy

### Tasks
- [x] Create `src/data/offerings.ts` with Lite, Blueprint, Partner objects
- [x] Add Stripe Price IDs to offerings
- [ ] Add feature flags to offerings structure
- [ ] Update ServiceCard to map over offerings array
- [ ] Implement `NEXT_PUBLIC_SHOW_PRICING` environment control
- [ ] Create pricing page with offering cards

### Feature Flags Structure
```typescript
export const OFFERINGS = {
  lite: {
    name: 'Dashboard Lite',
    description: 'Looker dashboard + weekly digest',
    priceId: 'price_1RsFQhGEwjQWkTx0mcFlA0Bv',
    features: {
      dashboard: true,
      weeklyDigest: true,
      apiAccess: false,
      customReports: false,
      prioritySupport: false
    },
    metadata: { tier: 'lite' }
  },
  // ... other offerings
}
```

---

## Phase 2 · Payments & Access
**Timeline**: 2 days  
**Owner**: Development  
**Proof of completion**: Test card purchases succeed in Stripe test mode

### Tasks
- [x] Install @stripe/stripe-js
- [x] Create `/api/stripe/checkout` route
- [ ] Add "Start" buttons that POST to checkout route with offeringId
- [ ] Implement Stripe Customer Portal for subscription management
- [ ] Create basic dashboard placeholder page
- [x] Set up webhook handling for payment events

---

## Phase 3 · Auth & Tenancy
**Timeline**: 2 days  
**Owner**: Development  
**Proof of completion**: New paying user redirected to /dashboard with "Data not connected yet" banner

### Tasks
- [ ] Install and configure NextAuth
- [ ] Set up Google OAuth provider
- [ ] Implement email magic link authentication
- [ ] Create `/api/provision` webhook endpoint
- [ ] Auto-create Client row on first payment
- [ ] Pre-load Looker dashboard template ID
- [ ] Create protected dashboard route

---

## Phase 4 · Dashboard Ingestion
**Timeline**: 3 days  
**Owner**: Development  
**Proof of completion**: Charts populate for one test client

### Tasks
- [ ] Set up scheduled CRON job (Next.js Queue or Supabase Edge Functions)
- [ ] Implement YouTube API integration
- [ ] Implement TikTok API integration
- [ ] Store metric data as JSON blobs in MetricFeed table
- [ ] Create Looker Studio dashboard template
- [ ] Embed Looker Studio iframe in /dashboard
- [ ] Parameterize dashboard by clientId

---

## Phase 5 · Automation Hooks
**Timeline**: 1 day  
**Owner**: Development  
**Proof of completion**: Success email to client with links to all tools

### Tasks
- [ ] Set up Airtable API integration
- [ ] Create Airtable base template duplication on client creation
- [ ] Implement Geniuslink API integration
- [ ] Auto-generate Geniuslink group for affiliate tracking
- [ ] Create success email template with tool links
- [ ] Send automated onboarding email

---

## Phase 6 · Sponsorship Brokerage Lane
**Timeline**: 1 day  
**Owner**: Development  
**Proof of completion**: First inbound brand query logged

### Tasks
- [ ] Create "Brand Deals" page
- [ ] Implement Partner tier gating
- [ ] Create brand inquiry form
- [ ] Set up Notion.so integration for lead pipeline
- [ ] Log brand queries to Notion database

---

## Phase 7 · Template Marketplace
**Timeline**: 1 day  
**Owner**: Development  
**Proof of completion**: Can buy a $49 Notion template end-to-end

### Tasks
- [ ] Create `/public/templates` directory structure
- [ ] Build "Resources" page with template index
- [ ] Implement Stripe one-time checkout for templates
- [ ] Set up email delivery for template downloads
- [ ] Create template purchase confirmation flow

---

## Current Status Summary

### ✅ Completed
- Stripe products created in live mode
- Basic offerings.ts structure
- Checkout API route with test mode
- Test coupon system for $0.60 testing

### 🔄 In Progress
- Phase 0: Data model setup
- Phase 1: Complete UI integration

### 📋 Next Immediate Steps
1. Set up Prisma schema and database
2. Update ServiceCard component to use offerings
3. Create pricing page
4. Implement authentication system
5. Build dashboard foundation

---

## Environment Variables Needed
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://stratanoble.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# APIs
YOUTUBE_API_KEY="..."
TIKTOK_API_KEY="..."
AIRTABLE_API_KEY="..."
GENIUSLINK_API_KEY="..."
NOTION_API_KEY="..."

# Looker
LOOKER_DASHBOARD_TEMPLATE_ID="..."
```

## Success Metrics
- [ ] User can sign up and pay for subscription
- [ ] Dashboard shows real social media metrics
- [ ] Automation tools are provisioned automatically
- [ ] Template marketplace generates revenue
- [ ] Brand deal pipeline captures leads
