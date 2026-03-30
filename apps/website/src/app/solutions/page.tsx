import type { Metadata } from 'next';

import { SolutionsPageClient } from './SolutionsPageClient';

export const metadata: Metadata = {
  title: 'Solutions | Strata Noble — Operational Control Systems',
  description:
    'Packaged operational outcomes for service businesses. Lead flow control, client operations, receivables, security, and executive visibility.',
  alternates: { canonical: '/solutions' },
  openGraph: {
    title: 'Solutions | Strata Noble',
    description: 'Operational control systems for service businesses.',
    url: '/solutions',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SolutionsPage() {
  return <SolutionsPageClient />;
}
