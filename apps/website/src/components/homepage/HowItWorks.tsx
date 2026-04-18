const steps = [
  {
    title: 'Discovery',
    body: 'We review your business — how you get leads, where things break, and what you actually need built. Free 48-hour diagnostic included.',
  },
  {
    title: 'Scope and price',
    body: 'You get a fixed scope, clear price, and timeline before any work starts. No surprises, no open-ended retainers.',
  },
  {
    title: 'Build and deliver',
    body: 'Your system gets built and configured for how you actually work. Production-grade, not a template. Delivered with full documentation.',
  },
  {
    title: 'Run and support',
    body: 'You own everything we build. Optional monthly support keeps systems running, optimized, and reporting clearly.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#070f1a] px-4 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 sn-scanlines opacity-[0.22]" aria-hidden />
      <div className="mx-auto max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">How we work</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            A straight path from what you need to a working system you own.
          </p>
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="sn-surface sn-surface-hover group relative rounded-sm p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-forest-green/35 bg-forest-green/10 font-mono text-[11px] font-bold text-forest-green transition-colors duration-300 group-hover:border-forest-green/60 group-hover:text-field-sage">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 sn-section-divider" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
