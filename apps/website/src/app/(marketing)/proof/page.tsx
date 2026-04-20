import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Proof | Strata Noble',
  description: 'Case studies and ecosystem proof — what we have built and shipped in production.',
};

const caseStudies = [
  {
    id: 'institutional-advisory',
    label: 'Retainer Consulting',
    industry: 'Institutional Financial Services',
    situation:
      'A boutique advisory firm operating at institutional scale had no systematic way to track outreach, manage pipeline, or measure engagement across a small number of high-value relationships. Communication was ad-hoc. Follow-up depended on memory. There was no audit trail for client interactions and no way to know which relationships were warming or cooling.',
    broken:
      'The pipeline ran on a spreadsheet and email. Proposals were written fresh each time with no template consistency. Follow-up cadences were informal — which meant they happened when remembered, not when needed. Revenue visibility was limited to what had already closed.',
    installed:
      'Q-CC (Client Command) deployed for intake and CRM routing. A proposal template library built and integrated into the workflow. A follow-up cadence installed with trigger-based reminders. Pipeline reporting configured so active relationships, proposal status, and follow-up dates are visible in one place. All interactions logged with timestamps for audit and handoff.',
    outcome:
      'The firm moved from reactive relationship management to a documented, repeatable outreach process. Retainer engagement active. Pipeline is tracked, not guessed.',
  },
  {
    id: 'ecommerce-operator',
    label: 'Full-Stack Implementation',
    industry: 'E-Commerce / Retail Operations',
    situation:
      'A product-based retail operator with an active Shopify storefront had accumulated technical debt across three systems — their storefront, a backend database, and a deployment pipeline — with no documentation, no monitoring, and no clear picture of whether the system was actually working. The operator had hired vendors to build features but had no proof that the integrations were sound.',
    broken:
      'Product sync between Shopify and the database was broken. Webhook registrations were misconfigured, pointing to stale endpoints. There was no health check endpoint — no way to verify the system was alive. The deployment pipeline had no QA gate. New features shipped directly to production without validation.',
    installed:
      'Full system audit with documented findings. Product sync webhooks re-registered with correct Admin token and verified end-to-end. Health check endpoint deployed at /api/health (returns status: ok). Deployment pipeline QA gate installed — new arrivals promotion strip, trust ribbon, and product sync all gate-passed before going live. Credential audit completed across 10 categories. Analytics (GA4) and error monitoring (Sentry) instrumented.',
    outcome:
      'System verified live and stable. Zero broken integrations. Every deployment gated. Operator received a proof pack documenting what was built, verified, and handed over — including the specific receipts for each fix.',
  },
];

const ecosystemProof = [
  {
    name: 'Direct Cuts',
    type: 'Production Marketplace',
    detail:
      'Two-sided barber booking and payment platform — Stripe Connect, real-time messaging, subscription billing, mobile app. Built and operated by the same team behind Strata Noble.',
    href: 'https://direct-cuts.com',
  },
  {
    name: 'Q-ARI',
    type: 'Internal Revenue Intelligence',
    detail:
      'Automated Revenue Intelligence module running on Strata Noble\'s own operations — tracking pipeline, revenue MTD, and engagement metrics. What we install for clients, we run ourselves.',
    href: null,
  },
  {
    name: 'Q-VAULT',
    type: 'Secure Delivery Infrastructure',
    detail:
      'Every engagement closes with a Q-VAULT proof pack — timestamped records of what was built, verified, and handed over. We don\'t deliver promises. We deliver receipts.',
    href: null,
  },
];

export default function ProofPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#070f1a] px-4 pt-24 pb-16 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90 mb-4">
            Strata Noble
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Proof Over Promise</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-xl">
            We don&apos;t ask you to take our word for it. Here is what we have built, installed, and shipped — with
            receipts.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl space-y-16">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">Case Studies</h2>
          {caseStudies.map((cs) => (
            <article
              key={cs.id}
              className="border-l-4 border-emerald-500 pl-6 space-y-6"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  {cs.label}
                </span>
                <p className="text-sm text-slate-500 mt-1">{cs.industry}</p>
              </div>

              <div className="space-y-4 text-slate-700">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Situation
                  </h3>
                  <p className="leading-relaxed">{cs.situation}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    What Was Broken
                  </h3>
                  <p className="leading-relaxed">{cs.broken}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    What Was Installed
                  </h3>
                  <p className="leading-relaxed">{cs.installed}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                    Outcome
                  </h3>
                  <p className="leading-relaxed text-emerald-900">{cs.outcome}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Ecosystem Proof */}
      <section className="bg-slate-50 border-t border-slate-200 px-4 py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy-900">Ecosystem Proof</h2>
            <p className="mt-2 text-slate-600">
              The infrastructure we install for clients runs on the same architecture we operate internally.
            </p>
          </div>
          <div className="space-y-6">
            {ecosystemProof.map((item) => (
              <div key={item.name} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-900">{item.name}</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 mt-0.5">
                      {item.type}
                    </p>
                  </div>
                  {item.href && (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-emerald-600 shrink-0"
                    >
                      View ↗
                    </a>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 border-t border-slate-200">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">
            Ready to install your system?
          </h2>
          <p className="text-slate-600">
            Start with a free diagnostic. We identify what is broken in 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/contact?service=lead-rescue"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-[#070f1a] hover:bg-emerald-400 transition"
            >
              Get Free Diagnostic
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-400 transition"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
