import { ECOSYSTEM_PROOF } from '@/data/offerings';

export function EcosystemProof() {
  return (
    <section className="relative overflow-hidden border-y border-slate-800 bg-[#0c1524] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 sn-ambient-vignette opacity-60" aria-hidden />
      <div className="mx-auto max-w-6xl">
        <div>
          <h2 className="text-xl font-bold text-white md:text-2xl">What we have actually built</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Real systems, live products, and working platforms. Not pitch deck mockups.
          </p>
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
          {ECOSYSTEM_PROOF.map((item) => (
            <article
              key={item.id}
              className="sn-surface sn-surface-hover group min-w-[260px] shrink-0 rounded-sm p-5 md:min-w-0"
            >
              <h3 className="font-semibold text-slate-100">
                {'link' in item && item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-field-sage transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.type}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.proves}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
