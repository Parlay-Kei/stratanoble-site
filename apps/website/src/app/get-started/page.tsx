import { Metadata } from 'next';
import { GetStartedPageClient } from '@/components/pages/GetStartedPageClient';

export const metadata: Metadata = {
  title: 'GetStarted | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function GetStartedPage() {
  return <GetStartedPageClient />;
}
