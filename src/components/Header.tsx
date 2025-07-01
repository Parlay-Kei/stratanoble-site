'use client'

import { useEffect, useState } from 'react'
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

import { useMobileMenuTracking } from '@/lib/useAnalytics'
import { Logo } from './Logo'

const navigation = [
  { 
    name: 'Services', 
    href: '/services', 
    description: 'Explore our solutions',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  { 
    name: 'About', 
    href: '/about', 
    description: 'Learn about our mission',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    name: 'Case Studies', 
    href: '/case-studies', 
    description: 'See our results',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    name: 'Contact', 
    href: '/contact', 
    description: 'Get started today',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { trackOpen, trackClose } = useMobileMenuTracking()

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        trackClose()
      }
    }
    
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      document.body.style.touchAction = 'auto'
    }
  }, [mobileMenuOpen, trackClose])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (mobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setMobileMenuOpen(false)
        trackClose()
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen, trackClose])

  const handleMobileMenuToggle = (open: boolean) => {
    setMobileMenuOpen(open)
    if (open) {
      trackOpen()
    } else {
      trackClose()
    }
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-silver-200 shadow-sm' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg transition-colors hover:bg-silver-50">
              <span className="sr-only">Strata Noble - Home</span>
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Mobile menu button - improved touch target */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="relative -m-2.5 inline-flex items-center justify-center rounded-xl p-3 text-navy-700 hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 active:scale-95"
              onClick={() => handleMobileMenuToggle(true)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Open main menu"
            >
              <motion.div
                animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </motion.div>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative text-sm font-semibold leading-6 text-navy-900 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg px-3 py-2"
                title={item.description}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              href="/contact"
              className="btn-primary btn-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Enhanced Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="lg:hidden" 
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="mobile-menu-title"
              data-mobile-menu
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <motion.div 
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" 
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Menu panel */}
              <motion.div 
                className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white shadow-2xl sm:max-w-sm"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="flex items-center justify-between p-6 border-b border-silver-200">
                  <Link 
                    href="/" 
                    className="-m-1.5 p-1.5 transition-colors hover:bg-silver-50 rounded-lg" 
                    onClick={() => handleMobileMenuToggle(false)}
                  >
                    <span className="sr-only">Strata Noble</span>
                    <Logo className="h-8 w-auto" />
                  </Link>
                  <button
                    type="button"
                    className="relative -m-2.5 rounded-xl p-3 text-navy-700 hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 active:scale-95"
                    onClick={() => handleMobileMenuToggle(false)}
                    aria-label="Close menu"
                  >
                    <motion.div
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </motion.div>
                  </button>
                </div>
                
                <div className="px-6 py-8">
                  <div className="space-y-1">
                    {navigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link
                          href={item.href}
                          className="group flex items-center justify-between rounded-xl px-4 py-4 text-base font-semibold text-navy-900 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 active:scale-95"
                          onClick={() => handleMobileMenuToggle(false)}
                          title={item.description}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-emerald-600 group-hover:text-emerald-700 transition-colors">
                              {item.icon}
                            </div>
                            <div>
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-sm text-navy-500 font-normal">{item.description}</div>
                            </div>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-navy-400 group-hover:text-emerald-600 transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Enhanced CTA section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="mt-8 pt-6 border-t border-silver-200"
                  >
                    <Link
                      href="/contact"
                      className="btn-primary btn-lg w-full justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                      onClick={() => handleMobileMenuToggle(false)}
                    >
                      Get Started Today
                    </Link>
                    <p className="mt-3 text-center text-sm text-navy-500">
                      Ready to build your prosperity?
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
