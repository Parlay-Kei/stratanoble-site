import { Metadata } from 'next';
import Link from 'next/link';
import { QSuiteHero, ModuleShowcase, QSuitePricing } from '@/components/q-suite';

export const metadata: Metadata = {
  title: 'Q SUITE | Strata Noble',
  description: 'Operational control system for service businesses — five modules, clear licensing, installed through consulting.',
};

export default function QSuitePage() {
  return (
    <>
      <QSuiteHero />
      <ModuleShowcase />
      <QSuitePricing />
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-8 text-center md:text-left">
          <div>
            <h2 className="text-xl font-bold text-navy-900">How you get Q SUITE</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Q SUITE is installed through a consulting engagement. We configure it for your business, train your
              team, and hand over the keys — with documentation and ProofLoop receipts.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900">Industry proof</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Q-REIL is built for real estate workflows; we also deploy home-service and consulting verticals
              where intake, scheduling, and follow-up share the same failure modes. The modules stay consistent
              — the configuration matches your market.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 text-center text-sm text-slate-600 sm:flex-row">
          <Link href="/services" className="font-semibold text-emerald-700 hover:underline">
            Consulting services
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/achievery" className="font-semibold text-emerald-700 hover:underline">
            ACHIEVERY
          </Link>
        </div>
      </section>
    </>
  );
}
