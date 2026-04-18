import { LeadLeakCheckForm } from '@/components/forms/LeadLeakCheckForm';

export function LeadLeakCheckSection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-grey/20 bg-[#0a1320] py-16 text-white">
      <div className="pointer-events-none absolute inset-0 sn-ambient-grid opacity-35" aria-hidden />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Find Out Where Your Leads Are Leaking
            </h2>
            <p className="text-lg text-slate-grey md:text-xl">
              Free diagnostic in 48 hours. We&apos;ll show you exactly where prospects are falling through the cracks.
            </p>
          </div>

          <div className="sn-surface rounded-2xl p-8 md:p-12 shadow-sm">
            <LeadLeakCheckForm />
          </div>
        </div>
      </div>
    </section>
  );
}
