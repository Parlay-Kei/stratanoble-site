# Testing Operations Skill
**Version**: 1.0
**Last Updated**: November 21, 2025
**Purpose**: Guide to running and maintaining the test suite.

---

## Test Suites

### Unit Tests (Jest)
- **Location**: `/__tests__`
- **Command**: `npm run test`
- **Scope**: Utility functions, individual components, API logic.

### E2E Tests (Playwright)
- **Location**: `/e2e`
- **Command**: `npm run test:e2e`
- **Scope**: Full user flows (Login -> Quote -> Submit).

### Load Testing
- **Location**: `/load-testing`
- **Command**: `npm run load-test`
- **Scope**: WebSocket concurrency, API throughput.

---

## CI/CD Integration
- Tests run automatically on PR via GitHub Actions.
- **Blockers**: Failed tests block merge.

---

## Manual Testing

### Voice AI
1. Call the test number.
2. Verify greeting.
3. Speak natural phrases ("I'm interested in internet").
4. Verify latency and response quality.
5. Check logs for "Stream started".

### Quote Wizard
1. Go to `/quote`.
2. Fill out form.
3. Verify email receipt.
4. Verify DB entry in `quotes` table.
