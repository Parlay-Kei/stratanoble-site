import Link from 'next/link';

const phases = [
  {
    title: 'Scope first',
    body: 'We agree on exactly what is being built, what success looks like, and what it costs. Scope is fixed before any work starts.',
  },
  {
    title: 'We install it',
    body: 'We build and configure everything against your real workflows and your real data — not a generic demo environment.',
  },
  {
    title: 'We hand it over',
    body: 'You receive documentation, a walkthrough, and a full ProofLoop receipt of everything built. Yours to keep, audit, and operate.',
  },
  {
    title: 'Optional: stay supported',
    body: 'Operations Command keeps us engaged monthly — monitoring, optimization, and priority support. Not required.',
  },
] as const;

export function DeliveryProcess() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-command-navy md:text-3xl">How every engagement works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {phases.map((p) => (
            <div key={p.title} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-command-navy">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-command-navy">Fixed scope. No retainer required.</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Every engagement is scoped and priced upfront. Ongoing support is available through Operations
            Command, but it is never a condition of delivery. You own what we build regardless.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-forest-green/25 bg-field-sage/10 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-command-navy">Every project ships with a full delivery record</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Documentation of what was built, how it was configured, and how to manage it. ProofLoop receipts
            included. Nothing is locked behind our systems or our access.
          </p>
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-700">
            Not sure which engagement fits?{' '}
            <Link href="/contact?service=diagnostic" className="font-semibold text-forest-green underline-offset-2 hover:underline">
              Book a free 30-minute diagnostic call
            </Link>
            . We will identify the structural issues and recommend a path.
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
