'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

import { Logo } from '../Logo'

/**
 * Primary IA: Home | Services | Q SUITE | ACHIEVERY | About | Proof | Contact
 */

const navigation = [
  { name: 'Home', href: '/', description: 'Strata Noble' },
  { name: 'Services', href: '/services', description: 'Consulting engagements' },
  { name: 'Q SUITE', href: '/q-suite', description: 'Operational control system' },
  { name: 'ACHIEVERY', href: '/achievery', description: 'Goals and accountability' },
  { name: 'About', href: '/about', description: 'Who we are' },
  { name: 'Proof', href: '/proof', description: 'Case studies & ecosystem' },
  { name: 'Contact', href: '/contact', description: 'Get in touch' },
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
          <motion.div
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />

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
              <div className="mb-6">
                <Link
                  href="/contact?service=lead-rescue"
                  className="block rounded-xl px-4 py-4 text-center text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Free Pipeline Diagnostic — 48-Hour Turnaround
                </Link>
              </div>

              <div className="space-y-1 border-t border-silver-200 pt-4">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
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

  const desktopLinks = navigation.filter((item) => item.href !== '/')

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-lg border-b border-silver-200 shadow-md'
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex lg:flex-1 min-w-0">
            <Link href="/" className="-m-1.5 p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg transition-colors hover:bg-silver-50 shrink-0">
              <span className="sr-only">Strata Noble - Home</span>
              <Logo className="h-12 w-auto" />
            </Link>
          </div>

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

          <div className="hidden lg:flex lg:items-center lg:gap-x-1 xl:gap-x-3 lg:flex-wrap lg:justify-end">
            {desktopLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative text-xs xl:text-sm font-semibold leading-6 text-navy-900 hover:text-emerald-600 transition-colors px-2 py-2 whitespace-nowrap"
              >
                {item.name}
                <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
            <Link
              href="/contact?service=lead-rescue"
              className="ml-2 inline-flex items-center rounded-lg px-3 py-2 text-xs xl:text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              Free diagnostic
            </Link>
          </div>
        </div>

        {mobileMenuPortal}
      </nav>
    </header>
  )
}
