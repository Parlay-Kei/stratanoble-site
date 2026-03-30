'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, DollarSign, Shield, Layers } from 'lucide-react';

const modules = [
  {
    label: 'Q-CC',
    name: 'Command Center',
    Icon: LayoutDashboard,
    description:
      'Executive visibility into your operation. Weekly review dashboards, activity feeds, and delivery health metrics — so you know what is working, what is stuck, and what needs attention.',
    expanded:
      'Built for operators who do not want to dig through five tools to answer "where are we?" Command Center pulls the signal into one operational view.',
    inDev: false,
  },
  {
    label: 'Q-ICMS',
    name: 'Client Operations',
    Icon: Users,
    description:
      'Lead pipeline, client lifecycle tracking, engagement management, and touchpoint logging. From first inquiry to ongoing relationship — every interaction tracked.',
    expanded:
      'Replaces the notebook, the inbox, and the "I thought someone called them" gap with a single system of record for client-facing work.',
    inDev: false,
  },
  {
    label: 'Q-ARI',
    name: 'Revenue Intelligence',
    Icon: DollarSign,
    description:
      'Invoice tracking, accounts receivable dashboard, payment status monitoring, and communications log. Know exactly who owes what, when, and what has been said about it.',
    expanded:
      'Stops revenue surprises by making AR visible the same way pipeline visibility stops deal surprises.',
    inDev: false,
  },
  {
    label: 'Q-VAULT',
    name: 'Secure Storage',
    Icon: Shield,
    description:
      'Credential governance, API key management, audit trails, and access controls. No more passwords in Slack threads or API keys in shared Google Docs.',
    expanded:
      'Every handoff includes governed access — who saw what, when — so compliance and trust are operational, not improvised.',
    inDev: false,
  },
  {
    label: 'Q-REIL',
    name: 'Execution Layer',
    Icon: Layers,
    description:
      'Operational execution and governance layer tying modules into a coherent operating rhythm. Details and public packaging are still in motion.',
    expanded:
      'We are careful not to oversell pieces still under active design. When you engage us, we scope only what is deployable today.',
    inDev: true,
  },
];

export function PlatformPageClient() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 text-white py-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -right-1/4 w-[80%] h-[80%] bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full"
          />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold"
          >
            Our Work Is Powered by a Modular Operating Framework
          </motion.h1>
          <p className="text-xl text-gray-300 mt-6 leading-relaxed">
            Q Suite is the system behind every engagement. We run on it. We deploy it. You own the result.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-navy">What Is Q Suite?</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Q Suite is a modular operating system built for service businesses. It controls intake, client operations,
          revenue tracking, execution visibility, and credential security through integrated modules.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We don&apos;t sell Q Suite as standalone software. We configure and deploy it as part of scoped engagements —
          the same way a contractor installs electrical, plumbing, and HVAC as part of building a house.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every module is independently useful but designed to work together. Your engagement might use two modules
          or all five, depending on what your operation needs.
        </p>
        <p className="text-sm text-muted-foreground/90 italic border-l-4 border-primary/30 pl-4 py-1">
          Strata Noble is transitioning its own operations onto the same Q Suite framework used in client delivery. We
          describe capabilities honestly: what is live in client work today, what is still tightening internally, and
          what we scope per engagement.
        </p>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-navy mb-12">Modules</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => (
            <motion.article
              key={mod.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl p-6 bg-white shadow-sm flex flex-col ${
                mod.inDev ? 'border border-dashed border-gray-300 bg-gray-50/80' : 'border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <mod.Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <span className="text-primary font-bold text-lg">{mod.label}</span>
                </div>
                {mod.inDev && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide bg-gray-200 text-gray-700 px-2 py-1 rounded-full shrink-0">
                    In development
                  </span>
                )}
              </div>
              <p className="font-semibold text-navy">{mod.name}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">{mod.description}</p>
              <p className="text-sm text-muted-foreground/90 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                {mod.expanded}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30 border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-navy">How It Connects to Your Engagement</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you engage Strata Noble, we scope which Q Suite modules your operation needs. We configure them, deploy
            them into your workflows, and hand them off with documentation and training.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You don&apos;t need to understand the architecture. You need to know that every system we install is modular,
            documented, and designed to work together.
          </p>
          <Link href="/solutions" className="inline-block text-primary font-semibold hover:underline">
            See what we install →
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-navy mb-6">Ready to See This in Your Business?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lead-rescue"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-lg"
            >
              48-Hour Lead Rescue
            </Link>
            <Link
              href="/pipeline-buildout"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors"
            >
              21-Day Pipeline Buildout
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
