import { RevampedHero } from '@/components/revamp/RevampedHero';
import { LeadLeakCheckSection } from '@/components/revamp/LeadLeakCheckSection';
import { BuiltInPublicSection } from '@/components/revamp/BuiltInPublicSection';
import { SmartConsultingBar, WhatWeInstallSection, PrinciplesSection } from '@/components/LazyLoadedSections';

/**
 * Homepage - Pipeline-focused landing page
 *
 * Copy:
 * - Lead-to-customer pipelines for service businesses
 * - Intake, follow-up automation, and deal tracking
 * - No branding. No websites. Pipeline infrastructure only.
 */

export default function HomePage() {
  return (
    <>
      <SmartConsultingBar />
      <main className="min-h-screen relative overflow-hidden">
        <RevampedHero />
        <LeadLeakCheckSection />
        <WhatWeInstallSection />
        <PrinciplesSection />
        <BuiltInPublicSection />
      </main>
    </>
  );
}
