'use client'

import React from 'react'
import { ArrowRightIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCTATracking } from '@/lib/useAnalytics'
import { ClientLogoStrip } from '../ClientLogoStrip'

// CTA buttons with clear hierarchy
const CTA_BUTTONS = {
  primary: { text: 'Get Started', icon: ArrowRightIcon, href: '/contact' },
  secondary: { text: 'Start Workshop', icon: CalendarIcon, href: '/contact?type=workshop' }
}

export function HeroSection() {
  const { trackClick } = useCTATracking()

  const handleCTAClick = (type: 'primary' | 'secondary') => {
    // Track CTA clicks
    trackClick(type, 0, 'hero')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy to-brand-emerald py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Enhanced Tagline Banner */}
          <motion.div 
            className="mb-8 inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SparklesIcon className="mr-2 h-4 w-4" />
            Passion to Prosperity
            <SparklesIcon className="ml-2 h-4 w-4" />
          </motion.div>

          {/* Enhanced Main Headline */}
          <motion.h1 
            className="text-4xl font-bold tracking-tight text-brand-light sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Transform Your{' '}
            <span className="gradient-text">Passion</span>
            <br />
            Into{' '}
            <span className="gradient-text">Profit</span>
          </motion.h1>

          {/* Refined Sub-headline - One sentence value proposition */}
          <motion.p 
            className="mt-6 text-lg leading-8 text-brand-light sm:text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We turn your passion into a profitable business through proven strategies, 
            expert guidance, and systematic execution because your vision deserves to thrive.
          </motion.p>

          {/* Enhanced Dual-State CTA Buttons with Micro-interactions */}
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Primary CTA - Get Started (Solid) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={CTA_BUTTONS.primary.href}
                className="btn-primary btn-lg group w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleCTAClick('primary')}
              >
                <div className="flex items-center">
                  <CTA_BUTTONS.primary.icon className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  {CTA_BUTTONS.primary.text}
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </div>
              </Link>
            </motion.div>

            {/* Secondary CTA - Start Workshop (Outline) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={CTA_BUTTONS.secondary.href}
                className="btn-outline btn-lg group w-full sm:w-auto border-2 transition-all duration-300"
                onClick={() => handleCTAClick('secondary')}
              >
                <div className="flex items-center">
                  <CTA_BUTTONS.secondary.icon className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  {CTA_BUTTONS.secondary.text}
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Trust Indicators */}
          <motion.div 
            className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-brand-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div 
              className="flex items-center gap-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Proven Strategies</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Expert Guidance</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Results-Driven</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Client Logo Strip */}
      <ClientLogoStrip 
        title="Trusted by innovative companies"
        subtitle="Join hundreds of successful entrepreneurs who've transformed their businesses"
      />

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-emerald-400 to-navy-400 opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
      </div>
    </section>
  )
}
