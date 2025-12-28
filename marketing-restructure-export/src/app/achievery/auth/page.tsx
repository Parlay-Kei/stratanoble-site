import { Metadata } from 'next';
import { AchieveryAuthPageClient } from '@/components/pages/AchieveryAuthPageClient';

export const metadata: Metadata = {
  title: 'AchieveryAuth | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function AchieveryAuthBridge() {
  return <AchieveryAuthPageClient />;
}
