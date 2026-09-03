import Link from 'next/link';

export function ServicesHero() {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-green">Practical AI Setup</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-command-navy md:text-4xl lg:text-5xl">
          One practical AI routine, set up for your business.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          We help owner-led professional firms turn one repeated office burden into a safe,
          human-reviewed AI-assisted routine their team can actually use.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact?service=ai-fit-call"
            className="inline-flex items-center justify-center rounded-sm bg-forest-green px-8 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Book an AI Fit Call
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-sm border border-slate-300 px-8 py-3.5 text-base font-semibold text-command-navy transition-colors duration-200 hover:border-forest-green hover:text-forest-green"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
