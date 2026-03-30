'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckoutErrorBoundary } from '@/components/ErrorBoundary'
import {
  getOfferingById,
  isConsultingService,
  isQSuitePlan,
  isAchieveryTier,
  type CatalogEntry,
} from '@/data/offerings'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  offeringId: string | null
  customerEmail?: string
  customerName?: string
}

function featureList(offering: CatalogEntry): string[] {
  if (isConsultingService(offering)) {
    return [...offering.deliverables]
  }
  if (isQSuitePlan(offering)) {
    return [offering.modules, offering.description]
  }
  if (isAchieveryTier(offering)) {
    return [...offering.features]
  }
  return []
}

function subtitleFor(offering: CatalogEntry): string {
  if (isConsultingService(offering)) {
    return 'entryPoint' in offering && offering.entryPoint ? offering.entryPoint : offering.description
  }
  if (isQSuitePlan(offering)) {
    return offering.description
  }
  return ''
}

export default function CheckoutModal({
  isOpen,
  onClose,
  offeringId,
  customerEmail = '',
  customerName = '',
}: CheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const offering = offeringId ? getOfferingById(offeringId) : null

  const handleCheckout = () => {
    if (!offeringId || !offering) return

    if (isAchieveryTier(offering) && offering.price === 0) {
      window.location.href = '/achievery'
      return
    }

    const params = new URLSearchParams()
    if (isConsultingService(offering)) {
      params.set('service', offering.id)
    } else if (isQSuitePlan(offering)) {
      params.set('service', 'q-suite')
    } else if (isAchieveryTier(offering)) {
      params.set('service', 'achievery-pro')
    }
    if (customerEmail) params.set('email', customerEmail)
    if (customerName) params.set('name', customerName)

    window.location.href = `/contact?${params.toString()}`
  }

  if (!offering) return null

  const displayPrice = offering.priceLabel + (offering.period || '')

  const featuresToShow = featureList(offering)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="checkout-dialog-description" className="sm:max-w-md">
        <CheckoutErrorBoundary>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Confirm your selection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{offering.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{subtitleFor(offering)}</p>
              <div className="text-2xl font-bold text-blue-600">{displayPrice}</div>
              {isAchieveryTier(offering) && offering.price === 0 && (
                <p className="text-xs text-gray-500 mt-2">No credit card required to start</p>
              )}
            </div>

            {featuresToShow.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What&apos;s included:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {featuresToShow.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                  {featuresToShow.length > 4 && (
                    <li className="text-gray-500 text-xs">+ {featuresToShow.length - 4} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsLoading(true)
                  handleCheckout()
                }}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Working…
                  </span>
                ) : isAchieveryTier(offering) && offering.price === 0 ? (
                  'Start free'
                ) : (
                  'Talk to us'
                )}
              </Button>
            </div>
          </div>
        </CheckoutErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}
