'use client'

import React from 'react'
import { ArrowRightIcon, CalendarIcon, ChartBarIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCTATracking } from '@/lib/useAnalytics'
import { Logo } from './Logo'

// Market statistics dashboard data
const MARKET_STATS = [
  { label: 'Job Market Decline', value: '23%', trend: 'down', icon: ArrowTrendingUpIcon, color: 'text-accent-red' },
  { label: 'AI Adoption Growth', value: '300%', trend: 'up', icon: ChartBarIcon, color: 'text-emerald-600' },
  { label: 'Avg. Job Search Time', value: '6.8mo', trend: 'up', icon: ClockIcon, color: 'text-orange-500' },
  { label: 'Skills Gap Widening', value: '67%', trend: 'up', icon: ArrowTrendingUpIcon, color: 'text-accent-red' }
]

export function CompactHeroSection() {
  const { trackClick } = useCTATracking()

  const handleCTAClick = (type: 'primary' | 'secondary') => {
    trackClick(type, 0, 'compact_hero')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-700 to-emerald-900 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Hero Content */}
            <div className="text-center lg:text-left">
              {/* Logo */}
              <motion.div
                className="mb-6 flex justify-center lg:justify-start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Logo variant="full" theme="white" className="w-24 h-24" />
              </motion.div>

              {/* Market Alert Badge */}
              <motion.div 
                className="mb-6 inline-flex items-center rounded-full bg-accent-red/20 px-4 py-2 text-sm font-medium text-accent-red ring-1 ring-inset ring-accent-red/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="mr-2">🚨</span>
                Market Reality Check
                <span className="ml-2">📊</span>
              </motion.div>

              {/* Revolutionary Headline */}
              <motion.h1 
                className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Don't Wait for the{' '}
                <span className="text-accent-red">Job Market</span>
                <br />
                To{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">Save You</span>
              </motion.h1>

              {/* Urgency-driven sub-headline */}
              <motion.p 
                className="mt-6 text-lg leading-8 text-navy-100 sm:text-xl max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                While others wait for opportunities, you can build your own AI-powered income stream. 
                <span className="font-bold text-emerald-200"> The market won't save you - but you can save yourself.</span>
              </motion.p>

              {/* Dual CTA - Market-focused */}
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/contact?utm_source=hero_primary"
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white btn-lg group w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300"
                    onClick={() => handleCTAClick('primary')}
                  >
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      Start Learning AI Today
                      <ArrowRightIcon className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                    </div>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/contact?utm_source=hero_secondary&type=strategy"
                    className="btn border-2 border-white text-white hover:bg-white hover:text-navy-900 btn-lg group w-full sm:w-auto transition-all duration-300"
                    onClick={() => handleCTAClick('secondary')}
                  >
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      Get My Strategy Session
                      <ArrowRightIcon className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                    </div>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust indicators - Market focused */}
              <motion.div 
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-navy-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.div 
                  className="flex items-center gap-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                  <span>AI Skills Training</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                  <span>Market Intelligence</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                  <span>Income Generation</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column - Market Statistics Dashboard */}
            <motion.div 
              className="lg:pl-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Dashboard Header */}
                <div className="mb-6 text-center lg:text-left">
                  <h3 className="text-lg font-semibold text-emerald-200 mb-2">Current Market Reality</h3>
                  <p className="text-sm text-navy-300">Live data • Updated daily</p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {MARKET_STATS.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        <motion.div
                          animate={{ 
                            scale: stat.trend === 'up' ? [1, 1.1, 1] : [1, 0.9, 1] 
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`text-xs px-2 py-1 rounded-full ${
                            stat.trend === 'up' 
                              ? 'bg-accent-red/20 text-accent-red' 
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {stat.trend === 'up' ? '↑' : '↓'}
                        </motion.div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-navy-300 leading-tight">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Call-to-action overlay */}
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-accent-red/20 to-orange-500/20 backdrop-blur-sm rounded-xl border border-accent-red/30"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-white mb-2">
                      <span className="text-accent-red">47%</span> of professionals are unprepared for AI disruption
                    </p>
                    <p className="text-xs text-navy-300">
                      Don't be part of this statistic. Act now.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-accent-red/30 to-emerald-400/30 opacity-20"
            style={{
              clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
        
        {/* Additional animated elements */}
        <motion.div
          className="absolute top-1/2 right-10 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>
    </section>
  )
}