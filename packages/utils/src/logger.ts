// Production-ready logging utility
// Supports console logging in development and external services in production

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

interface LogContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private async sendToExternalService(level: string, message: string, context?: LogContext, error?: Error) {
    // In production, you would integrate with services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - Axiom for log aggregation
    // - DataDog for monitoring
    
    if (this.isProduction) {
      try {
        // Example: Sentry integration
        if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Sentry) {
          const Sentry = (window as unknown as Record<string, unknown>).Sentry as {
            captureException: (error: Error, options?: unknown) => void;
            captureMessage: (message: string, level: string, options?: unknown) => void;
          };
          
          if (level === LOG_LEVELS.ERROR && error) {
            Sentry.captureException(error, {
              tags: { component: 'api' },
              extra: context,
            });
          } else {
            Sentry.captureMessage(message, level as 'info' | 'warning' | 'error', {
              tags: { component: 'api' },
              extra: context,
            });
          }
        }

        // Example: Custom logging endpoint
        if (process.env.LOGGING_ENDPOINT) {
          await fetch(process.env.LOGGING_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level,
              message,
              context,
              error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              } : undefined,
              timestamp: new Date().toISOString(),
            }),
          });
        }
      } catch (logError) {
        // Fallback to console if external logging fails
        // Only log in development to avoid console statements in production
        if (this.isDevelopment) {
          // eslint-disable-next-line no-console
          console.error('Failed to send log to external service:', logError);
          // eslint-disable-next-line no-console
          console.error('Original log:', { level, message, context, error });
        }
      }
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    const formattedMessage = this.formatMessage(LOG_LEVELS.ERROR, message, context);
    
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(formattedMessage);
      // eslint-disable-next-line no-console
      if (error) console.error(error);
    }
    
    this.sendToExternalService(LOG_LEVELS.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(LOG_LEVELS.WARN, message, context);
    
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(formattedMessage);
    }
    
    this.sendToExternalService(LOG_LEVELS.WARN, message, context);
  }

  info(message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(LOG_LEVELS.INFO, message, context);
    
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(formattedMessage);
    }
    
    this.sendToExternalService(LOG_LEVELS.INFO, message, context);
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(LOG_LEVELS.DEBUG, message, context);
      // eslint-disable-next-line no-console
      console.debug(formattedMessage);
    }
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, context?: LogContext) {
    this.info(`API Request: ${method} ${url}`, context);
  }

  apiResponse(method: string, url: string, status: number, duration?: number, context?: LogContext) {
    const message = `API Response: ${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    
    if (status >= 400) {
      this.error(message, undefined, context);
    } else {
      this.info(message, context);
    }
  }

  apiError(method: string, url: string, error: Error, context?: LogContext) {
    this.error(`API Error: ${method} ${url}`, error, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogContext };
export { LOG_LEVELS };
