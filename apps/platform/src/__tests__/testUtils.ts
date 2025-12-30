// Test utilities for Strata Noble platform tests

export const testUtils = {
  // Helper to create mock users
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    emailVerified: true,
    accountLocked: false,
    lockReason: undefined,
    failedLoginAttempts: 0,
    lastLoginAt: undefined,
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

  // Helper to create mock auth events
  createMockAuthEvent: (overrides = {}) => ({
    eventName: 'user.authenticated.v1',
    eventId: 'test-event-id',
    timestamp: new Date().toISOString(),
    correlationId: 'test-correlation-id',
    payload: {
      userId: 'test-user-id',
      email: 'test@example.com',
      authenticationMethod: 'password',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Browser',
      ...overrides,
    },
  }),
};
