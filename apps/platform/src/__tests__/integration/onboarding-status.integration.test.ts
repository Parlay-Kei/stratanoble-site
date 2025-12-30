// Onboarding Status Integration Test
// Tests GET /api/onboarding/status endpoint with factory-injected dependencies

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGetStatusHandler } from '@modules/onboarding/api/status';
import { OnboardingDomainService } from '@modules/onboarding/domain/onboarding-service';
import type { GetStatusHandlerDependencies } from '@modules/onboarding/api/status';

describe('Onboarding Status Integration', () => {
  let mockLogger: any;
  let onboardingDomainService: OnboardingDomainService;
  let deps: GetStatusHandlerDependencies;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn()
    };

    onboardingDomainService = new OnboardingDomainService();

    deps = {
      onboardingDomainService,
      logger: mockLogger
    };
  });

  it('should return onboarding status successfully', async () => {
    // Arrange
    const handler = createGetStatusHandler(deps);
    const mockRequest = new Request('http://localhost:3000/api/onboarding/status');

    // Act
    const response = await handler(mockRequest as any);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.status).toEqual({
      userId: 'test-user-id',
      status: 'not_started',
      completedAt: undefined,
      dreamId: undefined,
      phase: undefined,
      version: 1
    });
    expect(data.user).toEqual({
      id: 'test-user-id',
      email: 'test@example.com'
    });

    // Check that response includes x-request-id header
    expect(response.headers.get('x-request-id')).toMatch(/^req_\d+_[a-z0-9]+$/);

    // Check logging
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Get onboarding status request started',
      expect.objectContaining({
        requestId: expect.any(String)
      })
    );

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Get onboarding status successful',
      expect.objectContaining({
        requestId: expect.any(String),
        userId: 'test-user-id',
        status: 'not_started',
        duration: expect.any(Number)
      })
    );
  });

  it('should handle errors gracefully', async () => {
    // Arrange - make domain service throw error
    const failingService = {
      getStatus: vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      })
    };

    const failingDeps: GetStatusHandlerDependencies = {
      onboardingDomainService: failingService as any,
      logger: mockLogger
    };

    const handler = createGetStatusHandler(failingDeps);
    const mockRequest = new Request('http://localhost:3000/api/onboarding/status');

    // Act
    const response = await handler(mockRequest as any);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Failed to get onboarding status'
    });
    expect(data.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);

    // Check error logging
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Get onboarding status error',
      expect.objectContaining({
        requestId: expect.any(String),
        error: 'Database connection failed',
        duration: expect.any(Number)
      })
    );
  });
});
