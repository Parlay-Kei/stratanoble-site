'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    try {
      Sentry.captureException(error)
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError)
    }
  }, [error])

  const handleReset = () => {
    try {
      reset()
    } catch (resetError) {
      console.error('Reset failed:', resetError)
      window.location.href = '/'
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <html>
      <head>
        <title>Something went wrong - StrataNoble</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '6rem',
                fontWeight: 'bold',
                color: 'rgba(15, 23, 42, 0.2)',
                margin: '0 0 1rem 0'
              }}>
                Error
              </h1>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '1rem'
              }}>
                Something went wrong!
              </h2>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                margin: '0'
              }}>
                We apologize for the inconvenience. Our team has been notified of this issue and we're working to fix it.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleReset}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  fontWeight: '500',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: '1rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                Try again
              </button>
              <button
                onClick={handleGoHome}
                style={{
                  backgroundColor: 'transparent',
                  color: '#059669',
                  fontWeight: '500',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #059669',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '1rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#059669'
                }}
              >
                Go Home
              </button>
            </div>

            <div style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '1rem'
              }}>
                If this error persists, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}