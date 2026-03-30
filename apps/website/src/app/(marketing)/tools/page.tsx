import type { Metadata } from 'next';

import { ToolsPageClient } from './ToolsPageClient';

export const metadata: Metadata = {
  title: 'Tools | Strata Noble',
  description:
    'ProofLoop verification, ANX Vault handoff, and ACHIEVERY visibility — operational tools that ship with every Strata Noble engagement.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Tools | Strata Noble',
    description:
      'How we prove delivery, secure credentials, and extend visibility — powered by Q Suite.',
    url: '/tools',
  },
  robots: { index: true, follow: true },
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
