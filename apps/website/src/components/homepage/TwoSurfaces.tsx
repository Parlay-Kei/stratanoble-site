import Link from 'next/link';

const surfaces = [
  {
    title: 'We build it',
    subtitle:
      'Production websites, client portals, and platforms — scoped to your business, not pulled from a template. From quick fixes starting at $997 to full 21-day pipeline buildouts.',
    cta: 'See our services',
    href: '/services',
  },
  {
    title: 'We run it',
    subtitle:
      'Lead capture, follow-up automation, booking, revenue tracking, and reporting. The systems that keep your business running after launch — installed, monitored, and kept honest.',
    cta: 'See how it works',
    href: '/how-it-works',
  },
] as const;

export function TwoSurfaces() {
  return (
    <section className="border-y border-slate-grey/20 bg-command-navy py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
          Build it. Run it. You own it.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-grey">
          Websites, portals, and platforms — plus the systems that keep revenue trackable and operations consistent.
        </p>
        <div className="mt-12 grid max-w-4xl mx-auto gap-6 md:grid-cols-2">
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
