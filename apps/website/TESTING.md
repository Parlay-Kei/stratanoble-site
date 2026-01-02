# Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:ci

# Run specific test file
npm test -- middleware.test.ts

# Watch mode
npm test -- --watch
```

## Test Categories

### Unit Tests
Fast, isolated tests with no external dependencies.

**Location:** `src/__tests__/**/*.test.ts`

**Run:** `npm run test:unit`

**Examples:**
- `security-core.test.ts` - Input validation, XSS protection
- `middleware.test.ts` - Middleware security functionality
- `lib/__tests__/validators.test.ts` - Schema validation

### Integration Tests
Tests that interact with real services (database, APIs).

**Location:** `**/*.integration.test.ts`

**Run:** `npm run test:integration`

**Setup:**
- Requires test database
- Uses dedicated test schema
- Runs serially to avoid conflicts

### E2E Tests
Full browser automation tests.

**Location:** `tests/e2e/**/*.spec.ts`

**Run:** `npm run test:e2e` (Playwright)

## Middleware Security Tests

### Critical Tests

#### 1. Middleware Bypass Detection
```typescript
it('should NOT have early return bypass in middleware')
```
**Purpose:** Ensures middleware is not bypassed with early returns
**Status:** 🚨 Currently FAILING - middleware bypassed on line 131
**Impact:** HIGH - Disables all rate limiting and auth checks

#### 2. Protected Route Authentication
```typescript
it('should redirect to auth when unauthenticated')
```
**Purpose:** Validates `/achievery/*` routes require authentication
**Status:** ⚠️ Auth currently disabled (temporary)

#### 3. Rate Limit Headers
```typescript
it('should include rate limit headers on API route')
```
**Purpose:** Ensures API responses include rate limiting headers
**Required Headers:**
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

#### 4. Public Route Access
```typescript
it('should allow access to public route')
```
**Purpose:** Validates public routes work without authentication
**Routes Tested:**
- `/` (homepage)
- `/pricing`
- `/about`
- `/achievery/auth`
- `/api/health`

### Test Coverage

```typescript
// middleware.test.ts covers:

✅ Middleware bypass detection
✅ Public route access (5+ routes)
✅ Protected route authentication (3+ routes)
✅ Rate limiting headers
✅ Client IP detection (cf-connecting-ip, x-real-ip, x-forwarded-for)
✅ Deep link handling
✅ Environment-based behavior
✅ Error handling (fail open)
✅ Cookie-based authentication
✅ Route matcher configuration
✅ Rate limit configuration
```

## Security Core Tests

### Test Coverage

```typescript
// security-core.test.ts covers:

✅ SQL injection prevention
✅ XSS prevention
✅ Buffer overflow prevention
✅ Command injection handling
✅ Null/undefined handling
✅ Nested object injection
✅ Error information disclosure
✅ Rate limiting logic
✅ CSRF token structure
✅ Security headers (CSP, HSTS)
✅ JWT token validation
✅ Password strength validation
✅ Origin validation
```

## Writing Tests

### Test Structure

```typescript
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Test Category', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something specific', async () => {
    const req = createMockRequest('http://localhost:3000/api/test');
    const response = await middleware(req);

    expect(response.status).toBe(200);
  });
});
```

### Mock Request Helper

```typescript
function createMockRequest(url: string, options?: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  method?: string;
}): NextRequest
```

**Usage:**
```typescript
const req = createMockRequest('http://localhost:3000/api/test', {
  headers: {
    'x-forwarded-for': '203.0.113.1',
  },
  cookies: {
    'sb-access-token': 'mock-token',
  },
  method: 'POST',
});
```

## Test Patterns

### Testing Middleware Response

```typescript
const response = await middleware(req);

expect(response).toBeDefined();
expect(response.status).toBe(200);
expect(response.headers.get('x-ratelimit-limit')).toBeDefined();
```

### Testing Redirects

```typescript
const location = response.headers?.get?.('location');
expect(location).toContain('/achievery/auth');

const redirectUrl = new URL(location);
expect(redirectUrl.searchParams.get('redirectTo')).toBe('/achievery/dashboard');
```

### Testing Rate Limits

```typescript
expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
```

### Testing Client IP

```typescript
const forwardedFor = req.headers.get('x-forwarded-for');
const clientIP = forwardedFor?.split(',')[0].trim();
expect(clientIP).toBe('203.0.113.1');
```

## Environment Configuration

### Test Environment Variables

```env
NODE_ENV=test
UPSTASH_REDIS_REST_URL=https://mock-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=mock-token
```

### Override in Tests

```typescript
beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.SKIP_RATE_LIMITING = 'false';
});
```

## Known Issues & Expected Failures

### 1. Middleware Bypass (CRITICAL)
**Test:** `should NOT have early return bypass in middleware`
**Status:** 🚨 FAILING
**Reason:** Line 131 in middleware.ts has `return NextResponse.next()`
**Impact:** All middleware security is bypassed
**Action Required:** Remove early return before production deployment

### 2. Achievery Auth Disabled
**Test:** `should redirect to auth when unauthenticated`
**Status:** ⚠️ SKIPPED (auth disabled)
**Reason:** Edge Runtime compatibility issue
**Impact:** Protected routes not enforcing auth
**Action Required:** Re-enable after Edge Runtime fix

## CI/CD Integration

### Pre-commit Checks
```bash
npm run lint
npm run type-check
npm run test:unit
```

### PR Validation
```bash
npm run test:ci
npm run test:check-cleanup
npm run test:check-boundaries
```

### Pre-deployment
```bash
npm run test:integration
npm run test:e2e
```

## Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- --testNamePattern="should NOT have early return"
```

### Debug in VS Code
Add breakpoint and run with debugger:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Current File",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["${fileBasename}", "--runInBand"],
  "console": "integratedTerminal"
}
```

## Test Maintenance

### Adding New Tests

1. Create test file in `__tests__` directory
2. Import required modules
3. Write descriptive test cases
4. Run tests to verify
5. Update this documentation

### Updating Existing Tests

1. Understand what the test validates
2. Make changes carefully
3. Verify tests still pass
4. Update test documentation if needed

### Deprecating Tests

1. Mark test with `.skip` if temporarily disabled
2. Add comment explaining why
3. Create issue to track re-enabling
4. Remove completely only after confirming unnecessary

## Performance

### Test Execution Time

- Unit tests: ~5 seconds
- Integration tests: ~30 seconds
- E2E tests: ~2-5 minutes

### Optimization Tips

- Use `it.skip()` to temporarily disable slow tests
- Run unit tests in parallel (default)
- Run integration tests serially (configured)
- Use `--maxWorkers=4` to limit parallelism

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Playwright E2E](https://playwright.dev/)

## Support

Questions? Issues?

1. Check test README: `src/__tests__/README.md`
2. Review existing test files
3. Consult security documentation
4. Open issue with `testing` label
