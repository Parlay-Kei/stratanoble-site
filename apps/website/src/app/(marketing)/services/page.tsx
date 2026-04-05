import { Metadata } from 'next';
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
    </>
  );
}
