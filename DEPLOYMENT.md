# Production Deployment Guide

This document outlines the steps to push the Strata Noble stack to production after the October 3, 2025 updates.

## 1. Prerequisites
- Node.js 20+
- pnpm 9+
- Access to production environment variables (Stripe, Supabase, AWS, etc.)
- Access to Vercel (website) and the ACHIEVERY hosting environment

## 2. Verify Code Health
```bash
pnpm install

pnpm --filter @strata-noble/website run lint
pnpm --filter @strata-noble/website run type-check
pnpm --filter @strata-noble/website run test:ci
pnpm --filter @strata-noble/website run build

pnpm --filter @strata-noble/platform run build
```
Ensure both builds succeed and lint/test commands return without warnings.

## 3. Environment Variables
Create `.env.production` (or the platform equivalent) with:
- `NEXT_PUBLIC_BASE_URL`
- NextAuth secrets (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, OAuth client IDs)
- Database connection string
- Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Stripe publishable/secret/webhook keys
- Email provider credentials (SES/SMTP)
- Optional integrations: DocuSign, Mailchimp, Plausible, Upstash

Never commit secrets—store them in the deployment platform’s secret manager.

## 4. Third-Party Services
- **Google OAuth**: Confirm redirect URIs match production domain.
- **Stripe**: Products, prices, and webhooks configured for the live keys.
- **Supabase**: Run migrations and confirm Row Level Security (RLS) policies are enabled.
- **Email (SES/SMTP)**: Domain verified and production sender addresses approved.

## 5. Database
```bash
pnpm prisma db push --filter @strata-noble/website
pnpm prisma generate --filter @strata-noble/website
# Seed if required
pnpm prisma db seed --filter @strata-noble/website
```
Adjust the schema path if you are working in the platform package instead of the website.

## 6. Build Artifacts
- Website: deploy with Vercel (or your hosting provider) using `pnpm --filter @strata-noble/website run build`.
- Platform: deploy the Next.js 15 build output (`pnpm --filter @strata-noble/platform run build`).
- Mobile: use EAS build/submit if releasing new versions.

## 7. Smoke Tests
After deployment, run basic checks:
```bash
# Homepage should return 200
curl -I https://yourdomain.com

# Check protected route redirects
curl -I https://yourdomain.com/dashboard

# Trigger key API endpoints
curl -X POST https://yourdomain.com/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
```
Log into the app and confirm authentication, checkout, and Supabase-backed flows operate as expected.

## 8. Monitoring & Alerts
- Sentry (or your error tracker) should be enabled before the release.
- Configure uptime monitoring (Vercel, Pingdom, etc.).
- Confirm logging/metrics dashboards are connected to the new build.

## 9. Rollback Plan
- Vercel: `vercel rollback` to the previous deployment.
- Database: keep a backup snapshot or schema migration history to revert if necessary.

## 10. Post-Deployment Checklist
- Announce the release to stakeholders.
- Verify Stripe and Supabase dashboards for live activity.
- Schedule follow-up review of analytics within 24 hours.

Document last reviewed: **October 3, 2025**.
