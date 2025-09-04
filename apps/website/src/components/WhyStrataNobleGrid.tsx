'use client';

import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function WhyStrataNobleGrid() {
  const valuePropositions = [
    {
      icon: ClockIcon,
      title: 'Faster Results',
      description: 'Skip the guesswork and trial-and-error. Our proven methodology and AI-powered tools accelerate your path from idea to income.',
      stat: '3x faster',
      statLabel: 'than going it alone',
      gradient: 'from-accent-gold to-accent-cream',
      delay: 0.1
    },
    {
      icon: ChartBarIcon,
      title: 'Better Decisions',
      description: 'Make informed choices backed by market intelligence, data analysis, and evidence-based strategies that actually work.',
      stat: '73% success rate',
      statLabel: 'for our clients',
      gradient: 'from-emerald-500 to-emerald-300',
      delay: 0.2
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Affordable Expertise',
      description: 'Get enterprise-level consulting and AI tools at a fraction of traditional costs. Smart solutions that fit your budget.',
      stat: 'Starting at $47/mo',
      statLabel: 'comprehensive support',
      gradient: 'from-blue-600 to-blue-400',
      delay: 0.3
    },
    {
      icon: UserIcon,
      title: 'Customized to You',
      description: 'Every strategy is tailored to your unique situation, passions, and goals. No cookie-cutter solutions, just personalized guidance.',
      stat: '100% personalized',
      statLabel: 'to your situation',
      gradient: 'from-navy to-blue-800',
      delay: 0.4
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-navy via-navy/95 to-blue-900 text-white overflow-hidden">
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
            Why Choose Us
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Why{' '}
            <span className="bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent">
              StrataNoble
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We combine proven consulting methodologies with cutting-edge AI tools to deliver 
            results that matter to everyday people and small businesses.
          </p>
        </motion.div>

        {/* Value Propositions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {valuePropositions.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: prop.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 group-hover:border-white/40 group-hover:bg-white/15 transition-all duration-500 overflow-hidden">
                {/* Background Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${prop.gradient} rounded-2xl mb-6 shadow-lg relative z-10`}
                >
                  <prop.icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Content */}
                <div className="space-y-4 relative z-10">
                  <h3 className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
                    {prop.title}
                  </h3>

                  <p className="text-blue-100 leading-relaxed">
                    {prop.description}
                  </p>

                  {/* Statistics */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-r ${prop.gradient} p-4 rounded-xl ${prop.gradient.includes('navy') ? 'text-white' : 'text-navy'}`}
                  >
                    <div className="text-2xl font-bold">{prop.stat}</div>
                    <div className="text-sm opacity-80">{prop.statLabel}</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mb-6"
          >
            <HeartIcon className="h-12 w-12 text-accent-gold mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-3xl font-bold mb-6 text-white">
            Our Mission
          </h3>
          
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-2xl font-light text-blue-100 leading-relaxed max-w-4xl mx-auto mb-8 italic"
          >
            "Help people succeed doing what they love"
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-lg text-blue-200 max-w-3xl mx-auto mb-8"
          >
            We believe everyone deserves the opportunity to build a meaningful business around their passions. 
            That's why we've created a methodology that combines human expertise with AI-powered tools to make 
            professional consulting accessible to everyday entrepreneurs.
          </motion.div>

          {/* Mission Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: SparklesIcon, label: 'Clarity Over Confusion' },
              { icon: ChartBarIcon, label: 'Evidence Over Guesswork' },
              { icon: HeartIcon, label: 'Sustainability Over Quick Wins' }
            ].map((value, index) => (
              <motion.div
                key={value.label}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex flex-col items-center space-y-3 bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <value.icon className="h-8 w-8 text-accent-gold" />
                <span className="text-white font-semibold text-center">{value.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold mb-4 text-white">
            Ready to Experience the StrataNoble Difference?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the growing community of entrepreneurs who've turned their passions into profitable businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.a
              href="/contact?utm_source=why-strata&utm_medium=cta&utm_campaign=experience-difference"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Start Your Success Story
            </motion.a>
            
            <motion.a
              href="/about?utm_source=why-strata&utm_medium=cta&utm_campaign=learn-more"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/20 transition-all duration-300"
            >
              Learn Our Story
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}