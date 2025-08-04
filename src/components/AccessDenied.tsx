'use client'

import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'

interface AccessDeniedProps {
  message?: string
  requiredTier?: 'growth' | 'partner'
  showUpgrade?: boolean
}

export default function AccessDenied({ 
  message = "You don't have access to this feature",
  requiredTier,
  showUpgrade = true 
}: AccessDeniedProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offeringId: requiredTier || 'growth',
          customerEmail: 'user@example.com', // This should come from auth context
          customerName: 'Current User'
        })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        console.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const tierNames = {
    growth: 'Growth Blueprint',
    partner: 'Revenue Partner'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {requiredTier && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>{tierNames[requiredTier]}</strong> subscription required to access this feature.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {showUpgrade && requiredTier && (
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isUpgrading ? 'Processing...' : `Upgrade to ${tierNames[requiredTier]}`}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go Back
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/pricing'}
            className="w-full text-sm"
          >
            View All Plans
          </Button>
        </div>
      </Card>
    </div>
  )
}