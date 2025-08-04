'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      const eventId = window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
      this.setState({ eventId });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if props changed and resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }

    // Reset error boundary if any resetKeys changed
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some((key, idx) => key !== prevResetKeys[idx]);
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC] flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-lg text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            
            <p className="text-[#C0C0C0] mb-6">
              We encountered an unexpected error. This has been reported to our team.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-6 text-left">
                <summary className="text-yellow-400 cursor-pointer mb-2 hover:text-yellow-300">
                  Error Details (Development)
                </summary>
                <div className="bg-black/30 rounded p-4 text-xs text-gray-300 overflow-auto max-h-40">
                  <p className="font-semibold text-red-400 mb-2">{error.name}: {error.message}</p>
                  {error.stack && (
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  )}
                  {errorInfo && (
                    <div className="mt-4">
                      <p className="font-semibold text-yellow-400 mb-2">Component Stack:</p>
                      <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-[#50C878] hover:bg-[#3DB067] text-white"
              >
                Try Again
              </Button>
              
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                Reload Page
              </Button>
            </div>

            {eventId && (
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {eventId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// Functional component wrapper for simpler usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundaryWrapper({ children, fallback, onError }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

// Hook for programmatically triggering error boundary
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    // In development, throw the error to trigger error boundary
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    
    // In production, log the error and report to tracking service
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: errorInfo,
      });
    }
  };
}

// Specialized error boundaries for different parts of the app
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Dashboard error:', error, errorInfo);
    
    // Track dashboard-specific errors
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `Dashboard Error: ${error.message}`,
        fatal: false,
      });
    }
  };

  const fallback = (
    <div className="min-h-[400px] bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 flex flex-col items-center justify-center">
      <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Dashboard Unavailable</h3>
      <p className="text-[#C0C0C0] text-center mb-4">
        We're having trouble loading your dashboard. Please try refreshing the page.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="bg-[#50C878] hover:bg-[#3DB067] text-white"
      >
        Refresh Dashboard
      </Button>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

export function CheckoutErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Checkout error:', error, errorInfo);
    
    // Track checkout-specific errors (critical for revenue)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `Checkout Error: ${error.message}`,
        fatal: true, // Checkout errors are critical
      });
    }
  };

  const fallback = (
    <div className="min-h-[300px] bg-red-50 border border-red-200 rounded-lg p-8 flex flex-col items-center justify-center">
      <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-red-900 mb-2">Checkout Error</h3>
      <p className="text-red-700 text-center mb-4">
        We encountered an issue with the checkout process. Please try again or contact support.
      </p>
      <div className="space-x-3">
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </Button>
        <Button
          onClick={() => window.location.href = '/contact'}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Contact Support
        </Button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

// Type declarations for Sentry (if used)
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => string;
    };
    gtag?: (command: string, action: string, parameters: any) => void;
  }
}