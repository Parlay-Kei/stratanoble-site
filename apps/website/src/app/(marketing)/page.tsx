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
    a: 'Strata Noble installs operational control systems for service businesses: powered by Q SUITE, verified through ProofLoop, delivered through ANX Vault, with ACHIEVERY when accountability matters.',
  },
  {
    q: 'How long does it take to get started?',
    a: 'A Systems Audit is typically 48 to 72 hours. An Operations Buildout runs 21 days. A Process Improvement Sprint targets one workflow in 10 business days.',
  },
  {
    q: 'What does a Free Diagnostic include?',
    a: 'A review of how work flows today, where it breaks, and a recommended path with fixed pricing before any build starts.',
  },
  {
    q: 'Do I own the systems you build?',
    a: 'Yes. Deliverables land in your accounts and delivery folder. Q SUITE licensing is separate platform access; you are not locked into opaque bundles.',
  },
  {
    q: 'What is the price range for services?',
    a: 'Systems Audit is $997. Process Improvement Sprint is $2,497. Operations Buildout is $4,997. Operations Command is $1,497 per month with a 3-month minimum.',
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
