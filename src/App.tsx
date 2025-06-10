import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MissionSection } from './components/MissionSection';
import { ServicesSection } from './components/ServicesSection';
import { RevenueModelSection } from './components/RevenueModelSection';
import { MetricsSection } from './components/MetricsSection';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import { TimelineSection } from './components/TimelineSection';
import { ResourcesSection } from './components/ResourcesSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

export function App() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-800 font-sans">
      <Header />
      <main>
        <HeroSection />
        <MissionSection />
        <ServicesSection />
        <RevenueModelSection />
        <MetricsSection />
        <TargetAudienceSection />
        <TimelineSection />
        <ResourcesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
