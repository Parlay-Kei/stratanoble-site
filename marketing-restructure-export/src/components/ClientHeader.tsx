'use client';

import dynamic from 'next/dynamic';

// Dynamically import Header with SSR disabled to prevent useState errors during static generation
const Header = dynamic(
  () => import('./Header').then(mod => ({ default: mod.Header })),
  {
    ssr: false,
    loading: () => (
      <header className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-sm" />
    )
  }
);

export function ClientHeader() {
  return <Header />;
}
