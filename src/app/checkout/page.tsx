'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    businessStage: '',
    challenge: '',
    tier: ''
  });

  useEffect(() => {
    // Get parameters from URL (from discovery form)
    setCustomerInfo({
      name: searchParams.get('name') || '',
      email: searchParams.get('email') || '',
      businessStage: searchParams.get('businessStage') || '',
      challenge: searchParams.get('challenge') || '',
      tier: searchParams.get('tier') || ''
    });
  }, [searchParams]);

  const getTierDetails = (tier: string) => {
    switch (tier) {
      case 'lite':
        return { name: 'Lite Package', price: '$1,200', description: 'Essential strategy and execution support' };
      case 'core':
        return { name: 'Core Package', price: '$2,500', description: 'Comprehensive business development' };
      case 'premium':
        return { name: 'Premium Package', price: '$5,000', description: 'Full-service strategy and execution' };
      default:
        return { name: 'Package', price: '$0', description: 'Please select a package' };
    }
  };

  const handleCheckout = async () => {
    if (!customerInfo.tier || !customerInfo.name || !customerInfo.email) {
      alert('Missing required information. Please go back and complete the discovery form.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType: customerInfo.tier,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      // console.error('Checkout error:', error);
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tierDetails = getTierDetails(customerInfo.tier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Complete Your Purchase</h1>
          
          {/* Customer Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{customerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Business Stage:</span>
                <span className="font-medium capitalize">{customerInfo.businessStage}</span>
              </div>
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">{tierDetails.name}</span>
                    <p className="text-sm text-gray-600">{tierDetails.description}</p>
                  </div>
                  <span className="font-bold text-xl text-emerald-600">{tierDetails.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Summary */}
          {customerInfo.challenge && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2 text-gray-900">Your Main Challenge:</h3>
              <p className="text-gray-700 italic">&ldquo;{customerInfo.challenge}&rdquo;</p>
            </div>
          )}

          {/* What's Included */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-900">What&#39;s Included:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="text-emerald-500 mr-2">✓</span>
                Free discovery session to understand your needs
              </li>
              <li className="flex items-center">
                <span className="text-emerald-500 mr-2">✓</span>
                Custom strategy development
              </li>
              <li className="flex items-center">
                <span className="text-emerald-500 mr-2">✓</span>
                Implementation support and guidance
              </li>
              <li className="flex items-center">
                <span className="text-emerald-500 mr-2">✓</span>
                Follow-up sessions and support
              </li>
            </ul>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isLoading || !customerInfo.tier}
            className="w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Proceed to Payment - ${tierDetails.price}`
            )}
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Secure payment powered by Stripe</p>
            <p className="mt-1">You can cancel anytime before completing payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading checkout...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
