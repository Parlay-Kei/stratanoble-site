# Test Utilities

## db-reset.ts

Production-safe database reset utility for integration tests.

### Quick Start

```typescript
import { testReset } from '@/lib/test/db-reset';

// Reset all tables
await testReset();

// Reset specific tables
await testReset({ tables: ['user_actions', 'clients'] });
```

### Requirements

1. `NODE_ENV=test`
2. `TEST_ENV=true`
3. Test Supabase project (not production)
4. Service role key with proper permissions

### Setup

1. Run the SQL from `CREATE_TEST_RESET_FUNCTION_SQL` in your **TEST** Supabase project
2. Set environment variables:
   ```bash
   export TEST_ENV=true
   export NODE_ENV=test
   ```

### Guardrails

- ✅ Only works in test environments
- ✅ Validates project ref
- ✅ Blocks production URLs
- ✅ Schema isolation for parallel workers

**Never run this in production!**
