# Running Database Migrations Manually

**Issue**: Supabase databases are behind a firewall and cannot be reached from Netlify's build environment. Migrations must be run manually.

---

## Quick Fix: Run Migrations Now

### Option 1: Via Supabase Dashboard (Easiest) ✅ RECOMMENDED

1. **Go to Supabase SQL Editor**:
   - URL: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new
   - Or: Dashboard → SQL Editor → New Query

2. **Copy and paste the migration SQL**:
   - Open: `supabase/migrations/0026_create_lead_intake_table.sql`
   - Copy the entire contents
   - Paste into SQL Editor

3. **Execute the migration**:
   - Click "Run" or press Ctrl+Enter
   - Wait for success message

4. **Verify table created**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'LeadIntake';
   ```
   Should return one row.

### Option 2: Via Prisma CLI (Local Machine)

**Prerequisites:**
- `DATABASE_URL` environment variable set with production database connection
- Database must be reachable from your local machine

**Steps:**

1. **Set DATABASE_URL** (if not already set):
   ```bash
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.bvneqoevtwodyfqglpzi.supabase.co:5432/postgres"
   ```

2. **Navigate to website directory**:
   ```bash
   cd apps/website
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify table exists**:
   ```bash
   npx prisma db pull
   # Or check in Supabase dashboard
   ```

### Option 3: Via Supabase CLI

1. **Link to project** (if not already linked):
   ```bash
   npx supabase link --project-ref bvneqoevtwodyfqglpzi
   ```

2. **Push migrations**:
   ```bash
   npx supabase db push
   ```

---

## Why Migrations Can't Run During Build

- **Supabase databases are behind a firewall** - Netlify's build environment cannot reach them directly
- **Connection pooling required** - Supabase requires connection pooling (port 6543) for external connections
- **Security** - Direct database access from build environments is typically blocked

---

## Long-term Solution

Consider one of these approaches:

1. **Use Supabase Migrations** instead of Prisma migrations
   - Migrations live in `supabase/migrations/`
   - Can be applied via Supabase dashboard or CLI
   - Better integration with Supabase infrastructure

2. **Run migrations via GitHub Actions** or CI/CD
   - Separate workflow that runs after deploy
   - Has access to database credentials
   - Can run migrations automatically

3. **Use Supabase's built-in migration system**
   - Apply migrations through Supabase dashboard
   - More control and visibility

---

## Verify Migrations Applied

After running migrations, verify the `LeadIntake` table exists:

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'LeadIntake';
```

Expected result: Should return one row with `table_name = 'LeadIntake'`

---

## Current Status

- ✅ Migration fix prepared (removed from build)
- ⏳ Waiting for manual migration run
- ⏳ Intake route will work after `LeadIntake` table is created
