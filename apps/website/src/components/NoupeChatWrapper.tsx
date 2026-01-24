'use client';

import dynamic from 'next/dynamic';

/**
 * NoupeChatWrapper - Client-side wrapper for lazy-loading NoupeChat
 *
 * This wrapper exists because:
 * - next/dynamic with ssr:false requires a Client Component
 * - SiteShell is a Server Component and should remain so
 * - This pattern keeps SSR benefits while lazy-loading the chat widget
 */
const NoupeChat = dynamic(
  () => import('@/components/NoupeChat'),
  { ssr: false }
);

interface NoupeChatWrapperProps {
  showDisclosure?: boolean;
  loadDelay?: number;
}

export default function NoupeChatWrapper({
  showDisclosure = true,
  loadDelay = 3000
}: NoupeChatWrapperProps) {
  return <NoupeChat showDisclosure={showDisclosure} loadDelay={loadDelay} />;
}
