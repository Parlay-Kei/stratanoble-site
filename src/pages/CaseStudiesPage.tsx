import { Container, AnimatedText, AnimatedSection, Card } from '@/lib/ui';

export const CaseStudiesPage = () => (
  <div className="min-h-screen pt-20 bg-background">
    <Container className="py-12">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <AnimatedText
          as="h1"
          className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
        >
          Case Studies
        </AnimatedText>
        <AnimatedText as="p" className="text-xl text-primary/80 leading-relaxed">
          Discover how we&apos;ve helped businesses transform and achieve remarkable results
        </AnimatedText>
      </div>

      {/* Coming Soon Card */}
      <AnimatedSection delay={0.2}>
        <Card className="p-8 text-center">
          <AnimatedText
            as="h2"
            className="font-headings text-2xl md:text-3xl font-semibold mb-4 text-primary"
          >
            Coming Soon
          </AnimatedText>
          <AnimatedText as="p" className="text-lg text-primary/80">
            We&apos;re preparing to share our success stories. Our case studies will be available
            soon.
          </AnimatedText>
        </Card>
      </AnimatedSection>
    </Container>
  </div>
);
