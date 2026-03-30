import Link from 'next/link';
import { CONSULTING_SERVICES } from '@/data/offerings';

export function OfferLadder() {
  return (
    <section className="bg-slate-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-navy-900 md:text-3xl">Offer ladder</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Three entry points — from fastest stop-the-bleed to full pipeline install and optional ongoing command.
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {CONSULTING_SERVICES.map((svc) => (
            <article
              key={svc.id}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                svc.id === 'pipeline-buildout' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              {svc.id === 'pipeline-buildout' && (
                <span className="mb-3 w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Recommended
                </span>
              )}
              {'badge' in svc && svc.badge && (
                <span className="mb-3 w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                  {svc.badge}
                </span>
              )}
              <h3 className="text-xl font-bold text-navy-900">{svc.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {svc.id === 'lead-rescue' && 'Your quickest path to stopping revenue leaks'}
                {svc.id === 'pipeline-buildout' && 'A complete operational pipeline in 21 days'}
                {svc.id === 'operations-command' && 'Keep the builder on retainer'}
              </p>
              <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">{svc.description}</p>
              <p className="mt-6 text-2xl font-bold text-navy-900">
                {svc.priceLabel}
                {svc.period !== 'one-time' && (
                  <span className="text-base font-semibold text-slate-500">{svc.period}</span>
                )}
              </p>
              {'commitment' in svc && svc.commitment && (
                <p className="mt-1 text-xs text-slate-500">{svc.commitment}</p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {svc.deliverables.slice(0, 5).map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-emerald-600" aria-hidden>
                      ✓
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
              <Link
                href={svc.ctaLink}
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800"
              >
                {svc.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
