// Auth Module Data Contracts
// Version: 1.0.0

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  accountLocked: boolean;
  lockReason?: string;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  revokedAt?: Date;
}

export interface AuthProvider {
  id: string;
  userId: string;
  provider: 'google' | 'github' | 'microsoft';
  providerId: string;
  providerData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Query patterns for data access
export interface UserQuery {
  id?: string;
  email?: string;
  emailVerified?: boolean;
  accountLocked?: boolean;
}

export interface SessionQuery {
  id?: string;
  userId?: string;
  token?: string;
  expiresAt?: {
    $gt?: Date;
    $lt?: Date;
  };
  revokedAt?: {
    $exists?: boolean;
  };
}

export interface AuthProviderQuery {
  userId?: string;
  provider?: string;
  providerId?: string;
}

// Migration patterns
export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  emailVerified?: boolean;
}

export interface CreateSessionData {
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

export interface UpdateUserData {
  name?: string;
  emailVerified?: boolean;
  accountLocked?: boolean;
  lockReason?: string;
  failedLoginAttempts?: number;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}
