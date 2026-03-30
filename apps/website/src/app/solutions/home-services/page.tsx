import type { Metadata } from 'next';

import { VerticalSolutionPageClient } from '../VerticalSolutionPageClient';

export const metadata: Metadata = {
  title: 'Home Services Solutions',
  description:
    'Operational infrastructure for HVAC, plumbing, and home service operators: lead capture, speed-to-lead, pipeline visibility, and AR — powered by Q Suite.',
  alternates: { canonical: '/solutions/home-services' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Home Services Solutions | Strata Noble',
    description:
      'Google and Yelp leads with follow-up, office coordination, and revenue visibility.',
    url: '/solutions/home-services',
  },
};

export default function HomeServicesSolutionsPage() {
  return <VerticalSolutionPageClient slug="home-services" />;
}
