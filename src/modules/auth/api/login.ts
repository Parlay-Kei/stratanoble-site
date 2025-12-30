// Auth Module API Layer - Login Endpoint
// HTTP controller for authentication with dependency injection
// Framework-agnostic (uses standard Web API)

import {
  LoginRequest,
  LoginResponse,
  AuthError,
  AuthErrorCode
} from '../contracts/api';
import { AuthDomainServiceImpl } from '../domain/auth-service';
import { AuthServiceContainer } from '../services/auth-services';

export interface LoginHandlerDependencies {
  authDomainService: AuthDomainServiceImpl;
  sessionRepository: any; // From service container
  eventBus?: { publish: (event: any) => Promise<void> };
}

// Factory function for creating login handler with injected dependencies
export function createLoginHandler(deps: LoginHandlerDependencies) {
  return async function POST(request: Request) {
    try {
      const body: LoginRequest = await request.json();

      // Validate request
      if (!body.email || !body.password) {
        const error: AuthError = {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Email and password are required'
        };
        return new Response(JSON.stringify({ success: false, error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get client info for session
      const ipAddress = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Authenticate user
      const user = await deps.authDomainService.validateUserCredentials(body.email, body.password);

      if (!user) {
        // Record failed attempt
        await deps.authDomainService.recordFailedLoginAttempt(body.email);

        const error: AuthError = {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password'
        };
        return new Response(JSON.stringify({ success: false, error }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if account is locked
      if (deps.authDomainService.isAccountLocked(user)) {
        const error: AuthError = {
          code: AuthErrorCode.ACCOUNT_LOCKED,
          message: 'Account is temporarily locked due to too many failed attempts'
        };
        return new Response(JSON.stringify({ success: false, error }), {
          status: 423,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Clear failed attempts on successful login
      await deps.authDomainService.clearFailedLoginAttempts(user.id);

      // Create session
      const session = deps.authDomainService.createUserSession(user.id, ipAddress, userAgent);

      // Save session to database
      await deps.sessionRepository.create(session);

      // Publish authentication event
      if (deps.eventBus) {
        await deps.eventBus.publish({
          eventName: 'user.authenticated.v1',
          eventId: `auth-${Date.now()}`,
          timestamp: new Date().toISOString(),
          correlationId: `session-${session.id}`,
          payload: {
            userId: user.id,
            email: user.email,
            authenticationMethod: 'password',
            ipAddress,
            userAgent,
            sessionId: session.id
          }
        });
      }

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

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Login error:', error);

      const authError: AuthError = {
        code: AuthErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred'
      };

      return new Response(JSON.stringify({ success: false, error: authError }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

// Production wiring - use real container
const serviceContainer = new AuthServiceContainer({} as any); // TODO: Inject real Supabase client
const authDomainService = new AuthDomainServiceImpl();
const sessionRepository = serviceContainer.createSessionRepository();

// Export the handler with real dependencies for production
export const POST = createLoginHandler({
  authDomainService,
  sessionRepository,
  eventBus: undefined // TODO: Inject real event bus
});
