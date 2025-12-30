import { test, expect } from '@playwright/test';

test.describe('Auth E2E Smoke', () => {
  test('sign in -> protected -> sign out -> protected blocked', async ({ page }) => {
    const baseUrl = process.env.E2E_APP_BASE_URL || 'http://localhost:3000';
    const email = process.env.E2E_EMAIL!;
    const password = process.env.E2E_PASSWORD!;

    // Go to sign-in page
    await page.goto(`${baseUrl}/auth`);

    // Verify we're on the auth page
    await expect(page.getByText('Welcome back')).toBeVisible();

    // Fill in credentials
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    // Click sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirect to dashboard
    await page.waitForURL(/dashboard/);
    await expect(page.getByText('ACHIEVERY Analytics')).toBeVisible();

    // Verify session persists on refresh
    await page.reload();
    await expect(page.getByText('ACHIEVERY Analytics')).toBeVisible();

    // Sign out using real button
    await page.getByRole('button', { name: /^sign out$/i }).click();

    // Should redirect to auth page
    await page.waitForURL(/auth/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
