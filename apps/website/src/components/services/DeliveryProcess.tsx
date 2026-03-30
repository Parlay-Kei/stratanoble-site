import Link from 'next/link';

const phases = [
  { title: 'Discovery', body: 'We align on scope, tools, and success criteria — no surprise invoices.' },
  { title: 'Implementation', body: 'We build, configure, and test with your real leads and workflows.' },
  { title: 'Handoff', body: 'Documentation, training, and ProofLoop receipts so you own the system.' },
  { title: 'Optional support', body: 'Operations Command is there when you want monitoring without a lock-in contract.' },
] as const;

export function DeliveryProcess() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">How delivery works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {phases.map((p) => (
            <div key={p.title} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-navy-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-navy-900">Retainers, without the handcuffs</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Our core engagements are scoped and fixed-price. Ongoing support is available for clients who want
            it. No lock-in contracts — if you only need the install, you get the install.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-navy-900">ProofLoop &amp; ANX Vault</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Every engagement ships with verified proof of work: what changed, what was configured, and what you
            can audit later. ProofLoop is the receipt layer; ANX Vault is where deliverables and sensitive handoff
            artifacts land — controlled, traceable, yours to retain.
          </p>
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-700">
            Not sure which service? Start with a{' '}
            <Link href="/contact?service=lead-rescue" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
              free diagnostic
            </Link>{' '}
            — we will show you exactly where you are losing revenue in 48 hours.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-slate-50"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
