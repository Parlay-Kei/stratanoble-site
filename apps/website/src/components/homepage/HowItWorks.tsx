'use client';

import { motion, useReducedMotion } from 'framer-motion';

const steps = [
  {
    title: 'Discovery',
    body: 'We review your business — how you get leads, where things break, and what you actually need built. Free 48-hour diagnostic included.',
  },
  {
    title: 'Scope and price',
    body: 'You get a fixed scope, clear price, and timeline before any work starts. No surprises, no open-ended retainers.',
  },
  {
    title: 'Build and deliver',
    body: 'Your system gets built and configured for how you actually work. Production-grade, not a template. Delivered with full documentation.',
  },
  {
    title: 'Run and support',
    body: 'You own everything we build. Optional monthly support keeps systems running, optimized, and reporting clearly.',
  },
] as const;

export function HowItWorks() {
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReduced ? 0 : 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#070f1a] px-4 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 sn-scanlines opacity-[0.22]" aria-hidden />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold md:text-3xl">How we work</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            A straight path from what you need to a working system you own.
          </p>
        </motion.div>

        <motion.ol
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              variants={cardVariants}
              className="sn-surface sn-surface-hover group relative rounded-sm p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-forest-green/35 bg-forest-green/10 font-mono text-[11px] font-bold text-forest-green transition-colors duration-300 group-hover:border-forest-green/60 group-hover:text-field-sage">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 sn-section-divider" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
