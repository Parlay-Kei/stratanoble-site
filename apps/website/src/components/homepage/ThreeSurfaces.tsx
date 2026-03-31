import Link from 'next/link';

const surfaces = [
  {
    title: 'Build & Operations',
    subtitle:
      'We build your website, client portal, or platform — then set up the systems behind it so your business actually runs. Fixed scope, clear price.',
    cta: 'See what we build',
    href: '/services',
  },
  {
    title: 'Q SUITE',
    subtitle:
      'A set of business tools we built and use ourselves — for tracking clients, following up on money owed, and keeping your business organized. From $297/month.',
    cta: 'Explore Platform',
    href: '/q-suite',
  },
  {
    title: 'ACHIEVERY',
    subtitle:
      'A goal-tracking tool for entrepreneurs and their teams. Set targets, track progress, stay accountable. Free to start.',
    cta: 'Try Free',
    href: '/achievery',
  },
] as const;

export function ThreeSurfaces() {
  return (
    <section className="border-y border-slate-grey/20 bg-command-navy py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">Three ways to work with us</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-grey">
          Hands-on builds, a platform you can use daily, and a free tool your team can start using
          today — no contract required.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {surfaces.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-sm border border-slate-grey/25 bg-void p-8"
            >
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-slate-grey">{card.subtitle}</p>
              <Link
                href={card.href}
                className="mt-8 inline-flex items-center text-sm font-semibold text-field-sage hover:text-field-sage"
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
