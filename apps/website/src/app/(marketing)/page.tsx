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
    a: 'Strata Noble helps owner-led professional firms turn one recurring office burden into a safe, practical AI-assisted routine their team can review, use, and keep.',
  },
  {
    q: 'How long does it take to get started?',
    a: 'The AI Fit Call takes 15 to 20 minutes. A First AI Workday Setup is typically delivered in 7 to 10 business days after required materials are received.',
  },
  {
    q: 'What does an AI Operations Review include?',
    a: 'The review includes one process map, top AI opportunities, risk notes, one recommended setup, expected effort, and a fixed-scope proposal.',
  },
  {
    q: 'Does AI make decisions for my business?',
    a: 'No. AI can draft, summarize, classify, and organize approved information. Your team reviews important output and makes the final decision.',
  },
  {
    q: 'What is the price range for services?',
    a: 'The AI Operations Review is $500. The First AI Workday Setup test price is $2,000. Expansion is scoped at $1,250 to $2,500, and Quarterly AI Tune-Up is $750 per quarter.',
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
