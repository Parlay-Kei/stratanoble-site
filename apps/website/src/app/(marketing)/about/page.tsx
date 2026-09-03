import type { Metadata } from 'next';

import { AboutPageClient } from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About | Strata Noble',
  description:
    'Strata Noble helps owner-led businesses use AI for practical office routines: follow-up, notes, proposals, admin, and review.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About | Strata Noble',
    description:
      'Practical AI setup for small business operators who need less admin drag without a complicated platform.',
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
