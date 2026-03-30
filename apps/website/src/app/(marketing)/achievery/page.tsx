import { Metadata } from 'next';
import { AchieveryHero, AchieveryPricing, AchieveryIAP } from '@/components/achievery-marketing';

export const metadata: Metadata = {
  title: 'ACHIEVERY | Strata Noble',
  description: 'Goal tracking, daily execution, and accountability — Free and Pro tiers with optional in-app packs.',
};

export default function AchieveryMarketingPage() {
  return (
    <>
      <AchieveryHero />
      <section className="bg-white px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-command-navy md:text-2xl">What you get</h2>
          <p className="mt-4 text-slate-600">
            Goal tracking, daily activity logging, progress insights, and Pro-tier custom workflows — built for
            operators who want clarity without another bloated &quot;productivity&quot; toy.
          </p>
        </div>
      </section>
      <AchieveryPricing />
      <AchieveryIAP />
    </>
  );
}
