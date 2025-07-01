import { CtaSection } from '@/components/CtaSection';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { MissionSection } from '@/components/MissionSection';
import { ServicesSection } from '@/components/ServicesSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <MissionSection />
      <ServicesSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
