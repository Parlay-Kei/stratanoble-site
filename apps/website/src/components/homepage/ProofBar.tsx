export function ProofBar() {
  const stats = [
    { value: '1 routine', label: 'Selected, built, tested, and taught' },
    { value: '7-10 days', label: 'Typical setup window after materials arrive' },
    { value: 'Human review', label: 'Your team approves important output' },
  ] as const;

  return (
    <div className="border-b border-slate-grey/20 bg-command-navy px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="font-display text-3xl font-bold text-white">{stat.value}</dt>
              <dd className="mt-1 text-sm text-slate-grey">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
