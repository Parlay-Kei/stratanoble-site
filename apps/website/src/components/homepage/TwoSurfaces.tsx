import Link from 'next/link';

const surfaces = [
  {
    title: 'We build it',
    subtitle:
      'Lead capture, intake forms, booking flows, follow-up sequences, and reporting dashboards. Scoped to your business. Delivered in 48 hours to 21 days. Starting at $997.',
    cta: 'See our services',
    href: '/services',
  },
  {
    title: 'We run it',
    subtitle:
      'After delivery, we stay on to keep systems tuned, automations running, and reporting honest. Monthly support with no lock-in. Cancel any time.',
    cta: 'See how it works',
    href: '/how-it-works',
  },
] as const;

export function TwoSurfaces() {
  return (
    <section className="relative overflow-hidden border-y border-slate-grey/20 bg-command-navy px-4 py-20">
      <div className="pointer-events-none absolute inset-0 sn-ambient-grid opacity-40" aria-hidden />
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            The business runs. You lead it.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-grey">
            We build what you need and run it after delivery. You own the system either way.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {surfaces.map((card) => (
            <div
              key={card.title}
              className="sn-surface sn-surface-hover group flex flex-col rounded-sm p-8 transition-transform duration-200 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-white transition-colors duration-300 group-hover:text-field-sage">
                {card.title}
              </h3>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-slate-grey">
                {card.subtitle}
              </p>
              <Link
                href={card.href}
                className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-field-sage"
              >
                {card.cta}
                <span
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                >
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
