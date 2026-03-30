import type { Metadata } from 'next';

import { VerticalSolutionPageClient } from '../VerticalSolutionPageClient';

export const metadata: Metadata = {
  title: 'Real Estate Team Solutions',
  description:
    'Operational infrastructure for real estate teams: unified intake, call logging, MLS and CRM credential governance, team pipeline visibility.',
  alternates: { canonical: '/solutions/real-estate' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Real Estate Team Solutions | Strata Noble',
    description:
      'One pipeline for multiple lead sources and agents; audit-trailed access to tools.',
    url: '/solutions/real-estate',
  },
};

export default function RealEstateSolutionsPage() {
  return <VerticalSolutionPageClient slug="real-estate" />;
}
