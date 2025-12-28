import { Metadata } from 'next';
import { DiscoveryPageClient } from '@/components/pages/DiscoveryPageClient';

export const metadata: Metadata = {
  title: 'Discovery | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function DiscoveryPage() {
  return <DiscoveryPageClient />;
}
