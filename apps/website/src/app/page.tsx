import { CtaSection } from '@/components/CtaSection';
import { HeroSectionAligned } from '@/components/HeroSectionAligned';
import { OpportunityInsightSection } from '@/components/OpportunityInsightSection';
import { WhatWeDoFlow } from '@/components/WhatWeDoFlow';
import { WhyStrataNobleGrid } from '@/components/WhyStrataNobleGrid';
import { SmartConsultingBar } from '@/components/SmartConsultingBar';
import { isRevampEnabled } from '@/lib/feature-flags';
import { RevampedHero } from '@/components/revamp/RevampedHero';
import { LeadLeakCheckSection } from '@/components/revamp/LeadLeakCheckSection';
import { WhatWeInstallSection } from '@/components/revamp/WhatWeInstallSection';
import { PrinciplesSection } from '@/components/revamp/PrinciplesSection';
import { BuiltInPublicSection } from '@/components/revamp/BuiltInPublicSection';

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
