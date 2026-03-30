import type { Metadata } from 'next';

import { SiteShell } from '@/components/site';

export const metadata: Metadata = {
  title: 'Q Suite — Our Operating Framework',
  description:
    'Our work is powered by Q Suite, a modular operating framework. Q-CC, Q-ICMS, Q-ARI, Q-VAULT, Q-REIL — configured as part of scoped engagements.',
  alternates: { canonical: '/platform' },
  openGraph: {
    title: 'Q Suite | Strata Noble',
    description: 'Modular operating framework for service businesses.',
    url: '/platform',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
