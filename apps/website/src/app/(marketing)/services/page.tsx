import { Metadata } from 'next';
import {
  ServicesHero,
  AssessmentsGrid,
  OfferLadder,
  SupportPlansGrid,
  DeliveryProcess,
} from '@/components/services';

export const metadata: Metadata = {
  title: 'Practical AI Setup | Strata Noble',
  description:
    'Practical AI setup for owner-led professional firms. Review one recurring office burden, install one safe AI-assisted routine, and keep your team in control.',
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <AssessmentsGrid />
      <OfferLadder />
      <SupportPlansGrid />
      <DeliveryProcess />
    </>
  );
}
