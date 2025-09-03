'use client'

import React from 'react'
import { 
  BoltIcon, 
  ChartBarIcon, 
  CogIcon, 
  ArrowRightIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'

const URGENCY_STATS = [
  { 
    label: 'Jobs Cooling', 
    value: 'Down 23%', 
    trend: 'negative',
    icon: ArrowTrendingUpIcon,
    description: 'Traditional job market shrinking'
  },
  { 
    label: 'AI Accelerating', 
    value: 'Up 300%', 
    trend: 'positive',
    icon: BoltIcon,
    description: 'AI disruption accelerating rapidly'
  },
  { 
    label: 'Need Own Plan', 
    value: 'Critical', 
    trend: 'urgent',
    icon: ShieldCheckIcon,
    description: 'Self-reliance becoming essential'
  }
]

const TRANSFORMATION_STEPS = [
  {
    number: '01',
    title: 'Learn AI Skills',
    description: 'Master the tools that are reshaping every industry',
    features: ['AI automation workshops', 'Practical implementation', 'Real-world applications'],
    icon: BoltIcon,
    color: 'emerald'
  },
  {
    number: '02', 
    title: 'Build Market Intelligence',
    description: 'Understand opportunities before others see them',
    features: ['Market trend analysis', 'Opportunity identification', 'Competitive insights'],
    icon: ChartBarIcon,
    color: 'navy'
  },
  {
    number: '03',
    title: 'Create Income Streams',
    description: 'Generate revenue that works independently of job market',
    features: ['Multiple income sources', 'Scalable systems', 'Passive revenue generation'],
    icon: CogIcon,
    color: 'accent-red'
  }
]

export function TransformationFlow() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-navy-900 via-navy-800 to-emerald-900 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Market Urgency Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center rounded-full bg-accent-red/20 px-6 py-3 text-sm font-medium text-accent-red ring-1 ring-inset ring-accent-red/30 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              ⚡ Market Reality Check ⚡
            </motion.div>
            
            {/* Urgency Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {URGENCY_STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`h-6 w-6 ${
                      stat.trend === 'negative' ? 'text-accent-red' :
                      stat.trend === 'positive' ? 'text-emerald-400' : 
                      'text-orange-400'
                    }`} />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: stat.trend === 'urgent' ? [0, -5, 5, 0] : [0, 0, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        stat.trend === 'negative' ? 'bg-accent-red/20 text-accent-red' :
                        stat.trend === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {stat.trend === 'negative' ? '↓' : stat.trend === 'positive' ? '↑' : '⚠'}
                    </motion.div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-emerald-200 mb-1">{stat.label}</div>
                  <div className="text-sm text-navy-300">{stat.description}</div>
                </motion.div>
              ))}
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
              While Others Wait, You Can <span className="text-emerald-400">Build</span>
            </h2>
            <p className="text-xl text-navy-200 max-w-4xl mx-auto">
              The market crisis is your opportunity. Here's how to transform uncertainty into your competitive advantage.
            </p>
          </motion.div>

          {/* Transformation Steps */}
          <div className="space-y-16">
            {TRANSFORMATION_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {step.number}
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                        <p className="text-lg text-emerald-200 mt-1">Step {index + 1} of 3</p>
                      </div>
                    </div>
                    
                    <p className="text-xl text-navy-200 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div className="space-y-3">
                      {step.features.map((feature, featureIndex) => (
                        <motion.div 
                          key={featureIndex}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: (index * 0.2) + (featureIndex * 0.1) }}
                          viewport={{ once: true }}
                        >
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-navy-100 text-lg">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Step CTA */}
                    {index === TRANSFORMATION_STEPS.length - 1 && (
                      <motion.div
                        className="pt-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <Link 
                          href="/contact?utm_source=transformation_flow"
                          className="inline-flex items-center text-emerald-400 font-semibold text-lg hover:text-emerald-300 transition-colors group"
                        >
                          Ready to start your transformation?
                          <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </motion.div>
                    )}
                  </div>

                  {/* Step Visual */}
                  <motion.div 
                    className="flex-1 relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                      <div className="flex items-center justify-center mb-6">
                        <step.icon className={`h-24 w-24 ${
                          step.color === 'emerald' ? 'text-emerald-400' :
                          step.color === 'navy' ? 'text-blue-400' :
                          'text-accent-red'
                        }`} />
                      </div>
                      
                      {/* Visual representation based on step */}
                      <div className="space-y-4">
                        {step.number === '01' && (
                          <div className="grid grid-cols-2 gap-3">
                            {['AI Automation', 'Market Analysis', 'Data Processing', 'Smart Systems'].map((skill, i) => (
                              <motion.div 
                                key={i}
                                className="bg-emerald-500/20 rounded-lg p-3 text-center text-sm font-medium text-emerald-200"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                viewport={{ once: true }}
                              >
                                {skill}
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {step.number === '02' && (
                          <div className="space-y-3">
                            {[
                              { label: 'Market Trends', value: '↗ +150%' },
                              { label: 'Opportunities', value: '24 Found' },
                              { label: 'Competition', value: 'Low Risk' }
                            ].map((metric, i) => (
                              <motion.div 
                                key={i}
                                className="flex justify-between items-center bg-blue-500/20 rounded-lg p-3"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                viewport={{ once: true }}
                              >
                                <span className="text-blue-200 font-medium">{metric.label}</span>
                                <span className="text-white font-bold">{metric.value}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {step.number === '03' && (
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { stream: 'AI Consulting', amount: '$2,500/mo' },
                              { stream: 'Digital Products', amount: '$1,800/mo' },
                              { stream: 'Automation Services', amount: '$3,200/mo' }
                            ].map((income, i) => (
                              <motion.div 
                                key={i}
                                className="flex justify-between items-center bg-accent-red/20 rounded-lg p-3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                viewport={{ once: true }}
                              >
                                <span className="text-orange-200 font-medium">{income.stream}</span>
                                <span className="text-white font-bold">{income.amount}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connection arrow */}
                    {index < TRANSFORMATION_STEPS.length - 1 && (
                      <motion.div 
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <ArrowRightIcon className="h-4 w-4 text-white rotate-90" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mission Statement Integration */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-white/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ClockIcon className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
              </motion.div>
              
              <h3 className="text-3xl font-bold text-white mb-6">
                <span className="text-accent-red">Time</span> Is Your Most Valuable Asset
              </h3>
              <p className="text-xl text-navy-200 max-w-4xl mx-auto mb-8 leading-relaxed">
                While others wait for the market to improve, successful people are building the skills 
                and systems that create their own opportunities. Every day you delay is a day your 
                competition gets ahead.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/contact?utm_source=transformation_cta"
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white btn-xl group shadow-2xl"
                >
                  <BoltIcon className="mr-2 h-6 w-6" />
                  Start Your Transformation Today
                  <ArrowRightIcon className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-l from-accent-red/20 to-orange-500/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2 
          }}
        />
      </div>
    </section>
  )
}