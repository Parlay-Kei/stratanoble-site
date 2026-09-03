import Link from 'next/link';

const phases = [
  {
    title: 'Find',
    body: 'We observe one recurring task, its inputs, owners, delays, error points, and frequency.',
  },
  {
    title: 'Focus',
    body: 'We select a high-frequency, low-risk, reviewable use case with measurable value.',
  },
  {
    title: 'Build',
    body: 'We configure prompts, templates, source material, review steps, storage, and usage instructions.',
  },
  {
    title: 'Keep',
    body: 'We hand off the setup, access notes, AI Use Guide, and maintenance path so the business stays in control.',
  },
] as const;

export function DeliveryProcess() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-command-navy md:text-3xl">The Noble Workday Method</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {phases.map((p) => (
            <div key={p.title} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-command-navy">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-command-navy">Fixed scope. One routine only.</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The first setup does not include CRM replacement, complex integrations, autonomous agents,
            regulated advice, unlimited meetings, or open-ended support.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-forest-green/25 bg-field-sage/10 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-command-navy">Every setup includes an AI Use Guide</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            The guide names the approved tools, what data can be used, what data is prohibited,
            what AI may draft or organize, and what requires human review before use.
          </p>
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-700">
            Not sure which engagement fits?{' '}
            <Link href="/contact?service=ai-fit-call" className="font-semibold text-forest-green underline-offset-2 hover:underline">
              Book an AI Fit Call
            </Link>
            . We will look for one safe, useful place to start.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-command-navy hover:bg-slate-50"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
