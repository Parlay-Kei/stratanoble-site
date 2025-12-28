import { Metadata } from 'next';
import { AuthAchieveryPageClient } from '@/components/pages/AuthAchieveryPageClient';

export const metadata: Metadata = {
  title: 'AuthAchievery | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function AchieveryAuth() {
  return <AuthAchieveryPageClient />;
}
