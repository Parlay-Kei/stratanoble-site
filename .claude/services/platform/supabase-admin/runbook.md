# Supabase Admin Service

**Type**: Service (V4)
**Operator**: Platform Ops Lead

---

## Purpose

Database, auth, storage admin operations.

## Environments

| Env | Project ID | Purpose |
|-----|------------|---------|
| Dev | [id] | Development |
| Staging | [id] | Pre-prod |
| Production | [id] | Live |

## Database Operations

### Migration
```bash
# Create migration
supabase migration new [name]

# Apply migrations
supabase db push

# Reset database (dev only!)
supabase db reset
```

### Backup
```bash
# Manual backup
supabase db dump -f backup.sql

# Restore
psql -f backup.sql
```

## RLS Policies

```sql
-- Example policy
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

## Auth Configuration

| Setting | Value |
|---------|-------|
| JWT expiry | 1 hour |
| Refresh token | 7 days |
| Email confirmation | Required |
| Password min length | 8 |

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| avatars | Public | User photos |
| documents | Private | Uploads |
| assets | Public | Static assets |

## Monitoring

```bash
# Check connections
supabase db status

# View logs
supabase logs
```

## Incidents

| Issue | Resolution |
|-------|------------|
| Connection limit | Increase pool, check leaks |
| Slow queries | Analyze EXPLAIN, add indexes |
| Auth failures | Check JWT, verify config |
| Storage 403 | Check RLS policies |
