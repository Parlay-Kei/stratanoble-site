import { HeroSection } from '@/components/HeroSection';
import { MissionSection } from '@/components/MissionSection';
import { ServicesSection } from '@/components/ServicesSection';
import { CaseStudiesSlider } from '@/components/CaseStudiesSlider';
import { MetricsSection } from '@/components/MetricsSection';
import { TargetAudienceSection } from '@/components/TargetAudienceSection';
import { TimelineSection } from '@/components/TimelineSection';
import { ResourcesSection } from '@/components/ResourcesSection';
import { CtaSection } from '@/components/CtaSection';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <ServicesSection />
      <CaseStudiesSlider />
      <MetricsSection />
      <TargetAudienceSection />
      <TimelineSection />
      <ResourcesSection />
      <CtaSection />
    </>
  );
};
