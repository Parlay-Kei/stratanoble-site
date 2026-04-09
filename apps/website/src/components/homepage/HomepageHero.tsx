'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

export function HomepageHero() {
  const prefersReduced = useReducedMotion();

  const fadeUp = (delay = 0) =>
    prefersReduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: [0.25, 0.1, 0.25, 1] as const },
        };

  return (
    <section className="relative overflow-hidden border-b border-slate-grey/20 bg-void px-4 pb-20 pt-24 text-white md:pb-28 md:pt-32">
      <div className="pointer-events-none absolute inset-0 sn-ambient-vignette" aria-hidden />
      <div className="pointer-events-none absolute inset-0 sn-ambient-grid opacity-60" aria-hidden />
      <div className="pointer-events-none absolute inset-0 sn-scanlines opacity-[0.34]" aria-hidden />

      <div
        className="pointer-events-none absolute -top-36 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full opacity-[0.2] sn-orb-drift-slow"
        style={{
          background: 'radial-gradient(ellipse at center, #2D6A4F 0%, transparent 68%)',
          filter: 'blur(72px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[340px] w-[480px] opacity-[0.11]"
        style={{
          background: 'radial-gradient(ellipse at bottom right, #2D6A4F 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div {...fadeUp(0)} className="mb-8 flex justify-center">
          <span className="sn-shimmer-line inline-flex items-center gap-2 rounded-sm border border-forest-green/35 bg-forest-green/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-field-sage">
            <span className="hero-status-dot" aria-hidden />
            Systems Operational
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-[2.95rem] lg:leading-[1.1]"
        >
          Better systems. Better business.
        </motion.h1>

        <motion.p
          {...fadeUp(0.25)}
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-grey md:text-xl"
        >
          We build and operate revenue-producing digital infrastructure for service businesses and
          early-stage ventures.
        </motion.p>

        <motion.div
          {...fadeUp(0.4)}
          className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
        >
          <Link
            href="/contact?service=diagnostic"
            className="sn-float inline-flex items-center justify-center rounded-sm border border-forest-green/60 bg-forest-green px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_0_32px_rgba(45,106,79,0.45)]"
          >
            Get Your Free Diagnostic
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-sm border border-slate-grey/70 bg-void/50 px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:border-forest-green hover:text-field-sage"
          >
            See How We Work
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
