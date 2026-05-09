import React from 'react'
import { SiteShell } from '@/components/site'

/**
 * Marketing Layout
 *
 * Route group layout for all public marketing pages.
 * Uses SiteShell for consistent nav/footer.
 *
 * Pages in this group include:
 * - /, /about, /contact, /systems-audit, /operations-buildout
 * - /services, /q-suite, /achievery, /proof
 * - /tools, /how-it-works
 */

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SiteShell>{children}</SiteShell>
}
