'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function UrgencyBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Show/hide based on scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100
      if (scrolled && !hasScrolled) {
        setHasScrolled(true)
        // Reshow the bar after user scrolls down
        setTimeout(() => setIsVisible(true), 2000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolled])

  // Auto-hide after 8 seconds, but allow reappearing on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasScrolled) {
        setIsVisible(false)
      }
    }, 8000)

    return () => clearTimeout(timer)
  }, [hasScrolled])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-50 bg-gradient-to-r from-accent-red to-orange-600 text-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Alert Content */}
            <div className="flex items-center flex-1 min-w-0">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-shrink-0 mr-3"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-200" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate sm:text-base">
                  <span className="hidden sm:inline">🚨 Market Alert: </span>
                  <span className="font-bold">Job market cooling 23%</span>
                  <span className="hidden sm:inline"> • AI adoption accelerating 300% • </span>
                  <span className="font-bold text-orange-200">Your move?</span>
                </p>
              </div>
            </div>

            {/* CTA and Close */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link 
                href="/contact?utm_source=urgency_bar"
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-white text-accent-red rounded-full hover:bg-orange-50 transition-colors duration-200"
                onClick={() => setIsVisible(false)}
              >
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                Act Now
              </Link>
              
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="Dismiss alert"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated border at bottom */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-orange-300"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, ease: 'linear' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}