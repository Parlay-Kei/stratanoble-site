'use client'

import { useEffect } from 'react'
import { Container, Button } from '@strata-noble/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <Container className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            <div className="space-x-4">
              <Button
                onClick={reset}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Try again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Go to home
              </Button>
            </div>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </Container>
      </body>
    </html>
  )
}
