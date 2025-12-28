'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Note: Metadata export doesn't work with 'use client', handle via layout or remove animations
// For now, keeping animations as priority - metadata can be added via layout if needed

const phases = [
  {
    phase: 0,
    title: 'Foundation',
    status: 'complete' as const,
    items: ['Lead intake forms', 'Basic CRM integration', 'Email notifications'],
  },
  {
    phase: 1,
    title: 'Core Pipeline',
    status: 'complete' as const,
    items: ['Lead scoring', 'Follow-up sequences', 'Progress tracking'],
  },
  {
    phase: 2,
    title: 'Dashboard',
    status: 'complete' as const,
    items: ['Milestone visibility', 'Pipeline analytics', 'Team collaboration'],
  },
  {
    phase: 3,
    title: 'Automation Layer',
    status: 'in-progress' as const,
    items: ['Zapier alternative', 'Custom workflows', 'Trigger automation'],
  },
  {
    phase: 4,
    title: 'AI Enhancement',
    status: 'planned' as const,
    items: ['Smart lead routing', 'Response suggestions', 'Pattern detection'],
  },
  {
    phase: 5,
    title: 'Scale Features',
    status: 'planned' as const,
    items: ['Multi-team support', 'Advanced permissions', 'White-label option'],
  },
  {
    phase: 6,
    title: 'Integration Hub',
    status: 'planned' as const,
    items: ['Native integrations', 'API access', 'Webhook management'],
  },
  {
    phase: 7,
    title: 'Enterprise',
    status: 'planned' as const,
    items: ['Custom deployment', 'SLA guarantees', 'Dedicated support'],
  },
];

export default function PlatformPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Gradient */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-sm font-medium text-accent-gold uppercase tracking-wider">
              Built in Public
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 text-white">
              Platform Roadmap
            </h1>
            <p className="text-xl text-gray-300 mt-6 leading-relaxed">
              We're building the automation layer in the open. Here's what's shipped,
              what we're working on, and what's coming.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* What Clients Get Now vs Later */}
        <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-emerald-400">What You Get Now</h2>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Manual-first pipeline installation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Working CRM + follow-up system
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Dashboard for pipeline visibility
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Priority migration when platform ships
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-muted/50 border rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold">What You Get Later</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span>→</span>
                Unified automation platform
              </li>
              <li className="flex items-start gap-2">
                <span>→</span>
                No-code workflow builder
              </li>
              <li className="flex items-start gap-2">
                <span>→</span>
                AI-powered insights
              </li>
              <li className="flex items-start gap-2">
                <span>→</span>
                Free migration from current tools
              </li>
            </ul>
          </motion.div>
        </section>

        {/* Roadmap Timeline */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Development Roadmap</h2>
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <PhaseCard key={phase.phase} {...phase} index={index} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-16 py-12 bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 rounded-xl max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white">Ready to Start?</h2>
            <p className="text-gray-300 mt-2 max-w-xl mx-auto">
              Don't wait for the platform. Get a working pipeline now and upgrade seamlessly later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/lead-rescue"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-cream text-navy font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get the 48-Hour Lead Rescue
              </Link>
              <Link
                href="/phase-3"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-accent-gold text-accent-gold font-semibold rounded-lg hover:bg-accent-gold/10 transition-all duration-300"
              >
                Apply for Phase 3
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function PhaseCard({ phase, title, status, items, index }: typeof phases[0] & { index: number }) {
  const statusStyles = {
    'complete': 'bg-green-100 text-green-800 border-green-200',
    'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'planned': 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const statusLabels = {
    'complete': 'Complete',
    'in-progress': 'In Progress',
    'planned': 'Planned',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`border rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 ${
        status === 'complete' ? 'border-green-200 bg-green-50/30' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-muted-foreground">Phase {phase}</span>
          <h3 className="text-xl font-semibold mt-1">{title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <ul className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
            {status === 'complete' ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-muted-foreground/50">○</span>
            )}
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
