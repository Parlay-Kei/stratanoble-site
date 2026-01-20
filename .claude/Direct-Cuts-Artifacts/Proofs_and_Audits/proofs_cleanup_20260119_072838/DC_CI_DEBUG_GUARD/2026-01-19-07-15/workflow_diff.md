### CI Workflow Changes

**File:** `.github/workflows/ci.yml`

**Change 1: Added Static Guardrail Step**

```yaml
- name: Production Guard
  run: npm run gate:debug
```

This runs `node scripts/gate-check-debug.js` which verifies:

- `BuildFingerprint.tsx` has `if (isProduction) return null;`
- Sensitive environment variables are only accessed safely.

**Change 2: Added E2E Regression Job**

```yaml
production-guard-e2e:
    runs-on: ubuntu-latest
    needs: ci
    steps:
        - name: Checkout code
          uses: actions/checkout@v4
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
              node-version: 20
              cache: "npm"
        - name: Install dependencies
          run: npm ci
        - name: Install Playwright browsers
          run: npx playwright install --with-deps chromium
        - name: Build application
          run: npm run build
          env:
              NODE_ENV: production
        - name: Run Production Guard E2E
          run: |
              npm run preview -- --port 4173 &
              sleep 5
              npx playwright test tests/e2e/production-debug-guard.spec.ts
          env:
              BASE_URL: http://localhost:4173
```

This ensures:

- The app builds successfully in production mode.
- The `production-debug-guard.spec.ts` passes against the actual built artifact.
