import { CtaSection } from '@/components/CtaSection';
import { HeroSectionAligned } from '@/components/HeroSectionAligned';
import { OpportunityInsightSection } from '@/components/OpportunityInsightSection';
import { WhatWeDoFlow } from '@/components/WhatWeDoFlow';
import { WhyStrataNobleGrid } from '@/components/WhyStrataNobleGrid';
import { SmartConsultingBar } from '@/components/SmartConsultingBar';

export default function HomePage() {
  return (
    <>
      <SmartConsultingBar />
      <main className="min-h-screen relative overflow-hidden">
        <HeroSectionAligned />
        <OpportunityInsightSection />
        <WhatWeDoFlow />
        <WhyStrataNobleGrid />
        <CtaSection />
      </main>
    </>
  );
}
