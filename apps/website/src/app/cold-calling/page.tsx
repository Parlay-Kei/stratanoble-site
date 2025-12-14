import { Metadata } from 'next';
import { ColdCallingPageClient } from '@/components/pages/ColdCallingPageClient';

export const metadata: Metadata = {
  title: 'ColdCalling | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function ColdCallingDashboard() {
  return <ColdCallingPageClient />;
}
