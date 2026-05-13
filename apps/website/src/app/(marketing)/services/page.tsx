import { Metadata } from 'next';
import {
  ServicesHero,
  EntryProductsGrid,
  AssessmentsGrid,
  OfferLadder,
  SupportPlansGrid,
  DeliveryProcess,
} from '@/components/services';

export const metadata: Metadata = {
  title: 'Services & Products | Strata Noble',
  description:
    'From $50 entry products to full consulting engagements — Systems Audit, Process Improvement Sprint, Operations Buildout, and ongoing support plans for service businesses.',
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <EntryProductsGrid />
      <AssessmentsGrid />
      <OfferLadder />
      <SupportPlansGrid />
      <DeliveryProcess />
    </>
  );
}
