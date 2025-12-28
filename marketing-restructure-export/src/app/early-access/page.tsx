import { Metadata } from 'next';
import { EarlyAccessPageClient } from '@/components/pages/EarlyAccessPageClient';

export const metadata: Metadata = {
  title: 'EarlyAccess | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function EarlyAccessPage() {
  return <EarlyAccessPageClient />;
}
