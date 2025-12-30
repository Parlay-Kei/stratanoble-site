// Sentry error tracking configuration
// Captures client and server errors with request correlation

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event: Sentry.ErrorEvent) {
      // Add request ID to Sentry events if available
      const requestId = event.tags?.requestId;
      if (requestId) {
        event.tags = {
          ...event.tags,
          requestId,
        };
      }
      return event;
    },
  });
}

// Helper to capture errors with request context
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
    }
    Sentry.captureException(error);
  });
}

// Helper to set user context for Sentry
export function setUserContext(user: { id: string; email: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
}

// Helper to set request context for Sentry
export function setRequestContext(requestId: string) {
  Sentry.setTag('requestId', requestId);
}
