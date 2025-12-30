// Auth Domain Service Unit Tests
// Tests pure business logic without external dependencies

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthDomainServiceImpl, createUserAuthenticatedEvent, createUserSessionCreatedEvent } from './auth-service';
import { User } from '../contracts/data';

// Declare global testUtils type
declare global {
  var testUtils: {
    createMockUser: (overrides?: Partial<User>) => User;
    createMockSession: (overrides?: Record<string, unknown>) => unknown;
    waitFor: (ms: number) => Promise<void>;
    createMockAuthEvent: (overrides?: Record<string, unknown>) => unknown;
  };
}

describe('AuthDomainService', () => {
  let service: AuthDomainServiceImpl;

  beforeEach(() => {
    service = new AuthDomainServiceImpl();
  });

  describe('Password Validation', () => {
    it('should validate strong passwords correctly', () => {
      expect(service.isPasswordStrong('StrongPass123!')).toBe(true);
      expect(service.isPasswordStrong('weak')).toBe(false);
      expect(service.isPasswordStrong('nouppercase123!')).toBe(false);
      expect(service.isPasswordStrong('NOLOWERCASE123!')).toBe(false);
      expect(service.isPasswordStrong('NoNumbers!')).toBe(false);
      expect(service.isPasswordStrong('NoSpecial123')).toBe(false);
    });

    it('should require minimum 8 characters', () => {
      expect(service.isPasswordStrong('Short1!')).toBe(false);
      expect(service.isPasswordStrong('LongEnoughPassword123!')).toBe(true);
    });
  });

  describe('Account Lockout', () => {
    it('should calculate progressive lockout durations', () => {
      expect(service.calculateLockoutDuration(5)).toBe(5);   // 5 min
      expect(service.calculateLockoutDuration(6)).toBe(15);  // 15 min
      expect(service.calculateLockoutDuration(7)).toBe(60);  // 1 hour
      expect(service.calculateLockoutDuration(8)).toBe(1440); // 24 hours
      expect(service.calculateLockoutDuration(10)).toBe(1440); // Still 24 hours
    });

    it('should determine when to lock accounts', () => {
      const user = global.testUtils.createMockUser({
        accountLocked: false,
        failedLoginAttempts: 4
      });

      expect(service.shouldLockAccount(user, 4)).toBe(false); // Not yet at threshold
      expect(service.shouldLockAccount(user, 5)).toBe(true);  // At threshold
    });

    it('should check if account is locked', () => {
      const lockedUser = global.testUtils.createMockUser({
        accountLocked: true,
        lockReason: 'temporary'
      });

      const permanentlyLockedUser = global.testUtils.createMockUser({
        accountLocked: true,
        lockReason: 'permanent ban'
      });

      expect(service.isAccountLocked(lockedUser)).toBe(false); // Temporary lock logic
      expect(service.isAccountLocked(permanentlyLockedUser)).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should create valid session objects', () => {
      const session = service.createUserSession(
        'user-123',
        '192.168.1.1',
        'Mozilla/5.0 Test Browser'
      );

      expect(session.id).toBeTruthy(); // Session ID is a generated token
      expect(session.userId).toBe('user-123');
      expect(session.ipAddress).toBe('192.168.1.1');
      expect(session.userAgent).toBe('Mozilla/5.0 Test Browser');
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(session.revokedAt).toBeUndefined();
    });

    it('should generate secure session tokens', () => {
      const token1 = service.generateSessionToken();
      const token2 = service.generateSessionToken();

      // Test behavior, not internal format
      expect(token1).toBeTruthy();
      expect(typeof token1).toBe('string');
      expect(token1.length).toBeGreaterThan(0);
      expect(token1).not.toBe(token2); // Should be unique
    });
  });

  describe('Event Generation', () => {
    it('should create properly formatted auth events', () => {
      const event = createUserAuthenticatedEvent(
        'user-123',
        'test@example.com',
        'password',
        '127.0.0.1',
        'Test Browser'
      );

      expect(event.eventName).toBe('user.authenticated.v1');
      expect(event.eventId).toMatch(/^[0-9a-f-]+$/); // UUID format
      expect(event.correlationId).toMatch(/^[0-9a-f-]+$/);
      expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO date

      expect(event.payload.userId).toBe('user-123');
      expect(event.payload.email).toBe('test@example.com');
      expect(event.payload.authenticationMethod).toBe('password');
      expect(event.payload.ipAddress).toBe('127.0.0.1');
      expect(event.payload.userAgent).toBe('Test Browser');
    });

    it('should create session events with correct expiration', () => {
      const event = createUserSessionCreatedEvent(
        'user-123',
        'session-456',
        '127.0.0.1',
        'Test Browser'
      );

      expect(event.eventName).toBe('user.session.created.v1');
      expect(event.payload.userId).toBe('user-123');
      expect(event.payload.sessionId).toBe('session-456');
      expect(event.payload.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  // Note: validateUserCredentials, expireSession, hashPassword, verifyPassword,
  // recordFailedLoginAttempt, and clearFailedLoginAttempts are tested via
  // integration tests since they require data layer dependencies
});
