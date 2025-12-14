import { Metadata } from 'next';
import { PricingPageClient } from '@/components/pages/PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return <PricingPageClient />;
}
