import Link from 'next/link';

export function HomepageHero() {
  return (
    <section className="relative overflow-hidden bg-[#070f1a] text-white pt-24 pb-20 md:pt-32 md:pb-28 px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16, 185, 129, 0.25), transparent), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(212, 175, 55, 0.08), transparent)',
        }}
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90 mb-6">
          Strata Noble
        </p>
        <h1 className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.12]">
          We install operational control systems for service businesses — powered by proprietary
          technology we built and operate.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
          Consulting. Platform. Product. One firm.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact?service=lead-rescue"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-8 py-4 text-base font-semibold text-[#070f1a] shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
          >
            Get Free Diagnostic
          </Link>
          <Link
            href="/q-suite"
            className="inline-flex items-center justify-center rounded-lg border border-slate-500/80 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:border-emerald-400/60 hover:bg-white/10"
          >
            Explore Q SUITE
          </Link>
        </div>
      </div>
    </section>
  );
}
