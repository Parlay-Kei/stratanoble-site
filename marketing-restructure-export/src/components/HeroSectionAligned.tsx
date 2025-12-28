'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ChartBarIcon, LightBulbIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Logo } from './Logo';
import { publicConfig } from '@/lib/public-config';

export function HeroSectionAligned() {
  const [idea, setIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const successPrinciples = [
    { icon: LightBulbIcon, label: 'Clarity Over Confusion', value: '100%' },
    { icon: ChartBarIcon, label: 'Evidence Over Guesswork', value: '100%' },
    { icon: CurrencyDollarIcon, label: 'Sustainability Over Quick Wins', value: '100%' }
  ];

  const handleSubmit = async () => {
  setError(null);
  if (!idea?.trim()) {
    setError('Please enter your idea.');
    return;
  }
  try {
    setSubmitting(true);
    const res = await fetch('/api/validate-idea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: idea.trim() })
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || 'Something went wrong. Please try again.');
    }

    if (data?.success && data?.analysis) {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ideaAnalysis', JSON.stringify(data.analysis));
          sessionStorage.setItem('userIdea', idea.trim());
          window.location.href = '/get-started';
        }
      } catch (error) {
        console.error('Failed to save to sessionStorage:', error);
        // Fallback - still redirect but without cached data
        if (typeof window !== 'undefined') {
          window.location.href = '/get-started';
        }
      }
    } else {
      throw new Error('Failed to validate idea. Please try again.');
    }
  } catch (e: any) {
    setError(e?.message || 'Submission failed. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0] 
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            {/* <Logo variant="full" className="h-64 w-auto" theme="white" /> */}
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Turn Any{' '}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent"
              >
                Idea
              </motion.span>
              <br />
              Into a{' '}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
              >
                Real Business
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            You’ve got the idea. We’ve got the AI that builds it. Zero experience needed.
          </motion.p>

          {/* Success Principles Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {successPrinciples.map((principle, index) => (
              <motion.div
                key={principle.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex flex-col items-center space-y-3">
                  <principle.icon className="h-8 w-8 text-accent-gold" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{principle.value}</div>
                    <div className="text-sm text-gray-300">{principle.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Idea Capture */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label htmlFor="idea" className="sr-only">Your idea</label>
                  <input
                    id="idea"
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your idea (e.g., meal kits for students)"
                    className="w-full rounded-xl px-4 py-3 bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    disabled={submitting}
                  />
                </div>
                <div className="flex items-stretch md:justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy focus:ring-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto"
                    aria-label="Validate my idea for free"
                  >
                    {submitting ? 'Submitting...' : 'Validate My Idea Free'}
                  </button>
                </div>
              </div>
              {error && (
                <div className="mt-3 text-sm text-red-200">{error}</div>
              )}
              <p className="mt-2 text-xs text-gray-300">Free instant check. No spam. Unsubscribe anytime.</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col items-center space-y-4 pt-8"
          >
            <motion.a
              href="/discovery?utm_source=hero&utm_medium=cta&utm_campaign=start-assessment"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span>Start Your Free Assessment</span>
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.a>
            
            <motion.a
              href="/platform?utm_source=hero&utm_medium=cta&utm_campaign=preview-platform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white/80 hover:text-white text-base underline transition-colors"
            >
              or preview the platform
            </motion.a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="pt-8 text-center"
          >
            <p className="text-sm text-gray-400 mb-4">Trusted by everyday entrepreneurs</p>
            <div className="flex justify-center items-center space-x-8 text-gray-500">
              <div className="text-sm">• Proven Strategies</div>
              <div className="text-sm">• AI-Powered Tools</div>
              <div className="text-sm">• Personalized Guidance</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

