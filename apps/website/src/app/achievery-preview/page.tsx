import React from 'react';
import { Metadata } from 'next';
import {
  ChartBarIcon,
  ArrowPathIcon,
  MapIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  PlayIcon,
  SparklesIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ACHIEVERY - Transform Daily Activities Into Professional Growth',
  description: 'The activity-to-possibility translator for professionals who want practical progress without gamification. Turn ordinary activities into recognized achievements.',
  keywords: 'professional growth, activity tracking, career development, achievement management, progress tracking',
};

export default function AchieveryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/10 to-emerald-600/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <BoltIcon className="h-5 w-5" />
              Early Access Available
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-navy-900 mb-6">
              ACHIEVERY
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8">
              Transform Daily Activities Into Professional Growth
            </h2>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              The activity-to-possibility translator for professionals who want 
              practical progress without gamification.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                href="http://localhost:3001?utm_source=achievery-preview&utm_medium=cta&utm_campaign=preview-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Preview Platform
              </Link>
              <Link
                href="/achievery-early-access?utm_source=achievery-preview&utm_medium=cta&utm_campaign=early-access"
                className="border-2 border-navy-300 text-navy-700 font-bold py-4 px-8 rounded-xl hover:bg-navy-50 transition-all duration-300 inline-flex items-center justify-center"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Early Access Signup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What Is ACHIEVERY? */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-navy-900 mb-6">
                What Is ACHIEVERY?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-3 mr-4 mt-1">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">Clear Value Proposition</h3>
                    <p className="text-gray-600">"Turn ordinary activities into recognized professional achievements"</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-navy-100 rounded-lg p-3 mr-4 mt-1">
                    <CheckCircleIcon className="h-6 w-6 text-navy-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">Target Audience</h3>
                    <p className="text-gray-600">"For working professionals aged 25-45 who feel stuck but want a clear path forward"</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-silver-100 rounded-lg p-3 mr-4 mt-1">
                    <CheckCircleIcon className="h-6 w-6 text-silver-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">Key Differentiator</h3>
                    <p className="text-gray-600">"No badges, streaks, or points - just meaningful progress tracking"</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-navy-50 rounded-3xl p-8 border border-emerald-200">
              <h3 className="text-2xl font-bold text-navy-900 mb-6">Transform Your Activities</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-gray-500 text-sm mb-2">Before:</div>
                  <div className="text-gray-600">"Helped friend with email setup"</div>
                </div>
                <div className="flex justify-center">
                  <ArrowPathIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="text-emerald-600 text-sm mb-2">After:</div>
                  <div className="text-emerald-800 font-medium">"Practiced marketable tech skills"</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Five powerful tools designed to transform how you see and track your professional growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Pathfinder Onboarding',
                icon: MapIcon,
                color: 'emerald',
                description: 'Discover what drives you and get 3-5 personalized starter actions',
                preview: 'Complete a guided discovery process that identifies your core motivations and provides immediate next steps'
              },
              {
                title: 'Reframe Engine',
                icon: ArrowPathIcon, 
                color: 'navy',
                description: 'Transform "helped friend with email" → "practiced marketable tech skills"',
                preview: 'AI-powered activity transformation that reveals the professional value in everyday actions'
              },
              {
                title: 'Three-Phase Roadmap',
                icon: ChartBarIcon,
                color: 'silver',
                description: 'Track progress through Explore → Build → Launch phases',
                preview: 'Visual progression system that shows exactly where you are and what comes next'
              },
              {
                title: 'Weekly Narratives',
                icon: DocumentTextIcon,
                color: 'emerald',
                description: 'Get meaningful progress summaries, not just metrics',
                preview: 'AI-generated stories about your progress that highlight growth and suggest improvements'
              },
              {
                title: 'Trust Ledger',
                icon: ShieldCheckIcon,
                color: 'navy',
                description: 'Private achievement record with optional mentor sharing',
                preview: 'Secure personal achievement database that you can selectively share with trusted advisors'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className={`bg-${feature.color}-100 rounded-lg p-3 mr-4`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className={`bg-${feature.color}-50 rounded-lg p-3 border border-${feature.color}-200`}>
                  <p className={`text-${feature.color}-700 text-sm`}>{feature.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Access Information */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              ACHIEVERY Platform Access
            </h2>
            <p className="text-lg text-gray-600">
              Available across all your devices with progressive web app features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: 'Web Browser',
                subtitle: 'All Devices',
                icon: ComputerDesktopIcon,
                status: '✅ Available Now',
                color: 'emerald'
              },
              {
                title: 'Mobile Responsive',
                subtitle: 'Optimized Experience', 
                icon: DevicePhoneMobileIcon,
                status: '✅ Available Now',
                color: 'navy'
              },
              {
                title: 'Progressive Web App',
                subtitle: 'App-Like Features',
                icon: GlobeAltIcon,
                status: '✅ Available Now',
                color: 'silver'
              }
            ].map((access, index) => (
              <div key={index} className="text-center">
                <div className={`bg-${access.color}-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center`}>
                  <access.icon className={`h-10 w-10 text-${access.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">{access.title}</h3>
                <p className="text-gray-600 mb-3">{access.subtitle}</p>
                <span className={`bg-${access.color}-100 text-${access.color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>
                  {access.status}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-navy-50 to-emerald-50 rounded-3xl p-8 border border-navy-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy-900 mb-4">Current Status: Early Access</h3>
              <p className="text-gray-600 mb-6">Integrated with your Strata Noble account</p>
              <p className="text-sm text-navy-600 bg-navy-100 rounded-lg px-4 py-2 inline-block">
                📱 Native Apps Coming Soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Integration */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Included with Strata Noble Tiers
            </h2>
            <p className="text-lg text-gray-600">
              ACHIEVERY access scales with your subscription level
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tier: 'Basic',
                price: '$47/month',
                limit: '5 actions/week tracking',
                features: [
                  'Pathfinder Onboarding',
                  'Basic activity logging',
                  'Weekly progress summaries',
                  'Community access'
                ],
                color: 'silver'
              },
              {
                tier: 'Pro', 
                price: '$97/month',
                limit: '25 actions/week + full features',
                features: [
                  'All Basic features',
                  'Reframe Engine access',
                  'Three-Phase Roadmap',
                  'Weekly AI Narratives',
                  'Trust Ledger (10 shares)',
                  'Priority support'
                ],
                color: 'emerald',
                popular: true
              },
              {
                tier: 'Enterprise',
                price: '$197/month', 
                limit: '100 actions/week + coach tools',
                features: [
                  'All Pro features',
                  'Unlimited Trust Ledger shares',
                  'Coach integration tools',
                  'Team collaboration features',
                  'Custom reporting',
                  'Direct coaching access'
                ],
                color: 'navy'
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-emerald-300 ring-4 ring-emerald-100' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-navy-900 mb-2">{plan.tier}</h3>
                  <div className="text-3xl font-bold text-navy-900 mb-2">{plan.price}</div>
                  <div className={`text-${plan.color}-600 font-medium text-sm`}>{plan.limit}</div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center">
                      <CheckCircleIcon className={`h-4 w-4 text-${plan.color}-600 mr-3 flex-shrink-0`} />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/contact?utm_source=achievery&utm_medium=pricing&utm_campaign=${plan.tier.toLowerCase()}-tier`}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600' 
                      : `bg-${plan.color}-100 text-${plan.color}-800 hover:bg-${plan.color}-200`
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-navy-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Growth Journey
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Transform your daily activities into recognized professional achievements. 
            No gamification, just meaningful progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="http://localhost:3001?utm_source=achievery-preview&utm_medium=final-cta&utm_campaign=preview-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-navy-600 font-bold py-4 px-8 rounded-2xl hover:bg-navy-50 transition-colors inline-flex items-center justify-center shadow-lg"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Preview Platform
            </Link>
            <Link 
              href="/achievery-early-access?utm_source=achievery-preview&utm_medium=final-cta&utm_campaign=early-access"
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-navy-600 transition-colors inline-flex items-center justify-center"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Early Access Signup
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/80 text-sm">
              The activity-to-possibility translator for ambitious professionals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
