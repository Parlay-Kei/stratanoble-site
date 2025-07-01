'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ClientLogo {
  name: string
  logo: string
  url?: string
}

// Enhanced client logos with more variety
const clientLogos: ClientLogo[] = [
  { name: 'Turnerboone', logo: '' },
  { name: 'Wolf Creek Golf Course', logo: '' },
  { name: 'Canam Signs', logo: '' },
  { name: 'Jeni Ent.', logo: '' },
  { name: 'Creative Collective Capital', logo: '' },
  { name: 'Johnston NeuroServices', logo: '' },
  { name: 'BEA - Backstage Economic Alliance', logo: '' },
]

interface ClientLogoStripProps {
  title?: string
  subtitle?: string
  className?: string
  variant?: 'default' | 'compact'
}

export function ClientLogoStrip({ 
  title = "Companies Trust Us",
  subtitle = "Join a multitude of entrepreneurs who've transformed their business",
  className = '',
  variant = 'default'
}: ClientLogoStripProps) {
  // List of company names
  const companies = [
    'Turnerboone',
    'Wolf Creek Golf Course',
    'Canam Signs',
    'Jeni Ent.',
    'Creative Collective Capital',
    'Johnston NeuroServices',
    'BEA - Backstage Economic Alliance',
  ];

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900">
      <h2 className="text-center font-semibold text-lg tracking-wide text-slate-600 dark:text-slate-300">
        {title}
      </h2>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">
        {subtitle}
      </p>
      <div className="mx-auto grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-5xl px-4">
        {companies.map((company) => (
          <div
            key={company}
            className="flex items-center justify-center py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-full bg-white/60 dark:bg-slate-800/50 shadow-sm text-center text-xs font-medium tracking-wide uppercase"
          >
            {company}
          </div>
        ))}
      </div>
    </section>
  )
} 