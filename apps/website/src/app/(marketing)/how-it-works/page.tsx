import type { Metadata } from 'next';

import { HowItWorksPageClient } from './HowItWorksPageClient';

export const metadata: Metadata = {
  title: 'How It Works | Strata Noble',
  description:
    'Our delivery model: Discovery, Build, Handoff, and optional ongoing support. Clear scope, fixed price, and everything documented - for service businesses and early-stage ventures.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | Strata Noble',
    description:
      'How Strata Noble delivers - from website builds and portal deployments to full operational system installs. Same process every time.',
    url: '/how-it-works',
  },
  robots: { index: true, follow: true },
};

export default function HowItWorksPage() {
  return <HowItWorksPageClient />;
}
