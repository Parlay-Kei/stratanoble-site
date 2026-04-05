const steps = [
  {
    title: 'We review your business',
    body: 'Free, 48-hour diagnostic of how your business captures, follows up with, and converts leads. We show you exactly where money is leaking.',
  },
  {
    title: 'We scope and price the fix',
    body: 'No surprises. You get a fixed scope, clear price, and timeline before any work starts. Lead Rescue for quick fixes, Pipeline Buildout for the full system.',
  },
  {
    title: 'We build your system',
    body: 'Your infrastructure gets built and configured for how you actually work. Not a template. Delivered in 21 days or less.',
  },
  {
    title: 'You run it, we support it',
    body: 'Your team uses the system daily. Optional monthly support keeps everything running, optimized, and reporting clearly.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-[#070f1a] py-20 px-4 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          A simple, straight path from &ldquo;something is broken&rdquo; to &ldquo;here is your working system.&rdquo;
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
