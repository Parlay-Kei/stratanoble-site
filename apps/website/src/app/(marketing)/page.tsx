import {
  MarketingHomeShell,
  HomepageHero,
  ThreeSurfaces,
  HowItWorks,
  EcosystemProof,
  HomepageCTA,
} from '@/components/homepage';
import { LeadLeakCheckSection } from '@/components/revamp/LeadLeakCheckSection';

export default function HomePage() {
  return (
    <MarketingHomeShell>
      <main className="min-h-screen bg-[#070f1a]">
        <HomepageHero />
        <ThreeSurfaces />
        <HowItWorks />
        <EcosystemProof />
        <LeadLeakCheckSection />
        <HomepageCTA />
      </main>
    </MarketingHomeShell>
  );
}
