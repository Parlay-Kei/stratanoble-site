import type { Metadata } from 'next';

import { ToolsPageClient } from './ToolsPageClient';

export const metadata: Metadata = {
  title: 'Tools | Strata Noble',
  description:
    'Deployment verification, secure delivery, and ACHIEVERY goal tracking — tools and standards that ship with every Strata Noble engagement.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Tools | Strata Noble',
    description:
      'How we prove delivery, secure the handoff, and give you visibility into your operation.',
    url: '/tools',
  },
  robots: { index: true, follow: true },
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
