'use client';

import { motion } from 'framer-motion';
import { EyeIcon, ChartBarIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export function OpportunityInsightSection() {
  const opportunityCards = [
    {
      icon: EyeIcon,
      title: 'Spot Opportunities',
      subtitle: 'Market Intelligence',
      description: 'We analyze market trends, consumer behavior, and industry data to identify untapped opportunities that align with your passions and skills.',
      stat: '73% success rate',
      statLabel: 'for passion-based businesses',
      gradient: 'from-accent-gold to-accent-cream',
      delay: 0.1
    },
    {
      icon: ChartBarIcon,
      title: 'Turn Passion Into Strategy',
      subtitle: 'Data-Driven Planning',
      description: 'Transform your ideas into actionable business strategies with evidence-based planning, competitive analysis, and clear execution roadmaps.',
      stat: '3x faster',
      statLabel: 'than traditional planning',
      gradient: 'from-emerald-500 to-emerald-300',
      delay: 0.3
    },
    {
      icon: RocketLaunchIcon,
      title: 'Build With Confidence',
      subtitle: 'Sustainable Growth',
      description: 'Launch and scale your business with ongoing support, AI-powered tools, and personalized guidance that grows with your success.',
      stat: '84% growth',
      statLabel: 'in first 12 months',
      gradient: 'from-navy to-blue-600',
      delay: 0.5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-6">
            Turn Market Intelligence Into{' '}
            <span className="bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent">
              Your Advantage
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            While others guess, we use data. While others wait, we act. 
            Transform your passion into profit with evidence-based strategies.
          </p>
        </motion.div>

        {/* Opportunity Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {opportunityCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: card.delay }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              {/* Card Background */}
              <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
                
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl mb-6 shadow-lg`}
                >
                  <card.icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {card.subtitle}
                    </div>
                    <h3 className="text-2xl font-bold text-navy group-hover:text-navy/90 transition-colors">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Statistics */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-r ${card.gradient} p-4 rounded-xl text-white`}
                  >
                    <div className="text-2xl font-bold">{card.stat}</div>
                    <div className="text-sm opacity-90">{card.statLabel}</div>
                  </motion.div>
                </div>

                {/* Hover Effect Border */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${card.gradient} rounded-2xl opacity-20 -z-10`}
                  style={{ padding: '2px' }}
                />
              </div>

              {/* Arrow Connection (visible on desktop) */}
              {index < opportunityCards.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: card.delay + 0.2 }}
                  className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                    <motion.svg
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-6 h-6 text-accent-gold"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </motion.svg>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 bg-gradient-to-r from-navy to-blue-900 rounded-3xl p-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-4">
            Ready to Turn Your Ideas Into Income?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the 73% of successful entrepreneurs who started with passion and built with strategy.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.a
              href="/contact?utm_source=opportunity-insight&utm_medium=cta&utm_campaign=start-strategy"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Get Your Strategy Session
            </motion.a>
            
            <motion.a
              href="/methodology?utm_source=opportunity-insight&utm_medium=cta&utm_campaign=learn-process"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/20 transition-all duration-300"
            >
              Learn Our Process
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}