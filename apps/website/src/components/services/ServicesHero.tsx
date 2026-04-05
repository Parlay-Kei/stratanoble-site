import Link from 'next/link';

export function ServicesHero() {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-green">Services</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-command-navy md:text-4xl lg:text-5xl">
          Revenue pipeline infrastructure. Scoped, priced, and delivered.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          We build the systems that turn leads into booked, paid work. Every engagement starts with a free
          diagnostic.
        </p>
        <div className="mt-8">
          <Link
            href="/contact?service=diagnostic"
            className="inline-flex items-center justify-center rounded-sm bg-forest-green px-8 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Start With a Free Diagnostic
          </Link>
        </div>
      </div>
    </section>
  );
}
