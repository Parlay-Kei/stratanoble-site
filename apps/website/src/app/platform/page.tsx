import React from 'react';
import { Metadata } from 'next';
import {
  HeartIcon,
  LightBulbIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  CursorArrowRaysIcon,
  TrophyIcon,
  StarIcon,
  HandRaisedIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlayIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Platform Preview | Strata Noble - Tools That Support Your Journey',
  description: 'Preview the supportive tools and resources that help everyday entrepreneurs turn their ideas into income through our guided platform.',
  keywords: 'entrepreneur tools, business platform, idea validation, progress tracking, supportive business tools',
};

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <SparklesIcon className="h-5 w-5" />
              Platform Preview
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Tools That{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Support Your Journey
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple, helpful tools designed to guide you from idea to income without the overwhelm. 
              Each tool builds on the next, supporting you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Tool Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Supportive Toolkit
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each tool is designed to make your entrepreneurial journey feel manageable and encouraging
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: 'First Dollar Validator',
                subtitle: 'Test your idea safely',
                color: 'emerald',
                icon: CurrencyDollarIcon,
                description: 'A gentle way to test if people will actually pay for your idea before you invest time and money building it.',
                features: [
                  'Simple validation framework',
                  'Low-risk testing methods',
                  'Clear yes/no guidance',
                  'Real customer feedback'
                ],
                preview: 'Start with just asking 10 people if they\'d pay $X for your solution. We\'ll show you exactly how to ask.',
                benefit: 'Confidence before you invest'
              },
              {
                title: 'Progress Tracker',
                subtitle: 'See how far you\'ve come',
                color: 'blue',
                icon: ChartBarIcon,
                description: 'A visual dashboard that tracks your milestones and celebrates your wins, keeping you motivated along the way.',
                features: [
                  'Visual progress tracking',
                  'Milestone celebrations',
                  'Weekly check-ins',
                  'Motivation boosters'
                ],
                preview: 'Watch your journey unfold with visual milestones, progress bars, and celebration moments for every win.',
                benefit: 'Stay motivated and see progress'
              },
              {
                title: 'Simple Business Canvas',
                subtitle: 'Clarity without complexity',
                color: 'purple',
                icon: DocumentTextIcon,
                description: 'A one-page business model that makes sense to real people - no MBA required, just clear thinking.',
                features: [
                  'One-page overview',
                  'Plain language prompts',
                  'Visual thinking tools',
                  'Easy to update'
                ],
                preview: 'Fill in simple blanks: Who needs this? What problem does it solve? How will you reach them?',
                benefit: 'Crystal clear business direction'
              },
              {
                title: 'Revenue Roadmap',
                subtitle: 'Your path to first $1,000',
                color: 'amber',
                icon: RocketLaunchIcon,
                description: 'Step-by-step guidance to your first $1,000 in revenue, broken down into manageable daily actions.',
                features: [
                  'Step-by-step guidance',
                  'Daily action items',
                  'Revenue milestones',
                  'Celebration checkpoints'
                ],
                preview: 'Day 1: Validate with 5 people. Day 7: Set up simple payment. Day 30: First paying customer.',
                benefit: 'Clear path to first income'
              }
            ].map((tool, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 group hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div className={`bg-${tool.color}-100 rounded-xl p-4 mr-6`}>
                    <tool.icon className={`h-8 w-8 text-${tool.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{tool.title}</h3>
                    <p className={`text-${tool.color}-600 font-medium`}>{tool.subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {tool.description}
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">What You Get</h4>
                  <div className="space-y-2">
                    {tool.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center">
                        <CheckCircleIcon className={`h-4 w-4 text-${tool.color}-600 mr-3 flex-shrink-0`} />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`bg-${tool.color}-50 rounded-xl p-4 border border-${tool.color}-200 mb-6`}>
                  <h5 className={`font-semibold text-${tool.color}-900 mb-2`}>Preview:</h5>
                  <p className={`text-${tool.color}-700 text-sm italic`}>"{tool.preview}"</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SparklesIcon className={`h-4 w-4 text-${tool.color}-600 mr-2`} />
                    <span className={`text-${tool.color}-800 font-medium text-sm`}>{tool.benefit}</span>
                  </div>
                  <span className={`bg-${tool.color}-100 text-${tool.color}-800 px-3 py-1 rounded-full text-xs font-semibold`}>
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Together */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It All Works Together
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each tool builds on the previous one, creating a supported journey from idea to income
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Validate',
                description: 'Use the First Dollar Validator to test if people will pay for your idea',
                color: 'emerald'
              },
              {
                step: '2', 
                title: 'Plan',
                description: 'Fill out your Simple Business Canvas to get clarity on your approach',
                color: 'blue'
              },
              {
                step: '3',
                title: 'Execute',
                description: 'Follow your Revenue Roadmap with daily actions toward first income',
                color: 'purple'
              },
              {
                step: '4',
                title: 'Track',
                description: 'Monitor progress and celebrate wins with your Progress Tracker',
                color: 'amber'
              }
            ].map((phase, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-${phase.color}-100 rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <span className={`text-${phase.color}-600 font-bold text-xl`}>{phase.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{phase.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{phase.description}</p>
                
                {index < 3 && (
                  <div className="hidden md:block mt-4">
                    <div className="flex justify-center">
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform vs Human Support */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Best of Both Worlds
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform tools give you the guidance and structure you need, while human support 
                provides the encouragement and personalized help that makes all the difference.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: 'Platform Tools',
                    description: 'Available 24/7 to guide your next steps and track your progress',
                    icon: SparklesIcon,
                    color: 'emerald'
                  },
                  {
                    title: 'Human Support',
                    description: 'Real people who understand your journey and cheer you on',
                    icon: HeartIcon,
                    color: 'blue'
                  },
                  {
                    title: 'Your Success',
                    description: 'The combination that helps you turn ideas into income confidently',
                    icon: TrophyIcon,
                    color: 'purple'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`bg-${item.color}-100 rounded-lg p-3 mr-4 mt-1`}>
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-8 border border-emerald-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Access</h3>
              
              <div className="space-y-4 mb-8">
                {[
                  'Full access to all four tools',
                  'Step-by-step guided workflows', 
                  'Progress tracking and celebrations',
                  'Weekly check-in reminders',
                  'Resource library and templates',
                  'Community of fellow entrepreneurs'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">$47/month</div>
                <div className="text-gray-600 text-sm mb-6">Platform access + guided support</div>
                
                <Link
                  href="/achievery?utm_source=platform-preview&utm_medium=cta&utm_campaign=open-achievery"
                  className="block bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 text-center"
                >
                  ACHIEVERY Platform
                </Link>
                
                <p className="text-gray-500 text-xs mt-3">Part of the Strata Noble ecosystem - available now!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions You Might Have
            </h2>
            <p className="text-lg text-gray-600">
              Here's what other entrepreneurs want to know
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'Is this really designed for everyday people?',
                answer: 'Absolutely! We specifically created these tools for people who don\'t have business degrees or startup experience. Everything is explained in plain language with clear next steps.'
              },
              {
                question: 'What if I get stuck or need help?',
                answer: 'That\'s exactly why we combine platform tools with human support. You\'ll have access to real people who understand your journey and can help you through any obstacles.'
              },
              {
                question: 'How is this different from other business tools?',
                answer: 'Most business tools are either too complex or too generic. Ours are designed specifically for the "idea to first income" journey with supportive guidance every step of the way.'
              },
              {
                question: 'When will the platform be available?',
                answer: 'We\'re putting the finishing touches on the platform now. Join our early access list to be among the first to try it and get special launch pricing.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-300 to-emerald-200 bg-clip-text text-transparent">
              Ready to Start Your Supported Journey?
            </span>
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join our early access list to be the first to experience these supportive tools 
            and get special launch pricing when we go live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/achievery?utm_source=platform-preview&utm_medium=cta&utm_campaign=open-achievery"
              className="bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:bg-emerald-50 transition-colors inline-flex items-center justify-center"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              ACHIEVERY Platform
            </Link>
            <Link 
              href="/methodology?utm_source=platform-preview&utm_medium=cta&utm_campaign=learn-approach"
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-emerald-600 transition-colors inline-flex items-center justify-center"
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Learn Our Approach
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-emerald-500/30">
            <p className="text-emerald-200 text-sm">
              Tools that support you. People who believe in you. Progress you can see.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
