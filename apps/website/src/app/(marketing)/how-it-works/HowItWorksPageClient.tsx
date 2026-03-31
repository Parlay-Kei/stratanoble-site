'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    n: 1,
    title: 'Getting aligned',
    whatHappens:
      'We talk through what you need, look at what you already have, and agree on exactly what we are going to build. No surprises.',
    youProvide:
      'A walkthrough of how your business currently works and what is frustrating you most.',
    weDeliver:
      'A clear plan: what we are building, what it will cost, and when it will be done.',
    timeline: 'Same-day for Lead Rescue. Days 1–3 for Pipeline Buildout.',
    tentative: false,
  },
  {
    n: 2,
    title: 'Building it',
    whatHappens:
      'We build everything we agreed on — inside your actual business environment, not a test sandbox. You can see progress the whole way.',
    youProvide: 'Access to the tools we are connecting to. We will let you know if we need anything else.',
    weDeliver: 'A working system, tested and ready for your team to use.',
    timeline: '48 hours for Lead Rescue. Days 3–18 for Pipeline Buildout.',
    tentative: false,
  },
  {
    n: 3,
    title: 'Handing it over',
    whatHappens:
      'We walk you through everything we built, give you all the documentation, and make sure your team knows how to use it.',
    youProvide: 'About an hour for a walkthrough call.',
    weDeliver:
      'Full documentation, video walkthroughs, and a complete record of everything we configured — stored somewhere you control.',
    timeline: 'Included in the 48-hour window for Lead Rescue. Days 18–21 for Pipeline Buildout.',
    tentative: false,
  },
  {
    n: 4,
    title: 'Ongoing support (optional)',
    whatHappens:
      'If you want us to stay involved after handoff, we check in weekly, keep the system tuned, and handle anything that comes up.',
    youProvide: 'About 30 minutes a week for a check-in.',
    weDeliver: 'Regular reviews, system updates, and a point of contact who already knows your business.',
    timeline: 'Ongoing, post-handoff. Not required.',
    tentative: true,
  },
];

export function HowItWorksPageClient() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-command-navy text-white py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold"
          >
            Here is exactly how we work
          </motion.h1>
          <p className="text-xl text-gray-300 mt-6 leading-relaxed">
            Every project follows the same clear process. You always know what is happening, what you are
            getting, and when you are getting it.
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
                ? 'border border-dashed border-slate-grey/30 bg-void/30'
                : 'border border-slate-grey/25 bg-white shadow-sm'
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
                <h2 className="text-2xl font-bold text-command-navy">{step.title}</h2>
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
          <h2 className="text-2xl font-bold text-center text-command-navy mb-8">Engagement types</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-grey/25">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-slate-grey/25">
                  <th className="p-4 font-semibold text-command-navy" />
                  <th className="p-4 font-semibold text-command-navy">Lead Rescue</th>
                  <th className="p-4 font-semibold text-command-navy">Pipeline Buildout</th>
                  <th className="p-4 font-semibold text-command-navy border-l border-dashed border-slate-grey/30 bg-void/50">
                    Ongoing Support
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4 font-medium text-command-navy">Duration</td>
                  <td className="p-4 text-muted-foreground">48 hours</td>
                  <td className="p-4 text-muted-foreground">21 days</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-void/40">
                    Ongoing
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Price</td>
                  <td className="p-4 text-muted-foreground">$997</td>
                  <td className="p-4 text-muted-foreground">Starting at $4,997</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-void/40">
                    $1,497/month
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Commitment</td>
                  <td className="p-4 text-muted-foreground">—</td>
                  <td className="p-4 text-muted-foreground">Per engagement scope</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-void/40">
                    3-month minimum, month-to-month after
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Scope</td>
                  <td className="p-4 text-muted-foreground">Find and fix where you are losing leads</td>
                  <td className="p-4 text-muted-foreground">Full system, built from scratch</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-void/40">
                    Monthly maintenance and check-ins
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Handoff</td>
                  <td className="p-4 text-muted-foreground">Full write-up of what we fixed</td>
                  <td className="p-4 text-muted-foreground">Complete documentation package</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-void/40">
                    Weekly review notes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-command-navy mb-6">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
            <Link
              href="/lead-rescue"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold text-white bg-forest-green shadow-md hover:shadow-lg"
            >
              Start the 48-Hour Lead Rescue
            </Link>
            <Link
              href="/pipeline-buildout"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold border-2 border-command-navy text-command-navy hover:bg-command-navy hover:text-white transition-colors"
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
