import Link from 'next/link';

export function HomepageHero() {
  return (
    <section className="relative overflow-hidden bg-void text-white pt-24 pb-20 md:pt-32 md:pb-28 px-4 border-b border-slate-grey/20">
      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.12]">
          Better systems. Better business.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-grey md:text-xl">
          We build and operate revenue-producing digital infrastructure for service businesses and early-stage ventures.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact?service=diagnostic"
            className="inline-flex items-center justify-center rounded-sm bg-forest-green px-8 py-4 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Get Your Free Diagnostic
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-sm border border-slate-grey bg-transparent px-8 py-4 text-base font-semibold text-white transition-colors duration-200 hover:border-forest-green hover:text-field-sage"
          >
            See How We Work
          </Link>
        </div>
      </div>
    </section>
  );
}
