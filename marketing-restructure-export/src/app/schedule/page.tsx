import { Metadata } from 'next';
import { SchedulePageClient } from '@/components/pages/SchedulePageClient';

export const metadata: Metadata = {
  title: 'Schedule | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function SchedulePage() {
  return <SchedulePageClient />;
}
