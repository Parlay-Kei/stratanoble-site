import Link from 'next/link';

export function HomepageCTA() {
  return (
    <section className="bg-[#070f1a] py-20 px-4 pb-24">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950 px-8 py-12 text-center text-white shadow-2xl">
        <h2 className="text-2xl font-bold md:text-3xl">Ready to stop losing revenue to broken systems?</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Start with the free diagnostic. If we are a fit, we will show you the install path — scoped,
          priced, and documented.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact?service=lead-rescue"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-8 py-3.5 text-base font-semibold text-[#070f1a] hover:bg-emerald-400"
          >
            Get Your Free Diagnostic
          </Link>
          <Link
            href="/q-suite"
            className="inline-flex items-center justify-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Or explore Q SUITE →
          </Link>
        </div>
      </div>
    </section>
  );
}
