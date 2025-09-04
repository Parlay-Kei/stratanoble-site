import { CtaSection } from '@/components/CtaSection';
import { CompactHeroSection } from '@/components/CompactHeroSection';
import { MarketRealitySection } from '@/components/MarketRealitySection';
import { TransformationFlow } from '@/components/TransformationFlow';
import { InnovativeServicesGrid } from '@/components/InnovativeServicesGrid';
import { UrgencyBar } from '@/components/UrgencyBar';

export default function HomePage() {
  return (
    <>
      <UrgencyBar />
      <main className="min-h-screen relative overflow-hidden">
        <CompactHeroSection />
        <MarketRealitySection />
        <TransformationFlow />
        <InnovativeServicesGrid />
        <CtaSection />
      </main>
    </>
  );
}
