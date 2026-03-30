import {
  MarketingHomeShell,
  HomepageHero,
  ThreeSurfaces,
  HowItWorks,
  EcosystemProof,
  LeadLeakCheckSection,
  HomepageCTA,
} from '@/components/homepage';

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
