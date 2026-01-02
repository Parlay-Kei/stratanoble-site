import { CtaSection } from '@/components/CtaSection';
import { HeroSectionAligned } from '@/components/HeroSectionAligned';
import { OpportunityInsightSection } from '@/components/OpportunityInsightSection';
import { WhatWeDoFlow } from '@/components/WhatWeDoFlow';
import { WhyStrataNobleGrid } from '@/components/WhyStrataNobleGrid';
import { isRevampEnabled } from '@/lib/feature-flags';
import { RevampedHero } from '@/components/revamp/RevampedHero';
import { LeadLeakCheckSection } from '@/components/revamp/LeadLeakCheckSection';
import { BuiltInPublicSection } from '@/components/revamp/BuiltInPublicSection';
import { SmartConsultingBar, WhatWeInstallSection, PrinciplesSection } from '@/components/LazyLoadedSections';

export const dynamic = 'force-dynamic';


export default function HomePage() {
  const revampEnabled = isRevampEnabled();

  return (
    <>
      <SmartConsultingBar />
      <main className="min-h-screen relative overflow-hidden">
        {revampEnabled ? (
          <>
            <RevampedHero />
            <LeadLeakCheckSection />
            <WhatWeInstallSection />
            <PrinciplesSection />
            <BuiltInPublicSection />
          </>
        ) : (
          <>
            <HeroSectionAligned />
            <OpportunityInsightSection />
            <WhatWeDoFlow />
            <WhyStrataNobleGrid />
            <CtaSection />
          </>
        )}
      </main>
    </>
  );
}
