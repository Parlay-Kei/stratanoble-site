import React from 'react'
import Link from 'next/link'
import { SVGProps } from 'react'

import { Logo } from './Logo'

/** Legacy Footer component — aligned with SiteFooter IA (OCS-SN-0011) */

const navigation = {
  services: [
    { name: 'Lead Rescue', href: '/lead-rescue' },
    { name: 'Pipeline Buildout', href: '/pipeline-buildout' },
    { name: 'Operations Command', href: '/contact?service=operations-command' },
  ],
  platform: [
    { name: 'Q SUITE', href: '/q-suite' },
    { name: 'ACHIEVERY', href: '/achievery' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Proof', href: '/proof' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
  legal: [
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Cookies', href: '/cookies' },
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

export function Footer() {
  return (
    <footer className="bg-navy-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Logo className="h-16 w-auto" theme="white" />
            <p className="text-sm leading-6 text-navy-300">
              Operational control systems for service businesses. Consulting, platform, and product — one firm.
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

          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:col-span-2 xl:mt-0">
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
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Platform</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.platform.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm leading-6 text-navy-300 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
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

        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs leading-5 text-navy-400">
              &copy; {new Date().getFullYear()} Strata Noble. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-navy-400">
              <Link href="/privacy" className="hover:text-navy-300 transition-colors">Privacy Policy</Link>
              <Link href="/sitemap" className="hover:text-navy-300 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
