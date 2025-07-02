# Supabase Setup Guide for Strata Noble

## 🚀 Quick Setup Steps

### 1. Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in/sign up
2. **Click "New Project"**
3. **Fill in project details:**
   - **Name:** `strata-noble`
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users (US East for US)
   - **Pricing Plan:** Free tier is sufficient for launch

### 2. Get Your Project Credentials

Once your project is created:

1. **Go to Settings → API**
2. **Copy these values:**
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ`)
   - **service_role key** (starts with `eyJ`)

### 3. Update Environment Variables

Update your `.env.local` file with the real values:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
ADMIN_EMAIL=contact@stratanoble.com
FROM_EMAIL=noreply@stratanoble.com
```

### 4. Create Database Tables

Run this SQL in your Supabase SQL Editor (Database → SQL Editor):

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

-- Workshop Resources Table (for vault access)
CREATE TABLE workshop_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('pdf', 'video', 'slide', 'worksheet')),
  filename text NOT NULL,
  file_path text NOT NULL,
  size_bytes integer,
  category text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- User Access Table (for vault permissions)
CREATE TABLE user_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  access_level text NOT NULL DEFAULT 'workshop_participant',
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX idx_workshop_waitlist_email ON workshop_waitlist(email);
CREATE INDEX idx_workshop_waitlist_created_at ON workshop_waitlist(created_at);
CREATE INDEX idx_workshop_signups_email ON workshop_signups(customer_email);
CREATE INDEX idx_workshop_testimonials_approved ON workshop_testimonials(approved);
CREATE INDEX idx_workshop_resources_category ON workshop_resources(category);
CREATE INDEX idx_workshop_resources_active ON workshop_resources(is_active);
CREATE INDEX idx_user_access_email ON user_access(email);
CREATE INDEX idx_user_access_active ON user_access(is_active);
```

### 5. Set Up Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE workshop_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Workshop waitlist: Anyone can insert, only service role can read
CREATE POLICY "Anyone can join waitlist" ON workshop_waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read waitlist" ON workshop_waitlist
  FOR SELECT USING (auth.role() = 'service_role');

-- Workshop signups: Service role can insert/read
CREATE POLICY "Service role can manage signups" ON workshop_signups
  FOR ALL USING (auth.role() = 'service_role');

-- Workshop resources: Only authorized users can access
CREATE POLICY "Authorized users can access resources" ON workshop_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_access 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- User access: Service role can manage
CREATE POLICY "Service role can manage user access" ON user_access
  FOR ALL USING (auth.role() = 'service_role');
```

### 6. Test the Connection

After updating your environment variables, test the connection:

```bash
npm run build
```

If successful, you should see no Supabase-related errors.

### 7. Set Up Storage (Optional - for file uploads)

1. **Go to Storage in Supabase dashboard**
2. **Create a new bucket called `workshop-resources`**
3. **Set bucket to private**
4. **Create storage policies:**

```sql
-- Allow authenticated users to download resources
CREATE POLICY "Users can download workshop resources" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'workshop-resources' AND
    EXISTS (
      SELECT 1 FROM user_access 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND is_active = true
    )
  );

-- Only service role can upload
CREATE POLICY "Service role can upload resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workshop-resources' AND
    auth.role() = 'service_role'
  );
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid URL" error:**
   - Make sure your `SUPABASE_URL` starts with `https://`
   - No trailing slash at the end

2. **"API key does not start with SG" error:**
   - This is for SendGrid, not Supabase
   - You'll need to set up SendGrid separately

3. **"Service role not found" error:**
   - Make sure you're using the `service_role` key, not the `anon` key
   - The service role key has more permissions

4. **"Table does not exist" error:**
   - Run the SQL commands in the Supabase SQL Editor
   - Make sure you're in the correct project

## 📊 Next Steps

After Supabase is set up:

1. **Test the waitlist functionality**
2. **Test the vault access system**
3. **Set up SendGrid for email functionality**
4. **Configure Stripe webhooks**
5. **Deploy to production**

## 🔐 Security Notes

- **Never commit your `.env.local` file to version control**
- **Use the service role key only on the server side**
- **Use the anon key for client-side operations (if needed)**
- **Regularly rotate your API keys**
- **Monitor your Supabase usage in the dashboard**

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or reach out to the team. 