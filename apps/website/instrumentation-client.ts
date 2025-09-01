import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent, EventHint } from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,

  // You can remove this option if you're not planning to use the Sentry session replay feature
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event: ErrorEvent, hint: EventHint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      // Skip certain errors in development
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Skip common development errors
          if (error.message.includes('ChunkLoadError') || 
              error.message.includes('Loading chunk')) {
            return null;
          }
        }
      }
    }
    
    return event;
  },

  environment: process.env.NODE_ENV,
});

// Export the router transition hook as required by Sentry
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
