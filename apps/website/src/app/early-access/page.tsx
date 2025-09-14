'use client';

import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon, BoltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function EarlyAccessPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
      email: formData.get('email'),
      role: formData.get('role'),
      goals: formData.get('goals'),
      updates: formData.get('updates') === 'on'
    };

    try {
      const response = await fetch('/api/email/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setMessage(result.message || 'Successfully added to early access list!');
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitStatus('error');
        setMessage(result.message || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-8">
            <BoltIcon className="h-5 w-5" />
            Limited Early Access Available
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-navy-900 mb-6">
            Get Early Access to<br />
            <span className="text-emerald-600">ACHIEVERY</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Join an exclusive group of professionals who are transforming their daily activities
            into meaningful career growth. Limited spots available.
          </p>
        </div>
      </section>

      {/* Early Access Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">
            Early Access Benefits
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Priority Platform Access',
                description: 'First access to the complete ACHIEVERY platform with all features',
                icon: '🚀'
              },
              {
                title: 'Founding Member Pricing',
                description: 'Lock in special early-bird pricing for life as a founding member',
                icon: '💰'
              },
              {
                title: 'Direct Feedback Channel',
                description: 'Shape the platform development with direct input to our team',
                icon: '🎯'
              },
              {
                title: 'Exclusive Community',
                description: 'Join a private community of ambitious professionals',
                icon: '👥'
              },
              {
                title: 'Personal Onboarding',
                description: 'One-on-one setup session with our team',
                icon: '🤝'
              },
              {
                title: 'Early Feature Access',
                description: 'Beta test new features before general release',
                icon: '⚡'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-navy-600 to-emerald-600">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Request Early Access
              </h2>
              <p className="text-gray-600">
                Join the waitlist and we'll notify you when your spot is ready
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Role/Industry *
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Marketing Manager, Software Developer"
                />
              </div>

              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
                  What's your biggest professional growth challenge?
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Tell us about your current challenges and goals..."
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="updates"
                  name="updates"
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="updates" className="ml-3 text-sm text-gray-600">
                  I'd like to receive updates about ACHIEVERY development and early access opportunities
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                }`}
              >
                <SparklesIcon className="h-5 w-5 inline mr-2" />
                {isSubmitting ? 'Processing...' : 'Request Early Access'}
              </button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2" />
                    <p className="text-emerald-800 font-medium">{message}</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="h-5 w-5 text-red-600 mr-2">⚠️</span>
                    <p className="text-red-800 font-medium">{message}</p>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have access?
                <Link href="https://app.achievery.com/platform" className="text-emerald-600 hover:text-emerald-500 font-medium ml-1">
                  Sign in to ACHIEVERY
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-navy-900 mb-8">
            Join Other Ambitious Professionals
          </h2>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
                <div className="text-gray-600">Early Access Requests</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">25+</div>
                <div className="text-gray-600">Beta Testers Active</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Main Site */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-navy-600 transition-colors"
          >
            ← Back to Strata Noble
          </Link>
        </div>
      </section>
    </div>
  );
}