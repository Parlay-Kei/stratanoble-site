# Configuration Management

*Last Updated: January 8, 2025*
*Status: ✅ IMPLEMENTED & PRODUCTION READY*

This document describes the centralized configuration system for StrataNoble, which provides type-safe, validated access to environment variables and secrets across the monorepo.

## Overview

The configuration system centralizes all environment variables and secrets in a single, validated interface. It supports both server-side secrets and client-safe public configuration.

## Configuration Sources

Configuration values are loaded from the following sources in order of priority:

1. **`process.env`** - Environment variables (highest priority)
2. **`secure.config.json`** - Local development secrets file (gitignored)
3. **Default values** - Fallback values defined in the schema

## Supabase Configuration

The project uses Supabase as the primary database and authentication provider:

- **Project URL**: `https://bvneqoevtwodyfqglpzi.supabase.co`
- **Region**: `us-west-1` (inferred from project URL)
- **Project Reference**: `bvneqoevtwodyfqglpzi`

### Required Supabase Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bvneqoevtwodyfqglpzia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Configuration Schema

The configuration system validates all environment variables using Zod schemas:

### Public Configuration (Client-Safe)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_BASE_URL` - Application base URL

### Server-Only Configuration
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SES_SECRET` - AWS SES secret access key
- `NEXTAUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Usage

### Server-Side Modules

Import the configuration from the utils package:

```typescript
import { config, requireServerSecret } from '@strata-noble/utils';

// Access any configuration value
const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL;

// Require server-only secrets (throws if missing)
const serviceRoleKey = requireServerSecret('SUPABASE_SERVICE_ROLE_KEY');
```

### Client-Side Modules

Use the public configuration wrapper:

```typescript
import { publicConfig } from '@/lib/public-config';

const supabaseUrl = publicConfig.supabaseUrl;
const stripeKey = publicConfig.stripePublishableKey;
```

## Local Development Setup

1. **Copy the sample configuration**:
   ```bash
   cp secure.config.sample.json secure.config.json
   ```

2. **Update with your actual values**:
   - Replace placeholder values with actual API keys
   - Keep `secure.config.json` in your `.gitignore`

3. **Environment variables take precedence**:
   - Set `process.env` variables to override `secure.config.json`
   - Useful for CI/CD and production deployments

## File Structure

```
packages/utils/src/
├── config.ts          # Centralized configuration loader
└── index.ts           # Public exports

apps/website/src/lib/
├── public-config.ts   # Client-safe configuration wrapper
└── supabase.ts        # Supabase client initialization
```

## Security Considerations

- **Never commit secrets**: `secure.config.json` is gitignored
- **Client vs Server**: Use appropriate configuration wrapper
- **Validation**: All values are validated at startup
- **Type Safety**: Full TypeScript support with autocomplete

## Error Handling

The configuration system provides clear error messages for missing or invalid values:

```typescript
// Throws descriptive error if required secret is missing
const secret = requireServerSecret('SUPABASE_SERVICE_ROLE_KEY');

// Returns undefined for optional values
const optional = config.OPTIONAL_VALUE;
```

## Migration from process.env

To migrate existing code:

1. **Server modules**: Replace `process.env.KEY` with `config.KEY`
2. **Client modules**: Replace with `publicConfig.key`
3. **Required secrets**: Use `requireServerSecret('KEY')`

## Testing

The configuration system works in all environments:

- **Development**: Loads from `secure.config.json` + `process.env`
- **Testing**: Uses test environment variables
- **Production**: Uses production environment variables

## Troubleshooting

### Common Issues

1. **Missing configuration file**: Ensure `secure.config.json` exists
2. **Validation errors**: Check that all required values are provided
3. **Client-side errors**: Use `publicConfig` instead of `config`

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_CONFIG=true
```

This will log configuration loading and validation details.
