import React from 'react'
import { SiteShell } from '@/components/site'

/**
 * Marketing Layout
 *
 * Route group layout for all public marketing pages.
 * Uses SiteShell for consistent nav/footer.
 *
 * Pages in this group:
 * - / (home)
 * - /about
 * - /contact
 * - /lead-rescue
 * - /phase-3
 * - /tools
 */

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SiteShell>{children}</SiteShell>
}
