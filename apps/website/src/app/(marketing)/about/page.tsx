import type { Metadata } from 'next';

import { AboutPageClient } from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About | Strata Noble',
  description:
    'Strata Noble is a digital build and venture operations studio. We deliver production websites, portals, marketplaces, and the operational systems that make revenue trackable — for service businesses and early-stage ventures.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About | Strata Noble',
    description:
      'Build and operations studio for service businesses and early-stage ventures of any size. Websites, portals, platforms, and the systems behind them.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
