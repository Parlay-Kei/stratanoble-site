import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consulting Services | Strata Noble',
  description: 'Lead Rescue, Pipeline Buildout, and Operations Command — scoped engagements with proof of work.',
};

export default function ServicesPage() {
  return (
    <main className="container mx-auto px-4 py-24 text-center max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">Consulting Services</h1>
      <p className="mt-4 text-lg text-navy-600">Coming soon</p>
      <p className="mt-6 text-sm text-navy-500">
        Lead Rescue, 21-Day Pipeline Buildout, and Operations Command — full detail is on the way.
      </p>
    </main>
  );
}
