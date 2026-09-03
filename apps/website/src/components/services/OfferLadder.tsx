import Link from 'next/link';
import { CONSULTING_SERVICES } from '@/data/offerings';

const SUBTITLES: Record<string, string> = {
  'first-ai-workday-setup': 'One useful AI-assisted routine, set up and handed over',
  'ai-workday-expansion': 'Add the next routine after the first one is working',
};

export function OfferLadder() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-command-navy md:text-3xl">
          AI Workday Setups
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Fixed-scope implementation. One routine at a time. Your team reviews the output and owns the setup.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-command-navy">AI Fit Call</h3>
            <p className="mt-1 text-sm text-slate-500">The starting point for every engagement</p>
            <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">
              A short call to decide whether you have one recurring office task that is frequent,
              reviewable, and safe to improve with AI.
            </p>
            <p className="mt-6 text-2xl font-bold text-command-navy">Free</p>
            <Link
              href="/contact?service=ai-fit-call"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-command-navy px-5 py-3 text-sm font-semibold text-white hover:bg-command-navy/90"
            >
              Book an AI Fit Call
            </Link>
          </article>
          {CONSULTING_SERVICES.map((svc) => (
            <article
              key={svc.id}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                svc.id === 'first-ai-workday-setup'
                  ? 'border-forest-green ring-2 ring-forest-green/20'
                  : 'border-slate-200'
              }`}
            >
              {svc.id === 'first-ai-workday-setup' && (
                <span className="mb-3 w-fit rounded-full bg-field-sage/15 px-3 py-1 text-xs font-semibold text-forest-green">
                  Flagship setup
                </span>
              )}
              <h3 className="text-xl font-bold text-command-navy">{svc.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{SUBTITLES[svc.id] ?? ''}</p>
              <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">
                {svc.description}
              </p>
              <p className="mt-6 text-2xl font-bold text-command-navy">{svc.priceLabel}</p>
              {'timeline' in svc && svc.timeline && (
                <p className="mt-1 text-xs text-slate-500">Timeline: {svc.timeline}</p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {svc.deliverables.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-forest-green" aria-hidden>&#10003;</span>
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
