import Link from 'next/link';

const surfaces = [
  {
    title: "Fix What's Leaking",
    subtitle:
      'A fast, targeted intervention for businesses that are getting leads but losing them to broken follow-up, slow intake, or missing systems. Starting at $997.',
    cta: 'Learn about Lead Rescue',
    href: '/lead-rescue',
  },
  {
    title: 'Build the Full Pipeline',
    subtitle:
      'End-to-end infrastructure. Lead capture, routing, booking, follow-up automation, review engine, reporting, and SOPs. Delivered in 21 days.',
    cta: 'See the Pipeline Buildout',
    href: '/pipeline-buildout',
  },
] as const;

export function TwoSurfaces() {
  return (
    <section className="border-y border-slate-grey/20 bg-command-navy py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">Two ways to start</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-grey">
          Whether you need a fast fix or a full build, we scope it, price it, and deliver it.
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
