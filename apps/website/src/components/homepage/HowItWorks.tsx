const steps = [
  {
    title: 'Discovery',
    body: 'We review your business, how leads come in, where they go quiet, and what is actually costing you money. Free. 48-hour turnaround.',
  },
  {
    title: 'Scope and price',
    body: 'You get a written scope, a fixed price, and a delivery date before we start. No hourly billing, no scope creep.',
  },
  {
    title: 'Build and deliver',
    body: 'We build the system, configure it for your workflows, and hand it off with full documentation. Production-grade, not a template.',
  },
  {
    title: 'Run and support',
    body: 'You own it the moment it is delivered. Optional monthly support keeps it running and reporting clearly.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#070f1a] px-4 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 sn-scanlines opacity-[0.22]" aria-hidden />
      <div className="mx-auto max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">How we build it</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Four steps from broken to running. No surprises, no open-ended scope.
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
