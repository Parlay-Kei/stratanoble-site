// Onboarding Module Domain Service
// State machine for onboarding completion

import {
  OnboardingStatus,
  OnboardingErrorCode
} from '../contracts/api';
import { OnboardingEvent, OnboardingCompletedEvent } from '../contracts/events';

export class OnboardingDomainService {
  /**
   * Get current onboarding status for a user
   */
  getStatus(userId: string): OnboardingStatus {
    return {
      userId,
      status: 'not_started',
      version: 1
    };
  }

  /**
   * Complete onboarding for a user
   * Idempotent: can be called multiple times safely
   */
  async completeOnboarding(
    userId: string,
    dreamText: string,
    phase: 'explore' | 'build' | 'launch'
  ): Promise<{ status: OnboardingStatus; event?: OnboardingEvent }> {
    // Validate inputs
    if (!dreamText?.trim()) {
      throw new Error(OnboardingErrorCode.ONBOARDING_INVALID_INPUT);
    }

    if (!['explore', 'build', 'launch'].includes(phase)) {
      throw new Error(OnboardingErrorCode.ONBOARDING_INVALID_INPUT);
    }

    // Generate starter actions based on phase
    const starterActions = this.generateStarterActions(phase);

    // Create completion timestamp
    const completedAt = new Date();
    const completedAtStr = completedAt.toISOString();

    // Create status
    const status: OnboardingStatus = {
      userId,
      status: 'completed',
      completedAt: completedAtStr,
      phase,
      version: 1
    };

    // Create event
    const event: OnboardingCompletedEvent = {
      eventName: 'user.onboarding.completed.v1',
      eventId: `onboarding-${userId}-${Date.now()}`,
      timestamp: completedAtStr,
      correlationId: `onboarding-${userId}`,
      payload: {
        userId,
        dreamId: `dream-${userId}`, // Will be set by repository
        phase,
        completedAt: completedAtStr,
        dreamText: dreamText.trim()
      }
    };

    return { status, event };
  }

  /**
   * Generate starter actions based on selected phase
   */
  private generateStarterActions(phase: 'explore' | 'build' | 'launch'): string[] {
    const actionsByPhase = {
      explore: [
        'Research people doing what you want to do',
        'Watch tutorials or take a course in this area',
        'Join communities related to your interest',
        'Read articles and books about this topic',
        'Talk to someone who has experience in this field'
      ],
      build: [
        'Create your first prototype or draft',
        'Set up the basic tools and workspace you need',
        'Make a simple version to test your idea',
        'Share early work with trusted friends for feedback',
        'Document what you learn as you build'
      ],
      launch: [
        'Share your work publicly for the first time',
        'Get feedback from real users or customers',
        'Create a simple marketing plan',
        'Set up ways for people to find and contact you',
        'Track results and plan improvements'
      ]
    };

    return actionsByPhase[phase];
  }

  /**
   * Validate onboarding status transition
   */
  validateTransition(currentStatus: OnboardingStatus, newStatus: 'completed'): boolean {
    // Can always transition to completed (idempotent)
    return true;
  }
}
