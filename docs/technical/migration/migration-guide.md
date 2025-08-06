# Database Migration Guide

This project uses Supabase CLI migrations to manage database schema changes in a code-first approach.

## 🏗️ Migration Structure

Our database schema is split into organized, sequential migrations:

```
supabase/migrations/
├── 0001_init_core_tables.sql    # Core business tables (customers, orders, etc.)
├── 0002_core_indexes.sql        # Performance indexes for core tables
├── 0003_core_triggers.sql       # Triggers and functions for core tables
├── 0004_core_rls.sql           # Row Level Security for core tables
├── 0005_saas_tables.sql        # SaaS-specific tables (clients, subscriptions, etc.)
├── 0006_saas_indexes.sql       # Indexes for SaaS tables
├── 0007_saas_triggers.sql      # SaaS triggers and automation
├── 0008_saas_rls.sql           # RLS policies for SaaS tables
├── 0009_saas_functions.sql     # Database functions (Stripe webhook handler)
├── 0010_seed_data.sql          # Reference data (offerings table)
└── 0011_monitoring.sql         # Monitoring and health check tables
```

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://docs.docker.com/desktop/) (for local development)
- Node.js 18+ 
- Supabase CLI (installed as dev dependency)

### Local Development

1. **Start local Supabase stack:**
   ```bash
   npm run db:start
   ```

2. **Reset database with latest migrations:**
   ```bash
   npm run db:reset
   ```

3. **Check for schema drift:**
   ```bash
   npm run db:diff
   ```

4. **Stop local stack:**
   ```bash
   npm run db:stop
   ```

### Creating New Migrations

1. **Generate new migration file:**
   ```bash
   npm run db:new your_migration_name
   ```

2. **Write your SQL changes following our patterns:**
   - Use `IF NOT EXISTS` for CREATE statements
   - Use `ON CONFLICT DO NOTHING` for INSERT statements
   - Add proper indexes and RLS policies
   - Include comments explaining the change

3. **Test locally:**
   ```bash
   npm run db:reset
   npm run db:diff  # Should show "No changes found"
   ```

4. **Commit and push:**
   ```bash
   git add supabase/migrations/
   git commit -m "feat(db): add your_migration_name"
   git push
   ```

## 📋 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run db:start` | Start local Supabase (requires Docker) |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:reset` | Apply all migrations to clean database |
| `npm run db:diff` | Check for schema drift |
| `npm run db:push` | Deploy migrations to linked cloud project |
| `npm run db:combine` | Generate single SQL file for testing |
| `npm run db:validate` | Validate migration files |
| `npm run db:new` | Create new migration file |

## 🌐 Production Deployment

### One-time Setup

1. **Link your cloud project:**
   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   ```

### Deploy Migrations

```bash
npm run db:push
```

This applies only new migrations to your cloud database.

## 📏 Migration Best Practices

### ✅ DO

- **Use descriptive names:** `0012_add_user_preferences.sql`
- **One concern per file:** Keep related changes together
- **Make migrations idempotent:** Use `IF NOT EXISTS`, `ON CONFLICT`
- **Add proper indexes:** Consider query performance
- **Include RLS policies:** Security-first approach
- **Test thoroughly:** Reset and diff locally

### ❌ DON'T

- **Edit applied migrations:** Create new migration instead
- **Skip version numbers:** Keep sequential order
- **Forget RLS:** Every table needs security policies
- **Ignore conflicts:** Handle data collisions gracefully
- **Rush to production:** Always test locally first

## 🔒 Security Considerations

All tables have Row Level Security (RLS) enabled:

- **Service Role:** Full access (for server-side operations)
- **Authenticated Users:** Limited to their own data via `auth.uid()`
- **Anonymous Users:** No access (except where explicitly allowed)

## 🧪 Testing Strategy

### Automated Testing

- **CI Pipeline:** Validates migration syntax and structure
- **Drift Detection:** Ensures migrations match actual schema
- **Naming Validation:** Enforces consistent file naming

### Manual Testing

1. **Local Reset Test:**
   ```bash
   npm run db:reset
   npm run db:diff  # Should be clean
   ```

2. **Integration Test:**
   ```bash
   node scripts/test-supabase-integration.js
   ```

3. **Combined Schema Review:**
   ```bash
   npm run db:combine
   # Review database/combined_migrations.sql
   ```

## 🚨 Troubleshooting

### Common Issues

**Docker not found:**
```bash
# Install Docker Desktop and ensure it's running
# Or use manual validation:
npm run db:combine
npm run db:validate
```

**Migration conflicts:**
```bash
# Check current cloud schema
npx supabase db pull
# Compare with local migrations
npm run db:diff
```

**RLS policy errors:**
```bash
# Ensure service role key is used for admin operations
# Check policy syntax in migration files
```

### Emergency Procedures

**Rollback strategy:**
- Migrations are append-only
- Create new migration to undo changes
- Never edit existing migration files

**Schema drift resolution:**
```bash
# Generate migration from current cloud state
npx supabase db diff -f new_migration_name
# Review and apply the generated migration
```

## 📈 Monitoring

- **Health Checks:** Monitor `service_health_summary` view
- **Migration Status:** Check `stripe_event_log` for webhook processing
- **Performance:** Review query performance after index changes

## 🔄 CI/CD Integration

GitHub Actions automatically:
- Validates migration file structure
- Checks for sensitive data leaks
- Verifies migration order
- Tests schema consistency (when Docker available)

See `.github/workflows/database-drift.yml` for details.

---

## 📚 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)