import React from 'react';
import type { Metadata } from 'next';
import {
  BoltIcon,
  CheckCircleIcon,
  SparklesIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'ACHIEVERY Early Access - Get Notified When We Launch',
  description: 'Join the ACHIEVERY early access list to be among the first to transform your daily activities into professional growth achievements.',
  keywords: 'ACHIEVERY early access, professional growth, activity tracking, early bird signup',
};

export default function AchieveryEarlyAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-navy-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
            <BoltIcon className="h-5 w-5" />
            Early Access - Limited Spots
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-navy-900 mb-6">
            Be First to Access
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-navy-600 bg-clip-text text-transparent mb-8">
            ACHIEVERY
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Join our exclusive early access list to be among the first to transform your daily activities 
            into recognized professional achievements. Limited spots available.
          </p>
        </div>
      </section>

      {/* Early Access Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Early Access Benefits
            </h2>
            <p className="text-lg text-gray-600">
              Get exclusive perks as one of our first users
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Special Launch Pricing',
                description: '50% off your first 6 months - exclusive to early access members',
                icon: SparklesIcon,
                color: 'emerald',
                benefit: 'Save $141 on Growth plan'
              },
              {
                title: 'Priority Onboarding',
                description: 'Personal setup call and priority support during your first month',
                icon: UserIcon,
                color: 'navy',
                benefit: '1-on-1 success coaching'
              },
              {
                title: 'Founding Member Status',
                description: 'Lifetime founder badge and input on future feature development',
                icon: CheckCircleIcon,
                color: 'emerald',
                benefit: 'Shape the platform\'s future'
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`bg-${benefit.color}-100 rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                  <benefit.icon className={`h-8 w-8 text-${benefit.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.description}</p>
                <div className={`bg-${benefit.color}-50 rounded-lg p-3 border border-${benefit.color}-200`}>
                  <p className={`text-${benefit.color}-800 font-medium text-sm`}>💎 {benefit.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-navy-600 to-emerald-600">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Secure Your Spot
              </h2>
              <p className="text-gray-600">
                Join the waitlist - we'll notify you the moment ACHIEVERY launches with your exclusive benefits
              </p>
            </div>

            <form action="/api/email/early-access" method="POST" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy-900 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-navy-900 mb-2">
                  Current Role (Optional)
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select your role</option>
                  <option value="professional">Working Professional</option>
                  <option value="manager">Manager/Team Lead</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="consultant">Consultant/Freelancer</option>
                  <option value="student">Student/Recent Graduate</option>
                  <option value="career-changer">Career Changer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-navy-900 mb-2">
                  What's your biggest professional growth challenge? (Optional)
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  rows={3}
                  placeholder="e.g., Feeling stuck in my career, want to track my progress better, need help identifying achievements..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-4 px-8 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <BoltIcon className="h-5 w-5 mr-2 inline" />
                Join Early Access List
              </button>

              <p className="text-center text-sm text-gray-500">
                We'll never share your information. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-8">
            What Happens Next?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Confirmation Email',
                description: 'You\'ll receive an immediate confirmation with your early access details and estimated launch timeline.'
              },
              {
                step: '2', 
                title: 'Updates & Sneak Peeks',
                description: 'Get behind-the-scenes updates, feature previews, and development progress as we build ACHIEVERY.'
              },
              {
                step: '3',
                title: 'Launch Notification',
                description: 'Be the first to know when we launch with your exclusive discount code and priority onboarding link.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xl">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              <SparklesIcon className="h-5 w-5 mr-2 inline" />
              Expected Launch: Q1 2026 - Early access members get 30-day head start
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
