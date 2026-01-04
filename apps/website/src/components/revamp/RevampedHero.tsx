'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * RevampedHero - Pipeline-focused hero section
 *
 * Copy:
 * Headline: Lead-to-customer pipelines for service businesses.
 * Subhead: Intake, follow-up automation, and deal tracking that prevents lead loss and keeps operations measurable.
 * Primary CTA: Start the 48-Hour Lead Rescue
 * Secondary CTA: Apply for the 21-Day Pipeline Buildout
 * Trust line: Installed fast. Scope capped. You own it.
 * Bullets: Pipeline installation - Follow-up automation - Deal tracking dashboard
 * Micro-constraint: No branding. No website builds. Pipeline infrastructure only.
 */

export function RevampedHero() {
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
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Lead-to-customer{' '}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent"
              >
                pipelines
              </motion.span>
              {' '}for service businesses.
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed"
          >
            Intake, follow-up automation, and deal tracking that prevents lead loss and keeps operations measurable.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
          >
            <Link
              href="/lead-rescue"
              className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition inline-flex items-center justify-center shadow-xl hover:shadow-2xl"
            >
              Start the 48-Hour Lead Rescue
            </Link>
            <Link
              href="/phase-3"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition inline-flex items-center justify-center"
            >
              Apply for the 21-Day Pipeline Buildout
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-base text-accent-gold font-medium"
          >
            Installed fast. Scope capped. You own it.
          </motion.p>

          {/* Bullets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-4 text-center"
          >
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-gray-300">
              <div className="text-sm font-medium">Pipeline installation</div>
              <div className="text-gray-500">•</div>
              <div className="text-sm font-medium">Follow-up automation</div>
              <div className="text-gray-500">•</div>
              <div className="text-sm font-medium">Deal tracking dashboard</div>
            </div>
          </motion.div>

          {/* Micro-constraint line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-xs text-gray-500 mt-4"
          >
            No branding. No website builds. Pipeline infrastructure only.
          </motion.p>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
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
