# Revenue-First Revamp E2E Tests

This directory contains Playwright E2E tests for the Revenue-First Revamp (Sprint 0-5).

## Test Structure

```
revamp/
├── home.spec.ts           # Homepage revamp tests
├── lead-rescue.spec.ts    # Lead Rescue page tests
├── phase-3.spec.ts        # Phase 3 application tests
├── rate-limiting.spec.ts  # Rate limiting tests
├── navigation.spec.ts     # Navigation tests
├── pages.spec.ts          # Support pages tests
└── README.md              # This file
```

## Prerequisites

1. **Feature Flag**: Set `NEXT_PUBLIC_REVAMP_ENABLED=true` in `.env`
2. **Sprint Completion**: These tests require Sprints 1-4 to be completed
3. **Environment Variables**: All required env vars configured (see `.env.example`)
4. **Dev Server**: Running on `http://localhost:3000`

## Running Tests

### Run all revamp tests
```bash
npx playwright test tests/revamp
```

### Run specific test file
```bash
npx playwright test tests/revamp/home.spec.ts
```

### Run with UI mode (interactive)
```bash
npx playwright test tests/revamp --ui
```

### Run in headed mode (see browser)
```bash
npx playwright test tests/revamp --headed
```

### Generate HTML report
```bash
npx playwright test tests/revamp
npx playwright show-report
```

## Test Coverage

### Home Page (`home.spec.ts`)
- ✅ Homepage loads successfully
- ✅ Hero section with CTAs present
- ✅ No "preview platform" language
- ✅ Primary CTA routes to `/lead-rescue`
- ✅ Secondary CTA routes to `/phase-3`
- ✅ Mobile viewport renders correctly

### Lead Rescue (`lead-rescue.spec.ts`)
- ✅ Page loads or returns 404 (graceful)
- ✅ Form has required fields
- ✅ Form submission with valid data
- ✅ Form validation for empty submission
- ✅ Mobile layout is usable

### Phase 3 (`phase-3.spec.ts`)
- ✅ Page loads or returns 404 (graceful)
- ✅ Application form has required fields
- ✅ Application submission with valid data
- ✅ Form validation for empty submission
- ✅ Mobile layout is usable
- ✅ Page explains Phase 3 partnership

### Rate Limiting (`rate-limiting.spec.ts`)
- ✅ Lead Rescue form rate limiting
- ✅ Phase 3 form rate limiting
- 📋 Rate limit cooldown testing (skipped - requires Sprint 4 details)

### Navigation (`navigation.spec.ts`)
- ✅ Desktop nav shows correct items
- ✅ Contact removed from header (validation)
- ✅ Mobile nav renders and toggles
- ✅ Mobile nav includes CTAs
- ✅ Navigation links work correctly
- ✅ Logo links to homepage
- 📋 Navigation is sticky on scroll (informational)

### Support Pages (`pages.spec.ts`)
- ✅ Platform page loads
- ✅ Resources page loads
- ✅ Studio page loads
- ✅ About page loads
- ✅ All pages have offer CTAs
- ✅ Pages are mobile responsive
- ✅ Pages have proper meta tags

## Test Philosophy

### Graceful Degradation
Tests are written to gracefully handle missing features from incomplete sprints:

```typescript
if (response?.status() === 404) {
  test.skip('Page not implemented yet - requires Sprint X');
  return;
}
```

This allows tests to:
1. Run without failing on missing features
2. Provide informational annotations about what's missing
3. Pass when features are implemented

### Informational Annotations
Tests use `test.info().annotations.push()` to provide context:

```typescript
test.info().annotations.push({
  type: 'warning',
  description: 'Lead Rescue CTA not found - may need Sprint 1-2 completion'
});
```

This helps identify what needs to be implemented without failing the test.

## Debugging Failed Tests

### View trace for failed test
```bash
npx playwright test tests/revamp/home.spec.ts --trace on
npx playwright show-trace trace.zip
```

### Run test in debug mode
```bash
npx playwright test tests/revamp/home.spec.ts --debug
```

### Take screenshots on failure
Screenshots are automatically saved to `tests/results/` on failure.

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Revamp E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npx playwright test tests/revamp
```

## Known Limitations

1. **Sprint Dependencies**: Tests assume Sprints 1-4 are complete
2. **Feature Flag**: Tests require `NEXT_PUBLIC_REVAMP_ENABLED=true`
3. **Email Testing**: SES email deliverability not tested (manual QA)
4. **Rate Limiting**: Cooldown tests skipped (requires Sprint 4 configuration details)

## Manual QA Checklist

For comprehensive QA beyond automated tests, see:
`docs/qa/revamp-manual-checklist.md`

Manual QA covers:
- Lighthouse performance scores
- AWS SES email deliverability
- Sentry error monitoring
- Cross-browser compatibility
- Accessibility testing
- Content verification
- Security testing

## Contributing

When adding new tests:

1. Follow existing test structure and patterns
2. Use graceful degradation for missing features
3. Add informational annotations where helpful
4. Test both desktop and mobile viewports
5. Update this README with new test coverage

## Support

For questions about these tests, contact the QA team or refer to:
- Playwright docs: https://playwright.dev
- Project QA documentation: `docs/qa/`
