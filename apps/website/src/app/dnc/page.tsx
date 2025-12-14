import { Metadata } from 'next';
import { DncPageClient } from '@/components/pages/DncPageClient';

export const metadata: Metadata = {
  title: 'Dnc | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function DncPage() {
  return <DncPageClient />;
}
