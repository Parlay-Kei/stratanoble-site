# Supabase Project Configuration

## Project Details

- **Project Name**: StrataNoble
- **Project URL**: https://bvneqoevtwodyfqglpzi.supabase.co
- **Project Reference**: `bvneqoevtwodyfqglpzi`
- **Region**: `us-west-1` (inferred from project URL)
- **Database**: PostgreSQL 15
- **Created**: January 2025

## Environment Variables

### Required for All Environments

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bvneqoevtwodyfqglpzi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzM4OTQsImV4cCI6MjA2NzAwOTg5NH0.7yTUwwa7UMfX5-ZBvG9T8LWDsst9SjQ2P0MON6iWTkw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMzg5NCwiZXhwIjoyMDY3MDA5ODk0fQ.nuRSCa-USL25H7_8qgFjFs4noMUHVPIlD8Yz2Z2CGuQ
```

### Database Connection

```bash
# Direct Database Connection (for migrations, debugging)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.bvneqoevtwodyfqglpzi.supabase.co:5432/postgres
```

**Note**: Replace `[YOUR-PASSWORD]` with the actual database password: `Anewday4Me2day!`

## Local Development

### Supabase CLI Setup

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to project**:
   ```bash
   cd infra/supabase
   supabase link --project-ref bvneqoevtwodyfqglpzi
   ```

4. **Start local development**:
   ```bash
   supabase start
   ```

### Local vs Production

- **Local**: Uses local Supabase instance on ports 54321-54324
- **Production**: Uses hosted Supabase project at `bvneqoevtwodyfqglpzi.supabase.co`

## Database Schema

The project uses the following schemas:

- **`public`**: Main application tables and functions
- **`auth`**: Authentication and user management
- **`storage`**: File storage and management
- **`realtime`**: Real-time subscriptions

## Security

### Row Level Security (RLS)

- All tables have RLS enabled by default
- Policies are defined per table and operation
- Service role key bypasses RLS for admin operations

### API Keys

- **Anonymous Key**: Safe for client-side use, respects RLS policies
- **Service Role Key**: Full database access, bypasses RLS (server-side only)

## Monitoring and Logs

### Access Logs

- **Dashboard**: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi
- **Logs**: Available in project dashboard under "Logs" section
- **Metrics**: Database performance and API usage metrics

### Health Checks

```bash
# Check project status
curl https://bvneqoevtwodyfqglpzi.supabase.co/rest/v1/

# Check auth status
curl https://bvneqoevtwodyfqglpzi.supabase.co/auth/v1/health
```

## Backup and Recovery

### Database Backups

- **Automatic**: Daily backups retained for 7 days
- **Manual**: Create via dashboard or CLI
- **Point-in-time**: Available for disaster recovery

### Migration Strategy

1. **Development**: Test migrations locally first
2. **Staging**: Apply to staging environment
3. **Production**: Apply during maintenance window

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if project is paused
2. **Authentication Failed**: Verify API keys are correct
3. **Rate Limited**: Check usage limits in dashboard

### Support

- **Documentation**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Issues**: https://github.com/supabase/supabase/issues

## Cost Management

- **Free Tier**: 500MB database, 2GB bandwidth
- **Pro Tier**: $25/month for additional resources
- **Usage Monitoring**: Available in project dashboard

## Integration Points

### Frontend (Next.js)

```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from '@strata-noble/utils';

const supabase = createClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### Backend (API Routes)

```typescript
import { createClient } from '@supabase/supabase-js';
import { requireServerSecret } from '@strata-noble/utils';

const supabaseAdmin = createClient(
  requireServerSecret('NEXT_PUBLIC_SUPABASE_URL'),
  requireServerSecret('SUPABASE_SERVICE_ROLE_KEY')
);
```

### Database Migrations

```bash
# Generate migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset
```
