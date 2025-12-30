// Onboarding Module API Layer - Get Status Endpoint
// Returns current onboarding status for authenticated user
// Framework-agnostic (uses standard Web API)

import {
  GetOnboardingStatusResponse,
  OnboardingError,
  OnboardingErrorCode
} from '../contracts/api';
import { OnboardingDomainService } from '../domain/onboarding-service';

export interface GetStatusHandlerDependencies {
  onboardingDomainService: OnboardingDomainService;
  logger?: { info: (msg: string, meta?: any) => void; error: (msg: string, meta?: any) => void };
}

// Generate request ID for observability
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Factory function for creating get status handler with injected dependencies
export function createGetStatusHandler(deps: GetStatusHandlerDependencies) {
  return async function GET(request: Request) {
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      deps.logger?.info('Get onboarding status request started', {
        requestId,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      });

      // In a real implementation, get userId from auth context
      // For now, simulate with a test user ID
      const userId = 'test-user-id';

      // Get status from domain service
      const status = deps.onboardingDomainService.getStatus(userId);

      const response: GetOnboardingStatusResponse = {
        success: true,
        status: {
          userId: status.userId,
          status: status.status,
          completedAt: status.completedAt,
          dreamId: status.dreamId,
          phase: status.phase,
          version: status.version
        },
        user: {
          id: userId,
          email: 'test@example.com'
        }
      };

      deps.logger?.info('Get onboarding status successful', {
        requestId,
        userId,
        status: status.status,
        duration: Date.now() - startTime
      });

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;

      deps.logger?.error('Get onboarding status error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration
      });

      const onboardingError: OnboardingError = {
        code: OnboardingErrorCode.INTERNAL_ERROR,
        message: 'Failed to get onboarding status'
      };

      return new Response(JSON.stringify({ success: false, error: onboardingError, requestId }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId
        }
      });
    }
  };
}
