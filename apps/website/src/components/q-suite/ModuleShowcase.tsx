import { QSUITE_MODULES } from '@/data/offerings';

const outcomes: Record<string, string> = {
  'q-cc': 'Fewer dropped leads and a faster, consistent first response.',
  'q-icms': 'One operational ledger for the full client lifecycle — no orphan records.',
  'q-ari': 'Pipeline and revenue signals you can act on weekly, not quarterly.',
  'q-reil': 'Workflows that match how real estate (and adjacent verticals) actually operate.',
  'q-vault': 'Deliverables and proof land in a controlled, auditable handoff layer.',
};

export function ModuleShowcase() {
  return (
    <section className="bg-slate-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-command-navy md:text-3xl">Modules</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Five modules. One system. Activated to the depth your operation needs.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {QSUITE_MODULES.map((m) => (
            <article key={m.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-forest-green">{m.name}</p>
              <h3 className="mt-2 text-lg font-semibold text-command-navy">{m.fullName}</h3>
              <p className="mt-2 text-sm text-slate-600">{m.description}</p>
              <p className="mt-4 text-sm font-medium text-command-navy">{outcomes[m.id]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
