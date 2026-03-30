import { OperationalHero } from '@/components/revamp/OperationalHero';
import { LeadLeakCheckSection } from '@/components/revamp/LeadLeakCheckSection';
import { HowItWorksSection } from '@/components/revamp/HowItWorksSection';
import { QSuiteSection } from '@/components/revamp/QSuiteSection';
import { ProofSection } from '@/components/revamp/ProofSection';
import { OffersSection } from '@/components/revamp/OffersSection';
import { ProblemAreasSection } from '@/components/revamp/ProblemAreasSection';
import { CaseStudySection } from '@/components/revamp/CaseStudySection';
import { OfferLadderSection } from '@/components/revamp/OfferLadderSection';
import { SmartConsultingBar } from '@/components/LazyLoadedSections';

export default function HomePage() {
  return (
    <>
      <SmartConsultingBar />
      <main className="min-h-screen relative overflow-hidden">
        <OperationalHero />
        <ProblemAreasSection />
        <HowItWorksSection />
        <QSuiteSection />
        <ProofSection />
        <CaseStudySection />
        <OffersSection />
        <OfferLadderSection />
        <LeadLeakCheckSection />
      </main>
    </>
  );
}
