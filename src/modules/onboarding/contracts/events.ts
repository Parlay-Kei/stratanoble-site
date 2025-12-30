// Onboarding Module Event Contracts
// Version: 1.0.0

export interface OnboardingCompletedEvent {
  eventName: 'user.onboarding.completed.v1';
  eventId: string;
  timestamp: string;
  correlationId: string;
  payload: {
    userId: string;
    dreamId: string;
    phase: 'explore' | 'build' | 'launch';
    completedAt: string;
    dreamText: string;
  };
}

export type OnboardingEvent = OnboardingCompletedEvent;
