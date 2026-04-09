'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ECOSYSTEM_PROOF } from '@/data/offerings';

export function EcosystemProof() {
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReduced ? 0 : 0.09 },
    },
  };

  const itemVariants = {
    hidden: { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <section className="relative overflow-hidden border-y border-slate-800 bg-[#0c1524] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 sn-ambient-vignette opacity-60" aria-hidden />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white md:text-2xl">What we have actually built</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Real systems, live products, and working platforms. Not pitch deck mockups.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {ECOSYSTEM_PROOF.map((item) => (
            <motion.article
              key={item.id}
              variants={itemVariants}
              className="sn-surface sn-surface-hover group min-w-[260px] shrink-0 rounded-sm p-5 md:min-w-0"
            >
              <h3 className="font-semibold text-slate-100">
                {'link' in item && item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-field-sage transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.type}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.proves}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
