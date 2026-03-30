import Link from 'next/link';
import { QSUITE_PLANS } from '@/data/offerings';

export function QSuitePricing() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">Platform pricing</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Licensing scales with how many modules you run. Full Suite is included with Operations Command.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {QSUITE_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-8 ${
                'popular' in plan && plan.popular
                  ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {'popular' in plan && plan.popular && (
                <span className="mb-3 w-fit rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-navy-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.modules}</p>
              <p className="mt-6 text-3xl font-bold text-navy-900">
                {plan.priceLabel}
                <span className="text-lg font-semibold text-slate-500">{plan.period}</span>
              </p>
              <p className="mt-4 flex-grow text-sm text-slate-600">{plan.description}</p>
              {'note' in plan && plan.note && (
                <p className="mt-4 text-xs font-medium text-emerald-800">{plan.note}</p>
              )}
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/contact?service=q-suite"
            className="inline-flex rounded-lg bg-navy-900 px-8 py-3 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Get started
          </Link>
          <Link
            href="/contact"
            className="text-sm font-semibold text-slate-600 underline-offset-2 hover:text-navy-900 hover:underline"
          >
            Talk to us first
          </Link>
        </div>
      </div>
    </section>
  );
}
