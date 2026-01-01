# Testing Operations Skill

**Purpose:** Automated testing and validation for production systems  
**Version:** 1.0.0

---

## What This Skill Does

- **Automated Test Calls:** Run test call campaigns
- **Validation:** Validate system functionality
- **Smoke Tests:** Quick deployment validation
- **Load Testing:** Test system capacity
- **Quality Assurance:** Ensure call quality

---

## Key Capabilities

### Run Test Calls
```typescript
const results = await runTestCalls({ count: 10 });
// Executes automated test calls and reports success rates
```

### Validate Call Flow
```typescript
const validation = await validateCallFlow();
// Tests complete call flow end-to-end
```

### Run Smoke Tests
```typescript
const smoke = await runSmokeTests();
// Quick validation of critical paths
```

---

## Quick Reference

```bash
ops-cli test calls 10       # Run 10 test calls
ops-cli test flow           # Test call flow
ops-cli test smoke          # Smoke tests
ops-cli test load           # Load tests
```

---

**Last Updated:** 2025-11-06
