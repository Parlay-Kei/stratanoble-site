# P0 Security Hotfix: Supabase Admin Client

## Status: IMPLEMENTED

## Summary

Fixed critical security vulnerability where Supabase admin client would silently fall back to anon key when `SUPABASE_SERVICE_ROLE_KEY` was missing, potentially allowing privilege escalation attacks.

## Changes Made

### 1. Updated `apps/website/src/lib/supabase.ts`

**Lines Changed**: 11-75

**Changes**:
- Added `validateAdminEnvVars()` function to check environment configuration
- Modified `getSupabaseAdmin()` to:
  - Throw error in production if `SUPABASE_SERVICE_ROLE_KEY` is missing
  - Warn in development but allow fallback to anon key
  - Add clear security messaging in errors and warnings

**Impact**:
- **BREAKING in production**: Deployments without `SUPABASE_SERVICE_ROLE_KEY` will now fail loudly (intended behavior)
- **No change in development**: Still allows fallback with warning
- **No change to existing `db` helpers**: All existing code continues to work

### 2. Created `apps/website/src/lib/supabase/server.ts`

**New File**: 178 lines

**Exports**:
- `createAdminClient()` - Factory function for admin Supabase client
- `validateAdminConfig()` - Validates environment variables
- `healthCheckAdmin()` - Tests admin client connection
- `withAdminClient()` - Wrapper for server actions

**Features**:
- Server-only module (`'use server'` directive)
- Client-side usage prevention
- Production-only service role key requirement
- Health check with database connection test
- Comprehensive error messaging

### 3. Created `apps/website/src/lib/supabase/validate-config.ts`

**New File**: 92 lines

**Exports**:
- `validateSupabaseConfigOrThrow()` - Throws on invalid config (for startup)
- `validateSupabaseConfig()` - Returns validation result (for monitoring)
- CLI tool for pre-deployment validation

**Features**:
- Startup validation support
- Production health checks
- Development warnings
- CLI interface for CI/CD integration

### 4. Created `apps/website/SUPABASE_ADMIN_SECURITY_MIGRATION.md`

**New File**: Migration guide and documentation

**Contents**:
- Problem description
- Solution overview
- Migration steps for existing and new code
- Environment variable requirements
- Validation and health check usage
- Security best practices
- Troubleshooting guide

## Security Impact

### Before (VULNERABLE)
```typescript
// Silent fallback - security risk
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

### After (SECURE)
```typescript
// Fail loudly in production
if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations in production...');
}
```

## Deployment Requirements

### Production Checklist

- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` environment variable
- [ ] Run `npm run validate:supabase` before deploying (optional but recommended)
- [ ] Verify health checks pass after deployment

### Development Setup

No changes required. Development can continue with or without service role key:

```bash
# Option 1: Without service role key (will show warning)
npm run dev

# Option 2: With service role key (recommended)
# Add to .env.local:
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Testing

### Automated Tests Needed

1. **Unit Tests**:
   - `validateAdminEnvVars()` returns errors when keys missing
   - `createAdminClient()` throws in production without service role key
   - `createAdminClient()` throws when called from client-side

2. **Integration Tests**:
   - `healthCheckAdmin()` succeeds with valid credentials
   - `healthCheckAdmin()` fails with invalid credentials
   - Admin operations succeed with service role key

3. **E2E Tests**:
   - Deployment fails without service role key in production
   - Webhook handlers work correctly with admin client
   - API routes using `db` helpers continue to function

## Risk Assessment

### High Risk Areas (Require Testing)

1. **Stripe Webhooks**:
   - `apps/website/src/app/api/stripe/webhook/route.ts`
   - `apps/website/src/app/api/queues/stripe/route.ts`
   - Uses `handleStripeEvent()` and `db` helpers

2. **CRM Endpoints**:
   - `apps/website/src/app/api/crm/leads/route.ts`
   - `apps/website/src/app/api/crm/leads/[id]/route.ts`
   - Uses `db.createLead()`, `db.updateLead()`, etc.

3. **Email Sequences**:
   - `apps/website/src/app/api/crm/email-sequences/route.ts`
   - Uses `db.scheduleEmailSequences()`

### Low Risk Areas

1. **Client Components**: No changes to client-side code
2. **Read Operations**: Existing patterns continue to work
3. **Development Environment**: Allows fallback with warnings

## Rollback Plan

If issues arise in production:

1. **Immediate**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. **Emergency**: Revert to previous version of `apps/website/src/lib/supabase.ts`
3. **Investigation**: Check deployment logs for environment variable issues

## Monitoring

### Key Metrics to Watch

1. **Error Rate**: Monitor for new "SUPABASE_SERVICE_ROLE_KEY is required" errors
2. **Admin Operations**: Ensure db operations succeed at same rate as before
3. **Webhook Processing**: Monitor Stripe webhook success rate
4. **API Response Times**: Ensure no performance degradation

### Log Alerts to Configure

```
# Production error requiring immediate attention
ERROR: "SUPABASE_SERVICE_ROLE_KEY is required for admin operations in production"

# Development warning (informational only)
WARN: "[SECURITY WARNING] SUPABASE_SERVICE_ROLE_KEY not set in development"
```

## Next Steps

1. **Immediate**:
   - Review this summary
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set in all production environments
   - Deploy to staging first

2. **Short-term**:
   - Add validation script to CI/CD pipeline
   - Add health check to monitoring dashboard
   - Write unit tests for validation functions

3. **Long-term**:
   - Migrate API routes to use `createAdminClient()` pattern (optional)
   - Add key rotation procedure to runbook
   - Document in team security guidelines

## Files Modified

| File | Status | Lines Changed |
|------|--------|---------------|
| `apps/website/src/lib/supabase.ts` | Modified | ~64 lines |
| `apps/website/src/lib/supabase/server.ts` | Created | 178 lines |
| `apps/website/src/lib/supabase/validate-config.ts` | Created | 92 lines |
| `apps/website/SUPABASE_ADMIN_SECURITY_MIGRATION.md` | Created | Documentation |
| `apps/website/SECURITY_HOTFIX_SUMMARY.md` | Created | This file |

## Related Documentation

- [Supabase Admin Security Migration Guide](./SUPABASE_ADMIN_SECURITY_MIGRATION.md)
- [Supabase Service Role Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Next.js Server Actions Security](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#security)

## Contact

For questions or issues related to this hotfix, contact the backend team or refer to the migration guide.

---

**Hotfix Date**: 2026-01-01
**Severity**: P0 (Critical Security Fix)
**Environment Impact**: Production deployments require `SUPABASE_SERVICE_ROLE_KEY`
