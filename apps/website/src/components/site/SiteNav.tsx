'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

import { Logo } from '../Logo'

/**
 * SiteNav - Pipeline-focused navigation
 *
 * Nav links:
 * - About
 * - Contact
 * - 48-Hour Lead Rescue (primary CTA button)
 * - 21-Day Pipeline Buildout (secondary CTA button)
 * - Tools (simple link)
 */

const navigation = [
  {
    name: 'About',
    href: '/about',
    description: 'Who we are',
  },
  {
    name: 'Contact',
    href: '/contact',
    description: 'Get in touch',
  },
  {
    name: 'Tools',
    href: '/tools',
    description: 'Our products',
  },
]

const offerCTAs = [
  {
    name: '48-Hour Lead Rescue',
    href: '/lead-rescue',
    description: 'Fix your lead leaks fast',
    primary: true,
  },
  {
    name: '21-Day Pipeline Buildout',
    href: '/phase-3',
    description: 'Complete pipeline installation',
    primary: false,
  },
]

export function SiteNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const mobileMenuContent = (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          className="lg:hidden"
          role="dialog"
          aria-modal="true"
          data-mobile-menu
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <motion.div
            className="fixed inset-y-0 right-0 z-[110] w-full overflow-y-auto bg-white shadow-2xl sm:max-w-sm"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-silver-200">
              <Link
                href="/"
                className="-m-1.5 p-1.5 transition-colors hover:bg-silver-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Strata Noble</span>
                <Logo className="h-12 w-auto" />
              </Link>
              <button
                type="button"
                className="rounded-xl p-3 text-navy-700 hover:bg-navy-50 transition-all"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 py-8">
              {/* Offer CTAs */}
              <div className="space-y-3 mb-6">
                {offerCTAs.map((offer, index) => (
                  <motion.div
                    key={offer.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={offer.href}
                      className={`group block rounded-xl px-4 py-4 text-white shadow-lg hover:shadow-xl transition-all ${
                        offer.primary
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-navy-800 hover:bg-navy-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-bold text-base">{offer.name}</div>
                      <div className="text-sm text-white/80 font-normal">{offer.description}</div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Standard navigation links */}
              <div className="space-y-1 border-t border-silver-200 pt-4">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + offerCTAs.length) * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between rounded-xl px-4 py-4 text-base font-semibold text-navy-900 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-navy-500 font-normal">{item.description}</div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-navy-400 group-hover:text-emerald-600 transition-colors" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const mobileMenuPortal = mounted ? createPortal(mobileMenuContent, document.body) : null

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-lg border-b border-silver-200 shadow-md'
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg transition-colors hover:bg-silver-50">
              <span className="sr-only">Strata Noble - Home</span>
              <Logo className="h-12 w-auto" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="rounded-xl p-3 text-navy-700 hover:bg-navy-50 transition-all"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open main menu"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative text-sm font-semibold leading-6 text-navy-900 hover:text-emerald-600 transition-colors px-3 py-2"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {/* Offer CTAs */}
            <div className="flex items-center gap-x-3 ml-4">
              <Link
                href="/lead-rescue"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                48-Hour Lead Rescue
              </Link>
              <Link
                href="/phase-3"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-navy-900 border-2 border-navy-900 hover:bg-navy-900 hover:text-white transition-all"
              >
                21-Day Pipeline
              </Link>
            </div>
          </div>
        </div>

        {mobileMenuPortal}
      </nav>
    </header>
  )
}
