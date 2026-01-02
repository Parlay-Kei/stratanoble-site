# Security Test Suite

Comprehensive security tests for the StrataNoble website application.

## Test Files

### `middleware.test.ts`
Tests middleware security functionality including rate limiting, authentication, and route protection.

**Test Categories:**
1. **Middleware Bypass Detection** - Critical tests to ensure middleware is not bypassed
2. **Public Route Access** - Validates public routes are accessible without auth
3. **Protected Route Authentication** - Ensures protected routes require authentication
4. **Rate Limiting Headers** - Validates rate limit headers on API responses
5. **Client IP Detection** - Tests IP extraction from various headers
6. **Deep Link Handling** - Validates deep link and universal link support
7. **Environment-based Behavior** - Tests development vs production behavior
8. **Error Handling** - Ensures middleware fails open gracefully
9. **Cookie-based Authentication** - Validates Supabase token handling

### `security-core.test.ts`
Tests core security patterns including input validation, XSS protection, and security headers.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Middleware Tests Specifically
```bash
npm test -- middleware.test.ts
```

### Run Tests with Coverage
```bash
npm run test:ci
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

## Critical Security Tests

### 🚨 Middleware Bypass Detection

The most critical test checks for early return bypasses in middleware:

```typescript
it('should NOT have early return bypass in middleware', async () => {
  const middlewareSource = middleware.toString();
  const hasEarlyReturn = /return\s+NextResponse\.next\(\)/.test(middlewareSource);
  expect(hasEarlyReturn).toBe(false);
});
```

**This test will FAIL if:**
- Middleware has `return NextResponse.next()` at the top (line 131)
- Rate limiting is disabled
- Authentication checks are bypassed

**Current Status:** ⚠️ FAILING (middleware bypassed on line 131)

### Rate Limit Headers

Validates that API routes include proper rate limiting headers:

```typescript
X-RateLimit-Limit: <number>
X-RateLimit-Remaining: <number>
X-RateLimit-Reset: <timestamp>
Retry-After: <seconds> (on 429 responses)
```

### Protected Route Redirect

Tests that unauthenticated requests to `/achievery/*` routes redirect to `/achievery/auth`:

```typescript
it('should redirect to auth when unauthenticated', async () => {
  const req = createMockRequest('http://localhost:3000/achievery/dashboard');
  const response = await middleware(req);

  const location = response.headers?.get?.('location');
  expect(location).toContain('/achievery/auth');
});
```

## Test Environment

Tests run with:
- **Jest** as test runner
- **jsdom** environment for browser APIs
- **Mocked Next.js** server utilities

Environment variables:
```env
NODE_ENV=test
UPSTASH_REDIS_REST_URL=https://mock-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=mock-token
```

## Mock Utilities

### `createMockRequest(url, options)`

Creates a mock Next.js request for testing:

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

## Test Coverage

Current coverage areas:

- ✅ Input validation (SQL injection, XSS, buffer overflow)
- ✅ Rate limiting logic and headers
- ✅ Authentication redirects
- ✅ Public route access
- ✅ Client IP detection
- ✅ Environment-based configuration
- ✅ Error handling (fail open)
- ⚠️ Middleware bypass detection (currently failing)

## Known Issues

### 1. Middleware Bypass (CRITICAL)
**Status:** 🚨 ACTIVE ISSUE
**Location:** `middleware.ts:131`
**Issue:** Early return bypasses all security checks
**Impact:** Rate limiting and auth checks disabled
**Fix:** Remove `return NextResponse.next();` on line 131

### 2. Achievery Auth Disabled
**Status:** ⚠️ TEMPORARY
**Location:** `middleware.ts:91-124`
**Issue:** `checkAchieveryAuth` always returns false
**Impact:** Protected routes not enforcing authentication
**Fix:** Re-enable Supabase auth after Edge Runtime compatibility

## Writing New Tests

### Test Structure

```typescript
describe('Test Category', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
  });

  it('should do something', async () => {
    const req = createMockRequest('http://localhost:3000/api/test');
    const response = await middleware(req);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});
```

### Test Naming Conventions

- Use descriptive test names
- Start with "should"
- Be specific about expected behavior
- Group related tests with `describe`

### Assertions

Common assertions:
```typescript
expect(response.status).toBe(200);
expect(response.headers.get('x-ratelimit-limit')).toBeDefined();
expect(location).toContain('/achievery/auth');
expect(clientIP).toBe('203.0.113.1');
```

## Integration with CI/CD

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

Required passing tests:
- ✅ All unit tests
- ✅ Security tests (except known issues)
- ✅ Integration tests

## Security Audit Checklist

Before deploying to production:

- [ ] Middleware bypass detection test passes
- [ ] Rate limiting is active (not bypassed)
- [ ] Protected routes enforce authentication
- [ ] Rate limit headers present on API responses
- [ ] CSRF protection enabled
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Input validation working
- [ ] XSS protection active
- [ ] SQL injection prevention verified

## Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## Support

For questions or issues:
1. Check existing test files for examples
2. Review middleware implementation
3. Consult security documentation
4. Open issue with `security` label
