import React from 'react'
import Link from 'next/link'
import { SVGProps } from 'react'

import { Logo } from '../Logo'

/**
 * SiteFooter - Operational infrastructure footer
 *
 * Footer links:
 * - Lead Rescue
 * - 21-Day Pipeline Buildout
 * - Tools
 * - Contact
 * - Legal (Privacy, Terms)
 *
 * REMOVED (trust contamination):
 * - Platform
 * - Dashboard
 * - Solutions/Services subscription pages
 */

const navigation = {
  services: [
    { name: 'Lead Rescue', href: '/lead-rescue' },
    { name: '21-Day Pipeline Buildout', href: '/pipeline-buildout' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Tools', href: '/tools' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
  social: [
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/strata-noble',
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
          <path
            fillRule="evenodd"
            d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
}

export function SiteFooter() {
  return (
    <footer className="bg-navy-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and description */}
          <div className="space-y-8 xl:col-span-1">
            <Logo className="h-16 w-auto" theme="white" />
            <p className="text-sm leading-6 text-navy-300">
              Operational infrastructure for service businesses.
              Scoped engagements. Delivered systems. You own it.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-navy-400 hover:text-navy-300 transition-colors"
                  aria-label={`Follow us on ${item.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Services</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.services.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-navy-300 hover:text-white transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-navy-300 hover:text-white transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm leading-6 text-navy-300 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Chat Support Disclosure */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs leading-5 text-navy-500">
            <strong className="text-navy-400">Chat Support:</strong> Our chat feature is powered by{' '}
            <a
              href="https://www.jotform.com/ai/agents/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-400 hover:text-navy-300 underline"
            >
              Noupe
            </a>
            , a Jotform service. Chat conversations are processed by Jotform and delivered to
            Strata Noble via email. Please avoid sharing sensitive personal information in chat.{' '}
            <Link href="/privacy" className="text-navy-400 hover:text-navy-300 underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-white/10 pt-8 sm:mt-12 lg:mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs leading-5 text-navy-400">
              &copy; {new Date().getFullYear()} Strata Noble. All rights reserved.
            </p>
            <p className="text-xs text-navy-500">
              Operational control systems for service businesses.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
