'use client';

import { motion } from 'framer-motion';
import { ArrowRightIcon, ChartBarIcon, LightBulbIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Logo } from './Logo';

export function HeroSectionAligned() {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  
  const successPrinciples = [
    { icon: LightBulbIcon, label: 'Clarity Over Confusion', value: '100%' },
    { icon: ChartBarIcon, label: 'Evidence Over Guesswork', value: '100%' },
    { icon: CurrencyDollarIcon, label: 'Sustainability Over Quick Wins', value: '100%' }
  ];

  const marketStats = [
    { label: 'Passion-Based Businesses Succeed', value: '73%' },
    { label: 'Entrepreneurs Start Without Plans', value: '68%' },
    { label: 'Need Strategic Guidance', value: '84%' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % marketStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
            <Logo variant="full" className="h-64 w-auto" theme="white" />
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Turn Your{' '}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent"
              >
                Ideas
              </motion.span>
              <br />
              Into{' '}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
              >
                Income
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
            Smarter, faster, more personalized consulting that helps everyday people
            and small businesses succeed doing what they love
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

          {/* Market Intelligence Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-gradient-to-r from-accent-gold/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-accent-gold/30"
          >
            <div className="text-center">
              <motion.div
                key={currentStatIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <div className="text-3xl font-bold text-accent-gold">
                  {marketStats[currentStatIndex].value}
                </div>
                <div className="text-white font-medium">
                  {marketStats[currentStatIndex].label}
                </div>
              </motion.div>
              <div className="text-sm text-gray-400 mt-2">
                Market Intelligence • Live Data
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8"
          >
            <motion.a
              href="/contact?utm_source=hero&utm_medium=cta&utm_campaign=start-journey"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gradient-to-r from-accent-gold to-accent-gold/90 text-navy px-8 py-4 rounded-full font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span>Start Your Journey</span>
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.a>

            <motion.a
              href="/methodology?utm_source=hero&utm_medium=cta&utm_campaign=explore-approach"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/20 transition-all duration-300 flex items-center space-x-3"
            >
              <span>Explore Our Approach</span>
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
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
              <div className="text-sm">✓ Proven Strategies</div>
              <div className="text-sm">✓ AI-Powered Tools</div>
              <div className="text-sm">✓ Personalized Guidance</div>
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