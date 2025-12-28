// Auth Module Data Layer - Repository Implementations
// Implements data contracts with actual database operations

import {
  User,
  UserSession,
  AuthProvider,
  UserQuery,
  SessionQuery,
  AuthProviderQuery,
  CreateUserData,
  CreateSessionData,
  UpdateUserData
} from '../contracts/data';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByQuery(query: UserQuery): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface SessionRepository {
  findById(id: string): Promise<UserSession | null>;
  findByToken(token: string): Promise<UserSession | null>;
  findByUserId(userId: string): Promise<UserSession[]>;
  findByQuery(query: SessionQuery): Promise<UserSession[]>;
  create(data: CreateSessionData): Promise<UserSession>;
  update(id: string, data: Partial<UserSession>): Promise<UserSession>;
  delete(id: string): Promise<void>;
  revokeUserSessions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}

export interface AuthProviderRepository {
  findById(id: string): Promise<AuthProvider | null>;
  findByUserId(userId: string): Promise<AuthProvider[]>;
  findByProviderId(provider: string, providerId: string): Promise<AuthProvider | null>;
  findByQuery(query: AuthProviderQuery): Promise<AuthProvider[]>;
  create(data: Omit<AuthProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuthProvider>;
  update(id: string, data: Partial<AuthProvider>): Promise<AuthProvider>;
  delete(id: string): Promise<void>;
}

// Supabase Auth implementation of repositories
// Note: Since we're using Supabase Auth, user management is handled by Supabase Auth service
// These repositories provide additional business logic and data access for auth-related features

export class SupabaseAuthUserRepository implements UserRepository {
  constructor(private supabaseClient: any) {}

