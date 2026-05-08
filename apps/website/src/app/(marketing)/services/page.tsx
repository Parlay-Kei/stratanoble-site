import { Metadata } from 'next';
import { ServicesHero, OfferLadder, DeliveryProcess, ServicesDiagnosticForm } from '@/components/services';

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
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-forest-green">Free Diagnostic</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-command-navy md:text-3xl">
            Tell us what you are dealing with.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Every engagement starts here. We review your note, identify which solution fits, and follow up with a clear scope — no pitch, no upsell.
          </p>
          <div className="mt-8">
            <ServicesDiagnosticForm />
          </div>
        </div>
      </section>
    </>
  );
}
