'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    n: 1,
    title: 'Getting aligned',
    whatHappens:
      'We talk through the repeated office work that eats time, creates delays, or depends too much on memory.',
    youProvide:
      'A walkthrough of the routine, the tools you already use, and the parts that frustrate you most.',
    weDeliver:
      'A clear plan for one AI-assisted routine, including scope, price, timeline, and review rules.',
    timeline: 'Free AI Fit Call or 48-hour AI Operations Review.',
    tentative: false,
  },
  {
    n: 2,
    title: 'Building it',
    whatHappens:
      'We set up the prompts, templates, checklists, and handoff steps inside the tools you can realistically keep using.',
    youProvide: 'Access to the tools or sample work needed to build the routine correctly.',
    weDeliver: 'A working routine tested against the kind of work you actually handle.',
    timeline: '7 to 10 days for the First AI Workday Setup.',
    tentative: false,
  },
  {
    n: 3,
    title: 'Handing it over',
    whatHappens:
      'We walk you through the routine, show where AI helps, and make clear where a person still reviews the work.',
    youProvide: 'About an hour for a walkthrough call and feedback on what needs to feel simpler.',
    weDeliver:
      'Plain instructions, the prompt/template set, and a complete record of what we configured.',
    timeline: 'Included with each setup.',
    tentative: false,
  },
  {
    n: 4,
    title: 'Tuning it',
    whatHappens:
      'If the routine is useful, we improve it, add the next workflow, or review it quarterly so it keeps matching how the business works.',
    youProvide: 'Recent examples of the routine in use and what still feels too manual.',
    weDeliver: 'Routine improvements, prompt updates, and practical next-step recommendations.',
    timeline: 'As-needed expansion or quarterly tune-up.',
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
            getting, and where human review stays in the loop.
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
                ? 'border border-dashed border-slate-300 bg-slate-50'
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
                    Optional - billed as an expansion setup or quarterly tune-up.{' '}
                    <Link href="/contact?service=ai-tune-up" className="text-primary font-semibold hover:underline">
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
                  <th className="p-4 font-semibold text-command-navy">AI Operations Review</th>
                  <th className="p-4 font-semibold text-command-navy">First AI Workday Setup</th>
                  <th className="p-4 font-semibold text-command-navy border-l border-dashed border-slate-grey/30 bg-slate-100">
                    Quarterly Tune-Up
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4 font-medium text-command-navy">Duration</td>
                  <td className="p-4 text-muted-foreground">48 hours</td>
                  <td className="p-4 text-muted-foreground">7 to 10 days</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-slate-50">
                    Quarterly
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Price</td>
                  <td className="p-4 text-muted-foreground">$500</td>
                  <td className="p-4 text-muted-foreground">$2,000</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-slate-50">
                    $750/quarter
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Commitment</td>
                  <td className="p-4 text-muted-foreground">None</td>
                  <td className="p-4 text-muted-foreground">One routine</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-slate-50">
                    Optional after handoff
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Scope</td>
                  <td className="p-4 text-muted-foreground">Identify where AI can save time without adding complexity</td>
                  <td className="p-4 text-muted-foreground">Build one routine with prompts, templates, and review steps</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-slate-50">
                    Review usage and tune the routine
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-command-navy">Handoff</td>
                  <td className="p-4 text-muted-foreground">Plain recommendation and next setup scope</td>
                  <td className="p-4 text-muted-foreground">Walkthrough and simple operating instructions</td>
                  <td className="p-4 text-muted-foreground border-l border-dashed border-slate-grey/30 bg-slate-50">
                    Updated prompts and improvement notes
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
              href="/contact?service=ai-ops-review"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold text-white bg-forest-green shadow-md hover:shadow-lg"
            >
              Start with AI Operations Review
            </Link>
            <Link
              href="/contact?service=first-ai-workday-setup"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold border-2 border-command-navy text-command-navy hover:bg-command-navy hover:text-white transition-colors"
            >
              Book First AI Workday Setup
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
