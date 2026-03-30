import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACHIEVERY | Strata Noble',
  description: 'Track progress, build momentum, and stay accountable — standalone product from Strata Noble.',
};

export default function AchieveryMarketingPage() {
  return (
    <main className="container mx-auto px-4 py-24 text-center max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">ACHIEVERY</h1>
      <p className="mt-4 text-lg text-navy-600">Coming soon</p>
      <p className="mt-6 text-sm text-navy-500">
        Product overview, Free vs Pro, and in-app upgrades — this marketing surface is being finished now.
      </p>
    </main>
  );
}
