// Sentry server-side initialization
// Used by Next.js instrumentation.ts for server runtime

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    beforeSend(event) {
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
