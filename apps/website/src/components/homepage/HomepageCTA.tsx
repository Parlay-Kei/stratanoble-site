import Link from 'next/link';

export function HomepageCTA() {
  return (
    <section className="relative overflow-hidden border-t border-slate-grey/20 bg-command-navy px-4 pb-24 pt-20">
      <div className="pointer-events-none absolute inset-0 sn-scanlines opacity-[0.24]" aria-hidden />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 w-[560px] h-[320px] opacity-[0.14]"
        style={{
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse at bottom center, #2D6A4F 0%, transparent 65%)',
          filter: 'blur(64px)',
        }}
        aria-hidden
      />

      <div className="sn-surface relative mx-auto max-w-3xl rounded-sm px-8 py-12 text-center text-white">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Ready for systems that actually work?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-grey">
          Start with a free diagnostic. We review how your business captures and follows up with
          leads, show you where things break, and tell you exactly what it costs to fix.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact?service=diagnostic"
            className="inline-flex items-center justify-center rounded-sm border border-forest-green/50 bg-forest-green px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_0_32px_rgba(45,106,79,0.45)]"
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
