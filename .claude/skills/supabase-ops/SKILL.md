# Supabase Operations Skill

**Purpose:** Comprehensive database management, optimization, and administration for Supabase  
**Version:** 2.0.0  
**Created:** 2025-12-04  
**Updated:** 2025-12-19

---

## Level 1: Quick Reference (0-2KB)

### MCP Authentication Quick Setup

```bash
# Method 1: Dynamic (Default) - Just configure URL
# MCP client will prompt for browser login
# config: { "type": "http", "url": "https://mcp.supabase.com/mcp" }

# Method 2: PAT (CI/Automation)
# 1. Get token from: https://supabase.com/dashboard/account/tokens
# 2. Set environment variable:
export SUPABASE_ACCESS_TOKEN="your-token"
export SUPABASE_PROJECT_REF="your-project-ref"

# Verify connection
supabase projects list  # Should show your projects
```

### Essential CLI Commands

```bash
# Authentication & Project Management
supabase login                        # Authenticate with Supabase
supabase link --project-ref <ref>     # Link to existing project
supabase status                       # Check connection status
supabase projects list                # List all projects

# Database Operations
supabase db reset                     # Reset to clean state (CAUTION)
supabase db push                      # Push local migrations to remote
supabase db pull                      # Pull remote schema to local
supabase db diff                      # Show schema differences

# Migration Management
supabase migration new <name>         # Create new migration
supabase migration list               # List all migrations
supabase migration repair --status applied <version>  # Fix migration state

# Type Generation
supabase gen types typescript --local > src/types/database.ts
```

### Quick Diagnostics

| Task | Command/Query |
|------|---------------|
| Check table sizes | `SELECT pg_size_pretty(pg_total_relation_size(tablename))` |
| List all tables | `SELECT * FROM pg_tables WHERE schemaname = 'public'` |
| Check RLS status | `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'` |
| Active connections | `SELECT count(*) FROM pg_stat_activity` |
| Slow queries | Check Supabase Dashboard > Database > Query Performance |

### Common Issues & Fixes

| Issue | Quick Fix |
|-------|-----------|
| MCP login hangs | Use PAT method with --access-token flag |
| RLS blocking queries | Check policies: `SELECT * FROM pg_policies` |
| Type mismatch | Regenerate types: `supabase gen types typescript` |
| Migration conflict | `supabase migration repair` |
| Connection timeout | Check connection pooling settings |
| Realtime not working | Verify `ALTER PUBLICATION supabase_realtime ADD TABLE <table>` |

---

## Level 2: Detailed Guide (2-5KB)

### MCP Authentication Deep Dive

#### Dynamic Client Registration (Browser-Based)
```json
// .claude/mcp.json or claude_desktop_config.json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```
- MCP client handles OAuth flow automatically
- Best for interactive development
- Choose correct organization during login

#### PAT Authentication (CI/Automation)
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token", "${SUPABASE_ACCESS_TOKEN}",
        "--project-ref", "${SUPABASE_PROJECT_REF}"
      ]
    }
  }
}
```

#### SSE Transport (Browser MCP Connect)
```bash
# Terminal 1: Start supergateway
npx -y supergateway \
  --stdio "npx -y @supabase/mcp-server-supabase@latest --access-token $SUPABASE_ACCESS_TOKEN" \
  --port 8000 \
  --baseUrl http://localhost:8000 \
  --ssePath /sse \
  --messagePath /message \
  --cors
```

```json
// MCP client config for local SSE
{
  "mcpServers": {
    "supabase-local": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "http://localhost:8000/sse", "--transport", "sse", "--allow-http"]
    }
  }
}
```

#### OAuth App (Custom Integrations)
1. Navigate to: `https://supabase.com/dashboard/org/{org}/apps`
2. Create new OAuth application
3. Grant all required scopes
4. Use client ID and secret in MCP client

### Schema Management

#### Creating Tables with Best Practices

```sql
-- Standard table with timestamps, soft delete, and RLS ready
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Auto-update timestamp trigger
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
```

#### Standard Update Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Row Level Security (RLS) Patterns

#### User-Owned Data Pattern

```sql
CREATE POLICY "Users can view own resources"
  ON public.resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = user_id);
```

#### Role-Based Access Pattern

```sql
CREATE POLICY "Admins can view all"
  ON public.resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Service Role Bypass

```sql
CREATE POLICY "Service role has full access"
  ON public.resources FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### Index Optimization

```sql
-- Single column index
CREATE INDEX idx_resources_user_id ON public.resources(user_id);

-- Composite index for common query patterns
CREATE INDEX idx_resources_user_status ON public.resources(user_id, status);

-- Partial index for active records only
CREATE INDEX idx_resources_active ON public.resources(user_id) 
  WHERE deleted_at IS NULL;

-- GIN index for JSONB columns
CREATE INDEX idx_resources_metadata ON public.resources USING GIN(metadata);

-- Text search index
CREATE INDEX idx_resources_name_search ON public.resources 
  USING GIN(to_tsvector('english', name));
```

