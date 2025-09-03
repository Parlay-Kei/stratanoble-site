'use client'

import Link from 'next/link'
import { Logo } from './Logo'

export function HeaderSimple() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-silver-200 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Strata Noble - Home</span>
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Simple Navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            <Link href="/services" className="text-sm font-semibold text-navy-900 hover:text-emerald-600">
              Services
            </Link>
            <Link href="/about" className="text-sm font-semibold text-navy-900 hover:text-emerald-600">
              About
            </Link>
            <Link href="/contact" className="text-sm font-semibold text-navy-900 hover:text-emerald-600">
              Contact
            </Link>
          </div>

          {/* Simple CTA */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link href="/contact" className="btn-primary btn-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}