'use client';

import { useState } from 'react';
import { XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-accent-gold to-emerald-500 text-navy shadow-lg"
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
                <LightBulbIcon className="h-5 w-5 text-navy" />
              </motion.div>
              <div className="text-sm font-medium">
                <span className="hidden sm:inline">
                  <strong>Smart Opportunity:</strong> Market intelligence shows 73% of successful entrepreneurs started with passion projects.
                </span>
                <span className="sm:hidden">
                  <strong>Opportunity:</strong> Turn your ideas into income with proven strategies.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.a
                href="/contact?utm_source=smart-bar&utm_medium=banner&utm_campaign=opportunity-alert"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-navy text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-navy/90 transition-all duration-200 shadow-md"
              >
                Start Your Journey
              </motion.a>
              
              <motion.button
                onClick={() => setIsVisible(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-navy/70 hover:text-navy transition-colors p-1"
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
          className="h-0.5 bg-navy/20 origin-left"
        />
      </motion.div>
    </AnimatePresence>
  );
}