'use client';

import { useState } from 'react';
import { OFFERINGS } from '@/data/offerings';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleStartCheckout = async (offeringId: keyof typeof OFFERINGS) => {
    setIsLoading(offeringId);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offeringId,
          customerEmail: 'demo@stratanoble.com', // This would come from auth in production
          customerName: 'Demo User', // This would come from auth in production
          test: process.env.NODE_ENV === 'development' // Enable test mode in development
        }),
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Checkout error:', result.error);
        alert('Error creating checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC]">
      <Container className="py-20">
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
                  disabled={isLoading === offeringId}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    isPopular
                      ? 'bg-[#50C878] hover:bg-[#3DB067] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                  }`}
                >
                  {isLoading === offeringId ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating checkout...
                    </div>
                  ) : (
                    `Get Started with ${offering.name}`
                  )}
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
    </div>
  );
}
