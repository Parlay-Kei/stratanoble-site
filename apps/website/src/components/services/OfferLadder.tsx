import Link from 'next/link';
import { CONSULTING_SERVICES } from '@/data/offerings';

export function OfferLadder() {
  return (
    <section className="bg-slate-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-command-navy md:text-3xl">The offer ladder</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Start with a diagnostic. Fix what is urgent. Build what is missing. Stay supported.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-command-navy">Free Diagnostic</h3>
            <p className="mt-1 text-sm text-slate-500">The starting point for every engagement</p>
            <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">
              We review your lead flow, intake, and follow-up systems. You get a clear report showing where
              prospects are falling through and what to do about it.
            </p>
            <p className="mt-6 text-2xl font-bold text-command-navy">Free</p>
            <Link
              href="/contact?service=diagnostic"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-command-navy px-5 py-3 text-sm font-semibold text-white hover:bg-command-navy"
            >
              Get Your Diagnostic
            </Link>
          </article>
          {CONSULTING_SERVICES.map((svc) => (
            <article
              key={svc.id}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                svc.id === 'pipeline-buildout' ? 'border-forest-green ring-2 ring-forest-green/20' : 'border-slate-200'
              }`}
            >
              {svc.id === 'pipeline-buildout' && (
                <span className="mb-3 w-fit rounded-full bg-field-sage/15 px-3 py-1 text-xs font-semibold text-forest-green">
                  Recommended
                </span>
              )}
              <h3 className="text-xl font-bold text-command-navy">{svc.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {svc.id === 'lead-rescue' && 'The fastest way to stop losing leads you already paid for'}
                {svc.id === 'pipeline-buildout' && 'A complete business system, built and handed to you in 21 days'}
                {svc.id === 'operations-command' && 'We stay on and keep it running with you'}
              </p>
              <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">{svc.description}</p>
              <p className="mt-6 text-2xl font-bold text-command-navy">
                {svc.priceLabel}
                {svc.period !== 'one-time' && (
                  <span className="text-base font-semibold text-slate-500">{svc.period}</span>
                )}
              </p>
              {'commitment' in svc && svc.commitment && (
                <p className="mt-1 text-xs text-slate-500">{svc.commitment}</p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {svc.deliverables.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-forest-green" aria-hidden>
                      ✓
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
              <Link
                href={svc.ctaLink}
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-command-navy px-5 py-3 text-sm font-semibold text-white hover:bg-command-navy"
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