### Storage Bucket Management

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Level 3: Complete Reference (5KB+)

### MCP Security Configuration

#### Read-Only Mode
```json
{
  "mcpServers": {
    "supabase-readonly": {
      "command": "npx",
      "args": [
        "-y", "@supabase/mcp-server-supabase@latest",
        "--access-token", "${SUPABASE_ACCESS_TOKEN}",
        "--project-ref", "${SUPABASE_PROJECT_REF}",
        "--read-only"
      ]
    }
  }
}
```

#### Feature Group Control
Available tool groups: `sql`, `migrations`, `auth`, `storage`, `edge-functions`, `logs`

```json
{
  "mcpServers": {
    "supabase-limited": {
      "command": "npx",
      "args": [
        "-y", "@supabase/mcp-server-supabase@latest",
        "--access-token", "${SUPABASE_ACCESS_TOKEN}",
        "--enable-tools", "sql,migrations"
      ]
    }
  }
}
```

#### Security Checklist
- [ ] Never connect to production data
- [ ] Use development projects only
- [ ] Enable read-only for real data
- [ ] Scope to specific project
- [ ] Disable unused tool groups
- [ ] Use branching for safe testing
- [ ] Never give MCP to end users

### Database Functions

#### Atomic Counter Function

```sql
CREATE OR REPLACE FUNCTION increment_counter(row_id UUID, amount INT DEFAULT 1)
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE public.counters
  SET count = count + amount
  WHERE id = row_id
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Search Function with Pagination

```sql
CREATE OR REPLACE FUNCTION search_resources(
  search_query TEXT,
  page_size INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    ts_rank(to_tsvector('english', r.name), plainto_tsquery(search_query)) as rank
  FROM public.resources r
  WHERE to_tsvector('english', r.name) @@ plainto_tsquery(search_query)
    AND r.deleted_at IS NULL
  ORDER BY rank DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Realtime Configuration

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Check realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Edge Functions Pattern

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Your logic here

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Performance Monitoring Queries

```sql
-- Table sizes with indexes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- Unused indexes (candidates for removal)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public';

-- Cache hit ratio (should be > 99%)
SELECT
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

### Migration Best Practices

```sql
-- Migration: 20241204000000_add_feature.sql

-- Up migration
BEGIN;

-- Add new column with default
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;

-- Create index concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resources_priority ON public.resources(priority);

-- Update existing data if needed
UPDATE public.resources SET priority = 1 WHERE status = 'active';

COMMIT;

-- Down migration (in separate file or comment)
-- BEGIN;
-- DROP INDEX IF EXISTS idx_resources_priority;
-- ALTER TABLE public.resources DROP COLUMN IF EXISTS priority;
-- COMMIT;
```

### Backup & Restore

```bash
# Export schema only
supabase db dump -f schema.sql --schema-only

# Export data only
supabase db dump -f data.sql --data-only

# Full backup
supabase db dump -f backup.sql

# Restore (use with caution)
psql $DATABASE_URL < backup.sql
```

### Connection Pooling Configuration

| Pool Mode | Use Case |
|-----------|----------|
| Transaction | Default, best for serverless |
| Session | Long-running connections |
| Statement | Simple queries only |

```
# Connection string patterns
# Direct (for migrations)
postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Pooler - Transaction mode (for app)
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Pooler - Session mode
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### Client-Side Query Patterns

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Select with filtering
const { data, error } = await supabase
  .from('resources')
  .select('id, name, profiles(name, avatar_url)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range(0, 9)

// Upsert pattern
const { data, error } = await supabase
  .from('resources')
  .upsert({ id: existingId, name: 'Updated' }, { onConflict: 'id' })

// RPC call
const { data, error } = await supabase
  .rpc('search_resources', { search_query: 'test', page_size: 10 })

// Realtime subscription
const channel = supabase
  .channel('resources-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'resources' },
    (payload) => console.log(payload)
  )
  .subscribe()
```

---

## Audit Checklist

### Pre-Production Database Audit

- [ ] MCP connection configured and tested
- [ ] All tables have RLS enabled
- [ ] RLS policies tested for all user roles
- [ ] Indexes created for frequently queried columns
- [ ] Foreign key constraints properly set
- [ ] Cascade deletes configured appropriately
- [ ] Updated_at triggers on all mutable tables
- [ ] TypeScript types generated and current
- [ ] Connection pooling configured
- [ ] Backup strategy in place
- [ ] Edge functions deployed and tested

### Security Checklist

- [ ] Service role key never exposed to client
- [ ] Anon key only used for public operations
- [ ] JWT expiry configured appropriately
- [ ] Rate limiting enabled
- [ ] Storage bucket policies reviewed
- [ ] No sensitive data in public buckets
- [ ] MCP scoped to development project only

---

## Related Skills

- **deployment-ops** - Database deployment workflows
- **environment-ops** - Supabase environment variables
- **testing-ops** - Database testing strategies
- **monitoring-ops** - Database health monitoring

---

**Last Updated:** 2025-12-19
