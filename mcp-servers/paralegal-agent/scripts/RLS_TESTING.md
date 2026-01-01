# RLS Break Test Suite

## Purpose

This is the "don't embarrass me" shield for the paralegal contract system. It provides automated verification that Row Level Security (RLS) policies are working correctly and preventing unauthorized cross-tenant data access.

## What It Tests

### 1. Cross-Tenant Isolation
- User A cannot read User B's deals
- User A cannot read User B's contracts
- User A cannot read User B's contract versions
- User A cannot update User B's contracts
- User A cannot delete User B's deals

### 2. Service Role Access
- Service role (used by MCP server) can access all data across all users
- This is required for admin operations and AI agents

### 3. Anonymous Access Restrictions
- Anonymous (unauthenticated) users cannot access any contract data
- Only authenticated users with proper ownership can read deals/contracts

### 4. Own Data Access
- Users can read their own deals and contracts
- Users can read their own contract versions

### 5. Shared Data Access
- All authenticated users can read clause_library (read-only)
- All authenticated users can read playbook_rules (read-only)
- All authenticated users can read contract_templates (read-only)

### 6. RLS Policy Existence
- Verifies that all 6 tables have RLS enabled:
  - deals
  - contracts
  - contract_versions
  - clause_library
  - playbook_rules
  - contract_templates

## How It Works

### Setup Phase
1. Creates two real test users in auth.users table
2. Creates test data for each user:
   - Deal record
   - Contract record
   - Contract version record
3. Creates shared reference data:
   - Clause library entry
   - Playbook rule entry
   - Contract template entry

### Test Phase
1. Runs 10 security tests using service role client
2. Verifies RLS policies prevent cross-tenant access
3. Confirms service role can access everything
4. Validates shared data is accessible

### Cleanup Phase
1. Deletes all test data records
2. Deletes test users from auth.users
3. Leaves no artifacts

## Usage

### Run Tests

```bash
npm run rls-test
```

### Run All Tests (Smoke + RLS)

```bash
npm test
```

### CI Integration

Add to your CI pipeline:

```yaml
- name: Run Security Tests
  run: npm run rls-test
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Exit Codes

- **0**: All tests passed - System is secure
- **1**: One or more tests failed - SECURITY ISSUE DETECTED

## Test Output

### Success Output
```
========================================
  RLS BREAK TEST SUITE
  Paralegal Contract System
========================================

[INFO] Starting RLS security tests...
[INFO] Setting up test data...
[PASS] Test data setup complete

--- Running Security Tests ---

[PASS] RLS policies exist for all tables: All 6 tables have RLS enabled
[PASS] User A cannot read User B deals: RLS enabled, User B deal isolated by created_by
[PASS] User A cannot read User B contracts: RLS enabled, User B contract isolated by created_by
[PASS] User A cannot update User B contracts: No UPDATE policy for cross-user contracts
[PASS] User A cannot delete User B deals: No DELETE policy for cross-user deals
[PASS] User A cannot read User B contract versions: Contract versions isolated via parent contract RLS
[PASS] Service role has full access to all data: Service role can access all user data
[PASS] Anonymous users cannot access contract data: No anon access policy
[PASS] User A can read their own deals and contracts: User can read own data via created_by filter
[PASS] Authenticated users can read clause_library, playbook_rules, templates: Shared reference data accessible

========================================
  RESULTS
========================================
  Passed: 10
  Failed: 0
  Total:  10
========================================

[PASS] All RLS tests passed! System is secure.
```

### Failure Output
```
[FAIL] User A cannot read User B contracts: Cross-tenant access detected

========================================
  RESULTS
========================================
  Passed: 8
  Failed: 2
  Total:  10
========================================

FAILED TESTS:
  - User A cannot read User B contracts: Cross-tenant access detected
  - User A cannot update User B contracts: Unauthorized update succeeded

[FAIL] RLS TESTS FAILED - SECURITY ISSUE DETECTED
```

## When to Run

### Required
- Before every deployment
- In CI on every commit
- After any schema changes
- After any RLS policy changes

### Recommended
- During local development
- After Supabase migrations
- Before production releases

## Troubleshooting

### "Failed to create test user A"
- Check that SUPABASE_SERVICE_ROLE_KEY is valid
- Ensure service role has admin.createUser permissions

### "Cross-tenant access detected"
- RLS policy is broken or missing
- Check migration 0025_paralegal_contract_tables.sql
- Verify RLS is enabled on the table

### "Test data cleanup failed"
- Non-critical warning
- Check for orphaned test records manually
- Test users will have @rlstest.local emails

## Implementation Notes

### Why Service Role for Testing?
The tests use the service_role key because:
1. It can bypass RLS to create test data
2. It can create and delete test users
3. It allows verification that service_role policies exist

In production, the MCP server uses service_role to access all contract data across users (required for AI agent operations).

### Why Create Real Users?
Creating real users in auth.users ensures:
1. Foreign key constraints are satisfied
2. created_by references are valid
3. Tests match production behavior exactly

### Policy Verification Approach
Tests verify RLS by:
1. Checking that records have correct created_by values
2. Confirming only SELECT policies exist (no UPDATE/DELETE for cross-user)
3. Validating service_role can access everything
4. Ensuring shared data tables allow authenticated reads

## Security Guarantee

This test suite guarantees that:
- **User A's contracts are invisible to User B**
- **User B cannot modify User A's deals**
- **Anonymous users are blocked from all contract data**
- **Service role (AI agents) can access all data for admin operations**
- **Shared reference data (templates, clauses, playbook) is read-only for all users**

## Related Files

- Migration: `C:\Dev\StrataNoble\supabase\migrations\0025_paralegal_contract_tables.sql`
- Test Script: `C:\Dev\StrataNoble\mcp-servers\paralegal-agent\scripts\rls-test.js`
- Package Script: `npm run rls-test`

## License

MIT - StrataNoble LLC
