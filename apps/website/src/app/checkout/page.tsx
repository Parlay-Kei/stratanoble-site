'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { PLATFORM_TIERS, LEGACY_OFFERINGS, CONSULTING_SERVICES } from '@/data/offerings';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface TierDetails {
  name: string;
  price: string;
  description: string;
  stripePriceId: string | null;
  features: string[];
  isFree: boolean;
  isContact: boolean;
}

function CheckoutPageContent() {
  const showPricing = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formStep, setFormStep] = useState<'info' | 'confirm'>('info');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    businessStage: '',
    challenge: '',
    tier: ''
  });
  const [errors, setErrors] = useState<{name?: string; email?: string}>({});

  useEffect(() => {
    if (searchParams) {
      const name = searchParams.get('name') || '';
      const email = searchParams.get('email') || '';
      const tier = searchParams.get('tier') || '';

      setCustomerInfo({
        name,
        email,
        businessStage: searchParams.get('businessStage') || '',
        challenge: searchParams.get('challenge') || '',
        tier
      });

      // If name and email already provided, skip to confirm step
      if (name && email && tier) {
        setFormStep('confirm');
      }
    }
  }, [searchParams]);

  const getTierDetails = (tierId: string): TierDetails => {
    // Check Platform Tiers first (free, builder, prosperity)
    // Use type assertion to handle the readonly const array
    const platformTiers = PLATFORM_TIERS as readonly {
      id: string;
      name: string;
      subtitle: string;
      description: string;
      price: number;
      priceLabel: string;
      period: string;
      stripePriceId: string | null;
      features: readonly string[];
      cta: string;
      ctaLink: string;
      popular: boolean;
      tier: string;
      metadata: object;
    }[];
    const platformTier = platformTiers.find(t => t.id === tierId);
    if (platformTier) {
      return {
        name: platformTier.name,
        price: platformTier.priceLabel + (platformTier.period || ''),
        description: platformTier.subtitle || platformTier.description,
        stripePriceId: platformTier.stripePriceId,
        features: [...platformTier.features],
        isFree: platformTier.price === 0,
        isContact: false
      };
    }

    // Check Legacy Offerings (lite, growth, partner - dashboard services)
    if (tierId in LEGACY_OFFERINGS) {
      const legacyTier = LEGACY_OFFERINGS[tierId as keyof typeof LEGACY_OFFERINGS];
      // Handle different legacy tier structures (partner has priceIds, others have priceId)
      const priceId = 'priceId' in legacyTier
        ? legacyTier.priceId
        : ('priceIds' in legacyTier ? legacyTier.priceIds.recurring : null);
      return {
        name: legacyTier.name,
        price: legacyTier.price,
        description: legacyTier.description,
        stripePriceId: priceId || null,
        features: [...legacyTier.featureList],
        isFree: false,
        isContact: false
      };
    }

    // Check Consulting Services
    const consultingService = CONSULTING_SERVICES.find(s => s.id === tierId);
    if (consultingService) {
      return {
        name: consultingService.name,
        price: consultingService.priceLabel,
        description: consultingService.subtitle || '',
        stripePriceId: null, // Consulting requires contact
        features: [...consultingService.features],
        isFree: false,
        isContact: true
      };
    }

    // Fallback mappings for Solutions page tier names (starter, growth, partner)
    // These map to platform tiers
    const solutionsTierMap: Record<string, string> = {
      'starter': 'free',
      'growth': 'builder',  // Note: solutions "growth" at $97 maps to prosperity
      'partner': 'prosperity'
    };

    if (solutionsTierMap[tierId]) {
      return getTierDetails(solutionsTierMap[tierId]);
    }

    // Default fallback
    return {
      name: 'Package',
      price: showPricing ? 'Contact for Quote' : 'Contact for Quote',
      description: 'Please select a package',
      stripePriceId: null,
      features: [],
      isFree: false,
      isContact: true
    };
  };

  const validateForm = () => {
    const newErrors: {name?: string; email?: string} = {};
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Save lead to CRM (non-blocking)
    try {
      await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerInfo.name,
          email: customerInfo.email,
          interested_tier: customerInfo.tier,
          utm_source: searchParams?.get('utm_source') || 'checkout',
          utm_medium: searchParams?.get('utm_medium') || 'direct',
          utm_campaign: searchParams?.get('utm_campaign') || 'checkout_flow',
        }),
      });
    } catch {
      // Continue even if CRM fails
    }

    setFormStep('confirm');
  };

  const handleCheckout = async (): Promise<void> => {
    const tierDetails = getTierDetails(customerInfo.tier);

    // For free tiers, redirect to signup
    if (tierDetails.isFree) {
      router.push('/auth/signup');
      return;
    }

    // For contact-required tiers (consulting), redirect to contact
    if (tierDetails.isContact) {
      router.push(`/contact?tier=${customerInfo.tier}`);
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      setFormStep('info');
      return;
    }

    // Verify price ID exists
    if (!tierDetails.stripePriceId) {
      alert('This plan is not yet available for purchase. Please contact support.');
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
          priceId: tierDetails.stripePriceId,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
        }),
      });

      const data: unknown = await response.json();
      // Handle both direct url and nested data.url from createSuccessResponse
      const url = (typeof data === 'object' && data !== null)
        ? ((data as any).url || (data as any).data?.url)
        : '';
      const errorMsg = (typeof data === 'object' && data !== null && 'error' in data && typeof (data as { error?: string }).error === 'string') ? (data as { error: string }).error : '';

      if (response.ok && url) {
        window.location.href = url;
      } else {
        console.error('Checkout failed:', data);
        throw new Error(errorMsg || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tierDetails = getTierDetails(customerInfo.tier);

  // If no tier specified, show tier selection
  if (!customerInfo.tier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 mb-8">Select a plan to continue to checkout</p>

          <div className="grid md:grid-cols-3 gap-6">
            {PLATFORM_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setCustomerInfo(prev => ({ ...prev, tier: tier.id }))}
                className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                  tier.popular
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                {tier.popular && (
                  <span className="inline-block bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                    POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{tier.subtitle}</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {tier.priceLabel}
                  {tier.period && <span className="text-sm text-gray-500">{tier.period}</span>}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push('/solutions')}
            className="mt-8 text-gray-500 hover:text-gray-700 underline"
          >
            View full feature comparison
          </button>
        </div>
      </div>
    );
  }

  // Info collection step
  if (formStep === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Get Started with {tierDetails.name}
            </h1>
            <p className="text-gray-600">
              Enter your details to continue
            </p>
          </div>

          {/* Selected Plan Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{tierDetails.name}</h3>
                <p className="text-sm text-gray-600">{tierDetails.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-600">{tierDetails.price}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleInfoSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Continue to Checkout
            </button>

            <button
              type="button"
              onClick={() => setCustomerInfo(prev => ({ ...prev, tier: '' }))}
              className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Choose a different plan
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Secure checkout powered by Stripe
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Confirmation step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 pt-16">
      <div className="max-w-2xl mx-auto px-4 pb-12">
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
              {customerInfo.businessStage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Stage:</span>
                  <span className="font-medium capitalize">{customerInfo.businessStage}</span>
                </div>
              )}
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
          {tierDetails.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900">What&#39;s Included:</h3>
              <ul className="space-y-2 text-gray-700">
                {tierDetails.features.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {tierDetails.features.length > 6 && (
                  <li className="text-gray-500 text-sm ml-7">
                    + {tierDetails.features.length - 6} more features
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                void handleCheckout();
              }}
              disabled={isLoading}
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
              ) : tierDetails.isFree ? (
                'Create Free Account'
              ) : tierDetails.isContact ? (
                'Contact Us to Get Started'
              ) : (
                `Proceed to Payment - ${tierDetails.price}`
              )}
            </button>

            <button
              onClick={() => setFormStep('info')}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              Edit your information
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Secure payment powered by Stripe</p>
            <p className="mt-1">You can cancel anytime before completing payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 pt-16 flex items-center justify-center">
        <div className="text-white text-xl">Loading checkout...</div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

export default CheckoutPage;
