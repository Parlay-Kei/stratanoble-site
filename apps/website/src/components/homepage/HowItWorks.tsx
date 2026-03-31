const steps = [
  {
    title: 'We review your business',
    body: 'Free, 48-hour review of how your business captures and follows up with leads — we tell you exactly where money is slipping through the cracks.',
  },
  {
    title: 'We build your system',
    body: 'We build and set up the right tools for your business in 21 days or less. No templates — configured for how you actually work.',
  },
  {
    title: 'You run it, we support it',
    body: 'Your team uses the platform daily. We are available monthly to keep things running smoothly.',
  },
  {
    title: 'You see what is working',
    body: 'Clear reporting shows you which clients, offers, and channels are actually making you money.',
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
