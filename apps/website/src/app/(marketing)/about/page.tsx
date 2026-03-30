import type { Metadata } from 'next';

import { AboutPageClient } from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About | Strata Noble',
  description:
    'Operator-led operational infrastructure firm. We install control systems for service businesses — scoped, documented, and transferable.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About | Strata Noble',
    description:
      'Operational infrastructure firm for service businesses. How we differ from agencies and CRM consultants.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
