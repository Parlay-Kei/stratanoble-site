import Link from 'next/link';
import { SUPPORT_PLANS } from '@/data/offerings';

export function SupportPlansGrid() {
  return (
    <section className="bg-slate-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-command-navy md:text-3xl">
          Ongoing support
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          For businesses that have completed an engagement and want ongoing monitoring and access.
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {SUPPORT_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                plan.id === 'operations-command'
                  ? 'border-forest-green ring-2 ring-forest-green/20'
                  : 'border-slate-200'
              }`}
            >
              {plan.id === 'operations-command' && (
                <span className="mb-3 w-fit rounded-full bg-field-sage/15 px-3 py-1 text-xs font-semibold text-forest-green">
                  Full access
                </span>
              )}
              <h3 className="text-xl font-bold text-command-navy">{plan.name}</h3>
              <p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">
                {plan.description}
              </p>
              <p className="mt-6 text-2xl font-bold text-command-navy">
                {plan.priceLabel}
                <span className="text-base font-semibold text-slate-500">{plan.period}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{plan.commitment}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {plan.deliverables.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-forest-green" aria-hidden>&#10003;</span>
                    {d}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaLink}
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-command-navy px-5 py-3 text-sm font-semibold text-white hover:bg-command-navy/90"
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
