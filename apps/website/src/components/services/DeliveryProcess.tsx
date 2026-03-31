import Link from 'next/link';

const phases = [
  { title: 'We get aligned', body: 'We agree on exactly what we are building, what success looks like, and what it costs — before any work starts.' },
  { title: 'We build it', body: 'We build and test everything using your real data and real workflows — not a generic demo environment.' },
  { title: 'We hand it over', body: 'You get documentation, a walkthrough, and a full record of everything we built — yours to keep and audit.' },
  { title: 'Optional ongoing support', body: 'If you want us to stay involved, we offer monthly support — no long-term contract required.' },
] as const;

export function DeliveryProcess() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-command-navy md:text-3xl">How every project works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {phases.map((p) => (
            <div key={p.title} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-command-navy">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-command-navy">Support when you want it, not because you are locked in</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Our builds are fixed-price and scoped upfront. If you want continued support after we hand things
            over, it is available — but it is never required.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-forest-green/25 bg-field-sage/10 p-8 md:p-10">
          <h3 className="text-lg font-semibold text-command-navy">You get a full record of everything we did</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Every project ships with documentation of what was built, how it was configured, and how to manage
            it. Nothing is locked behind our systems — you own it.
          </p>
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-700">
            Not sure where to start? Get a{' '}
            <Link href="/contact?service=lead-rescue" className="font-semibold text-forest-green underline-offset-2 hover:underline">
              free review
            </Link>{' '}
            — we will tell you exactly where your business is losing money, at no cost.
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
