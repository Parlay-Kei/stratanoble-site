import type { Metadata } from 'next';

import { VerticalSolutionPageClient } from '../VerticalSolutionPageClient';

export const metadata: Metadata = {
  title: 'Appointment Business Solutions',
  description:
    'Operational infrastructure for appointment-based businesses: unified bookings, no-show recovery, reviews, and booking-to-revenue visibility.',
  alternates: { canonical: '/solutions/appointment-businesses' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Appointment Business Solutions | Strata Noble',
    description:
      'Med spas, dental, salons — tie scheduling, follow-up, and cash together.',
    url: '/solutions/appointment-businesses',
  },
};

export default function AppointmentBusinessesSolutionsPage() {
  return <VerticalSolutionPageClient slug="appointment-businesses" />;
}
