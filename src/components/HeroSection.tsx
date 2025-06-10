import { ArrowUpRight, FileText } from 'lucide-react';
import { AnimatedSection, AnimatedText, Container, buttonVariants } from '@/lib/ui';
import { cn } from '@/lib/utils';

export const HeroSection = () => {
  return (
    <section className="w-full bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-full h-full bg-grid-pattern"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#003366] opacity-10 rounded-full blur-3xl"></div>
      </div>
      <Container className="relative z-10">
        <div className="max-w-3xl">
          <AnimatedText
            text="Elevating Under-Served Entrepreneurs Through Data-Driven Strategy"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#003366] leading-tight mb-6"
          />
          <AnimatedSection delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-600 mb-10">
              Hands-on consulting that turns passion into profit—one insight at a time.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.4} className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-[#50C878] hover:bg-opacity-90 text-white shadow-lg shadow-emerald-200'
              )}
            >
              Book a Strategy Call
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="#resources"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'text-[#003366] border-[#003366]'
              )}
            >
              Download Intro Deck
              <FileText className="w-5 h-5 ml-2" />
            </a>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
};
