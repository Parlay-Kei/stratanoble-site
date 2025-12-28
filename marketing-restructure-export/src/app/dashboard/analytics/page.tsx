import { Metadata } from 'next';
import { DashboardAnalyticsPageClient } from '@/components/pages/DashboardAnalyticsPageClient';

export const metadata: Metadata = {
  title: 'DashboardAnalytics | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function AnalyticsDashboard() {
  return <DashboardAnalyticsPageClient />;
}
