import { Metadata } from 'next';
import Link from 'next/link';
import { ServicesHero, OfferLadder, DeliveryProcess } from '@/components/services';

export const metadata: Metadata = {
  title: 'Consulting Services | Strata Noble',
  description:
    'Production websites, client portals, platform builds, and operational system installs — for service businesses and early-stage ventures. Fixed scope, clear pricing.',
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <OfferLadder />
      <DeliveryProcess />
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 text-center text-sm text-slate-600 sm:flex-row">
          <span>Explore the platform:</span>
          <Link href="/q-suite" className="font-semibold text-forest-green hover:underline">
            Q SUITE
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/achievery" className="font-semibold text-forest-green hover:underline">
            ACHIEVERY
          </Link>
        </div>
      </section>
    </>
  );
}
