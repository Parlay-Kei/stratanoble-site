# Session Checkpoint - StrataNoble

Date: 2025-10-04

Purpose: Save current progress so you can resume quickly later.

Completed
- AI Validator API integrated (OpenAI, Supabase insert, optional SendGrid email)
  - apps/website/src/app/api/validate-idea/route.ts:1
- Results page shows AI analysis and CTAs
  - apps/website/src/app/get-started/page.tsx:1
- Hero captures idea/email, calls validator, stores results, redirects
  - apps/website/src/components/HeroSectionAligned.tsx:1
- Email sender utility (SendGrid)
  - apps/website/src/lib/send-validation-email.ts:1
- Pricing data restructured (platform tiers, consulting services, legacy offerings)
  - apps/website/src/data/offerings.ts:1
- Pricing page redesigned and wired to CheckoutModal for paid tiers
  - apps/website/src/app/pricing/page.tsx:1
- Checkout modal supports free ? signup, consulting ? contact, paid ? Stripe
  - apps/website/src/components/CheckoutModal.tsx:1
- Checkout API uses priceId directly (compatible with new tiers)
  - apps/website/src/app/api/stripe/checkout/route.ts:1
- Validation updated for new tier IDs and optional priceId
  - apps/website/src/lib/validators.ts:1

Outstanding/Pending
- Env: set Stripe price IDs for Builder/Prosperity
  - NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID, NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID
- Optional: persist analysis server-side and read it on results page (instead of sessionStorage)
- Optional: update/add tests for new tier IDs and priceId in checkout validation
  - apps/website/src/lib/__tests__/validators.test.ts:1

Environment Variables (apps/website/.env.local)
- OPENAI_API_KEY=sk-...
- SENDGRID_API_KEY=SG-...
- SENDGRID_FROM_EMAIL=noreply@stratanoble.com
- NEXT_PUBLIC_BASE_URL=https://stratanoble.com
- NEXT_PUBLIC_SUPABASE_URL=...
- SUPABASE_SERVICE_ROLE_KEY=...
- NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID=price_...
- NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID=price_...

How To Resume
1) Add Stripe price IDs to .env.local (test mode) and run:
   - cd apps/website
   - pnpm dev
2) Test at http://localhost:3000/pricing
   - Free ? /auth/signup
   - Builder ? modal ? Stripe shows $47/month
   - Prosperity ? modal ? Stripe shows $97/month
   - Consulting ? /contact
   - AI validation: homepage form ? /get-started renders analysis
3) (Optional) Update tests for new tier IDs and priceId

Quick Test Checklist
- Free ? /auth/signup
- Builder ? modal ? Stripe shows $47/month
- Prosperity ? modal ? Stripe shows $97/month
- Consulting ? /contact
- AI validation: homepage form ? /get-started renders analysis