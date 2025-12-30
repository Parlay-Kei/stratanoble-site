// Onboarding Module API Contracts
// Version: 1.0.0

export interface GetOnboardingStatusRequest {
  // Empty - uses authenticated user context
}

export interface GetOnboardingStatusResponse {
  success: boolean;
  status: OnboardingStatus;
  user: {
    id: string;
    email: string;
  };
  error?: OnboardingError;
}

export interface CompleteOnboardingRequest {
  dreamText: string;
  phase: 'explore' | 'build' | 'launch';
}

export interface CompleteOnboardingResponse {
  success: boolean;
  status: OnboardingStatus;
  dreamId: string;
  user: {
    id: string;
    email: string;
  };
  error?: OnboardingError;
}

export interface OnboardingError {
  code: OnboardingErrorCode;
  message: string;
  details?: Record<string, any>;
}

export enum OnboardingErrorCode {
  ONBOARDING_INVALID_INPUT = 'ONBOARDING_INVALID_INPUT',
  ONBOARDING_ALREADY_COMPLETED = 'ONBOARDING_ALREADY_COMPLETED',
  ONBOARDING_PERSISTENCE_FAILED = 'ONBOARDING_PERSISTENCE_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface OnboardingStatus {
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  dreamId?: string;
  phase?: 'explore' | 'build' | 'launch';
  version: number;
}
