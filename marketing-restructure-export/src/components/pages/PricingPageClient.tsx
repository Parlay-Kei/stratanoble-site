'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLATFORM_TIERS, CONSULTING_SERVICES, type PlatformTierId } from '@/data/offerings';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import CheckoutModal from '@/components/CheckoutModal';
import { 
  CheckCircleIcon, 
  SparklesIcon, 
  RocketLaunchIcon,
  BoltIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';

function PricingPageContent() {
    const [selectedOffering, setSelectedOffering] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCancelMessage, setShowCancelMessage] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('canceled') === '1') {
      setShowCancelMessage(true);
      setTimeout(() => setShowCancelMessage(false), 5000);
    }
  }, [searchParams]);

  const handleSelectPlan = (tierId: string) => {
    if (tierId === 'free') {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signup';
      }
      return;
    }
    setSelectedOffering(tierId);
    setShowCheckoutModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244]">
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
                  ×
                </button>
              </div>
              <p className="text-sm mt-1">
                No worries! Try again when you&apos;re ready.
              </p>
            </div>
          </div>
        )}

        {/* PLATFORM TIERS SECTION */}
        <section className="mb-24">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#50C878]/10 border border-[#50C878]/30 rounded-full px-4 py-2 mb-6">
              <SparklesIcon className="h-5 w-5 text-[#50C878]" />
              <span className="text-[#50C878] font-semibold text-sm">AI-Powered Business Building</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-300 to-emerald-200 bg-clip-text text-transparent">
                Start Free. Scale When You're Ready.
              </span>
            </h1>
            
            <p className="text-xl text-[#C0C0C0] max-w-3xl mx-auto mb-8">
              Turn any idea into a real business with AI automation. No experience required.
            </p>

            {/* Billing Toggle - Placeholder for future annual billing */}
            {/* <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-1">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition-all ${billingCycle === 'monthly' ? 'bg-[#50C878] text-white' : 'text-[#C0C0C0]'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('annually')}
                className={`px-6 py-2 rounded-full transition-all ${billingCycle === 'annually' ? 'bg-[#50C878] text-white' : 'text-[#C0C0C0]'}`}
              >
                Annual <span className="text-xs ml-1">(Save 20%)</span>
              </button>
            </div> */}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {PLATFORM_TIERS.map((tier) => {
              const Icon = tier.id === 'free' ? SparklesIcon : 
                          tier.id === 'builder' ? RocketLaunchIcon : 
                          BoltIcon;
              
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-2xl p-8 ${
                    tier.popular
                      ? 'bg-gradient-to-br from-[#50C878]/20 to-[#50C878]/10 border-2 border-[#50C878] transform scale-105'
                      : 'bg-[#001122] border border-white/10'
                  } backdrop-blur-xl transition-all hover:border-[#50C878]/50`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#50C878] to-[#40B068] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex p-3 rounded-xl ${tier.popular ? 'bg-[#50C878]/20' : 'bg-white/5'}`}>
                      <Icon className={`h-8 w-8 ${tier.popular ? 'text-[#50C878]' : 'text-[#C0C0C0]'}`} />
                    </div>
                  </div>

                  {/* Plan Header */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-[#C0C0C0] mb-4">
                      {tier.subtitle}
                    </p>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-white">
                        {tier.priceLabel}
                      </span>
                      {tier.period && (
                        <span className="text-[#C0C0C0] text-lg ml-2">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#C0C0C0]">
                      {tier.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className={`flex items-start ${feature.includes('Everything') ? 'text-[#C0C0C0]/70 text-sm' : 'text-[#C0C0C0]'}`}>
                          <CheckCircleIcon 
                            className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${tier.popular ? 'text-[#50C878]' : 'text-[#50C878]/70'}`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(tier.id)}
                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-[#50C878] to-[#40B068] hover:from-[#40B068] hover:to-[#50C878] text-white shadow-lg hover:shadow-[#50C878]/50'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#50C878]/50'
                    }`}
                  >
                    {tier.cta}
                  </Button>

                  {tier.id === 'free' && (
                    <p className="text-center text-xs text-[#C0C0C0] mt-3">
                      No credit card required
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 text-[#C0C0C0] text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#50C878]" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#50C878]" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-[#50C878]" />
                <span>No setup fees</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONSULTING SERVICES SECTION */}
        <section className="py-20 bg-gradient-to-br from-[#001122] to-[#002244] rounded-3xl border border-white/10">
          <div className="px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                <PhoneIcon className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm">Premium Hands-On Support</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Need Custom Help?
              </h2>
              
              <p className="text-xl text-[#C0C0C0] max-w-2xl mx-auto">
                Expert consulting for complex businesses that need personalized guidance beyond platform automation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {CONSULTING_SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 transition-all"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-[#C0C0C0] mb-4">
                      {service.subtitle}
                    </p>
                    <div className="text-3xl font-bold text-blue-400">
                      {service.priceLabel}
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-[#C0C0C0] mb-6">
                      {service.description}
                    </p>
                    
                    {/* Show packages if available */}
                    {service.packages && service.packages.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <p className="text-sm font-semibold text-white">Available packages:</p>
                        {service.packages.map((pkg, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-white text-sm">{pkg.name}</span>
                              <span className="text-[#50C878] font-bold">{pkg.price}</span>
                            </div>
                            <ul className="space-y-1">
                              {pkg.features.slice(0, 3).map((feature, fIdx) => (
                                <li key={fIdx} className="text-xs text-[#C0C0C0] flex items-start">
                                  <span className="text-[#50C878] mr-2">•</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(service.id)}
                    className="w-full py-4 px-6 rounded-xl font-bold bg-white/10 hover:bg-blue-500/20 text-white border border-white/20 hover:border-blue-400/50 transition-all"
                  >
                    {service.cta}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-[#C0C0C0] mb-4">
                Not sure which consulting package is right for you?
              </p>
              <a 
                href="/contact"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Schedule a free discovery call
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-[#C0C0C0]">
                Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at your next billing cycle.
              </p>
            </div>

            <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                How does the AI automation work?
              </h3>
              <p className="text-[#C0C0C0]">
                Our AI analyzes your business idea, generates market research, creates your business plan, builds your brand identity, and sets up your complete business infrastructure automatically.
              </p>
            </div>

            <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                What if I need help getting started?
              </h3>
              <p className="text-[#C0C0C0]">
                All paid plans include support. Builder tier gets priority email support, and Prosperity tier includes 1-on-1 monthly coaching calls plus priority support with 2-hour response times.
              </p>
            </div>

            <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                Is there a money-back guarantee?
              </h3>
              <p className="text-[#C0C0C0]">
                Yes! We offer a 30-day money-back guarantee on all plans. If you're not satisfied, we'll refund your payment—no questions asked.
              </p>
            </div>

            <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                Do I need technical skills?
              </h3>
              <p className="text-[#C0C0C0]">
                Not at all! Our platform is designed for people with zero business or technical experience. If you can type your idea, you can use our platform.
              </p>
            </div>

            <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                What's the difference between platform and consulting?
              </h3>
              <p className="text-[#C0C0C0]">
                Platform tiers give you AI-powered automation and self-service tools. Consulting provides hands-on expert guidance for complex businesses that need personalized strategic support.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-24 text-center">
          <div className="bg-gradient-to-r from-[#50C878]/10 to-blue-500/10 border border-[#50C878]/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Build Your Business?
            </h2>
            <p className="text-xl text-[#C0C0C0] mb-8 max-w-2xl mx-auto">
              Start free and see your business come to life with AI automation. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => handleSelectPlan('free')}
                className="bg-gradient-to-r from-[#50C878] to-[#40B068] hover:from-[#40B068] hover:to-[#50C878] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-[#50C878]/50 transition-all"
              >
                Start Free Now
              </Button>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/contact';
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 hover:border-[#50C878]/50 transition-all"
              >
                Talk to an Expert
              </Button>
            </div>
          </div>
        </section>

        <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} offeringId={selectedOffering} />
      </Container>
    </div>
  );
}

export function PricingPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#0066CC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white">Loading pricing...</p>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  );
}
