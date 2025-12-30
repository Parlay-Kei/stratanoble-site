// Middleware Redirect Decision Unit Tests
// Tests the pure decideRedirect function for redirect logic

import { describe, it, expect } from 'vitest';
import { decideRedirect } from '../../../middleware';

describe('decideRedirect', () => {
  describe('Session expired scenarios', () => {
    it('should redirect to /auth and clear cookie when session expired', () => {
      const result = decideRedirect({
        pathname: '/dashboard',
        isAuthed: true,
        onboardingCompleted: true,
        sessionExpired: true
      });

      expect(result).toEqual({ redirect: '/auth', clearCookie: true });
    });

    it('should redirect to /auth when expired even if on public-ish route', () => {
      const result = decideRedirect({
        pathname: '/onboarding',
        isAuthed: true,
        onboardingCompleted: false,
        sessionExpired: true
      });

      expect(result).toEqual({ redirect: '/auth', clearCookie: true });
    });
  });

  describe('Unauthenticated scenarios', () => {
    it('should redirect to /auth when not authed and accessing /dashboard', () => {
      const result = decideRedirect({
        pathname: '/dashboard',
        isAuthed: false,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: '/auth', clearCookie: false });
    });

    it('should redirect to /auth when not authed and accessing /profile', () => {
      const result = decideRedirect({
        pathname: '/profile',
        isAuthed: false,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: '/auth', clearCookie: false });
    });

    it('should redirect to /auth when not authed and accessing /onboarding', () => {
      const result = decideRedirect({
        pathname: '/onboarding',
        isAuthed: false,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: '/auth', clearCookie: false });
    });
  });

  describe('Authenticated but onboarding not completed', () => {
    it('should redirect to /onboarding when authed but onboarding not completed and accessing /dashboard', () => {
      const result = decideRedirect({
        pathname: '/dashboard',
        isAuthed: true,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: '/onboarding', clearCookie: false });
    });

    it('should redirect to /onboarding when authed but onboarding not completed and accessing /settings', () => {
      const result = decideRedirect({
        pathname: '/settings',
        isAuthed: true,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: '/onboarding', clearCookie: false });
    });

    it('should allow access to /onboarding when authed but onboarding not completed', () => {
      const result = decideRedirect({
        pathname: '/onboarding',
        isAuthed: true,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: null, clearCookie: false });
    });
  });

  describe('Authenticated with onboarding completed', () => {
    it('should allow access to /dashboard when authed and onboarding completed', () => {
      const result = decideRedirect({
        pathname: '/dashboard',
        isAuthed: true,
        onboardingCompleted: true,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: null, clearCookie: false });
    });

    it('should redirect to /dashboard when authed and completed but accessing /onboarding', () => {
      // Prevent revisiting onboarding after completion
      const result = decideRedirect({
        pathname: '/onboarding',
        isAuthed: true,
        onboardingCompleted: true,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: '/dashboard', clearCookie: false });
    });

    it('should allow access to /settings when authed and onboarding completed', () => {
      const result = decideRedirect({
        pathname: '/settings',
        isAuthed: true,
        onboardingCompleted: true,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: null, clearCookie: false });
    });
  });

  describe('Edge cases', () => {
    it('should allow access to unknown routes when authed with onboarding completed', () => {
      const result = decideRedirect({
        pathname: '/some-random-route',
        isAuthed: true,
        onboardingCompleted: true,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: null, clearCookie: false });
    });

    it('should allow access to unknown routes when not authed (let Next.js handle 404)', () => {
      const result = decideRedirect({
        pathname: '/some-random-route',
        isAuthed: false,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: null, clearCookie: false });
    });

    it('should handle nested protected routes like /dashboard/analytics', () => {
      const result = decideRedirect({
        pathname: '/dashboard/analytics',
        isAuthed: true,
        onboardingCompleted: false,
        sessionExpired: false
      });

      expect(result).toEqual({ redirect: '/onboarding', clearCookie: false });
    });
  });
});
