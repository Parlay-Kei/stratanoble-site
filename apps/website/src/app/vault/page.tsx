import { Metadata } from 'next';
import { VaultPageClient } from '@/components/pages/VaultPageClient';

export const metadata: Metadata = {
  title: 'Vault | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function VaultPage() {
  return <VaultPageClient />;
}
