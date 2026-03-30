import Link from 'next/link';
import { ACHIEVERY_TIERS } from '@/data/offerings';

export function AchieveryPricing() {
  return (
    <section className="bg-slate-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">Pricing</h2>
        <p className="mt-3 text-slate-600">Free to start. Pro when you want unlimited structure and depth.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {ACHIEVERY_TIERS.map((t) => (
            <article
              key={t.id}
              className={`flex flex-col rounded-2xl border p-8 ${
                'popular' in t && t.popular
                  ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <h3 className="text-xl font-bold text-navy-900">{t.name}</h3>
              <p className="mt-2 text-3xl font-bold text-navy-900">
                {t.priceLabel}
                <span className="text-lg font-semibold text-slate-500">
                  {t.period === 'forever' ? ' forever' : t.period}
                </span>
              </p>
              {'annualLabel' in t && t.annualLabel && (
                <p className="mt-1 text-sm text-slate-500">Billed annually: {t.annualLabel}</p>
              )}
              <ul className="mt-6 flex-grow space-y-2 text-sm text-slate-600">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {t.price === 0 ? (
                  <Link
                    href="/auth/signup"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 py-3 text-sm font-semibold text-navy-900 hover:bg-slate-50"
                  >
                    Start free
                  </Link>
                ) : (
                  <Link
                    href="/contact?service=achievery-pro"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-navy-900 py-3 text-sm font-semibold text-white hover:bg-navy-800"
                  >
                    Go Pro
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:underline">
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
