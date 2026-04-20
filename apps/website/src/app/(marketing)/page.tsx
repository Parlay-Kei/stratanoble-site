import {
  MarketingHomeShell,
  HomepageHero,
  ProofBar,
  TwoSurfaces,
  HowItWorks,
  EcosystemProof,
  LeadLeakCheckSection,
  HomepageCTA,
} from '@/components/homepage';
import { buildFaqPageJsonLd } from '@/lib/seo/json-ld';

const HOMEPAGE_FAQS = [
  {
    q: 'What does Strata Noble do?',
    a: 'Strata Noble builds and operates lead capture, follow-up automation, booking, and revenue tracking systems for service businesses and early-stage ventures.',
  },
  {
    q: 'How long does it take to get started?',
    a: 'The 48-hour Lead Rescue can be installed in two business days. A full 21-day Pipeline Buildout delivers a complete lead-to-customer system in three weeks.',
  },
  {
    q: 'What does a Free Diagnostic include?',
    a: 'A review of how your business currently captures and follows up with leads, identification of where revenue is being lost, and a recommended fix with a fixed price.',
  },
  {
    q: 'Do I own the systems you build?',
    a: 'Yes. Everything Strata Noble builds is delivered to your accounts. You own the code, the workflows, and the data. There are no platform lock-in fees.',
  },
  {
    q: 'What is the price range for services?',
    a: 'Lead Rescue starts at $997. Pipeline Buildout starts at $2,500. Operations Support is $297 to $997 per month depending on scope.',
  },
] as const;

export default function HomePage() {
  const faqJsonLd = buildFaqPageJsonLd(HOMEPAGE_FAQS, 'https://stratanoble.com');

  return (
    <MarketingHomeShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen bg-[#070f1a]">
        <HomepageHero />
        <ProofBar />
        <TwoSurfaces />
        <HowItWorks />
        <EcosystemProof />
        <LeadLeakCheckSection />
        <HomepageCTA />
      </main>
    </MarketingHomeShell>
  );
}
