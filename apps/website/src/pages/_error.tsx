import { NextPageContext } from 'next'
import * as Sentry from '@sentry/nextjs'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { CTA_LABELS } from '@/lib/cta-labels'

interface Props {
  statusCode?: number
  hasGetInitialPropsRun?: boolean
  err?: Error
}

function ErrorPage({ statusCode, hasGetInitialPropsRun, err }: Props) {
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-silver-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-navy-900/20">{statusCode || 'Error'}</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">
            {statusCode === 404
              ? 'Page Not Found'
              : statusCode === 500
              ? 'Server Error'
              : 'Something went wrong'}
          </h2>
          <p className="text-navy-600 leading-relaxed">
            {statusCode === 404
              ? "The page you're looking for doesn't exist or has been moved."
              : statusCode === 500
              ? "We're experiencing some technical difficulties. Please try again later."
              : "An unexpected error occurred. We've been notified and are working to fix it."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary btn-lg inline-flex items-center justify-center group"
          >
            <HomeIcon className="mr-2 h-5 w-5" />
            {CTA_LABELS.BACK_HOME}
          </Link>
          <Link
            href="/contact"
            className="btn-outline btn-lg inline-flex items-center justify-center group"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            {CTA_LABELS.CONTACT_US}
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-silver-200">
          <p className="text-sm text-navy-500 mb-4">Popular pages you might be looking for:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Link
              href="/services"
              className="text-emerald-600 hover:text-emerald-700 transition-colors p-2 rounded hover:bg-emerald-50"
            >
              → All Services
            </Link>
            <Link
              href="/data-analysis"
              className="text-emerald-600 hover:text-emerald-700 transition-colors p-2 rounded hover:bg-emerald-50"
            >
              → Data Analysis
            </Link>
            <Link
              href="/discovery"
              className="text-emerald-600 hover:text-emerald-700 transition-colors p-2 rounded hover:bg-emerald-50"
            >
              → Discovery Call
            </Link>
            <Link
              href="/about"
              className="text-emerald-600 hover:text-emerald-700 transition-colors p-2 rounded hover:bg-emerald-50"
            >
              → About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

ErrorPage.getInitialProps = async ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404

  // Capture exceptions in Sentry
  if (err) {
    Sentry.captureException(err)
  }

  return {
    statusCode,
    hasGetInitialPropsRun: true,
  }
}

export default ErrorPage