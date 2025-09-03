'use client'

import React from 'react'
import { 
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'

const SERVICES = [
  {
    id: 'workshops',
    title: 'AI Skills Workshops',
    subtitle: 'Learn while others wait',
    description: 'Master AI automation, market analysis, and income generation tools through hands-on workshops designed for non-technical professionals.',
    price: 'Starting at $47/month',
    priceDetail: 'Cancel anytime',
    features: [
      'Weekly live AI training sessions',
      'Practical automation tools',
      'Market opportunity identification',
      'Income generation strategies',
      'Community access & support'
    ],
    icon: AcademicCapIcon,
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-emerald-100',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    buttonStyle: 'btn-primary',
    popular: true,
    stats: {
      participants: '2,400+',
      satisfaction: '96%',
      income_increase: 'Avg +$2,800/mo'
    },
    cta: 'Start Learning AI',
    href: '/contact?utm_source=services&type=workshop'
  },
  {
    id: 'strategy',
    title: 'Strategy Sessions',
    subtitle: 'Personalized action plan',
    description: 'Get a custom roadmap for your specific situation. Learn exactly which AI skills to prioritize and how to monetize them quickly.',
    price: 'Book your session',
    priceDetail: '90-minute deep dive',
    features: [
      'Personalized AI skill assessment',
      'Custom income opportunity mapping',
      'Market positioning strategy',
      '90-day implementation roadmap',
      'Follow-up support included'
    ],
    icon: ChatBubbleLeftRightIcon,
    gradient: 'from-navy-600 to-navy-700',
    bgGradient: 'from-navy-50 to-navy-100',
    borderColor: 'border-navy-200',
    textColor: 'text-navy-700',
    buttonStyle: 'btn btn-navy',
    popular: false,
    stats: {
      sessions: '850+',
      success_rate: '94%',
      avg_roi: '340%'
    },
    cta: 'Book Strategy Call',
    href: '/contact?utm_source=services&type=strategy'
  },
  {
    id: 'intelligence',
    title: 'Market Intelligence',
    subtitle: 'See opportunities first',
    description: 'Access our proprietary market analysis system. Get weekly reports on emerging opportunities, AI trends, and income potential.',
    price: 'Intelligence reports',
    priceDetail: 'Weekly insights',
    features: [
      'Weekly market opportunity reports',
      'AI trend analysis & predictions',
      'Income potential assessments',
      'Competitive landscape insights',
      'Early access to emerging markets'
    ],
    icon: ChartBarIcon,
    gradient: 'from-accent-red to-orange-600',
    bgGradient: 'from-orange-50 to-accent-cream',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    buttonStyle: 'btn btn-outline border-accent-red text-accent-red hover:bg-accent-red hover:text-white',
    popular: false,
    stats: {
      reports: '150+',
      accuracy: '87%',
      subscribers: '1,200+'
    },
    cta: 'Get Market Intel',
    href: '/contact?utm_source=services&type=intelligence'
  }
]

export function InnovativeServicesGrid() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-silver-50 to-white relative overflow-hidden">
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
              className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              🎯 Your Path to AI-Powered Income
            </motion.div>
            
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl mb-4">
              Don't Just Learn AI - <span className="text-emerald-600">Profit From It</span>
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Choose your learning path. All programs designed for working professionals who want practical, 
              income-generating AI skills - not just theory.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                className={`relative group ${service.popular ? 'md:scale-105' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                {/* Popular Badge */}
                {service.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Most Popular
                    </div>
                  </motion.div>
                )}

                {/* Service Card */}
                <div className={`relative bg-gradient-to-br ${service.bgGradient} rounded-2xl p-8 h-full border-2 ${service.borderColor} shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                  
                  {/* Service Icon & Header */}
                  <div className="mb-6">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <service.icon className="h-8 w-8 text-white" />
                    </motion.div>

                    <div className="mb-2">
                      <h3 className="text-2xl font-bold text-navy-900 mb-1">
                        {service.title}
                      </h3>
                      <p className={`text-sm font-semibold ${service.textColor} uppercase tracking-wide`}>
                        {service.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Service Description */}
                  <p className="text-navy-700 text-lg leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: (index * 0.2) + (featureIndex * 0.1) }}
                        viewport={{ once: true }}
                      >
                        <div className={`w-2 h-2 rounded-full mt-3 flex-shrink-0 bg-gradient-to-r ${service.gradient}`}></div>
                        <span className="text-navy-800 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Service Stats */}
                  <motion.div 
                    className="mb-8 p-4 bg-white/50 rounded-xl border border-white/50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: (index * 0.2) + 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {Object.entries(service.stats).map(([key, value], statIndex) => (
                        <div key={key} className="space-y-1">
                          <div className="text-lg font-bold text-navy-900">{value}</div>
                          <div className="text-xs text-navy-600 capitalize">{key.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Pricing */}
                  <div className="mb-6 text-center">
                    <div className="text-2xl font-bold text-navy-900 mb-1">
                      {service.price}
                    </div>
                    <div className="text-sm text-navy-600">
                      {service.priceDetail}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={service.href}
                      className={`${service.buttonStyle} btn-lg w-full group shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="flex items-center justify-center">
                        {service.id === 'workshops' && <AcademicCapIcon className="mr-2 h-5 w-5" />}
                        {service.id === 'strategy' && <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5" />}
                        {service.id === 'intelligence' && <ChartBarIcon className="mr-2 h-5 w-5" />}
                        {service.cta}
                        <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </motion.div>

                  {/* Service specific badges */}
                  <div className="mt-4 flex justify-center">
                    {service.id === 'workshops' && (
                      <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <UserGroupIcon className="h-3 w-3 mr-1" />
                        Live Community
                      </div>
                    )}
                    {service.id === 'strategy' && (
                      <div className="flex items-center text-xs text-navy-600 bg-navy-50 px-3 py-1 rounded-full">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        1-on-1 Session
                      </div>
                    )}
                    {service.id === 'intelligence' && (
                      <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        <ChartBarIcon className="h-3 w-3 mr-1" />
                        Weekly Reports
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-navy-900 to-emerald-800 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold mb-4">
                  Not Sure Which Path Is Right for You?
                </h3>
                <p className="text-xl text-navy-100 mb-8 max-w-3xl mx-auto">
                  Book a free 15-minute consultation. We'll assess your current situation and recommend 
                  the best starting point for your AI-powered income journey.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href="/contact?utm_source=services_consultation"
                      className="btn bg-white text-navy-900 hover:bg-silver-100 btn-lg group"
                    >
                      <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5" />
                      Get Free Consultation
                      <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                  
                  <div className="flex items-center text-emerald-200 text-sm">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    15-minute call • No sales pressure • Actionable advice
                  </div>
                </div>
              </motion.div>

              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-emerald-200/20 to-navy-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-accent-red/10 to-orange-200/10 rounded-full blur-2xl"></div>
      </div>
    </section>
  )
}