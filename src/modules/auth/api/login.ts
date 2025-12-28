// Auth Module API Layer - Login Endpoint
// HTTP controller for authentication

import { NextRequest, NextResponse } from 'next/server';
import {
  LoginRequest,
  LoginResponse,
  AuthError,
  AuthErrorCode
} from '@/modules/auth/contracts/api';
import { AuthDomainServiceImpl } from '@/modules/auth/domain/auth-service';
import { AuthServiceContainer } from '@/modules/auth/services/auth-services';

// Initialize services (in production, use proper DI container)
const serviceContainer = new AuthServiceContainer({} as any); // Placeholder
const authDomainService = new AuthDomainServiceImpl();

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate request
    if (!body.email || !body.password) {
      const error: AuthError = {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Email and password are required'
      };
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    // Get client info for session
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Authenticate user
    const user = await authDomainService.validateUserCredentials(body.email, body.password);

    if (!user) {
      // Record failed attempt
      await authDomainService.recordFailedLoginAttempt(body.email);

      const error: AuthError = {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      };
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    // Check if account is locked
    if (authDomainService.isAccountLocked(user)) {
      const error: AuthError = {
        code: AuthErrorCode.ACCOUNT_LOCKED,
        message: 'Account is temporarily locked due to too many failed attempts'
      };
      return NextResponse.json({ success: false, error }, { status: 423 });
    }

    // Clear failed attempts on successful login
    await authDomainService.clearFailedLoginAttempts(user.id);

    // Create session
    const session = authDomainService.createUserSession(user.id, ipAddress, userAgent);

    // TODO: Save session to database via repository
    // const sessionRepo = serviceContainer.createSessionRepository();
    // await sessionRepo.create(session);

    // Publish authentication event
    // TODO: Publish event via event service

    const response: LoginResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt.toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Login error:', error);

    const authError: AuthError = {
      code: AuthErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred'
    };

    return NextResponse.json(
      { success: false, error: authError },
      { status: 500 }
    );
  }
}
