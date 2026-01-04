import React from 'react'
import { SiteNav } from './SiteNav'
import { SiteFooter } from './SiteFooter'

/**
 * SiteShell - Single source of truth for nav/footer
 *
 * Rule: No page renders its own header/footer anymore.
 * Pages render content only.
 *
 * This component wraps all marketing pages.
 */

interface SiteShellProps {
  children: React.ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  )
}
