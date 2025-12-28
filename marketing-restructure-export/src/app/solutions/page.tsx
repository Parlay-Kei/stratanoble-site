import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckIcon, StarIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: 'Solutions | Strata Noble - Choose Your Package',
  description: 'Flexible CaaS platform packages for entrepreneurs. From self-service tools to full coaching support, find the right fit for your journey.',
  keywords: 'consulting packages, CaaS tiers, business coaching packages, platform subscription',
};

export default function SolutionsPage() {
  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for exploring and getting started',
      features: [
        'AI idea validation',
        'Market research report',
        'Business name generator',
        'Basic business plan',
        '5 AI assists per month',
        'Community forum access',
        'Business templates library'
      ],
      cta: 'Get Started Free',
      ctaHref: '/auth/signup',
      popular: false,
      color: 'gray',
      tierId: 'free'
    },
    {
      name: 'Builder',
      price: '$47',
      period: '/month',
      description: 'For serious builders ready to launch',
      features: [
        'Everything in Starter',
        'Complete business plan',
        'Brand identity package',
        'Website builder with templates',
        'Unlimited AI assists',
        'Marketing automation',
        'Launch playbook',
        'Priority email support'
      ],
      cta: 'Start Building',
      ctaHref: '/checkout?tier=builder',
      popular: true,
      color: 'emerald',
      tierId: 'builder'
    },
    {
      name: 'Prosperity',
      price: '$97',
      period: '/month',
      description: 'Advanced automation with expert coaching',
      features: [
        'Everything in Builder',
        'Advanced automation workflows',
        '1-on-1 monthly coaching call',
        'Priority support (2-hour response)',
        'Funding assistance & grant finder',
        'Custom growth strategies',
        'Performance analytics dashboard',
        'Dedicated success manager'
      ],
      cta: 'Go Pro',
      ctaHref: '/checkout?tier=prosperity',
      popular: false,
      color: 'blue',
      tierId: 'prosperity'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Path to{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Prosperity
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Whether you're just starting or ready to scale, we have a package 
            that meets you where you are—and helps you get where you want to go.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <div
                id={tier.name.toLowerCase()}
                key={index}
                className={`relative bg-white rounded-3xl p-8 border-2 ${
                  tier.popular 
                    ? 'border-emerald-500 shadow-2xl scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <StarIcon className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-4">{tier.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-bold ${tier.popular ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-gray-500">{tier.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className={`h-5 w-5 ${tier.popular ? 'text-emerald-600' : 'text-gray-600'} mt-0.5 mr-3 flex-shrink-0`} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.ctaHref}
                  className={`block text-center font-bold py-4 px-6 rounded-xl transition-all duration-300 ${
                    tier.popular
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Compare Packages
          </h2>
          {/* Add detailed comparison table here */}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          {/* Add FAQ accordion here */}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Not Sure Which Package to Choose?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Start with a free discovery call. We'll help you find the right fit.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-emerald-600 font-bold py-4 px-10 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
          >
            Schedule Discovery Call
          </Link>
        </div>
      </section>
    </div>
  );
}

