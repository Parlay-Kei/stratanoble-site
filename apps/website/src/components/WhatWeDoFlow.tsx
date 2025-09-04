'use client';

import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon, MagnifyingGlassIcon, DocumentTextIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export function WhatWeDoFlow() {
  const steps = [
    {
      number: '01',
      icon: ChatBubbleLeftRightIcon,
      title: 'Listen',
      subtitle: 'Discovery & Understanding',
      description: 'We start by understanding your vision, passions, and goals. Through structured discovery sessions, we uncover what truly drives you and identify your unique strengths.',
      features: ['Vision clarification', 'Passion assessment', 'Goal alignment', 'Strength analysis'],
      gradient: 'from-accent-gold to-accent-cream',
      delay: 0.1
    },
    {
      number: '02',
      icon: MagnifyingGlassIcon,
      title: 'Analyze',
      subtitle: 'Market Intelligence & Research',
      description: 'Our team conducts comprehensive market research, competitor analysis, and opportunity assessment to identify the best path forward for your unique situation.',
      features: ['Market analysis', 'Competitor research', 'Opportunity mapping', 'Risk assessment'],
      gradient: 'from-emerald-500 to-emerald-300',
      delay: 0.2
    },
    {
      number: '03',
      icon: DocumentTextIcon,
      title: 'Plan',
      subtitle: 'Strategic Roadmap Creation',
      description: 'We create a detailed, actionable strategic plan tailored to your specific situation, complete with timelines, milestones, and measurable objectives.',
      features: ['Strategic roadmap', 'Action timelines', 'Milestone planning', 'Success metrics'],
      gradient: 'from-blue-600 to-blue-400',
      delay: 0.3
    },
    {
      number: '04',
      icon: RocketLaunchIcon,
      title: 'Execute',
      subtitle: 'Implementation & Support',
      description: 'We provide ongoing support, AI-powered tools, and personalized guidance to help you execute your plan and achieve sustainable growth.',
      features: ['Implementation support', 'AI-powered tools', 'Progress tracking', 'Ongoing guidance'],
      gradient: 'from-navy to-blue-800',
      delay: 0.4
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-6 py-2 rounded-full text-sm font-semibold mb-4"
          >
            Our Process
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-6">
            How We Help You{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A proven four-step methodology that transforms your passion into a profitable, 
            sustainable business with clarity, evidence, and ongoing support.
          </p>
        </motion.div>

        {/* Process Flow */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 transform -translate-y-1/2">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
              className="h-0.5 bg-gradient-to-r from-accent-gold via-emerald-500 via-blue-500 to-navy origin-left"
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: step.delay }}
                className="relative group"
              >
                {/* Step Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  {/* Background Gradient Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                  
                  {/* Step Number */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl mb-6 shadow-lg relative z-10`}
                  >
                    <span className="text-white text-xl font-bold">{step.number}</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mb-4 relative z-10"
                  >
                    <step.icon className={`h-8 w-8 text-gray-400 group-hover:text-navy transition-colors`} />
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-4 relative z-10">
                    <div>
                      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {step.subtitle}
                      </div>
                      <h3 className="text-2xl font-bold text-navy group-hover:text-navy/90 transition-colors">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: step.delay + 0.1 + featureIndex * 0.1 }}
                          className="flex items-center space-x-2"
                        >
                          <div className={`w-2 h-2 bg-gradient-to-r ${step.gradient} rounded-full`} />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    className={`absolute inset-0 border-2 bg-gradient-to-r ${step.gradient} rounded-3xl opacity-20 -z-10`}
                    style={{ padding: '2px' }}
                  />
                </div>

                {/* Mobile Connection Arrow */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: step.delay + 0.3 }}
                    className="lg:hidden flex justify-center mt-6 mb-2"
                  >
                    <motion.svg
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-8 h-8 text-gradient-to-r ${step.gradient}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </motion.svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-50 to-white p-8 rounded-3xl border border-gray-200">
            <h3 className="text-2xl font-bold text-navy mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's begin with a discovery session to understand your vision and create your personalized roadmap to success.
            </p>
            
            <motion.a
              href="/contact?utm_source=process-flow&utm_medium=cta&utm_campaign=start-discovery"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span>Schedule Discovery Session</span>
              <RocketLaunchIcon className="ml-3 h-5 w-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}