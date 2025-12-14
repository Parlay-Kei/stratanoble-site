import { Metadata } from 'next';
import { VoiceTestPageClient } from '@/components/pages/VoiceTestPageClient';

export const metadata: Metadata = {
  title: 'VoiceTest | Strata Noble',
};

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export default function VoiceTestPage() {
  return <VoiceTestPageClient />;
}
