import Link from 'next/link';

const surfaces = [
  {
    title: 'Consulting Services',
    subtitle: 'Scoped engagements that install operational control systems. From $997.',
    cta: 'View Services',
    href: '/services',
  },
  {
    title: 'Q SUITE',
    subtitle: 'The operational control system your business runs on. From $297/month.',
    cta: 'Explore Platform',
    href: '/q-suite',
  },
  {
    title: 'ACHIEVERY',
    subtitle: 'Track progress, build momentum, stay accountable. Free to start.',
    cta: 'Try Free',
    href: '/achievery',
  },
] as const;

export function ThreeSurfaces() {
  return (
    <section className="border-y border-slate-800 bg-[#0c1524] py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">Three surfaces</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
          How we work with operators: hands-on installs, the platform you run on, and a product your
          team can adopt without a retainer.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {surfaces.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/40 p-8 shadow-xl backdrop-blur-sm"
            >
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-slate-400">{card.subtitle}</p>
              <Link
                href={card.href}
                className="mt-8 inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                {card.cta}
                <span className="ml-1" aria-hidden>
                  →
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
