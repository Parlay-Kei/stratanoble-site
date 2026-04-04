'use client';

import React from 'react'
import { useState } from 'react';
import { XMarkIcon, BoltIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/**
 * Entry-offer CTA — free pipeline diagnostic (OCS-SN-0011)
 */

export function SmartConsultingBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-field-sage text-command-navy border-b border-slate-grey/30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <BoltIcon className="h-5 w-5 text-command-navy" />
              </motion.div>
              <div className="text-sm font-medium">
                <span className="hidden sm:inline">
                  <strong>Free Lead Diagnostic</strong> — 48-hour turnaround. We show you where you&apos;re losing leads before you spend a dollar.
                </span>
                <span className="sm:hidden">
                  <strong>Free diagnostic</strong> — 48-hour turnaround.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/contact?service=lead-rescue">
                <motion.span
                  className="bg-command-navy text-white px-4 py-1.5 rounded-sm text-sm font-semibold hover:opacity-90 transition-opacity duration-200 inline-block"
                >
                  Get Free Diagnostic
                </motion.span>
              </Link>

              <motion.button
                onClick={() => setIsVisible(false)}
                className="text-slate-grey hover:text-command-navy transition-colors duration-200 p-1"
                aria-label="Dismiss notification"
              >
                <XMarkIcon className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Animated bottom border */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="h-0.5 bg-command-navy/30 origin-left"
        />
      </motion.div>
    </AnimatePresence>
  );
}
