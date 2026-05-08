import { Metadata } from 'next';
import { ServicesHero, OfferLadder, DeliveryProcess } from '@/components/services';

export const metadata: Metadata = {
  title: 'Consulting Services | Strata Noble',
  description:
    'Lead Rescue, 21-Day Pipeline Buildout, and Operations Command for service businesses. Fixed scope delivery, clear pricing, and operational infrastructure you own.',
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
