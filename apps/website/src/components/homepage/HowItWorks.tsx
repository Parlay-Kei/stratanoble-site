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
    <section className="bg-[#070f1a] py-20 px-4 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold md:text-3xl">How we work</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          A straight path from what you need to a working system you own.
        </p>
        <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <span className="text-xs font-bold text-forest-green">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
