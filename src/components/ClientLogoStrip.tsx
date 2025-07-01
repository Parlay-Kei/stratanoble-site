'use client'

import React from 'react'

interface ClientLogoStripProps {
  title?: string
  subtitle?: string
}

export function ClientLogoStrip({
  title = "Trusted by innovative companies",
  subtitle = "Join hundreds of successful entrepreneurs who've transformed their businesses",
}: ClientLogoStripProps) {
  const companies = [
    'Turnerboone',
    'Wolf Creek Golf Course',
    'Canam Signs',
    'Jeni Ent.',
    'Creative Collective Capital',
    'Johnston NeuroServices',
    'BEA – Backstage Economic Alliance',
  ];

  return (
    <section id="trusted" className="relative isolate bg-slate-900 text-slate-100">
      {/* top hair-line */}
      <span
        aria-hidden="true"
        className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent"
      ></span>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {subtitle}
        </p>

        {/* company “text-logos” */}
        <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.slice(0, 6).map((company) => (
            <li key={company}>
              <span className="block rounded-full border border-slate-600/60 px-4 py-2 text-xs font-medium uppercase tracking-wide">
                {company}
              </span>
            </li>
          ))}
          <li className="sm:col-span-2 lg:col-span-3">
            <span className="block rounded-full border border-slate-600/60 px-4 py-2 text-xs font-medium uppercase tracking-wide">
              {companies[6]}
            </span>
          </li>
        </ul>
      </div>

      {/* bottom hair-line */}
      <span
        aria-hidden="true"
        className="absolute -bottom-px inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent"
      ></span>
    </section>
  )
} 