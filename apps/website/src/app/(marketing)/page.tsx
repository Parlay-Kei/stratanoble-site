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
    a: 'Strata Noble builds business solutions and installs operational systems for service businesses. The work spans workflow design, system configuration, automation, reporting, and custom solution building — backed by proprietary technology the firm built and operates.',
  },
  {
    q: 'How long does it take to get started?',
    a: 'Every engagement starts with a free 30-minute diagnostic call. A Systems Audit delivers findings in 48–72 hours. A Process Improvement Sprint runs 10 business days. An Operations Buildout delivers in 21 days.',
  },
  {
    q: 'What does the free diagnostic call include?',
    a: 'A 30-minute review of how the business currently operates — where work flows, where it breaks down, and what the structural issues are. You receive a recommended path forward before any work or payment begins.',
  },
  {
    q: 'Do I own the systems you build?',
    a: 'Yes. Everything Strata Noble builds is delivered to your accounts with full documentation. You own the workflows, the configurations, and the data. Nothing is locked behind our systems or our access.',
  },
  {
    q: 'What is the price range for services?',
    a: 'Systems Audit is $997. Process Improvement Sprint is $2,497. Operations Buildout is $4,997. Operations Command ongoing support is $1,497 per month with a 3-month minimum.',
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
