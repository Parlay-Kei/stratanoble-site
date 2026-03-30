import { Metadata } from 'next';
import Link from 'next/link';
import { LeadRescueForm } from '@/components/forms/LeadRescueForm';
import { LeadLeakCalculator } from '@/components/LeadLeakCalculator';
import { ReceiptsIncluded } from '@/components/ReceiptsIncluded';

export const metadata: Metadata = {
  title: '48-Hour Lead Rescue | Strata Noble',
  description:
    'Stop losing leads. We find the leak, fix the flow, and ship receipts proving it works. 48 hours.',
  alternates: {
    canonical: '/lead-rescue',
  },
  openGraph: {
    title: '48-Hour Lead Rescue | Strata Noble',
    description:
      'Stop losing leads. We find the leak, fix the flow, and ship receipts proving it works. 48 hours.',
    url: '/lead-rescue',
  },
};

export default function LeadRescuePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '48-Hour Lead Rescue',
    description: 'Lead capture and follow-up system installation with verified delivery',
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
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-command-navy text-white py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Lead Rescue <span className="text-field-sage">(48 hours)</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              We stop the lead leak, prove what&apos;s broken, and ship the fix with receipts.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="#form"
                className="bg-forest-green text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
              >
                Book a Lead Rescue Call
              </a>
              <Link
                href="/tools/sample-receipt"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                See a Sample ProofLoop Receipt
              </Link>
            </div>

            {/* Trust strip */}
            <p className="text-sm text-slate-grey">
              ProofLoop verified delivery. Receipts stored in ANX Vault. If we can&apos;t prove it, we don&apos;t ship it.
            </p>
          </div>
        </section>

        <div className="container mx-auto py-12 px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left: Content blocks */}
            <div className="space-y-10">
              {/* What You Walk Away With */}
              <WhatYouGet />

              {/* Lead Leak Calculator */}
              <LeadLeakCalculator />

              {/* How We Prove The Work */}
              <HowWeProve />

              {/* Receipts Included */}
              <ReceiptsIncluded variant="lead-rescue" />

              {/* Timeline */}
              <Timeline />

              {/* Requirements */}
              <Requirements />

              {/* Who This Is For */}
              <WhoItsFor />

              {/* Pricing */}
              <Pricing />

              {/* Recent Rescues */}
              <RecentRescues />
            </div>

            {/* Right: Form (sticky on desktop) */}
            <div id="form" className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Book the 10-minute access check</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  If we can&apos;t run ProofLoop, we don&apos;t take the sprint.
                </p>
                <LeadRescueForm />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <FAQSection />

          {/* Bottom CTA */}
          <BottomCTA />
        </div>
      </main>
    </>
  );
}

function WhatYouGet() {
  const outcomes = [
    {
      title: 'Leak stopped',
      description: 'Forms, routing, inboxing, and notifications verified end-to-end.',
    },
    {
      title: 'Money path protected',
      description: 'Lead-to-contact-to-next-step flow stabilized so you stop losing warm intent.',
    },
    {
      title: 'Single source of truth',
      description: 'A clean ledger of what changed, why it changed, and how to reproduce it.',
    },
    {
      title: 'Zero-guesswork handoff',
      description: 'A runnable checklist your team can replay without you in the room.',
    },
    {
      title: 'Receipts in the ANX Vault',
      description: 'Logs, screenshots, commands, and proofs organized for audits, partners, and future upgrades.',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">What you walk away with</h2>
      <ul className="space-y-4">
        {outcomes.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-forest-green text-xl flex-shrink-0 mt-0.5">✓</span>
            <div>
              <span className="font-semibold">{item.title}:</span>{' '}
              <span className="text-muted-foreground">{item.description}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground pt-2 border-t">
        You get stability you can trust and documentation you can use.
      </p>
    </div>
  );
}

function HowWeProve() {
  const receipts = [
    'Build, typecheck, lint, and test receipts',
    'Runtime health receipts',
    'Lead flow smoke test receipts',
    'Auth and email link domain resolution checks (no NXDOMAIN surprises)',
    'Risk acceptance notes when something is intentionally deferred',
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-3">How we prove the work</h2>
      <p className="text-muted-foreground mb-4">
        We deliver through ProofLoop, a verification system that produces a pass/fail verdict with receipts.
        Your project gets a dedicated evidence pack stored in the ANX Vault.
      </p>

      <h3 className="font-semibold text-sm mb-2">ProofLoop pack includes:</h3>
      <ul className="space-y-2 mb-4">
        {receipts.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-blue-500 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/tools/sample-receipt"
        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        See a Sample ProofLoop Receipt (redacted) →
      </Link>
    </div>
  );
}

function Timeline() {
  const steps = [
    { time: 'Hour 0–4', description: 'Intake, access, baseline checks, confirm what "working" means' },
    { time: 'Hour 4–24', description: 'Find the leak, isolate root cause, implement fix, create receipts' },
    { time: 'Hour 24–36', description: 'Verification loop, regression checks, finalize ProofLoop pack' },
    { time: 'Hour 36–48', description: 'Handoff call, ANX Vault delivery, next-step recommendations' },
  ];

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-2">48-hour timeline</h2>
      <ul className="space-y-3 mt-4">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-primary">{step.time}:</span>{' '}
              <span className="text-muted-foreground">{step.description}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-primary/20">
        Fast delivery. Measured output. Clean handoff.
      </p>
    </div>
  );
}

function Requirements() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Requirements to start (10 minutes)</h2>
      <p className="text-sm text-muted-foreground">
        This is a rescue sprint. We move fast when access is clean.
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2">Required:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Admin access to the site platform (or the repo if code-based)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Access to the form tool or CRM where leads should land</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Access to the notification layer (email provider or logs)</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2">Strongly recommended:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>One test lead destination inbox you control</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>A single &quot;golden path&quot; definition (example: landing page → form → confirmation → inbox)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-amber-900">
          <strong>If you don&apos;t have these:</strong> We can still run the rescue.
          The first deliverable becomes an access map and the minimum changes needed to create observability.
        </p>
      </div>
    </div>
  );
}

