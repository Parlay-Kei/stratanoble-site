'use client';

import { ArrowPathIcon,HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-off-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-command-navy mb-4">Something went wrong</h2>
          <p className="text-slate-grey leading-relaxed">
            We&apos;re experiencing technical difficulties. Our team has been notified and is
            working to resolve the issue. Please try again or contact us for assistance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary btn-lg inline-flex items-center justify-center group"
          >
            <ArrowPathIcon className="mr-2 h-5 w-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="btn-outline btn-lg inline-flex items-center justify-center group"
          >
            <HomeIcon className="mr-2 h-5 w-5" />
            Return Home
          </Link>
        </div>

        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-slate-grey/25">
          <p className="text-sm text-slate-grey mb-4">
            Still having issues? Contact our support team:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <Link
              href="/contact"
              className="text-forest-green hover:text-forest-green transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="tel:+1-702-721-3566"
              className="text-forest-green hover:text-forest-green transition-colors"
            >
              Call: (702) 721-3566
            </a>
          </div>
        </div>

        {/* Error ID for debugging */}
        {error.digest && (
          <div className="mt-8 pt-4 border-t border-slate-grey/25">
            <p className="text-xs text-slate-grey">Error ID: {error.digest}</p>
          </div>
        )}
      </div>
    </div>
  );
}
