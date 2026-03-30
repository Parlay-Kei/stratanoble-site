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
    title: 'Optional ongoing support',
    body: 'For businesses that want it, we offer ongoing operational support to maintain the rhythm — weekly reviews and continuous tuning when you are ready.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">About Strata Noble</h1>
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
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl font-semibold">What Strata Noble Is</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Strata Noble is an operational infrastructure firm. We deploy modular systems that control intake,
            revenue, execution, and security for service businesses roughly between $500K and $5M in revenue. We are
            not an agency. We are not a bench of freelancers. We are not CRM consultants who stop at one tool. We
            install operating systems — scoped, documented, and transferable.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every system we install runs on the same architecture we use internally. When we say we run on this — we
            mean it. Our own intake, revenue tracking, client operations, and credential governance run through Q
            Suite.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl font-semibold">Operator-Led</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The firm is led by an operator who has sat in the seat — someone who knows what it is like to lose deals
            in follow-up, chase invoices manually, and run a business on spreadsheets and memory. Strata Noble exists
            because the operator behind the firm built the systems he needed, then made them deployable for others who
            face the same operational gaps.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-semibold text-center mb-10">How This Is Different</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-navy mb-4">Agencies</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.agencies.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-gray-400 shrink-0">—</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-navy mb-4">CRM Consultants</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.crm.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-gray-400 shrink-0">—</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border-2 border-primary rounded-xl p-6 shadow-md ring-2 ring-primary/10">
              <h3 className="text-lg font-bold text-primary mb-4">Strata Noble</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {comparison.sn.map((row) => (
                  <li key={row} className="flex gap-2">
                    <span className="text-emerald-600 shrink-0">✓</span>
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
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-3xl font-semibold">Infrastructure-First Delivery</h2>
          <div className="grid gap-6">
            {methodSteps.map((step, i) => (
              <div
                key={step.title}
                className="bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 rounded-lg p-6"
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
              See the full delivery model →
            </Link>
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto py-4"
        >
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-6">
            <div className="text-4xl font-bold text-emerald-400">48hrs</div>
            <p className="text-sm text-gray-600 mt-2">Lead Rescue Delivery</p>
          </div>
          <div className="bg-gradient-to-br from-accent-gold/10 via-accent-gold/5 to-transparent border border-accent-gold/20 rounded-xl p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent">
              21 days
            </div>
            <p className="text-sm text-gray-600 mt-2">Full System Buildout</p>
          </div>
          <div className="bg-gradient-to-br from-navy/10 via-navy/5 to-transparent border border-navy/20 rounded-xl p-6">
            <div className="text-4xl font-bold text-navy">100%</div>
            <p className="text-sm text-gray-600 mt-2">Client-Owned Infrastructure</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto rounded-xl border-l-4 border-accent-gold bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 p-8"
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
            transition={{ duration: 0.6 }}
            className="text-center p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl"
          >
            <h2 className="text-3xl font-bold">Ready to Install Operational Control?</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Start with the 48-Hour Lead Rescue or apply for a full system buildout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/lead-rescue"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-cream text-navy font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get the Lead Rescue
              </Link>
              <Link
                href="/pipeline-buildout"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-600/10 transition-all duration-300"
              >
                Apply for the 21-Day Pipeline Buildout
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
