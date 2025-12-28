// Auth Module Domain Service
// Pure business logic - no UI, no infrastructure dependencies

import { User, UserSession, AuthProvider } from '../contracts/data';
import {
  UserAuthenticatedEvent,
  UserSessionCreatedEvent,
  UserSessionExpiredEvent,
  UserPasswordChangedEvent
} from '../contracts/events';

export interface AuthDomainService {
  validateUserCredentials(email: string, password: string): Promise<User | null>;
  createUserSession(userId: string, ipAddress: string, userAgent: string): UserSession;
  validateSession(sessionId: string): Promise<boolean>;
  expireSession(sessionId: string): Promise<void>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateSessionToken(): string;
  isPasswordStrong(password: string): boolean;
  shouldLockAccount(user: User, failedAttempts: number): boolean;
  calculateLockoutDuration(failedAttempts: number): number; // minutes
  isAccountLocked(user: User): boolean;
  recordFailedLoginAttempt(userId: string): Promise<void>;
  clearFailedLoginAttempts(userId: string): Promise<void>;
}

export class AuthDomainServiceImpl implements AuthDomainService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATIONS = [5, 15, 60, 1440]; // minutes

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    // This would typically query the data layer
    // Implementation will be in the data layer
    throw new Error('Not implemented - use data layer');
  }

  createUserSession(userId: string, ipAddress: string, userAgent: string): UserSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      id: this.generateSessionToken(),
      userId,
      token: this.generateSessionToken(),
      expiresAt,
      ipAddress,
      userAgent,
      createdAt: now,
      revokedAt: undefined
    };
  }

  async validateSession(sessionId: string): Promise<boolean> {
    // Implementation in data layer
    throw new Error('Not implemented - use data layer');
  }

  async expireSession(sessionId: string): Promise<void> {
    // Implementation in data layer
    throw new Error('Not implemented - use data layer');
  }

  async hashPassword(password: string): Promise<string> {
    // Use bcrypt or similar - implementation in services layer
    throw new Error('Not implemented - use services layer');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Use bcrypt or similar - implementation in services layer
    throw new Error('Not implemented - use services layer');
  }

  generateSessionToken(): string {
    // Cryptographically secure random token
    return require('crypto').randomBytes(32).toString('hex');
  }

  isPasswordStrong(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  shouldLockAccount(user: User, failedAttempts: number): boolean {
    return failedAttempts >= this.MAX_FAILED_ATTEMPTS && !this.isAccountLocked(user);
  }

  calculateLockoutDuration(failedAttempts: number): number {
    const index = Math.min(failedAttempts - this.MAX_FAILED_ATTEMPTS, this.LOCKOUT_DURATIONS.length - 1);
    return this.LOCKOUT_DURATIONS[index] || this.LOCKOUT_DURATIONS[this.LOCKOUT_DURATIONS.length - 1];
  }

  isAccountLocked(user: User): boolean {
    if (!user.accountLocked) return false;

    // Check if lockout period has expired
    if (!user.lockReason?.includes('temporary')) return true;

    // For temporary locks, check if duration has passed
    // This would need the lock timestamp - simplified for now
    return false;
  }

  async recordFailedLoginAttempt(userId: string): Promise<void> {
    // Implementation in data layer
    throw new Error('Not implemented - use data layer');
  }

  async clearFailedLoginAttempts(userId: string): Promise<void> {
    // Implementation in data layer
    throw new Error('Not implemented - use data layer');
  }
}

// Event factory functions
export function createUserAuthenticatedEvent(
  userId: string,
  email: string,
  authMethod: 'password' | 'oauth' | 'sso',
  ipAddress: string,
  userAgent: string
): UserAuthenticatedEvent {
  return {
    eventName: 'user.authenticated.v1',
    eventId: require('crypto').randomUUID(),
    timestamp: new Date().toISOString(),
    correlationId: require('crypto').randomUUID(),
    payload: {
      userId,
      email,
      authenticationMethod: authMethod,
      ipAddress,
      userAgent
    }
  };
}

export function createUserSessionCreatedEvent(
  userId: string,
  sessionId: string,
  ipAddress: string,
  userAgent: string
): UserSessionCreatedEvent {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  return {
    eventName: 'user.session.created.v1',
    eventId: require('crypto').randomUUID(),
    timestamp: now.toISOString(),
    correlationId: require('crypto').randomUUID(),
    payload: {
      userId,
      sessionId,
      expiresAt,
      ipAddress,
      userAgent
    }
  };
}

export function createUserSessionExpiredEvent(
  userId: string,
  sessionId: string,
  reason: 'timeout' | 'manual_logout' | 'forced_logout'
): UserSessionExpiredEvent {
  return {
    eventName: 'user.session.expired.v1',
    eventId: require('crypto').randomUUID(),
    timestamp: new Date().toISOString(),
    correlationId: require('crypto').randomUUID(),
    payload: {
      userId,
      sessionId,
      expiredAt: new Date().toISOString(),
      reason
    }
  };
}
