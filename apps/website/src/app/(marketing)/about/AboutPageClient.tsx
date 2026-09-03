'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const comparison = {
  agencies: [
    'Sell broad strategy, tools, or campaigns',
    'Often hand you more software to figure out',
    'Leave the day-to-day workflow unclear',
    'Hard to know what changed after the call',
  ],
  crm: [
    'Configure one app or automation',
    'Focus on the tool more than the routine',
    'Useful only if you already know what to ask for',
    'Can create another thing to manage',
  ],
  sn: [
    'Pick one practical routine and make it usable',
    'Fixed scope, clear price, plain handoff',
    'You keep the prompts, templates, and process',
    'Human review stays built into the workflow',
  ],
};

const methodSteps = [
  {
    title: 'Discovery',
    body: 'We find the repeated office work that is costing time or slipping through the cracks.',
  },
  {
    title: 'Setup',
    body: 'We set up one AI-assisted routine using practical tools, prompts, templates, and review rules.',
  },
  {
    title: 'Handoff',
    body: 'You get a walkthrough and plain instructions so the routine can run without us sitting beside you.',
  },
  {
    title: 'Tune-up',
    body: 'When the routine proves useful, we improve it or add the next routine without turning your business into a tech project.',
  },
];

export function AboutPageClient() {
  return (
    <main className="min-h-screen">
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-command-navy border-b border-slate-grey/20">
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display">
              About Strata Noble
            </h1>
            <p className="text-xl text-gray-300 mt-6 leading-relaxed">
              We help owner-led businesses make AI useful inside the workday.
              You keep the routine, the prompts, and the process.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl font-semibold">What Strata Noble Is</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Strata Noble is a practical AI setup firm for owner-led businesses. We help small teams
            use AI for the office work that repeats every week: meeting notes, follow-up, proposals,
            customer questions, intake, task lists, and simple reporting.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The offer is intentionally lean. We do not sell a complicated platform or a pile of
            abstract AI training. We find one useful routine, set it up, document it, and teach you
            how to use it with human review still in place.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            That lets a solo operator or small team get value from AI without spending weeks trying
            to understand every tool, pricing plan, prompt framework, or automation platform.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl font-semibold">Operator-Led</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The firm is led by an operator who has built from the ground up. He has done
            the sales work, run client operations, chased invoices, managed handoffs, and built the
            routines he needed before making them available to others. Strata Noble exists for owners
            who know AI probably matters, but do not have time to turn it into something useful by themselves.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-semibold text-center mb-10">How This Is Different</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-grey/25 rounded-sm p-6">
              <h3 className="text-lg font-bold text-command-navy mb-4">AI Advisors</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.agencies.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-slate-grey shrink-0">·</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-grey/25 rounded-sm p-6">
              <h3 className="text-lg font-bold text-command-navy mb-4">Tool Setups</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.crm.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-slate-grey shrink-0">·</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border-2 border-forest-green rounded-sm p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Strata Noble</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.sn.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-forest-green shrink-0">✓</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-3xl font-semibold">Routine-First Delivery</h2>
          <p className="text-muted-foreground">
            <Link href="/how-it-works" className="text-primary font-semibold hover:underline">
              See the full delivery model →
            </Link>
          </p>
          <div className="grid gap-6">
            {methodSteps.map((step, i) => (
              <div
                key={step.title}
                className="bg-forest-green/10 border-l-4 border-forest-green rounded-sm p-6"
              >
                <h3 className="font-semibold text-xl mb-2">
                  {i + 1}. {step.title}
                </h3>
                <p className="text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
          <p className="pt-4">
            <Link href="/how-it-works" className="text-primary font-semibold hover:underline">
              How we work: timelines, engagement types, and what to expect →
            </Link>
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="grid md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto py-4"
        >
          <div className="bg-forest-green/10 border border-forest-green/20 rounded-sm p-6">
            <div className="text-4xl font-bold text-field-sage font-display">48hrs</div>
            <p className="text-sm text-slate-grey mt-2">AI Operations Review</p>
          </div>
          <div className="bg-field-sage/10 border border-field-sage/30 rounded-sm p-6">
            <div className="text-4xl font-bold text-forest-green font-display">21 days</div>
            <p className="text-sm text-slate-grey mt-2">Expansion Window</p>
          </div>
          <div className="bg-void border border-slate-grey/30 rounded-sm p-6">
            <div className="text-4xl font-bold text-white font-display">100%</div>
            <p className="text-sm text-slate-grey mt-2">Human Review Built In</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto rounded-sm border-l-4 border-field-sage bg-command-navy p-8"
        >
          <p className="text-lg text-white leading-relaxed">
            AI only matters if it changes how the work gets done. We build the routine first, then keep the tool choice simple.
          </p>
          <div className="mt-6 text-gray-300 border-t border-white/10 pt-6">
            <p className="font-semibold text-white">The Strata Noble Method</p>
            <p className="text-sm mt-1">Useful before complicated</p>
          </div>
        </motion.div>

        <section className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="text-center p-8 bg-forest-green/10 border border-forest-green/20 rounded-sm"
          >
            <h2 className="text-3xl font-bold">Ready to Make AI Useful?</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Start with one routine your business already repeats and make it easier to run.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-field-sage text-command-navy font-semibold rounded-sm hover:opacity-90 transition-opacity duration-200"
              >
                See AI Setup Services
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
