import type { Metadata } from 'next';

import { VerticalSolutionPageClient } from '../VerticalSolutionPageClient';

export const metadata: Metadata = {
  title: 'Consulting & Agency Solutions',
  description:
    'Operational infrastructure for consulting firms and agencies: client lifecycle, AR, executive rhythm, and credential governance — powered by Q Suite.',
  alternates: { canonical: '/solutions/consultants' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Consulting & Agency Solutions | Strata Noble',
    description:
      'Client lifecycle off email, invoices on time, weekly operating rhythm, credentials governed.',
    url: '/solutions/consultants',
  },
};

export default function ConsultantsSolutionsPage() {
  return <VerticalSolutionPageClient slug="consultants" />;
}
