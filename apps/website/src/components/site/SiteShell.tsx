import React from 'react'
import { SiteNav } from './SiteNav'
import { SiteFooter } from './SiteFooter'
import NoupeChatWrapper from '@/components/NoupeChatWrapper'

/**
 * SiteShell - Single source of truth for nav/footer
 *
 * Rule: No page renders its own header/footer anymore.
 * Pages render content only.
 *
 * This component wraps all marketing pages.
 *
 * Includes:
 * - SiteNav: Main navigation
 * - SiteFooter: Footer with legal links
 * - NoupeChatWrapper: Client-side lazy-loaded chat widget (Jotform)
 */

interface SiteShellProps {
  children: React.ReactNode
  /** Disable chat widget on specific pages */
  disableChat?: boolean
}

export function SiteShell({ children, disableChat = false }: SiteShellProps) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
      {!disableChat && <NoupeChatWrapper showDisclosure={true} loadDelay={3000} />}
    </>
  )
}
