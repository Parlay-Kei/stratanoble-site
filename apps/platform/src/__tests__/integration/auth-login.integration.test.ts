// Integration test for Auth Login API
// Tests controller/service/repo wiring end-to-end
// Mocks: Supabase client, bcrypt, event publishing, domain service
// Real: Handler, request/response flow

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLoginHandler, LoginHandlerDependencies } from '@modules/auth/api/login';

// Mock external dependencies only
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock bcrypt (external crypto)
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Mock event publishing (external service)
const mockEventBus = {
  publish: vi.fn().mockResolvedValue(undefined),
};

describe('Auth Login API Integration', () => {
  let handler: (request: Request) => Promise<Response>;
  let mockSessionRepository: any;
  let mockAuthDomainService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks
    mockSupabaseClient.auth.getUser.mockReset();
    mockSupabaseClient.auth.signInWithPassword.mockReset();
    mockEventBus.publish.mockReset();

    // Create mock domain service with controllable behavior
    // Real domain service requires data layer which isn't available in unit tests
    mockAuthDomainService = {
      validateUserCredentials: vi.fn(),
      createUserSession: vi.fn().mockReturnValue({
        id: 'session-123',
        userId: 'user-123',
        token: 'jwt-token-123',
        expiresAt: new Date(Date.now() + 3600000),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        createdAt: new Date(),
        revokedAt: undefined
      }),
      recordFailedLoginAttempt: vi.fn(),
      clearFailedLoginAttempts: vi.fn(),
      isAccountLocked: vi.fn().mockReturnValue(false),
      isEmailVerificationRequired: vi.fn().mockReturnValue(false),
      validateSession: vi.fn(),
      expireSession: vi.fn(),
      revokeUserSessions: vi.fn(),
      isPasswordStrong: vi.fn(),
      getPasswordStrengthFeedback: vi.fn(),
      hashPassword: vi.fn(),
      verifyPassword: vi.fn(),
    };

    // Create mock session repository with spy capabilities
    mockSessionRepository = {
      create: vi.fn().mockResolvedValue({
        id: 'session-123',
        userId: 'user-123',
        token: 'jwt-token-123',
        expiresAt: new Date(Date.now() + 3600000),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        createdAt: new Date(),
      }),
      findById: vi.fn(),
      findByToken: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      revokeUserSessions: vi.fn(),
      cleanupExpiredSessions: vi.fn(),
    };

    // Create handler with mocked domain service and external deps
    const deps: LoginHandlerDependencies = {
      authDomainService: mockAuthDomainService,
      sessionRepository: mockSessionRepository,
      eventBus: mockEventBus,
    };

    handler = createLoginHandler(deps);
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user successfully with valid credentials', async () => {
      // Arrange - Mock domain service to return valid user
      mockAuthDomainService.validateUserCredentials.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const requestBody = {
        email: 'test@example.com',
        password: 'validpassword123',
      };

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'Test Browser',
        },
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await handler(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result).toEqual({
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        session: {
          token: 'jwt-token-123',
          expiresAt: expect.any(String),
        },
      });

      // Verify domain service was called with credentials
      expect(mockAuthDomainService.validateUserCredentials).toHaveBeenCalledWith(
        'test@example.com',
        'validpassword123'
      );

      // Verify session was created
      expect(mockAuthDomainService.createUserSession).toHaveBeenCalledWith(
        'user-123',
        '127.0.0.1',
        'Test Browser'
      );

      // Verify session persistence
      expect(mockSessionRepository.create).toHaveBeenCalled();

      // Verify event publishing
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'user.authenticated.v1',
          payload: expect.objectContaining({
            userId: 'user-123',
            email: 'test@example.com',
            authenticationMethod: 'password',
          }),
        })
      );
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange - Mock domain service to return null (invalid credentials)
      mockAuthDomainService.validateUserCredentials.mockResolvedValue(null);

      const requestBody = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'Test Browser',
        },
        body: JSON.stringify(requestBody),
      });

      // Act
      const response = await handler(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(result).toEqual({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });

      // Verify domain service was called
      expect(mockAuthDomainService.validateUserCredentials).toHaveBeenCalledWith(
        'invalid@example.com',
        'wrongpassword'
      );

      // Verify failed login was recorded
      expect(mockAuthDomainService.recordFailedLoginAttempt).toHaveBeenCalledWith(
        'invalid@example.com'
      );

      // Verify session was NOT persisted (failed auth)
      expect(mockSessionRepository.create).not.toHaveBeenCalled();

      // Verify no event published (failed auth)
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email or password', async () => {
      // Arrange
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }), // Missing password
      });

      // Act
      const response = await handler(request);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(result).toEqual({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email and password are required',
        },
      });

      // Verify domain service was NOT called (validation failed first)
      expect(mockAuthDomainService.validateUserCredentials).not.toHaveBeenCalled();
      expect(mockSessionRepository.create).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });
});
