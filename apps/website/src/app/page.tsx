import { CtaSection } from '@/components/CtaSection';
import { HeroSection } from '@/components/HeroSection';
import { LazySectionWrapper, LazyServicesSection } from '@/components/LazyComponents';
import { MissionSection } from '@/components/MissionSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <MissionSection />
      
      {/* Lazy load services section for better performance */}
      <LazySectionWrapper>
        <LazyServicesSection />
      </LazySectionWrapper>
      
      <CtaSection />
    </main>
  );
}
