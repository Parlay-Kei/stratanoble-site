import { Metadata } from 'next';
import { ServicesHero, OfferLadder, DeliveryProcess } from '@/components/services';

export const metadata: Metadata = {
  title: 'Consulting Services | Strata Noble',
  description:
    'Systems Audit, Process Improvement Sprint, Operations Buildout, and Operations Command for service businesses. Fixed scope, ProofLoop verification, infrastructure you can run.',
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
