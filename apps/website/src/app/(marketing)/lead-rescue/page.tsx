import { Metadata } from 'next';
import { LeadRescueForm } from '@/components/forms/LeadRescueForm';

export const metadata: Metadata = {
  title: '48-Hour Lead Rescue | Strata Noble',
  description:
    'Stop losing leads. Get a complete lead capture and follow-up system installed in 48 hours.',
  openGraph: {
    title: '48-Hour Lead Rescue | Strata Noble',
    description:
      'Stop losing leads. Get a complete lead capture and follow-up system installed in 48 hours.',
  },
};

export default function LeadRescuePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '48-Hour Lead Rescue',
    description: 'Lead capture and follow-up system installation',
    provider: {
      '@type': 'Organization',
      name: 'Strata Noble',
    },
    offers: {
      '@type': 'Offer',
      price: '997',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto py-12 px-4">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">48-Hour Lead Rescue</h1>
          <p className="text-xl text-muted-foreground mt-4">
            We install a lead capture and follow-up system in 48 hours. No fluff, no lengthy
            onboarding. Just a working pipeline.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left: Content blocks */}
          <div className="space-y-8">
            <WhoItsFor />
            <Deliverables />
            <Timeline />
            <Requirements />
            <Pricing />
          </div>

          {/* Right: Form (sticky on desktop) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Request the Lead Rescue</h2>
              <LeadRescueForm />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* Bottom CTA */}
        <BottomCTA />
      </main>
    </>
  );
}

function WhoItsFor() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Who This Is For</h2>
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>Service businesses with leads coming in but no system to track them</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>Operators who know they're losing deals in follow-up</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>Anyone tired of "I'll get back to them" turning into ghosted leads</span>
        </li>
      </ul>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3">Who This Is NOT For</h3>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>Businesses that need brand/website work first</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>Teams looking for ongoing marketing retainers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Deliverables() {
  const items = [
    'Lead intake form connected to your CRM/database',
    'Automated email confirmation to new leads',
    'Follow-up sequence (3 emails)',
    'Lead tracking dashboard',
    'Handoff documentation + Loom walkthrough',
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">What You Get</h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-primary font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This is a one-time buildout. We deliver the working system, you
          own it and run it.
        </p>
      </div>
    </div>
  );
}

function Timeline() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-2">Timeline</h2>
      <p className="text-4xl font-bold text-primary mt-3">48 Hours</p>
      <p className="text-muted-foreground mt-2">From kickoff call to working system</p>
      <div className="mt-4 pt-4 border-t border-primary/20">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>Hour 0: Kickoff call (30 min)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>Hours 1-24: Build and configure</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>Hours 25-48: Test, refine, and handoff</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Requirements() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Requirements</h2>
      <ul className="space-y-3 text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="text-foreground">•</span>
          <span>Access to your current tools (we'll guide you)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-foreground">•</span>
          <span>One clear offer to build the intake around</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-foreground">•</span>
          <span>30-minute kickoff call availability</span>
        </li>
      </ul>
    </div>
  );
}

function Pricing() {
  return (
    <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
      <h2 className="text-2xl font-semibold mb-3">Investment</h2>
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">Starting at</span>
        <p className="text-3xl font-bold text-primary">$997</p>
      </div>
      <p className="text-sm text-muted-foreground mt-2">One-time fee. No recurring costs.</p>
      <div className="mt-4 pt-4 border-t border-primary/20">
        <p className="text-sm">
          <strong>What's included:</strong>
        </p>
        <ul className="text-sm space-y-1 mt-2 text-muted-foreground">
          <li>✓ Complete system setup</li>
          <li>✓ 3-email follow-up sequence</li>
          <li>✓ Dashboard & documentation</li>
          <li>✓ 48-hour delivery guarantee</li>
        </ul>
      </div>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "What if I don't have a CRM yet?",
      a: "No problem. We'll recommend the best tool for your needs (usually Notion or Airtable for simplicity) and set it up as part of the buildout.",
    },
    {
      q: 'Can you integrate with my existing tools?',
      a: "Yes. We work with most common tools: Notion, Airtable, HubSpot, Google Sheets, Zapier, etc. If you have a unique setup, we'll discuss it on the kickoff call.",
    },
    {
      q: 'What happens after the 48 hours?',
      a: 'You own the system. We provide documentation and a Loom walkthrough. If you need ongoing support or want to expand, we can discuss Phase 3 (21-day buildout).',
    },
    {
      q: 'Do you write the email copy?',
      a: 'Yes. We write the 3-email follow-up sequence based on your offer and voice. You review and approve before launch.',
    },
    {
      q: 'Is this a good fit if I get less than 10 leads per month?',
      a: "It can be, but only if those leads are high-value. If you're just starting out, we recommend focusing on lead generation first.",
    },
  ];

  return (
    <section className="max-w-3xl mx-auto mt-20">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="border rounded-lg p-4 hover:border-primary/50 transition-colors group"
          >
            <summary className="font-medium cursor-pointer flex items-center justify-between">
              <span>{faq.q}</span>
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-muted-foreground leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="max-w-2xl mx-auto mt-20 text-center bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-4">Stop Losing Leads Today</h2>
      <p className="text-muted-foreground mb-6">
        Fill out the form above to request your 48-Hour Lead Rescue. We'll review your submission
        and get back to you within 24 hours.
      </p>
      <a
        href="#top"
        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
      >
        Request Lead Rescue
      </a>
    </section>
  );
}
