import React from 'react';
import { Suspense } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
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
  BoltIcon,
  UserCircleIcon,
  ArrowRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { publicConfig } from '@/lib/public-config';

export const metadata: Metadata = {
  title: 'ACHIEVERY - Transform Daily Activities Into Professional Growth',
  description: 'The activity-to-possibility translator for professionals who want practical progress without gamification. Turn ordinary activities into recognized achievements.',
  keywords: 'professional growth, activity tracking, career development, achievement management, progress tracking',
};

export default function AchieveryPage() {
  return (
    <>
      {/* Preload critical images for better performance */}

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

            {/* Enhanced CTAs with Visual Context */}
            <div className="bg-gradient-to-r from-navy-50/80 to-emerald-50/80 rounded-3xl p-8 backdrop-blur-sm border border-white/20 mb-16">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Experience ACHIEVERY Now</h3>
                <p className="text-gray-600">Choose your path to professional growth</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href={`${publicConfig.achieveryUrl}?utm_source=achievery-preview&utm_medium=cta&utm_campaign=preview-platform`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center transform hover:scale-105"
                >
                  <EyeIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  Preview Platform
                  <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/achievery-early-access?utm_source=achievery-preview&utm_medium=cta&utm_campaign=early-access"
                  className="group border-2 border-navy-300 text-navy-700 font-bold py-4 px-8 rounded-xl hover:bg-navy-50 transition-all duration-300 inline-flex items-center justify-center hover:border-navy-400"
                >
                  <SparklesIcon className="h-5 w-5 mr-2 group-hover:animate-spin" />
                  Early Access Signup
                  <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">✓ No credit card required for preview • ✓ Full features available</p>
              </div>
            </div>

            {/* Dashboard Preview Hero Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-2xl border border-gray-200">
                <Suspense fallback={
                  <div className="w-full h-96 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
                    <div className="text-gray-500">Loading dashboard preview...</div>
                  </div>
                }>
                  <Image
                    src="/images/achievery/dashboard-growth-tier.webp"
                    alt="ACHIEVERY Platform Dashboard - Transform daily activities into professional growth"
                    width={1200}
                    height={800}
                    className="rounded-xl w-full h-auto"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </Suspense>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✅ Live Preview Available
              </div>
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

      {/* User Flow Demonstration */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-navy-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              See Your Journey from Start to Growth
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the complete ACHIEVERY workflow from sign-in to meaningful progress tracking
            </p>
          </div>

          {/* Sign-in Process Preview */}
          <div className="mb-20">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-navy-100 text-navy-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <UserCircleIcon className="h-4 w-4" />
                  Step 1: Secure Access
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Professional Authentication Experience</h3>
                <p className="text-gray-600">Streamlined sign-in integrated with your Strata Noble account</p>
              </div>

              <div className="relative">
                <Image
                  src="/images/achievery/signin-interface.webp"
                  alt="ACHIEVERY Sign-in Interface - Professional authentication experience"
                  width={800}
                  height={500}
                  className="rounded-xl w-full h-auto shadow-lg"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Live Interface</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "2",
                title: "Pathfinder Onboarding",
                description: "Discover your motivations and get personalized starter actions",
                icon: MapIcon,
                color: "emerald"
              },
              {
                step: "3",
                title: "Activity Transformation",
                description: "Turn everyday actions into recognized professional achievements",
                icon: ArrowPathIcon,
                color: "navy"
              },
              {
                step: "4",
                title: "Progress Tracking",
                description: "Watch your growth through visual roadmaps and AI narratives",
                icon: ChartBarIcon,
                color: "silver"
              }
            ].map((workflow, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-${workflow.color}-100 text-${workflow.color}-800 rounded-full font-bold text-lg mb-4 mx-auto`}>
                  {workflow.step}
                </div>
                <div className={`bg-${workflow.color}-50 rounded-lg p-3 mb-4 mx-auto w-fit`}>
                  <workflow.icon className={`h-8 w-8 text-${workflow.color}-600`} />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{workflow.title}</h3>
                <p className="text-gray-600 text-sm">{workflow.description}</p>
              </div>
            ))}
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

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Feature Cards */}
            <div className="grid gap-6">
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

            {/* Visual Feature Demonstration */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-navy-50 to-emerald-50 rounded-2xl p-6 border border-navy-200">
                <h3 className="text-xl font-bold text-navy-900 mb-4">Interactive Dashboard</h3>
                <div className="relative group">
                  <Suspense fallback={
                    <div className="w-full h-80 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                      <div className="text-gray-500">Loading interface...</div>
                    </div>
                  }>
                    <Image
                      src="/images/achievery/dashboard-growth-tier.webp"
                      alt="ACHIEVERY Interactive Dashboard - Real-time activity transformation"
                      width={600}
                      height={400}
                      className="rounded-lg w-full h-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                      loading="lazy"
                    />
                  </Suspense>
                  <div className="absolute top-3 right-3 bg-emerald-100/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700">
                    ✨ Growth Tier
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    title: 'Weekly Narratives',
                    icon: DocumentTextIcon,
                    color: 'emerald',
                    description: 'Get meaningful progress summaries, not just metrics'
                  },
                  {
                    title: 'Trust Ledger',
                    icon: ShieldCheckIcon,
                    color: 'navy',
                    description: 'Private achievement record with optional mentor sharing'
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <div className="flex items-center">
                      <div className={`bg-${feature.color}-100 rounded-lg p-2 mr-3`}>
                        <feature.icon className={`h-5 w-5 text-${feature.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-900">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

          {/* Cross-Platform Visual Demo */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Works Seamlessly Everywhere</h3>
                <p className="text-gray-600">Desktop, tablet, and mobile - optimized for every screen</p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                <Image
                  src="/images/achievery/mobile-responsive-demo.webp"
                  alt="ACHIEVERY cross-platform demonstration - desktop, tablet and mobile views"
                  width={1000}
                  height={600}
                  className="w-full h-auto rounded-xl"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  🌐 Progressive Web App Ready
                </div>
              </div>
            </div>
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

          {/* Visual Tier Comparison */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-navy-900 mb-2">See What Each Tier Unlocks</h3>
                <p className="text-gray-600">Visual comparison of dashboard features across subscription levels</p>
              </div>

              <div className="relative">
                <Image
                  src="/images/achievery/tier-comparison-grid.webp"
                  alt="ACHIEVERY subscription tiers comparison - Free, Growth, and Partner dashboard features"
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-xl"
                  loading="lazy"
                />
              </div>
            </div>
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
                color: 'silver',
                dashboardImage: '/images/achievery/dashboard-free-tier.webp'
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
                popular: true,
                dashboardImage: '/images/achievery/dashboard-growth-tier.webp'
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
                color: 'navy',
                dashboardImage: '/images/achievery/dashboard-partner-tier.webp'
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

                {/* Dashboard Preview for Tier */}
                <div className="mb-6">
                  <div className="relative">
                    <Image
                      src={plan.dashboardImage}
                      alt={`${plan.tier} tier dashboard preview`}
                      width={400}
                      height={250}
                      className="w-full h-auto rounded-lg border border-gray-200"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
                      {plan.tier} Dashboard
                    </div>
                  </div>
                </div>

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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href={`${publicConfig.achieveryUrl}?utm_source=achievery-preview&utm_medium=final-cta&utm_campaign=preview-platform`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white text-navy-600 font-bold py-4 px-8 rounded-2xl hover:bg-navy-50 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <EyeIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              Preview Platform
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/achievery-early-access?utm_source=achievery-preview&utm_medium=final-cta&utm_campaign=early-access"
              className="group border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-navy-600 transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105"
            >
              <SparklesIcon className="h-5 w-5 mr-2 group-hover:animate-spin" />
              Early Access Signup
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Final Visual Proof Point */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white mb-1">5 Core Tools</div>
                <div className="text-white/80 text-sm">Professional growth features</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">Cross-Platform</div>
                <div className="text-white/80 text-sm">Web, mobile, and PWA ready</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">No Gamification</div>
                <div className="text-white/80 text-sm">Meaningful progress tracking</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/80 text-sm">
              The activity-to-possibility translator for ambitious professionals.
            </p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
