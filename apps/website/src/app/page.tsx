import { CtaSection } from '@/components/CtaSection';
import { DevelopmentPortfolio } from '@/components/DevelopmentPortfolio';
import { HeroSection } from '@/components/HeroSection';
import { LazySectionWrapper, LazyServicesSection } from '@/components/LazyComponents';
import { MissionSection } from '@/components/MissionSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <MissionSection />
      
      {/* Development Portfolio Section */}
      <DevelopmentPortfolio />
      
      {/* Lazy load services section for better performance */}
      <LazySectionWrapper>
        <LazyServicesSection />
      </LazySectionWrapper>
      
      <CtaSection />
    </main>
  );
}
