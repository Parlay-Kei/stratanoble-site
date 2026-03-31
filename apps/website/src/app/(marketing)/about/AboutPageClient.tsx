'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const comparison = {
  agencies: [
    'Sell campaigns and creative',
    'Monthly retainers, scope creep',
    'You get deliverables',
    'No operational visibility',
  ],
  crm: [
    'Configure a single tool',
    'Per-project, single-tool focus',
    'You get a configured tool',
    'Partial pipeline view',
  ],
  sn: [
    'Install a complete operating system',
    'Scoped engagement, modular delivery',
    'You get infrastructure you own',
    'Full intake → revenue → execution visibility',
  ],
};

const methodSteps = [
  {
    title: 'Discovery',
    body: 'Map workflows, identify friction points, and define scope so delivery stays bounded and measurable.',
  },
  {
    title: 'Implementation',
    body: 'Deploy modules, configure pipelines, and wire integrations — the same Q Suite patterns we run internally.',
  },
  {
    title: 'Handoff',
    body: 'Documentation, training, and proof pack delivery so your team can run the system without guessing.',
  },
  {
    title: 'Operations Command (optional)',
    body: 'For businesses that want it, we offer ongoing operational support to maintain the rhythm — weekly reviews and continuous tuning when you are ready.',
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
              We install operational control systems for service businesses. Scoped engagements. Delivered
              infrastructure. You own the result.
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
            Strata Noble is a digital build and venture operations studio. We design and deliver
            production websites, client portals, and marketplace-style platforms for service
            businesses and emerging ventures of any size — from solo operators to growing teams.
            We also build and operate the backend systems that make revenue trackable: lead capture,
            client operations, workflow automation, and credential governance.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We support partnerships and go-to-market execution by packaging proof, tightening
            operational systems, and building the infrastructure operators need to close, retain,
            and scale. Every system we deploy runs on the same architecture we use internally.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The platform is called{' '}
            <Link href="/q-suite" className="font-semibold text-primary hover:underline">
              Q SUITE
            </Link>{' '}
            — a modular operating system covering intake, client operations, revenue intelligence,
            execution, and credential security. We built it for ourselves first.
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
            The firm is led by an operator who has built from the ground up — someone who has done
            the sales work, run client operations, chased invoices, and built the systems he needed
            before making them available to others. Strata Noble exists because the gap between
            &ldquo;I have a business&rdquo; and &ldquo;my business runs properly&rdquo; is the same problem for a solo
            operator as it is for a growing venture, and most firms only solve half of it.
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
              <h3 className="text-lg font-bold text-command-navy mb-4">Agencies</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.agencies.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-slate-grey shrink-0">—</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-grey/25 rounded-sm p-6">
              <h3 className="text-lg font-bold text-command-navy mb-4">CRM Consultants</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.crm.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-slate-grey shrink-0">—</span>
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
          <h2 className="text-3xl font-semibold">Infrastructure-First Delivery</h2>
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
              How we work — timelines, engagement types, and what to expect →
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
            <p className="text-sm text-slate-grey mt-2">Lead Rescue Delivery</p>
          </div>
          <div className="bg-field-sage/10 border border-field-sage/30 rounded-sm p-6">
            <div className="text-4xl font-bold text-forest-green font-display">21 days</div>
            <p className="text-sm text-slate-grey mt-2">Full System Buildout</p>
          </div>
          <div className="bg-void border border-slate-grey/30 rounded-sm p-6">
            <div className="text-4xl font-bold text-white font-display">100%</div>
            <p className="text-sm text-slate-grey mt-2">Client-Owned Infrastructure</p>
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
            We don&apos;t sell promises. We install systems, run them ourselves, and hand you the same architecture.
          </p>
          <div className="mt-6 text-gray-300 border-t border-white/10 pt-6">
            <p className="font-semibold text-white">The Strata Noble Method</p>
            <p className="text-sm mt-1">Proof Over Promise</p>
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
            <h2 className="text-3xl font-bold">Ready to Install Operational Control?</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              See how our engagements stack — from 48-hour Lead Rescue through full pipeline buildout and Q SUITE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-field-sage text-command-navy font-semibold rounded-sm hover:opacity-90 transition-opacity duration-200"
              >
                See Our Services
              </Link>
              <Link
                href="/q-suite"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-forest-green text-forest-green font-semibold rounded-sm hover:bg-forest-green/10 transition-colors duration-200"
              >
                Explore Q SUITE
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
