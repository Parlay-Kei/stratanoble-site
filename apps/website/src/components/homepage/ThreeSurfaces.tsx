'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

const surfaces = [
  {
    title: 'Consulting Services',
    subtitle:
      'Scoped engagements that install operational control systems. Systems Audit from $997. Operations Buildout $4,997. Process Improvement Sprint $2,497.',
    cta: 'View Services',
    href: '/services',
  },
  {
    title: 'Q SUITE',
    subtitle:
      'The operational control system your business runs on. Five modules — intake, client management, revenue intelligence, industry workflows, secure delivery. From $297/month.',
    cta: 'Explore Platform',
    href: '/q-suite',
  },
  {
    title: 'ACHIEVERY',
    subtitle:
      'Track progress, build momentum, stay accountable. Goal tracking, daily execution, and progress insights. Free to start.',
    cta: 'Try Free',
    href: '/achievery',
  },
] as const;

export function ThreeSurfaces() {
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReduced ? 0 : 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <section className="relative overflow-hidden border-y border-slate-grey/20 bg-command-navy px-4 py-20">
      <div className="pointer-events-none absolute inset-0 sn-ambient-grid opacity-40" aria-hidden />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Consulting. Platform. Product. One firm.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-grey">
            Three ways to work with Strata Noble — scoped engagements, platform licensing, and a standalone product.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {surfaces.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={prefersReduced ? {} : { y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="sn-surface sn-surface-hover group flex flex-col rounded-sm p-8"
            >
              <h3 className="text-xl font-semibold text-white transition-colors duration-300 group-hover:text-field-sage">
                {card.title}
              </h3>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-slate-grey">
                {card.subtitle}
              </p>
              <Link
                href={card.href}
                className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-field-sage"
              >
                {card.cta}
                <span
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
