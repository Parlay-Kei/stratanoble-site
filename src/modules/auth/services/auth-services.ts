// Auth Module Services Layer - Infrastructure Integrations
// External service integrations (Supabase, email, etc.)

import {
  UserRepository,
  SessionRepository,
  AuthProviderRepository,
  SupabaseAuthUserRepository,
  SupabaseAuthSessionRepository,
  SupabaseAuthProviderRepository
} from '../data/repositories';

// Type-only imports to avoid requiring packages at build time
type SupabaseClient = any;
type BcryptStatic = {
  hash(password: string, saltRounds: number): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
};

export interface PasswordService {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface EmailService {
  sendPasswordReset(email: string, resetToken: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}

export interface SupabaseAuthService {
  getClient(): SupabaseClient;
  signUp(email: string, password: string, metadata?: Record<string, any>): Promise<any>;
  signIn(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  getUser(token: string): Promise<any>;
  resetPassword(email: string): Promise<void>;
}

// Bcrypt implementation
export class BcryptPasswordService implements PasswordService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    // Dynamic import to avoid build-time dependency
    const bcrypt = await import('bcrypt');
    return bcrypt.default.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    // Dynamic import to avoid build-time dependency
    const bcrypt = await import('bcrypt');
    return bcrypt.default.compare(password, hash);
  }
}

// Supabase implementation
export class SupabaseAuthServiceImpl implements SupabaseAuthService {
  constructor(private client: SupabaseClient) {}

  getClient(): SupabaseClient {
    return this.client;
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<any> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string): Promise<any> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getUser(token: string): Promise<any> {
    const { data, error } = await this.client.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
}

// Email service (placeholder - integrate with actual email provider)
export class ConsoleEmailService implements EmailService {
  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    console.log(`Password reset for ${email}: ${resetToken}`);
    // In production, integrate with SendGrid, SES, etc.
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`Welcome email sent to ${email} for ${name}`);
    // In production, integrate with email service
  }
}

// Service container for dependency injection
export class AuthServiceContainer {
  constructor(
    private supabaseClient: SupabaseClient,
    private passwordService: PasswordService = new BcryptPasswordService(),
    private emailService: EmailService = new ConsoleEmailService()
  ) {}

  getPasswordService(): PasswordService {
    return this.passwordService;
  }

  getEmailService(): EmailService {
    return this.emailService;
  }

  getSupabaseAuthService(): SupabaseAuthService {
    return new SupabaseAuthServiceImpl(this.supabaseClient);
  }

  // Repository factory methods
  createUserRepository(): UserRepository {
    return new SupabaseAuthUserRepository(this.supabaseClient);
  }

  createSessionRepository(): SessionRepository {
    return new SupabaseAuthSessionRepository(this.supabaseClient);
  }

  createAuthProviderRepository(): AuthProviderRepository {
    return new SupabaseAuthProviderRepository(this.supabaseClient);
  }
}
