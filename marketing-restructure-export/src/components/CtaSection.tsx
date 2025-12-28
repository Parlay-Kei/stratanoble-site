'use client';

import React from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline';
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
        <div className="mx-auto max-w-4xl text-center">
          {/* Simplified CTA Content per MESSAGING_FRAMEWORK.md */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6"
          >
            Ready to Stop{' '}
            <span className="bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent">
              Guessing
            </span>
            ?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl leading-8 text-blue-100 mb-10 max-w-2xl mx-auto"
          >
            Get clarity on what actually matters for your business.
            Start with a free assessment—no commitment, just honest answers.
          </motion.p>

          {/* Single Primary CTA + Text Link */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/discovery?utm_source=cta_final&utm_medium=cta&utm_campaign=start-assessment"
                className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                Start Your Free Assessment
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/platform?utm_source=cta_final&utm_medium=text-link&utm_campaign=preview-platform"
                className="text-white/80 hover:text-white text-base underline transition-colors"
              >
                or preview the platform
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
