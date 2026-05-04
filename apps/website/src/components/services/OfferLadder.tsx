import Link from 'next/link';
import { CONSULTING_SERVICES } from '@/data/offerings';

const SUBTITLES: Record<string, string> = {
  'systems-audit': 'Identify the top structural problems before committing to a larger engagement',
  'process-improvement-sprint': 'Rebuild one broken process in 10 business days — scoped, priced, and delivered',
  'operations-buildout': 'End-to-end operational infrastructure installation in 21 days',
  'operations-command': 'Monthly monitoring, optimization, and support — keep the systems running',
};

export function OfferLadder() {
  return (
    <section className="bg-slate-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-command-navy md:text-3xl">Entry offers</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Every engagement starts with a free 30-minute diagnostic call. From there, pick the scope that matches what the business needs.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-command-navy">Free Diagnostic</h3>
            <p className="mt-1 text-sm text-slate-500">The starting point for every engagement</p>
            <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">
              A 30-minute call to review how your business currently operates, identify where it breaks down,
              and map a recommended path forward — before any work starts.
            </p>
            <p className="mt-6 text-2xl font-bold text-command-navy">Free</p>
            <Link
              href="/contact?service=diagnostic"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-command-navy px-5 py-3 text-sm font-semibold text-white hover:bg-command-navy/90"
            >
              Book Your Diagnostic
            </Link>
          </article>
          {CONSULTING_SERVICES.map((svc) => (
            <article
              key={svc.id}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                svc.id === 'operations-buildout' ? 'border-forest-green ring-2 ring-forest-green/20' : 'border-slate-200'
              }`}
            >
              {svc.id === 'operations-buildout' && (
                <span className="mb-3 w-fit rounded-full bg-field-sage/15 px-3 py-1 text-xs font-semibold text-forest-green">
                  Most comprehensive
                </span>
              )}
              <h3 className="text-xl font-bold text-command-navy">{svc.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{SUBTITLES[svc.id] ?? ''}</p>
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
              {'timeline' in svc && svc.timeline && (
                <p className="mt-1 text-xs text-slate-500">Timeline: {svc.timeline}</p>
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
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-command-navy px-5 py-3 text-sm font-semibold text-white hover:bg-command-navy/90"
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
