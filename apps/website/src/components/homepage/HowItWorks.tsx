const steps = [
  {
    title: 'Diagnose',
    body: 'Free 48-hour pipeline diagnostic identifies where you are losing revenue.',
  },
  {
    title: 'Install',
    body: 'We build and configure Q SUITE for your business in 21 days or less.',
  },
  {
    title: 'Operate',
    body: 'Your team uses the platform daily. We monitor and optimize monthly.',
  },
  {
    title: 'Grow',
    body: 'Data-driven insights from Q-ARI reveal your next operational moves.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-[#070f1a] py-20 px-4 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          A straight line from leak to system — no motivational filler, just delivery sequence.
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
