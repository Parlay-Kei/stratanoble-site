import Link from 'next/link';
import { ACHIEVERY_IAP } from '@/data/offerings';

export function AchieveryIAP() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">In-app upgrades</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Add packs when you need them — including business-grade ties into Q SUITE.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ACHIEVERY_IAP.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-6 ${
                item.id === 'qsuite-integration'
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-navy-900">{item.name}</h3>
                <span className="text-lg font-bold text-navy-900">${item.price}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              {item.id === 'qsuite-integration' && (
                <p className="mt-3 text-sm font-medium text-emerald-900">
                  Connect ACHIEVERY to Q SUITE for operational intelligence across goals and execution.
                </p>
              )}
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <h3 className="text-lg font-semibold text-navy-900">Standalone by design</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            ACHIEVERY is a standalone product. You do not need to hire Strata Noble to use it — and hiring us
            does not require ACHIEVERY. They are better together when you want personal accountability and
            business-grade systems in one stack.
          </p>
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center text-sm sm:flex-row sm:gap-6">
          <Link href="/q-suite" className="font-semibold text-emerald-700 hover:underline">
            Ready for the full operating system? Explore Q SUITE →
          </Link>
          <Link href="/services" className="font-semibold text-emerald-700 hover:underline">
            Need hands-on help? View consulting services →
          </Link>
        </div>
      </div>
    </section>
  );
}
