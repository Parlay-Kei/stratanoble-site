import type { Metadata } from 'next';

import { HowItWorksPageClient } from './HowItWorksPageClient';

export const metadata: Metadata = {
  title: 'How It Works | Strata Noble',
  description:
    'Our 4-step delivery model: Discovery, Implementation, Handoff, and optional Operations Command ($1,497/mo). Scoped engagements for service businesses.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | Strata Noble',
    description: 'Scoped operational infrastructure delivery — Lead Rescue, Pipeline Buildout, Operations Command.',
    url: '/how-it-works',
  },
  robots: { index: true, follow: true },
};

export default function HowItWorksPage() {
  return <HowItWorksPageClient />;
}
