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
    console.error('ACHIEVERY error:', error)
  }, [error])

  return (
    <Container className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We encountered an error with ACHIEVERY. Our team has been notified and is working on it.
        </p>
        <div className="space-x-4">
          <Button
            onClick={reset}
            variant="primary"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="secondary"
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
  )
}
