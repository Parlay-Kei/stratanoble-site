# Stripe Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Stripe Configuration
# Replace with your actual Stripe keys from the Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here

# Stripe Webhook Secret (get this from Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product/Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_ID_LITE=price_your_lite_price_id_here
STRIPE_PRICE_ID_CORE=price_your_core_price_id_here
STRIPE_PRICE_ID_PREMIUM=price_your_premium_price_id_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:8080

# Email Service Configuration (for kickoff emails)
# SENDGRID_API_KEY=your_sendgrid_api_key_here
# MAILGUN_API_KEY=your_mailgun_api_key_here

# Database Configuration (for storing merchant accounts)
# DATABASE_URL=your_database_connection_string_here
```

## Setup Steps

### 1. Get Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. Copy your test publishable key and secret key
4. Replace the placeholder values in `.env.local`

### 2. Create Products and Prices
1. In Stripe Dashboard, go to Products
2. Create three products:
   - Solution Services - Lite ($1,200)
   - Solution Services - Core ($2,500)
   - Solution Services - Premium ($5,000)
3. Copy the price IDs and update the environment variables

### 3. Set Up Webhooks
1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add to `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode Configuration
- Use test keys for development
- Test with Stripe's test card numbers:
  - Success: `4242424242424242`
  - Decline: `4000000000000002`
  - Expired: `4000000000000069`

## Security Notes
- Never commit `.env.local` to version control
- Use test keys for development
- Only use live keys in production
- Keep webhook secrets secure 