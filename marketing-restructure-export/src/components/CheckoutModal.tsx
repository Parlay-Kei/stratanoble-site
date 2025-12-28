'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { CheckoutErrorBoundary } from '@/components/ErrorBoundary'
import { getOfferingById, isPlatformTier, isConsultingService } from '@/data/offerings'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  offeringId: string | null
  customerEmail?: string
  customerName?: string
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  offeringId, 
  customerEmail = '',
  customerName = ''
}: CheckoutModalProps) {
  const [promoCode, setPromoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPromoInput, setShowPromoInput] = useState(false)
  const { showToast } = useToast()

  const offering = offeringId ? getOfferingById(offeringId) : null

  const handleCheckout = async () => {
    if (!offeringId || !offering) return

    // For free tier, redirect to signup instead of payment
    if (offering.id === 'free') {
      window.location.href = '/auth/signup';
      return;
    }

    // For consulting services without price IDs, redirect to contact
    if (isConsultingService(offering) && !offering.stripePriceId) {
      window.location.href = '/contact?service=' + offering.id;
      return;
    }

    // Verify price ID exists before attempting checkout
    if (!offering.stripePriceId) {
      showToast({
        type: 'error',
        title: 'Configuration Error',
        message: 'This plan is not yet available for purchase. Please contact support.'
      });
      console.error('Missing stripePriceId for offering:', offeringId);
      return;
    }

    setIsLoading(true)

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/api/csrf', { credentials: 'include' });
      if (!csrfResponse.ok) {
        throw new Error('Failed to get security token');
      }
      const csrf = await csrfResponse.json();

      const requestBody = {
        offeringId,
        priceId: offering.stripePriceId,
        customerEmail: customerEmail || 'demo@stratanoble.com',
        customerName: customerName || 'Demo User',
        promoCode: promoCode || undefined,
        test: process.env.NODE_ENV === 'development'
      };

      console.log('Checkout request:', { offeringId, hasCSRF: !!csrf?.csrfToken });

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf?.csrfToken || ''
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('Checkout response:', { status: response.status, hasUrl: !!result.url || !!result.data?.url });

      // Handle nested response structure from createSuccessResponse
      const checkoutUrl = result.url || result.data?.url;

      if (response.ok && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        const errorMessage = result.error || result.message || result.details?.message || 'Error creating checkout session';
        console.error('Checkout failed:', result);
        showToast({
          type: 'error',
          title: 'Checkout Error',
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Checkout exception:', error);
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to checkout service. Please try again.'
      });
    } finally {
      setIsLoading(false)
    }
  }

  if (!offering) return null

  // Get display price
  const displayPrice = isPlatformTier(offering) 
    ? offering.priceLabel + (offering.period || '')
    : offering.priceLabel;

  // Get features to display
  const featuresToShow = isPlatformTier(offering) 
    ? offering.features 
    : offering.features;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="checkout-dialog-description" className="sm:max-w-md">
        <CheckoutErrorBoundary>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Confirm Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {offering.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {offering.subtitle || ''}
            </p>
            <div className="text-2xl font-bold text-blue-600">
              {displayPrice}
            </div>
            {offering.id === 'free' && (
              <p className="text-xs text-gray-500 mt-2">
                No credit card required
              </p>
            )}
          </div>

          {/* Key Features */}
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
                <li className="text-gray-500 text-xs">
                  + {featuresToShow.length - 4} more features
                </li>
              )}
            </ul>
          </div>

          {/* Promo Code Section - Only for paid tiers */}
          {offering.id !== 'free' && !isConsultingService(offering) && (
            <div>
              {!showPromoInput ? (
                <button
                  onClick={() => setShowPromoInput(true)}
                  className="text-blue-600 text-sm hover:text-blue-700 font-medium"
                >
                  Have a promo code? Click here
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPromoInput(false)
                        setPromoCode('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test Mode Indicator */}
          {process.env.NODE_ENV === 'development' && offering.id !== 'free' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Test Mode Active</p>
                  <p className="text-xs text-yellow-700">99.8% discount will be applied automatically</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : offering.id === 'free' ? (
                'Create Free Account'
              ) : isConsultingService(offering) && !offering.stripePriceId ? (
                'Contact Us'
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </div>

          {/* Security Notice - Only for paid tiers */}
          {offering.id !== 'free' && isPlatformTier(offering) && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Secure checkout powered by Stripe
              </p>
            </div>
          )}
        </div>
        </CheckoutErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}



