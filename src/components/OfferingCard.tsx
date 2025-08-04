'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OFFERINGS, type OfferingId } from '@/data/offerings';

interface OfferingCardProps {
  offeringId: OfferingId;
  isPopular?: boolean;
}

export default function OfferingCard({ offeringId, isPopular = false }: OfferingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const offering = OFFERINGS[offeringId];

  const handleStartCheckout = async () => {
    setIsLoading(true);
    
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
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-8 ${
        isPopular
          ? 'bg-gradient-to-br from-[#50C878]/20 to-[#50C878]/10 border-2 border-[#50C878]'
          : 'bg-white/10 border border-white/20'
      } backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
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
        onClick={handleStartCheckout}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          isPopular
            ? 'bg-[#50C878] hover:bg-[#3DB067] text-white'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Starting...
          </div>
        ) : (
          `Start with ${offering.name}`
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
}
