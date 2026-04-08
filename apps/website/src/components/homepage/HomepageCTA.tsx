import Link from 'next/link';

export function HomepageCTA() {
  return (
    <section className="bg-command-navy py-20 px-4 pb-24 border-t border-slate-grey/20">
      <div className="mx-auto max-w-3xl rounded-sm border border-slate-grey/30 bg-void px-8 py-12 text-center text-white">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Ready for systems that actually work?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-grey">
          Start with a free diagnostic. We review how your business captures and follows up with leads, show you where things break, and tell you exactly what it costs to fix.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact?service=diagnostic"
            className="inline-flex items-center justify-center rounded-sm bg-forest-green px-8 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Get Your Free Diagnostic
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center text-sm font-semibold text-field-sage hover:opacity-90 transition-opacity duration-200"
          >
            Or see how we work →
          </Link>
        </div>
      </div>
    </section>
  );
}
