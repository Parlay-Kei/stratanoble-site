import Link from 'next/link';

export function HomepageHero() {
  return (
    <section className="relative overflow-hidden bg-void text-white pt-24 pb-20 md:pt-32 md:pb-28 px-4 border-b border-slate-grey/20">
      <div className="relative mx-auto max-w-5xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-field-sage/90 mb-6 font-mono">
          Strata Noble
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.12]">
          We build and operate revenue-producing digital infrastructure — for service businesses
          and the ventures ready to grow.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-grey md:text-xl">
          Websites. Portals. Marketplaces. The systems that run them.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact?service=lead-rescue"
            className="inline-flex items-center justify-center rounded-sm bg-forest-green px-8 py-4 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Get a Free Review
          </Link>
          <Link
            href="/q-suite"
            className="inline-flex items-center justify-center rounded-sm border border-slate-grey bg-transparent px-8 py-4 text-base font-semibold text-white transition-colors duration-200 hover:border-forest-green hover:text-field-sage"
          >
            Explore Q SUITE
          </Link>
        </div>
      </div>
    </section>
  );
}
