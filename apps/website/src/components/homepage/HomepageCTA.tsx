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
          Ready to make AI useful inside the workday?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-grey">
          Start with a short fit call. We will look for one recurring office burden that can become
          a safe, practical AI-assisted routine.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact?service=ai-fit-call"
            className="inline-flex items-center justify-center rounded-sm border border-forest-green/50 bg-forest-green px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_0_32px_rgba(45,106,79,0.45)]"
          >
            Book an AI Fit Call
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center text-sm font-semibold text-field-sage hover:opacity-90 transition-opacity duration-200"
          >
            Or see how we work -&gt;
          </Link>
        </div>
      </div>
    </section>
  );
}
