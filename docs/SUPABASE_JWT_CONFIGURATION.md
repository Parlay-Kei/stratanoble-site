# Supabase JWT Configuration Guide

## Overview

This document describes how to configure JWT (JSON Web Token) expiry settings for the Strata Noble Supabase project to support Level A session revocation.

## Current Configuration

- **Project Name**: stratanoble-site
- **Project Reference**: `bvneqoevtwodyfqglpzi`
- **Dashboard URL**: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi
- **JWT Expiry**: 900 seconds (15 minutes)

## Why 15 Minutes?

The default JWT expiry is 1 hour (3600 seconds). For Level A session revocation, we reduce this to 15 minutes because:

1. **Session Revocation**: When users log out, `signOut({ scope: 'global' })` revokes refresh tokens immediately
2. **Access Token Gap**: However, the access JWT remains valid until expiry (stateless design)
3. **Security Window**: With 15-minute expiry, the maximum "still logged in" window after logout is 15 minutes
4. **Balance**: This balances security with user experience (tokens refresh automatically in the background)

## Configuration Methods

### Method 1: Manual Dashboard Configuration (Recommended)

1. Navigate to Auth Settings:
   ```
   https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/settings/auth
   ```

2. Scroll to "Advanced Settings" section

3. Find "Access token expiry time" (or "JWT expiry limit")

4. Change value from `3600` to `900`

5. Click "Save" to apply changes

### Method 2: Programmatic Configuration via Management API

#### Prerequisites

1. Generate a Personal Access Token (PAT):
   - Visit: https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Name: `StrataNoble JWT Config`
   - Scopes: Select `auth:write` (required for auth configuration)
   - Expiry: Choose appropriate duration (recommend: 30 days)
   - Copy the token (you won't see it again)

2. Add to environment:
   ```bash
   # Add to .env.local (DO NOT commit to git)
   SUPABASE_ACCESS_TOKEN=sbp_your_generated_token_here
   ```

#### Run the Configuration Script

```bash
# From project root
node scripts/update-jwt-expiry.mjs
```

#### Manual API Call (for reference)

```bash
# Using curl
curl -X PATCH "https://api.supabase.com/v1/projects/bvneqoevtwodyfqglpzi/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jwt_exp": 900}'
```

## Local Development Configuration

The local Supabase configuration has been updated to match production:

**File**: `supabase/config.toml`
```toml
[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 900  # 15 minutes
```

When running `supabase start`, this ensures local development matches production JWT behavior.

## Verification

### Check Current Setting (Dashboard)

1. Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/settings/auth
2. Scroll to "Advanced Settings"
3. Verify "Access token expiry time" shows `900`

### Check Current Setting (API)

```bash
curl "https://api.supabase.com/v1/projects/bvneqoevtwodyfqglpzi/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | jq '.jwt_exp'
```

Expected output: `900`

### Test JWT Expiry in Application

1. Log in to the application
2. Check the access token expiry:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Token expires at:', new Date(session.expires_at * 1000));
   ```
3. Verify expiry is approximately 15 minutes from now

## Important Notes

### Security Considerations

- **Existing Tokens**: Tokens issued before the configuration change remain valid until their original expiry
- **User Impact**: Users with active sessions will need to re-authenticate to get new 15-minute tokens
- **Refresh Behavior**: Supabase client libraries automatically refresh tokens before expiry
- **Minimum Recommended**: Supabase recommends not going below 5 minutes to avoid clock skew issues

### Production Deployment Checklist

- [ ] Update production Supabase project JWT expiry to 900 seconds
- [ ] Update local `supabase/config.toml` to match (already done)
- [ ] Test logout flow: verify access tokens become invalid within 15 minutes
- [ ] Monitor user sessions for any issues (clock skew, refresh failures)
- [ ] Document in security audit logs

### Rollback Procedure

If 15 minutes causes issues, revert to 1 hour:

```bash
# Update via API
curl -X PATCH "https://api.supabase.com/v1/projects/bvneqoevtwodyfqglpzi/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jwt_exp": 3600}'

# Update local config
# Change jwt_expiry = 900 back to jwt_expiry = 3600 in supabase/config.toml
```

## Management API Reference

- **Endpoint**: `PATCH /v1/projects/{ref}/config/auth`
- **Scope Required**: `auth:write`
- **Rate Limit**: 120 requests per minute per user
- **Documentation**: https://supabase.com/docs/reference/api/introduction

### Available Parameters

```typescript
{
  jwt_exp?: number;              // JWT expiry in seconds (recommend: 900-3600)
  site_url?: string;             // Primary site URL
  disable_signup?: boolean;      // Disable new user signups
  smtp_admin_email?: string;     // SMTP configuration
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  // ... additional SMTP and email settings
}
```

## Related Documentation

- [Supabase User Sessions](https://supabase.com/docs/guides/auth/sessions)
- [JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys)
- [JSON Web Tokens](https://supabase.com/docs/guides/auth/jwts)
- [Management API Reference](https://supabase.com/docs/reference/api/introduction)

## Troubleshooting

### Issue: "JWT Expired" errors immediately after login

**Cause**: Clock skew between client and server

**Solution**:
- Ensure system clock is synchronized (NTP)
- Consider increasing JWT expiry slightly (e.g., 1200 seconds / 20 minutes)

### Issue: Users getting logged out unexpectedly

**Cause**: Token refresh failing or expiry too short

**Solution**:
- Check browser console for refresh errors
- Verify network connectivity
- Ensure `supabase.auth.onAuthStateChange()` is properly handling token refresh

### Issue: Management API returns 429 (Rate Limit)

**Cause**: Exceeded 120 requests per minute

**Solution**:
- Wait 60 seconds before retrying
- Implement exponential backoff in automation scripts

### Issue: Management API returns 401 (Unauthorized)

**Cause**: Invalid or expired Personal Access Token

**Solution**:
- Regenerate PAT at: https://supabase.com/dashboard/account/tokens
- Ensure PAT has `auth:write` scope
- Update `SUPABASE_ACCESS_TOKEN` in `.env.local`

## Maintenance

- Review JWT expiry setting quarterly as part of security audits
- Monitor session metrics for unusual patterns
- Update this documentation when changing configuration
- Keep Personal Access Tokens rotated (recommend: 90-day expiry)
