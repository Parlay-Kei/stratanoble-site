# Supabase Setup Checklist

## ✅ Step-by-Step Setup

### 1. Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign in/sign up
- [ ] Click "New Project"
- [ ] Name: `strata-noble`
- [ ] Set database password (save it!)
- [ ] Choose region (US East recommended)
- [ ] Select Free plan

### 2. Get Project Credentials
- [ ] Go to Settings → API
- [ ] Copy Project URL (starts with `https://`)
- [ ] Copy service_role key (starts with `eyJ`)
- [ ] Copy anon key (starts with `eyJ`)

### 3. Update Environment Variables
- [ ] Open `.env.local`
- [ ] Replace `your_supabase_url_here` with your Project URL
- [ ] Replace `your_supabase_service_role_here` with your service_role key
- [ ] Add `SUPABASE_ANON_KEY=your_anon_key_here`

### 4. Create Database Tables
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Copy and paste the SQL from `SUPABASE_SETUP_GUIDE.md`
- [ ] Click "Run" to create all tables

### 5. Test Connection
- [ ] Run `npm run build` to test
- [ ] Should complete without Supabase errors

## 🔧 Quick SQL Commands

If you just want the essential tables, run this in SQL Editor:

```sql
-- Essential tables for Strata Noble
CREATE TABLE workshop_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'web',
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE user_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  access_level text NOT NULL DEFAULT 'workshop_participant',
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true
);
```

## 🚨 Common Issues

- **"Invalid URL"**: Make sure URL starts with `https://` and has no trailing slash
- **"Table not found"**: Run the SQL commands in SQL Editor
- **"Service role not found"**: Use the service_role key, not anon key
- **Build fails**: Check that all environment variables are set correctly

## 📞 Need Help?

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Look at the detailed guide in `SUPABASE_SETUP_GUIDE.md`
3. Run the setup script: `node setup-supabase.js`

---

**Once Supabase is set up, we can proceed with the QA blitz and launch preparation!** 🚀 