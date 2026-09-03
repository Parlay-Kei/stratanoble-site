import React from 'react'
import Link from 'next/link'
import { SVGProps } from 'react'

import { Logo } from '../Logo'

/**
 * Footer IA (OCS-SN-0011): Services | Routines | Company | Legal
 */

const navigation = {
  services: [
    { name: 'AI Fit Call', href: '/contact?service=ai-fit-call' },
    { name: 'AI Operations Review', href: '/contact?service=ai-operations-review' },
    { name: 'First AI Workday Setup', href: '/services' },
    { name: 'Quarterly AI Tune-Up', href: '/contact?service=quarterly-ai-tune-up' },
  ],
  platform: [
    { name: 'AI Meeting-to-Action Setup', href: '/services' },
    { name: 'AI Proposal Desk', href: '/services' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
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

export function SiteFooter() {
  return (
    <footer className="bg-command-navy" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and description */}
          <div className="space-y-8 xl:col-span-1">
            <Logo className="h-16 w-auto" theme="white" />
            <p className="text-sm leading-6 text-slate-grey">
              Practical AI setup for owner-led professional firms. One recurring office burden,
              one safe routine, set up and handed over.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-grey hover:text-field-sage transition-colors"
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
                    <Link href={item.href} className="text-sm leading-6 text-slate-grey hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Routines</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.platform.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm leading-6 text-slate-grey hover:text-white transition-colors">
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
                    <Link href={item.href} className="text-sm leading-6 text-slate-grey hover:text-white transition-colors">
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
                    <Link href={item.href} className="text-sm leading-6 text-slate-grey hover:text-white transition-colors">
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
          <p className="text-xs leading-5 text-slate-grey">
            <strong className="text-slate-grey">Chat Support:</strong> Our chat feature is powered by{' '}
            <a
              href="https://www.jotform.com/ai/agents/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-grey hover:text-field-sage underline"
            >
              Noupe
            </a>
            , a Jotform service. Chat conversations are processed by Jotform and delivered to
            Strata Noble via email. Please avoid sharing sensitive personal information in chat.{' '}
            <Link href="/privacy" className="text-slate-grey hover:text-field-sage underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-white/10 pt-8 sm:mt-12 lg:mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs leading-5 text-slate-grey">
              &copy; {new Date().getFullYear()} Strata Noble. All rights reserved.
            </p>
            <p className="text-xs text-slate-grey">
              AI can prepare the first draft. Your team makes the final decision.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
