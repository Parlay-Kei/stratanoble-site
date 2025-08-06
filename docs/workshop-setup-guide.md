# Side Hustle Workshops Setup Guide

This guide covers the complete setup for the Side Hustle Workshops feature, including environment variables, database setup, and deployment configuration.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Calendly Configuration
NEXT_PUBLIC_CALENDLY_ORG=StrataNoble
CALENDLY_TOKEN=sk_live_your_calendly_token_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key_here

# Mailchimp Configuration (Optional)
MAILCHIMP_API_KEY=your_mailchimp_api_key_here
MAILCHIMP_AUDIENCE_ID=your_audience_id_here

# Stripe Configuration (for webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://stratanoble.com
NODE_ENV=production
```

## Database Setup

### Supabase Table Creation

Run the following SQL in your Supabase SQL editor:

```sql
-- Workshop Waitlist Table
CREATE TABLE workshop_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'web',
  created_at timestamptz DEFAULT now()
);

-- Workshop Signups Table (for Stripe webhook)
CREATE TABLE workshop_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text,
  event_uri text,
  event_name text,
  payment_status text,
  amount_paid integer,
  created_at timestamptz DEFAULT now()
);

-- Workshop Testimonials Table (for future use)
CREATE TABLE workshop_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  testimonial text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  workshop_date date,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_workshop_waitlist_email ON workshop_waitlist(email);
CREATE INDEX idx_workshop_waitlist_created_at ON workshop_waitlist(created_at);
CREATE INDEX idx_workshop_signups_email ON workshop_signups(customer_email);
CREATE INDEX idx_workshop_testimonials_approved ON workshop_testimonials(approved);
```

## Calendly Setup

1. **Create Group Event Type**:
   - Go to Calendly → Event Types
   - Create a new "Group" event type
   - Set the URL to: `https://calendly.com/stratanoble/side-hustle`
   - Configure capacity, duration, and availability

2. **Get API Token**:
   - Go to Calendly → Integrations → API & Webhooks
   - Generate a new API token with read permissions
   - Add to your environment variables

## Mailchimp Setup (Optional)

1. **Create Audience**:
   - Create a new audience called "Side-Hustle Waitlist"
   - Note the Audience ID for environment variables

2. **Get API Key**:
   - Go to Account → Extras → API Keys
   - Generate a new API key
   - Add to your environment variables

## Stripe Webhook Setup

1. **Install Stripe CLI**:
   ```bash
   # For development
   stripe listen --forward-to localhost:8080/api/stripe/webhook
   ```

2. **Configure Webhook**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://stratanoble.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`
   - Copy webhook secret to environment variables

## Testing

### Local Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the waitlist flow**:
   - Visit `http://localhost:8080/workshops`
   - If no events are available, you should see the waitlist fallback
   - Test the waitlist modal form

3. **Test the Calendly integration**:
   - Create a test event in Calendly
   - Verify it appears on the workshops page

### API Testing

1. **Test Calendly API**:
   ```bash
   curl "http://localhost:8080/api/calendly/upcoming"
   ```

2. **Test Waitlist API**:
   ```bash
   curl -X POST "http://localhost:8080/api/waitlist" \
     -H "Content-Type: application/json" \
     -d '{"fullName":"Test User","email":"test@example.com"}'
   ```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Supabase tables created
- [ ] Calendly group event created
- [ ] Stripe webhook configured
- [ ] Mailchimp audience created (if using)
- [ ] Test the complete flow in production
- [ ] Verify analytics events are firing
- [ ] Check mobile responsiveness
- [ ] Test cookie banner overlap on iOS Safari

## Analytics Events

The following events are automatically tracked:

- `waitlist_joined` - When user joins the waitlist
- `workshop_cta_clicked` - When user clicks "Reserve My Seat"
- `checkout_completed` - When Stripe webhook processes payment

## Troubleshooting

### Common Issues

1. **Calendly API errors**:
   - Verify `CALENDLY_TOKEN` is correct
   - Check that the event type URL exists
   - Ensure the token has read permissions

2. **Supabase connection errors**:
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE`
   - Check that tables exist in your database
   - Ensure service role has insert permissions

3. **Mailchimp integration errors**:
   - Verify API key and audience ID
   - Check that the audience exists
   - Ensure API key has write permissions

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed error messages in the console.

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check Supabase logs for database errors 