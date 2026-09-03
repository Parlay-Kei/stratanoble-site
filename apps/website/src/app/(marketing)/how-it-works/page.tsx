import type { Metadata } from 'next';

import { HowItWorksPageClient } from './HowItWorksPageClient';

export const metadata: Metadata = {
  title: 'How It Works | Strata Noble',
  description:
    'How Strata Noble turns one repeated office workflow into a simple AI-assisted routine with clear handoff and human review.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | Strata Noble',
    description:
      'Find one useful AI routine, set it up, teach it, and tune it only when it proves useful.',
    url: '/how-it-works',
  },
  robots: { index: true, follow: true },
};

export default function HowItWorksPage() {
  return <HowItWorksPageClient />;
}