  async findById(id: string): Promise<User | null> {
    try {
      // For Supabase Auth, we get user data from auth.users via admin API
      // In client context, we can only access the current user
      const { data: authUser, error } = await this.supabaseClient.auth.getUser();

      if (error || !authUser.user) return null;

      // Map Supabase auth user to our User contract
      if (authUser.user.id === id) {
        return {
          id: authUser.user.id,
          email: authUser.user.email,
          name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || '',
          passwordHash: '', // Not accessible via client
          emailVerified: authUser.user.email_confirmed_at ? true : false,
          emailVerificationToken: undefined,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
          accountLocked: false, // Would need custom table for this
          lockReason: undefined,
          failedLoginAttempts: 0, // Would need custom table for this
          lastLoginAt: authUser.user.last_sign_in_at ? new Date(authUser.user.last_sign_in_at) : undefined,
          createdAt: new Date(authUser.user.created_at),
          updatedAt: new Date(authUser.user.updated_at || authUser.user.created_at)
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // Supabase Auth doesn't allow querying users by email from client
    // This would require admin privileges or a custom users table
    throw new Error('Email lookup requires admin privileges or custom users table');
  }

  async findByQuery(query: UserQuery): Promise<User[]> {
    // Limited querying available in Supabase Auth
    throw new Error('Complex user queries require custom users table');
  }

  async create(data: CreateUserData): Promise<User> {
    // User creation is handled by Supabase Auth signUp
    throw new Error('User creation handled by Supabase Auth service');
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    // Limited updates available via Supabase Auth
    throw new Error('User updates require custom users table for extended fields');
  }

  async delete(id: string): Promise<void> {
    // User deletion requires admin privileges
    throw new Error('User deletion requires admin privileges');
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }
}

// Supabase Auth Session Repository
// Sessions are managed by Supabase Auth (JWT tokens), but we can track additional metadata
export class SupabaseAuthSessionRepository implements SessionRepository {
  constructor(private supabaseClient: any) {}

  async findById(id: string): Promise<UserSession | null> {
    // For Supabase Auth, sessions are JWT tokens, not stored in custom tables
    // If we need custom session tracking, we'd need a user_sessions table
    throw new Error('Session tracking requires custom user_sessions table - Supabase Auth uses JWT tokens');
  }

  async findByToken(token: string): Promise<UserSession | null> {
    try {
      // Validate token with Supabase Auth
      const { data, error } = await this.supabaseClient.auth.getUser(token);

      if (error || !data.user) return null;

      // Create a session object from the JWT data
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // Assume 1 hour for JWT

      return {
        id: `session_${data.user.id}_${Date.now()}`,
        userId: data.user.id,
        token: token,
        expiresAt: expiresAt,
        ipAddress: 'unknown', // Not available from JWT
        userAgent: 'unknown', // Not available from JWT
        createdAt: now,
        revokedAt: undefined
      };
    } catch (error) {
      console.error('Error finding session by token:', error);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<UserSession[]> {
    // Supabase Auth doesn't expose session lists
    // Would need custom session tracking table
    throw new Error('Session listing requires custom user_sessions table');
  }

  async findByQuery(query: SessionQuery): Promise<UserSession[]> {
    // Limited session querying with Supabase Auth
    throw new Error('Session queries require custom user_sessions table');
  }

  async create(data: CreateSessionData): Promise<UserSession> {
    // Sessions are created by Supabase Auth sign-in
    // We can return the session data structure for consistency
    return {
      id: `session_${data.userId}_${Date.now()}`,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: new Date(),
      revokedAt: undefined
    };
  }

  async update(id: string, data: Partial<UserSession>): Promise<UserSession> {
    throw new Error('Session updates require custom user_sessions table');
  }

  async delete(id: string): Promise<void> {
    // Sign out handled by Supabase Auth
    await this.supabaseClient.auth.signOut();
  }

  async revokeUserSessions(userId: string): Promise<void> {
    // Force sign out for user
    await this.supabaseClient.auth.signOut();
  }

  async cleanupExpiredSessions(): Promise<void> {
    // Supabase Auth handles JWT expiration automatically
    // Custom cleanup would require session tracking table
    console.log('JWT cleanup handled by Supabase Auth');
  }
}

// Supabase Auth Provider Repository
// OAuth providers are managed by Supabase Auth, but we can track additional metadata
export class SupabaseAuthProviderRepository implements AuthProviderRepository {
  constructor(private supabaseClient: any) {}

  async findById(id: string): Promise<AuthProvider | null> {
    // Supabase Auth doesn't expose provider details in a queryable way from client
    // Would need custom table for additional provider metadata
    throw new Error('OAuth provider tracking requires custom auth_providers table');
  }

  async findByUserId(userId: string): Promise<AuthProvider[]> {
    try {
      // Get user identities from Supabase Auth
      const { data: authUser, error } = await this.supabaseClient.auth.getUser();

      if (error || !authUser.user || authUser.user.id !== userId) return [];

      // Map identities to our AuthProvider format
      const identities = authUser.user.identities || [];
      return identities.map((identity: any) => ({
        id: identity.id || `provider_${userId}_${identity.provider}`,
        userId: userId,
        provider: identity.provider as 'google' | 'github' | 'microsoft',
        providerId: identity.id,
        providerData: identity,
        createdAt: new Date(authUser.user.created_at),
        updatedAt: new Date(authUser.user.updated_at || authUser.user.created_at)
      }));
    } catch (error) {
      console.error('Error finding providers by user ID:', error);
      return [];
    }
  }

  async findByProviderId(provider: string, providerId: string): Promise<AuthProvider | null> {
    // Supabase Auth doesn't allow querying by provider ID from client
    throw new Error('Provider ID lookup requires admin privileges');
  }

  async findByQuery(query: AuthProviderQuery): Promise<AuthProvider[]> {
    // Limited provider querying with Supabase Auth
    if (query.userId) {
      return this.findByUserId(query.userId);
    }
    throw new Error('Complex provider queries require custom auth_providers table');
  }

  async create(data: Omit<AuthProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuthProvider> {
    // OAuth providers are linked during Supabase Auth sign-in
    // Additional metadata would require custom table
    throw new Error('OAuth provider creation handled by Supabase Auth');
  }

  async update(id: string, data: Partial<AuthProvider>): Promise<AuthProvider> {
    throw new Error('OAuth provider updates require custom auth_providers table');
  }

  async delete(id: string): Promise<void> {
    // Unlinking providers requires admin privileges or custom table
    throw new Error('OAuth provider unlinking requires admin privileges');
  }
}
