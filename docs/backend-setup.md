# Backend Infrastructure Setup Guide

This guide walks you through setting up the complete backend infrastructure for Strata Noble, including database, email service, and payment processing.

## Prerequisites

Before starting, ensure you have:
- A Supabase account (database)
- A SendGrid account (email service)  
- A Stripe account (payment processing)
- Access to your production environment variables

## 1. Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API
3. Get your service role key (keep this secret!)

### Step 2: Create Database Schema
1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Execute the script to create all tables, indexes, and triggers

### Step 3: Configure Environment Variables
Add these to your `.env.local` or production environment:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 2. Email Service Setup (SendGrid)

### Step 1: Create SendGrid Account
1. Sign up at [SendGrid](https://sendgrid.com)
2. Verify your account and complete setup

### Step 2: Create API Key
1. Go to Settings > API Keys
2. Create a new API key with "Full Access" 
3. Copy the API key (you won't see it again!)

### Step 3: Verify Sender Email
1. Go to Settings > Sender Authentication
2. Add and verify your domain (recommended) or single sender email
3. Use this verified email as your FROM address

### Step 4: Configure Environment Variables
```env
# SendGrid Configuration  
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
```

## 3. Stripe Integration

Your Stripe integration is already configured. Ensure these environment variables are set:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Webhook Configuration
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
4. Copy the webhook signing secret to your environment variables

## 4. Testing the Setup

### Test Database Connection
```bash
# This should return without errors
npm run dev
# Check console for Supabase connection messages
```

### Test Email Service
1. Use the contact form on your website
2. Check that emails are sent to both customer and team
3. Verify emails appear in SendGrid Activity Feed

### Test Payment Flow
1. Complete a test purchase using Stripe test cards
2. Verify order is created in Supabase `orders` table
3. Check that kickoff email is sent automatically
4. Confirm webhook events are logged in `webhook_logs` table

## 5. Monitoring & Logs

### Database Monitoring
- Check Supabase Dashboard > Logs for database queries
- Monitor table sizes and performance in Database > Tables

### Email Monitoring  
- SendGrid Activity Feed shows all email attempts
- Check `email_logs` table for application-level tracking

### Error Tracking
- Application logs use Pino logger
- Webhook processing is logged in `webhook_logs` table
- Consider adding Sentry for production error tracking

## 6. Production Considerations

### Security
- Never expose service role keys in client-side code
- Use Row Level Security (RLS) policies in Supabase
- Validate webhook signatures from Stripe
- Sanitize all user inputs

### Performance  
- Database indexes are included in schema
- Consider connection pooling for high traffic
- Monitor email sending limits with SendGrid

### Backup & Recovery
- Supabase handles automated backups
- Export critical data regularly
- Test recovery procedures

## 7. Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify Supabase URL and keys are correct
- Check that schema was created successfully
- Ensure RLS policies allow service role access

**Email Not Sending**
- Verify SendGrid API key has correct permissions
- Check sender email is verified
- Look for errors in `email_logs` table

**Webhook Failures**  
- Confirm webhook URL is accessible from internet
- Verify webhook secret matches Stripe dashboard
- Check `webhook_logs` table for processing errors

**Order Not Created**
- Ensure Stripe session includes required metadata
- Check webhook is being received and processed
- Verify database permissions for orders table

## 8. Data Schema Overview

### Tables Created
- `customers` - Customer information and stats
- `contact_submissions` - Contact form submissions  
- `orders` - Purchase orders and fulfillment status
- `webhook_logs` - Stripe webhook processing logs
- `email_logs` - Email delivery tracking

### Key Relationships
- Orders link to customers via email
- Customer stats auto-update when orders are paid
- All tables include audit timestamps
- Metadata fields store flexible JSON data

## 9. Next Steps

After setup completion:

1. **Test thoroughly** in staging environment
2. **Configure monitoring** alerts for failures
3. **Set up automated backups** of critical data
4. **Document** any custom procedures for your team
5. **Plan** for scaling as your business grows

## Support

For issues with this setup:
- Check application logs first
- Review service provider documentation
- Consult the troubleshooting section above
- Consider professional support for production deployments

---

**Security Note**: Keep all API keys and secrets secure. Never commit them to version control or share them publicly.