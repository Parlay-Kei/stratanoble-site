import Link from 'next/link';
import { ASSESSMENTS } from '@/data/offerings';

export function AssessmentsGrid() {
  return (
    <section className="bg-slate-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-command-navy md:text-3xl">
          Assessments
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Know something is off but cannot name it? An assessment gives you a clear diagnosis
          and a prioritized fix list before committing to a larger engagement.
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {ASSESSMENTS.map((svc) => (
            <article
              key={svc.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold text-command-navy">{svc.name}</h3>
              {'timeline' in svc && svc.timeline && (
                <p className="mt-1 text-sm text-slate-500">Delivered in {svc.timeline}</p>
              )}
              <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">
                {svc.description}
              </p>
              <p className="mt-6 text-2xl font-bold text-command-navy">{svc.priceLabel}</p>
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
