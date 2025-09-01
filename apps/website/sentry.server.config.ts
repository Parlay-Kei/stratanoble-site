import * as Sentry from "@sentry/nextjs";

export function init() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
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
            // Skip database connection errors in development
            if (error.message.includes('connect ECONNREFUSED') ||
                error.message.includes('Database connection')) {
              return null;
            }
          }
        }
      }
      
      return event;
    },

    environment: process.env.NODE_ENV,
  });
}

// Initialize immediately for backward compatibility
init();