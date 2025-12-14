import { Metadata } from 'next';
import { ThanksPageClient } from '@/components/pages/ThanksPageClient';

export const metadata: Metadata = {
  title: 'Thanks | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function ThanksPage() {
  return <ThanksPageClient />;
}
