'use client';

import { ArrowRightIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-r from-navy to-emerald-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
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
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          {/* Success-Focused Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-4 py-2 text-sm font-medium ring-1 ring-inset ring-accent-gold/50 mb-4">
              ✨ Your Success Story Starts Here
            </div>
          </motion.div>

          {/* Brand-Aligned CTA Content */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6"
          >
            Ready to Turn Your <span className="bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent">Ideas</span> Into <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Income</span>?
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl leading-8 text-blue-100 mb-10 max-w-3xl mx-auto"
          >
            Join the entrepreneurs who've discovered the power of combining passion with strategy. 
            With our proven methodology and AI-powered tools, your dreams become your business plan.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact?utm_source=cta_primary&utm_medium=cta&utm_campaign=start-journey"
                className="inline-flex items-center bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                Start Your Journey Today
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact?utm_source=cta_secondary&utm_medium=cta&utm_campaign=discovery-session"
                className="inline-flex items-center bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:border-white/50 hover:bg-white/20 transition-all duration-300"
              >
                Schedule Discovery Session
              </Link>
            </motion.div>
          </motion.div>

          {/* Brand-Aligned Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-blue-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-gold"></div>
              <span>Proven Strategies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>AI-Powered Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-cream"></div>
              <span>Personalized Guidance</span>
            </div>
          </motion.div>

          {/* Success-Focused Social Proof */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
          >
            <div className="flex items-center justify-center mb-6">
              <HeartIcon className="h-8 w-8 text-accent-gold mr-3" />
              <h3 className="text-2xl font-bold text-white">Success Stories</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
              <div>
                <div className="text-3xl font-bold text-white mb-1">73%</div>
                <div className="text-sm text-blue-200">Success Rate for Passion-Based Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">3x</div>
                <div className="text-sm text-blue-200">Faster Results Than Going Alone</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-blue-200">Customized to Your Situation</div>
              </div>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-accent-gold/20 to-emerald-500/20 rounded-2xl p-6 border border-accent-gold/30"
            >
              <SparklesIcon className="h-6 w-6 text-accent-gold mx-auto mb-2" />
              <p className="text-blue-100 font-medium">
                "Help people succeed doing what they love" - Our mission drives everything we do.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
