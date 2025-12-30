import { test, expect } from '@playwright/test';

test.describe('Onboarding E2E Smoke', () => {
  test('new user: login -> redirected to onboarding -> complete -> dashboard', async ({ page }) => {
    const baseUrl = process.env.E2E_APP_BASE_URL || 'http://localhost:3000';
    const email = process.env.E2E_INCOMPLETE_EMAIL || 'e2e.incomplete@achievery.test';
    const password = process.env.E2E_INCOMPLETE_PASSWORD || 'ChangeMe-Incomplete-123!';

    // 1. Try to access dashboard without being logged in
    await page.goto(`${baseUrl}/dashboard`);

    // Should redirect to auth page
    await page.waitForURL(/auth/);
    await expect(page.getByText('Welcome back')).toBeVisible();

    // 2. Login with a user who hasn't completed onboarding
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // 3. Should redirect to onboarding (not dashboard) because onboarding_completed=false
    await page.waitForURL(/onboarding/);
    await expect(page.getByText('Welcome to ACHIEVERY')).toBeVisible();
    await expect(page.getByText('What do you dream of doing?')).toBeVisible();

    // 4. Step 1: Fill in dream
    await page.getByPlaceholder(/I want to start/).fill('I want to build a SaaS product');
    await page.getByRole('button', { name: /continue/i }).click();

    // 5. Step 2: Select phase and complete
    await page.waitForSelector('text=Where are you in your journey?');
    await expect(page.getByText('Where are you in your journey?')).toBeVisible();

    // Select "Build Phase"
    await page.getByText('Build Phase').click();

    // Complete onboarding
    await page.getByRole('button', { name: /complete setup/i }).click();

    // 6. Should redirect to dashboard after completion
    await page.waitForURL(/dashboard/);
    await expect(page.getByText('ACHIEVERY Analytics')).toBeVisible();

    // 7. Refresh: should stay on dashboard (session persists)
    await page.reload();
    await expect(page.getByText('ACHIEVERY Analytics')).toBeVisible();

    // 8. Try to access /onboarding directly: should redirect back to dashboard
    await page.goto(`${baseUrl}/onboarding`);
    await page.waitForURL(/dashboard/);
    await expect(page.getByText('ACHIEVERY Analytics')).toBeVisible();
  });

  test('existing user: already completed onboarding -> dashboard directly', async ({ page }) => {
    const baseUrl = process.env.E2E_APP_BASE_URL || 'http://localhost:3000';
    const email = process.env.E2E_COMPLETED_EMAIL || 'e2e.completed@achievery.test';
    const password = process.env.E2E_COMPLETED_PASSWORD || 'ChangeMe-Completed-123!';

    // Go to sign-in page
    await page.goto(`${baseUrl}/auth`);

    // Login
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should go directly to dashboard (skip onboarding)
    await page.waitForURL(/dashboard/);
    await expect(page.getByText('ACHIEVERY Analytics')).toBeVisible();
  });

  test('unauthenticated: /onboarding redirects to /auth', async ({ page }) => {
    const baseUrl = process.env.E2E_APP_BASE_URL || 'http://localhost:3000';

    // Try to access onboarding without being logged in
    await page.goto(`${baseUrl}/onboarding`);

    // Should redirect to auth page
    await page.waitForURL(/auth/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
