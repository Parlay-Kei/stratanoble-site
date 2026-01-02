# Supabase Admin Client Security Migration Guide

## Overview

This document describes the P0 security hotfix that prevents the Supabase admin client from silently falling back to the anon key when the service role key is missing.

## The Problem

Previously, `apps/website/src/lib/supabase.ts` had this dangerous fallback:

```typescript
// BEFORE (INSECURE)
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

This meant:
- If `SUPABASE_SERVICE_ROLE_KEY` was missing in production, the admin client would silently use the anon key
- Admin operations would fail due to insufficient permissions
- Security breach: An attacker could potentially trigger admin operations that shouldn't be allowed
- Silent failures made debugging extremely difficult

## The Solution

### 1. Updated `apps/website/src/lib/supabase.ts`

The existing admin client now:
- **Throws an error** in production if `SUPABASE_SERVICE_ROLE_KEY` is missing
- **Warns in development** but allows fallback for local development
- Provides `validateAdminEnvVars()` function for configuration validation

```typescript
// AFTER (SECURE)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is required for admin operations in production. ' +
    'This prevents privilege escalation attacks. Configure the service role key immediately.'
  );
}

if (!serviceRoleKey) {
  console.warn('[SECURITY WARNING] SUPABASE_SERVICE_ROLE_KEY not set in development...');
}
```

### 2. Created `apps/website/src/lib/supabase/server.ts`

A new server-only module with:
- `createAdminClient()` - Factory function for creating admin clients
- `validateAdminConfig()` - Validates environment variables
- `healthCheckAdmin()` - Tests admin client connection
- `withAdminClient()` - Wrapper for server actions

This module uses the `'use server'` directive to ensure it's only bundled for server-side code.

### 3. Created `apps/website/src/lib/supabase/validate-config.ts`

Configuration validation utilities:
- `validateSupabaseConfigOrThrow()` - For startup validation
- `validateSupabaseConfig()` - For monitoring/reporting
- CLI tool for pre-deployment checks

## Migration Steps

### For Existing Code

**No immediate changes required.** The existing `db` helper functions in `apps/website/src/lib/supabase.ts` continue to work as before.

### For New Server Actions

When creating new server actions, prefer the new secure pattern:

```typescript
// NEW PATTERN (Recommended)
'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function myServerAction(userId: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
```

Or use the wrapper pattern:

```typescript
// WRAPPER PATTERN
import { withAdminClient } from '@/lib/supabase/server';

export const myServerAction = withAdminClient(async (admin, userId: string) => {
  const { data, error } = await admin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
});
```

### For API Routes

API routes can continue using the existing `db` helpers or migrate to the new pattern:

```typescript
// EXISTING PATTERN (Still works)
import { db } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const lead = await db.createLead({
    name: 'John Doe',
    email: 'john@example.com',
    // ...
  });

  return NextResponse.json(lead);
}
```

```typescript
// NEW PATTERN (Recommended for new code)
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('leads')
    .insert([{ name: 'John Doe', email: 'john@example.com' }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return NextResponse.json(data);
}
```

## Environment Variables

### Required in Production

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### Development (Optional Service Role Key)

```bash
# Development can omit SUPABASE_SERVICE_ROLE_KEY for convenience
# but you'll see a warning in the console
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Validation & Health Checks

### Startup Validation

Add to your `instrumentation.ts` or startup script:

```typescript
import { validateSupabaseConfigOrThrow } from '@/lib/supabase/validate-config';

export async function register() {
  if (process.env.NEXT_INSTRUMENTATION_STARTUP === 'true') {
    await validateSupabaseConfigOrThrow();
  }
}
```

### CLI Validation

Run before deployment:

```bash
# Validate configuration
node -r tsx/register src/lib/supabase/validate-config.ts

# Or add to package.json
npm run validate:supabase
```

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Validate Supabase Configuration
  run: npm run validate:supabase
  env:
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NODE_ENV: production
```

## Security Considerations

### Why This Matters

1. **Privilege Escalation Prevention**: The service role key bypasses Row Level Security (RLS). Using the anon key for admin operations means operations fail or succeed with wrong permissions.

2. **Fail Loudly**: By throwing errors when misconfigured, we catch issues before they reach production.

3. **Audit Trail**: All admin operations are traceable to properly authenticated service accounts.

### Best Practices

1. **Never expose service role key to client**: Only use in server-side code (API routes, server actions, server components)

2. **Use RLS policies**: Even with service role key, implement proper RLS policies for defense in depth

3. **Validate at startup**: Use validation utilities to catch configuration issues early

4. **Monitor admin operations**: Log all admin client usage for security auditing

5. **Rotate keys regularly**: Treat service role keys as sensitive credentials and rotate them periodically

## Testing

### Local Development

```bash
# Without service role key (will warn but work)
npm run dev

# With service role key (recommended)
SUPABASE_SERVICE_ROLE_KEY=your-key npm run dev
```

### Production Deployment

Before deploying, ensure:

1. `SUPABASE_SERVICE_ROLE_KEY` is set in deployment environment
2. Configuration validation passes
3. Health checks succeed

```bash
# Pre-deployment check
NODE_ENV=production npm run validate:supabase
```

## Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY is required for admin operations in production"

**Solution**: Set the `SUPABASE_SERVICE_ROLE_KEY` environment variable in your production deployment.

### Warning: "SUPABASE_SERVICE_ROLE_KEY not set in development"

**Expected in development**. You can:
- Ignore the warning if using anon key is acceptable locally
- Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` to suppress the warning

### Admin operations failing with permission errors

**Check**:
1. Is `SUPABASE_SERVICE_ROLE_KEY` set correctly?
2. Is the key valid and not expired?
3. Are RLS policies correctly configured?

## Files Changed

- `apps/website/src/lib/supabase.ts` - Updated admin client with security checks
- `apps/website/src/lib/supabase/server.ts` - New server-only admin utilities
- `apps/website/src/lib/supabase/validate-config.ts` - New configuration validation utilities
- `apps/website/SUPABASE_ADMIN_SECURITY_MIGRATION.md` - This guide

## Additional Resources

- [Supabase Service Role Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
