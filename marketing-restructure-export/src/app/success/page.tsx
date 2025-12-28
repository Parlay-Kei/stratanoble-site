import { Metadata } from 'next';
import { SuccessPageClient } from '@/components/pages/SuccessPageClient';

export const metadata: Metadata = {
  title: 'Success | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function SuccessPage() {
  return <SuccessPageClient />;
}
