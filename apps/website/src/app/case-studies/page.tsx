import { Metadata } from 'next';
import { DevelopmentPortfolio } from '@/components/DevelopmentPortfolio';

export const metadata: Metadata = {
  title: 'Development Portfolio & Case Studies | Strata Noble',
  description: 'Explore our development portfolio featuring enterprise-grade platform development, technical achievements, and proven business results.',
  openGraph: {
    title: 'Development Portfolio & Case Studies | Strata Noble',
    description: 'Explore our development portfolio featuring enterprise-grade platform development, technical achievements, and proven business results.',
  },
};

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen">
      <DevelopmentPortfolio />
    </main>
  );
}
