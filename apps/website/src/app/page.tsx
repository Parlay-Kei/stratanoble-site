import { CtaSection } from '@/components/CtaSection';
import { HeroSectionAligned } from '@/components/HeroSectionAligned';
import { OpportunityInsightSection } from '@/components/OpportunityInsightSection';
import { WhatWeDoFlow } from '@/components/WhatWeDoFlow';
import { WhyStrataNobleGrid } from '@/components/WhyStrataNobleGrid';
import { isRevampEnabled } from '@/lib/feature-flags';
import { RevampedHero } from '@/components/revamp/RevampedHero';
import { LeadLeakCheckSection } from '@/components/revamp/LeadLeakCheckSection';
import { BuiltInPublicSection } from '@/components/revamp/BuiltInPublicSection';
import nextDynamic from 'next/dynamic';

// Lazy-load client components below the fold for better performance
// Note: These will still be lazy-loaded, just server-rendered on first load
const SmartConsultingBar = nextDynamic(() => import('@/components/SmartConsultingBar').then(mod => ({ default: mod.SmartConsultingBar })));

const WhatWeInstallSection = nextDynamic(() => import('@/components/revamp/WhatWeInstallSection').then(mod => ({ default: mod.WhatWeInstallSection })));

const PrinciplesSection = nextDynamic(() => import('@/components/revamp/PrinciplesSection').then(mod => ({ default: mod.PrinciplesSection })));

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
