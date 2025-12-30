// Vitest test setup
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Declare global test utilities type
declare global {
  var testUtils: {
    createMockUser: (overrides?: Record<string, unknown>) => Record<string, unknown>;
    createMockSession: (overrides?: Record<string, unknown>) => Record<string, unknown>;
    waitFor: (ms: number) => Promise<void>;
  };
}

// Global test utilities
(global as typeof globalThis).testUtils = {
  // Helper to create mock users
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Helper to create mock sessions
  createMockSession: (overrides = {}) => ({
    id: 'test-session-id',
    userId: 'test-user-id',
    token: 'test-jwt-token',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
    ipAddress: '127.0.0.1',
    userAgent: 'Test Browser',
    createdAt: new Date(),
    revokedAt: undefined,
    ...overrides,
  }),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};
