import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';


export default function Sitemap() {
  const siteStructure = {
    'Main Pages': [
      { name: 'Home', href: '/' },
      { name: 'Services', href: '/services' },
      { name: 'Technology', href: '/technology' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    'Platform': [
      { name: 'Q Suite', href: '/q-suite' },
      { name: 'ACHIEVERY Preview', href: '/achievery-preview' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    'Legal & Policies': [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility Statement', href: '/accessibility' },
    ],
    'Account': [
      { name: 'Sign In', href: '/auth/signin' },
      { name: 'Sign Up', href: '/auth/signup' },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-4xl font-bold text-command-navy mb-4">Sitemap</h1>
        <p className="text-gray-600 mb-12">
          Browse all pages available on Strata Noble
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(siteStructure).map(([category, pages]) => (
            <div key={category} className="bg-void/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-command-navy mb-4 pb-2 border-b border-slate-grey/30">
                {category}
              </h2>
              <ul className="space-y-3">
                {pages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-slate-grey hover:text-forest-green transition-colors flex items-center group"
                    >
                      <svg
                        className="w-4 h-4 mr-2 text-slate-grey group-hover:text-forest-green transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 bg-field-sage/10 rounded-lg">
          <h2 className="text-2xl font-semibold text-command-navy mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-gray-700 mb-4">
            If you can't find the page you're looking for in our sitemap, please use our search function
            or contact us directly.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-forest-green text-white font-semibold rounded-lg hover:bg-forest-green transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-command-navy font-semibold rounded-lg border-2 border-command-navy hover:bg-command-navy hover:text-white transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>
            This sitemap was last updated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