function WhoItsFor() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Who this is for</h2>
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>You have leads coming in and the pipeline feels unreliable</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>Your team loses time chasing ghosts and duplicates</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-green-500 text-xl flex-shrink-0 mt-0.5">✓</span>
          <span>You need a fix that survives the next deploy</span>
        </li>
      </ul>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3">Who this is NOT for</h3>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>You want a full redesign, SEO overhaul, performance sprint, or rebrand</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>You want a multi-week roadmap packaged as a rescue</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">✗</span>
            <span>You want ongoing support without a retainer plan</span>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4 pt-2 border-t">
          This is stabilization and proof. Expansion comes next.
        </p>
      </div>
    </div>
  );
}

function Pricing() {
  return (
    <div className="border-2 border-primary rounded-xl p-6 bg-primary/5">
      <h2 className="text-xl font-bold mb-3">Investment</h2>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-primary">$997</p>
        <span className="text-sm text-muted-foreground">fixed scope</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">One-time fee. No recurring costs. You own it.</p>
      <p className="text-xs text-muted-foreground mt-1">Complex integrations require a pre-quote.</p>
      <div className="mt-4 pt-4 border-t border-primary/20">
        <p className="text-sm font-semibold mb-2">What&apos;s included:</p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>✓ Complete system setup + fix</li>
          <li>✓ ProofLoop receipt pack</li>
          <li>✓ ANX Vault delivery folder</li>
          <li>✓ 48-hour delivery guarantee</li>
          <li>✓ Handoff call + documentation</li>
        </ul>
      </div>
    </div>
  );
}

function RecentRescues() {
  const rescues = [
    { outcome: 'Lead routing restored in 6 hours', type: 'Routing' },
    { outcome: 'Email confirmations fixed after DNS misconfig', type: 'Email' },
    { outcome: 'Form submission errors eliminated', type: 'Forms' },
    { outcome: 'CRM sync restored after API credential rotation', type: 'Integration' },
    { outcome: 'Duplicate lead entries stopped at source', type: 'Data' },
  ];

  return (
    <div className="bg-void/30 border rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Recent rescues</h2>
      <ul className="space-y-3">
        {rescues.map((rescue, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="text-forest-green flex-shrink-0 mt-0.5">✓</span>
            <span className="text-muted-foreground">{rescue.outcome}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
        No names. No logos. Just outcomes.
      </p>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: 'How do I know you actually fixed it?',
      a: 'You get a ProofLoop verdict and a receipt pack. You can replay the exact steps. You can see the logs, the tests, and the smoke checks.',
    },
    {
      q: 'Where does my data go?',
      a: 'Receipts go into the ANX Vault. Read-only access is provided for stakeholders. Sensitive values are redacted. Access is revoked after handoff unless we move into an ongoing plan.',
    },
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
      a: 'You own the system. We provide documentation and a Loom walkthrough. If you need ongoing support or want to expand, we can discuss the 21-Day Pipeline Buildout.',
    },
    {
      q: 'What does it cost?',
      a: 'Fixed scope. Fixed timeline. $997 starting price. Final quote confirmed after the 10-minute access check.',
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
    <section className="max-w-2xl mx-auto mt-20 text-center bg-command-navy text-white rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-4">Stop losing leads this week.</h2>
      <p className="text-gray-300 mb-4">
        Book the 10-minute access check. If we can&apos;t run ProofLoop, we don&apos;t take the sprint.
      </p>
      <p className="text-slate-grey text-sm mb-6">
        If the leak is outside scope, you get a refund path or a clear next step.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#form"
          className="bg-forest-green text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Book the 10-minute access check
        </a>
        <Link
          href="/tools/sample-receipt"
          className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all"
        >
          See a redacted ProofLoop receipt
        </Link>
      </div>
    </section>
  );
}
