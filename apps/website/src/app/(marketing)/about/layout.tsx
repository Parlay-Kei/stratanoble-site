import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Strata Noble installs operational control systems for service businesses — operator-led, infrastructure-first, scoped engagements.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About | Strata Noble',
    description:
      'Operational infrastructure firm for service businesses. How we differ from agencies and CRM consultants.',
    url: '/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
