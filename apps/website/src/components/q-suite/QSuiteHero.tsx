import Link from 'next/link';

export function QSuiteHero() {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-green">Platform</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-command-navy md:text-4xl lg:text-5xl">
          The operational control system for service businesses.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Q SUITE is the proprietary technology Strata Noble built and operates. Five modules covering intake,
          client management, revenue intelligence, industry workflows, and secure delivery. We install it,
          configure it to your operation, and support it.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#qsuite-demo"
            className="inline-flex items-center justify-center rounded-sm bg-forest-green px-8 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Request a walkthrough
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-sm border border-slate-300 px-8 py-3.5 text-base font-semibold text-command-navy transition-colors duration-200 hover:border-forest-green hover:text-forest-green"
          >
            View consulting services
          </Link>
        </div>
      </div>
    </section>
  );
}
