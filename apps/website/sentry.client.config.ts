import * as Sentry from "@sentry/nextjs";

export function init() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',

    beforeSend(event, hint) {
      // Filter out development errors
      if (process.env.NODE_ENV === 'development') {
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Skip common development errors
            if (error.message.includes('ChunkLoadError') ||
                error.message.includes('Loading chunk') ||
                error.message.includes('connect ECONNREFUSED') ||
                error.message.includes('Database connection')) {
              return null;
            }
          }
        }
      }

      return event;
    },

    environment: process.env.NODE_ENV,

    // Configure integrations for client-side
    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    // Performance monitoring
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Reduce noise in development
    beforeSendTransaction(event) {
      if (process.env.NODE_ENV === 'development') {
        // Filter out development transactions that aren't useful
        if (event.transaction?.includes('/_next/') ||
            event.transaction?.includes('/static/')) {
          return null;
        }
      }
      return event;
    },
  });
}

// Initialize conditionally to avoid issues
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  init();
}
