import { Metadata } from 'next';
import { AdminVaultPageClient } from '@/components/pages/AdminVaultPageClient';

export const metadata: Metadata = {
  title: 'AdminVault | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function VaultDashboard() {
  return <AdminVaultPageClient />;
}
