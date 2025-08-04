'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { OFFERINGS, type OfferingId } from '@/data/offerings';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import CheckoutModal from '@/components/CheckoutModal';

export default function PricingPage() {
  const [showCancelMessage, setShowCancelMessage] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<OfferingId | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('canceled') === '1') {
      setShowCancelMessage(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowCancelMessage(false), 5000);
    }
  }, [searchParams]);

  const handleStartCheckout = (offeringId: OfferingId) => {
    setSelectedOffering(offeringId);
    setShowCheckoutModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC]">
      <Container className="py-20">
        {/* Cancel Message Banner */}
        {showCancelMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="bg-yellow-500 text-yellow-900 px-6 py-4 rounded-lg shadow-lg border border-yellow-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Checkout cancelled</span>
                </div>
                <button 
                  onClick={() => setShowCancelMessage(false)}
                  className="text-yellow-700 hover:text-yellow-900"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-sm mt-1">
                No worries! Your information wasn&apos;t saved. Try again when you&apos;re ready.
              </p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Growth Plan
          </h1>
          <p className="text-xl text-[#C0C0C0] max-w-3xl mx-auto">
            Transform your social media presence with data-driven insights, automation tools, and revenue optimization strategies.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {Object.entries(OFFERINGS).map(([key, offering]) => {
            const offeringId = key as keyof typeof OFFERINGS;
            const isPopular = offeringId === 'growth';
            
            return (
              <div
                key={key}
                className={`relative rounded-2xl p-8 ${
                  isPopular
                    ? 'bg-gradient-to-br from-[#50C878]/20 to-[#50C878]/10 border-2 border-[#50C878]'
                    : 'bg-white/10 border border-white/20'
                } backdrop-blur-xl`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#50C878] text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {offering.name}
                  </h3>
                  <p className="text-[#C0C0C0] mb-4">
                    {offering.description}
                  </p>
                  <div className="text-3xl font-bold text-[#50C878]">
                    {offering.price}
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {offering.featureList.map((feature, index) => (
                      <li key={index} className="flex items-start text-[#C0C0C0]">
                        <svg
                          className="w-5 h-5 text-[#50C878] mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleStartCheckout(offeringId)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    isPopular
                      ? 'bg-[#50C878] hover:bg-[#3DB067] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                  }`}
                >
                  Get Started with {offering.name}
                </Button>

                {/* Test Mode Indicator */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 text-center">
                    <span className="text-xs text-yellow-400">
                      🧪 Test mode: 99.8% discount applied
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-[#C0C0C0]">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">
                What platforms do you support?
              </h3>
              <p className="text-[#C0C0C0]">
                We currently support YouTube, TikTok, Instagram, and Twitter with more platforms coming soon.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-[#C0C0C0]">
                We offer a 14-day money-back guarantee on all plans. Cancel within 14 days for a full refund.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">
                Do you offer custom solutions?
              </h3>
              <p className="text-[#C0C0C0]">
                Yes! Revenue Partner tier includes custom dashboard development and dedicated account management.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        offeringId={selectedOffering}
        customerEmail="demo@stratanoble.com"
        customerName="Demo User"
      />
    </div>
  );
}
