import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Our 4-step delivery model: Discovery, Implementation, Handoff, and Optional Ongoing Support. Scoped engagements for service businesses.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | Strata Noble',
    description: 'Scoped operational infrastructure delivery in 4 steps.',
    url: '/how-it-works',
  },
  robots: { index: true, follow: true },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
