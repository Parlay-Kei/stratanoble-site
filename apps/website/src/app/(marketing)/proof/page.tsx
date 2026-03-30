import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proof | Strata Noble',
  description: 'Case studies and ecosystem proof — what we have built and shipped in production.',
};

export default function ProofPage() {
  return (
    <main className="container mx-auto px-4 py-24 text-center max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">Proof</h1>
      <p className="mt-4 text-lg text-navy-600">Coming soon</p>
      <p className="mt-6 text-sm text-navy-500">
        Case studies and ecosystem credibility — this page will collect receipts and references in one place.
      </p>
    </main>
  );
}
