import { Metadata } from 'next';
import { ServicesHero, OfferLadder, DeliveryProcess } from '@/components/services';

export const metadata: Metadata = {
  title: 'Consulting Services | Strata Noble',
  description:
    'Business solutions and operational systems for service businesses. Systems Audit, Process Improvement Sprint, Operations Buildout, and ongoing Operations Command. Fixed scope, clear pricing.',
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
