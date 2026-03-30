'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    n: 1,
    title: 'Discovery',
    whatHappens:
      'We map your current workflows, identify friction points, and define a bounded scope for the engagement. Discovery is typically a 60-minute kickoff call plus async review of your existing tools and processes.',
    youProvide:
      'Access to your current tools, a walkthrough of your process, and clarity on which problems hurt most.',
    weDeliver:
      'A scoped engagement plan with specific deliverables, timeline, and acceptance criteria.',
    timeline: 'Same-day for Lead Rescue. Days 1–3 for Pipeline Buildout.',
    tentative: false,
  },
  {
    n: 2,
    title: 'Implementation',
    whatHappens:
      'We deploy modules, configure pipelines, wire integrations, and build the operating infrastructure specified in the engagement plan. We work inside your environment — not a sandbox.',
    youProvide: 'Admin access to relevant tools. Responsive availability for questions (async is fine).',
    weDeliver: 'Working systems configured for your business. Every module tested with real data.',
    timeline: '48 hours for Lead Rescue. Days 3–18 for Pipeline Buildout.',
    tentative: false,
  },
  {
    n: 3,
    title: 'Handoff',
    whatHappens:
      'Documentation, training walkthrough, proof pack delivery. We hand you everything — credentials, configurations, video walkthroughs, written docs — stored in your ANX Vault.',
    youProvide: 'Time for a training walkthrough (typically 45–60 minutes).',
    weDeliver:
      'Complete handoff package: documentation, video walkthroughs, ProofLoop verification receipts, and vault access.',
    timeline: 'Included in the 48-hour window for Lead Rescue. Days 18–21 for Pipeline Buildout.',
    tentative: false,
  },
  {
    n: 4,
    title: 'Operations Command (optional)',
    whatHappens:
      'For businesses that want continued operational partnership, we maintain the rhythm — weekly executive reviews, system tuning, configuration updates, and priority support.',
    youProvide: 'Recurring time for weekly review (30 minutes).',
    weDeliver: 'Ongoing operational visibility, system health monitoring, and continuous tuning.',
    timeline: 'Ongoing, post-handoff. Not required.',
    tentative: true,
  },
];

export function HowItWorksPageClient() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 text-white py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold"
          >
            How We Work
          </motion.h1>
          <p className="text-xl text-gray-300 mt-6 leading-relaxed">
            Every engagement follows the same proven delivery model. Scoped, documented, and transferable.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {steps.map((step) => (
          <motion.section
            key={step.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className={`rounded-xl p-6 md:p-8 ${
              step.tentative
                ? 'border border-dashed border-gray-300 bg-gray-50'
                : 'border border-gray-200 bg-white shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${
                  step.tentative ? 'bg-gray-400' : 'bg-primary'
                }`}
              >
                {step.n}
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-bold text-navy">{step.title}</h2>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">What happens</p>
                  <p className="text-muted-foreground leading-relaxed">{step.whatHappens}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">What you provide</p>
                  <p className="text-muted-foreground leading-relaxed">{step.youProvide}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">What we deliver</p>
                  <p className="text-muted-foreground leading-relaxed">{step.weDeliver}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Timeline</p>
                  <p className="text-muted-foreground leading-relaxed">{step.timeline}</p>
                </div>
                {step.tentative && (
                  <p className="text-sm text-muted-foreground pt-2">
                    Optional — billed at $1,497/month (3-month minimum, then month-to-month).{' '}
                    <Link href="/contact?service=operations-command" className="text-primary font-semibold hover:underline">
                      Contact us
                    </Link>{' '}
                    to discuss fit.
                  </p>
                )}
              </div>
            </div>
          </motion.section>
        ))}
      </div>

      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-navy mb-8">Engagement types</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-navy" />
                  <th className="p-4 font-semibold text-navy">Lead Rescue</th>
                  <th className="p-4 font-semibold text-navy">Pipeline Buildout</th>
                  <th className="p-4 font-semibold text-navy border-l border-dashed border-gray-300 bg-gray-50/80">
                    Operations Command
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4 font-medium text-navy">Duration</td>
                  <td className="p-4 text-muted-foreground">48 hours</td>
                  <td className="p-4 text-muted-foreground">21 days</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-gray-300 bg-gray-50/50">
                    Ongoing
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-navy">Price</td>
                  <td className="p-4 text-muted-foreground">$997</td>
                  <td className="p-4 text-muted-foreground">Starting at $4,997</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-gray-300 bg-gray-50/50">
                    $1,497/month
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-navy">Commitment</td>
                  <td className="p-4 text-muted-foreground">—</td>
                  <td className="p-4 text-muted-foreground">Per engagement scope</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-gray-300 bg-gray-50/50">
                    3-month minimum, month-to-month after
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-navy">Scope</td>
                  <td className="p-4 text-muted-foreground">Lead flow audit + fix</td>
                  <td className="p-4 text-muted-foreground">Full system install</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-gray-300 bg-gray-50/50">
                    Maintenance + rhythm
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-navy">Handoff</td>
                  <td className="p-4 text-muted-foreground">Receipt pack</td>
                  <td className="p-4 text-muted-foreground">Full proof suite</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-gray-300 bg-gray-50/50">
                    Weekly reviews
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-navy mb-6">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
            <Link
              href="/lead-rescue"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-lg"
            >
              Start the 48-Hour Lead Rescue
            </Link>
            <Link
              href="/pipeline-buildout"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors"
            >
              Apply for the 21-Day Pipeline Buildout
            </Link>
            <Link
              href="/services"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold text-primary border-2 border-primary hover:bg-primary/5 transition-colors"
            >
              View All Services
            </Link>
          </div>
          <p className="text-muted-foreground mt-6">
            Not sure which?{' '}
            <Link href="/contact" className="text-primary font-semibold hover:underline">
              Talk to us
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
