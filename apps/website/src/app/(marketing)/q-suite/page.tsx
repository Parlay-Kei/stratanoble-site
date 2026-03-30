import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Q SUITE | Strata Noble',
  description: 'The operational control system for service businesses — Client Command through Secure Delivery Vault.',
};

export default function QSuitePage() {
  return (
    <main className="container mx-auto px-4 py-24 text-center max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">Q SUITE</h1>
      <p className="mt-4 text-lg text-navy-600">Coming soon</p>
      <p className="mt-6 text-sm text-navy-500">
        Platform modules, pricing tiers, and how we install Q SUITE for your operation — launching here shortly.
      </p>
    </main>
  );
}
