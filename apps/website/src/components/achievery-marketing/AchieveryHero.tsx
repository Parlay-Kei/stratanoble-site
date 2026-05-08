import Link from 'next/link';

export function AchieveryHero() {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-green">Product</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-command-navy md:text-4xl lg:text-5xl">
          Goal tracking and daily execution for operators.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          ACHIEVERY is a standalone application product under the Strata Noble brand. Set goals, log daily
          activity, track progress, and connect to Q SUITE when you are ready for business-grade operational
          infrastructure. Free to start.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#achievery-early-access"
            className="inline-flex items-center justify-center rounded-sm bg-forest-green px-8 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Join the early access list
          </Link>
          <Link
            href="/q-suite"
            className="inline-flex items-center justify-center rounded-sm border border-slate-300 px-8 py-3.5 text-base font-semibold text-command-navy transition-colors duration-200 hover:border-forest-green hover:text-forest-green"
          >
            Explore Q SUITE
          </Link>
        </div>
      </div>
    </section>
  );
}
