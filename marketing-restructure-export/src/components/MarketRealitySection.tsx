'use client'

import React from 'react'
import { ExclamationTriangleIcon, LightBulbIcon, RocketLaunchIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'

const REALITY_CARDS = [
  {
    type: 'problem',
    icon: ExclamationTriangleIcon,
    title: 'The Market Reality',
    subtitle: 'What\'s Really Happening',
    description: 'Job market uncertainty is at an all-time high. Traditional career paths are disappearing while AI reshapes every industry.',
    stats: [
      '23% decline in job postings',
      '6.8 month average job search',
      '67% skills gap widening'
    ],
    bgColor: 'from-accent-red/20 to-orange-500/20',
    borderColor: 'border-accent-red/30',
    iconColor: 'text-accent-red',
    textColor: 'text-navy-800',
    className: 'problem-card'
  },
  {
    type: 'gap',
    icon: LightBulbIcon,
    title: 'The Knowledge Gap',
    subtitle: 'Why Most People Are Stuck',
    description: 'Most professionals lack AI skills and market intelligence needed to create their own opportunities in this new economy.',
    stats: [
      '78% don\'t understand AI potential',
      '84% waiting for "things to improve"',
      '91% lack income diversification'
    ],
    bgColor: 'from-amber-100/50 to-accent-gold/30',
    borderColor: 'border-accent-gold/40',
    iconColor: 'text-amber-600',
    textColor: 'text-navy-800',
    className: 'gap-card'
  },
  {
    type: 'solution',
    icon: RocketLaunchIcon,
    title: 'Your Strategic Advantage',
    subtitle: 'How You Can Win',
    description: 'While others wait, you can learn AI skills, build market intelligence, and create multiple income streams that work for you.',
    stats: [
      'AI workshops starting at $47/mo',
      'Custom strategy sessions available',
      'Proven income generation methods'
    ],
    bgColor: 'from-emerald-100/50 to-emerald-200/30',
    borderColor: 'border-emerald-400/40',
    iconColor: 'text-emerald-600',
    textColor: 'text-navy-800',
    className: 'solution-card'
  }
]

export function MarketRealitySection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-silver-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center rounded-full bg-accent-red/10 px-4 py-2 text-sm font-medium text-accent-red ring-1 ring-inset ring-accent-red/20 mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              📊 Market Intelligence Report
            </motion.div>
            
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl mb-4">
              The Market Won't Save You
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Understanding the problem is the first step to building your solution
            </p>
          </motion.div>

          {/* Three-Card Problem/Gap/Solution Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {REALITY_CARDS.map((card, index) => (
              <motion.div
                key={card.type}
                className={`relative ${card.className}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Card Background */}
                <div className={`relative bg-gradient-to-br ${card.bgColor} backdrop-blur-sm rounded-2xl p-8 h-full border ${card.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  
                  {/* Card Icon */}
                  <motion.div 
                    className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <card.icon className={`h-7 w-7 ${card.iconColor}`} />
                  </motion.div>

                  {/* Card Content */}
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-navy-500 uppercase tracking-wide mb-2">
                      {card.subtitle}
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-4">
                      {card.title}
                    </h3>
                    <p className={`text-lg leading-relaxed ${card.textColor} mb-6`}>
                      {card.description}
                    </p>
                  </div>

                  {/* Stats/Features List */}
                  <div className="space-y-3 mb-6">
                    {card.stats.map((stat, statIndex) => (
                      <motion.div 
                        key={statIndex}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: (index * 0.2) + (statIndex * 0.1) }}
                        viewport={{ once: true }}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          card.type === 'problem' ? 'bg-accent-red' :
                          card.type === 'gap' ? 'bg-amber-500' : 
                          'bg-emerald-500'
                        }`}></div>
                        <span className="text-navy-800 font-medium">{stat}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Element */}
                  {card.type === 'solution' && (
                    <motion.div
                      className="mt-6 pt-6 border-t border-emerald-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <Link 
                        href="/contact?utm_source=market_reality"
                        className="inline-flex items-center text-emerald-700 font-semibold hover:text-emerald-800 transition-colors group"
                      >
                        Start Building Your Advantage
                        <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                  )}

                  {/* Flow Arrow (except for last card) */}
                  {index < REALITY_CARDS.length - 1 && (
                    <motion.div 
                      className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-10"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: (index * 0.2) + 0.4 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-navy-200">
                        <ArrowRightIcon className="h-6 w-6 text-navy-600" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-navy-50 to-emerald-50 rounded-2xl p-8 border border-navy-200">
              <h3 className="text-2xl font-bold text-navy-900 mb-4">
                The Question Isn't <span className="text-accent-red">If</span> the Market Will Change
              </h3>
              <p className="text-lg text-navy-600 mb-6 max-w-2xl mx-auto">
                It's whether you'll be prepared when it does. While others wait and hope, 
                you can build the skills and systems that create your own opportunities.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/contact?utm_source=market_reality_cta"
                  className="btn bg-navy-900 hover:bg-navy-800 text-white btn-lg group shadow-xl"
                >
                  Don't Wait - Start Building Now
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-navy-200/20 rounded-full blur-3xl"></div>
        <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-gradient-to-l from-accent-red/10 to-orange-200/10 rounded-full blur-2xl"></div>
      </div>
    </section>
  )
}