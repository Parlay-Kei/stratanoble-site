import { Metadata } from 'next';
import Link from 'next/link';
import { BusinessSystemsIntakeForm } from '@/components/forms/BusinessSystemsIntakeForm';

export const metadata: Metadata = {
  title: 'Business Systems Intake | Strata Noble',
  description:
    'Tell us how work enters your business and where it stalls. We recommend a starting point: Audit, Fix, or Buildout.',
  alternates: {
    canonical: '/business-systems-intake',
  },
  openGraph: {
    title: 'Business Systems Intake | Strata Noble',
    description:
      'Short intake for lead follow-up, CRM cleanup, customer tracking, and operating systems.',
    url: '/business-systems-intake',
  },
};

export default function BusinessSystemsIntakePage() {
  return (
    <main className="bg-white">
      <section className="bg-command-navy text-white py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-sm uppercase tracking-wide text-field-sage mb-3">Strata Noble</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Business Systems Intake
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Tell me how work enters your business and where it stalls. This takes about 4 minutes. I
            use it to recommend a starting point: Follow-Up Cleanup, Customer Tracker, CRM Rescue,
            Workflow Map, Automation Readiness, or a simple Operations Dashboard. No passwords. No
            tool logins.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 max-w-5xl mx-auto">
          <aside className="space-y-6 lg:pt-2">
            <div>
              <h2 className="text-xl font-semibold text-command-navy mb-2">What happens next</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-grey">
                <li>You submit this intake</li>
                <li>I review fit and reply with Audit, Fix, Buildout, or no-fit</li>
                <li>Optional 15-minute diagnostic if useful</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-command-navy mb-2">Starting options</h2>
              <ul className="space-y-3 text-sm text-slate-grey">
                <li>
                  <span className="font-medium text-command-navy">Business Systems Audit</span>
                  {' '}$149 · 48 hours
                </li>
                <li>
                  <span className="font-medium text-command-navy">48-Hour Operations Fix</span>
                  {' '}$1,250 · one broken loop
                </li>
                <li>
                  <span className="font-medium text-command-navy">Service System Buildout</span>
                  {' '}$3,500 · about 14 days
                </li>
              </ul>
            </div>

            <p className="text-sm text-slate-grey">
              Prefer email first?{' '}
              <Link href="/contact?service=business-systems-audit" className="text-forest-green underline">
                Contact with audit intent
              </Link>
              .
            </p>
          </aside>

          <div id="form" className="bg-card border border-slate-grey/20 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-command-navy mb-1">Start here</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Required fields are marked. Optional fields stay optional.
            </p>
            <BusinessSystemsIntakeForm />
          </div>
        </div>
      </section>
    </main>
  );
}
