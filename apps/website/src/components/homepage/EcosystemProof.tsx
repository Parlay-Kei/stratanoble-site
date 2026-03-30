import { ECOSYSTEM_PROOF } from '@/data/offerings';

export function EcosystemProof() {
  return (
    <section className="border-y border-slate-800 bg-[#0c1524] py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-xl font-bold text-white md:text-2xl">What we have built</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Production systems and verified delivery — not slide-deck claims.
        </p>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
          {ECOSYSTEM_PROOF.map((item) => (
            <article
              key={item.id}
              className="min-w-[260px] shrink-0 rounded-lg border border-slate-800/80 bg-slate-950/50 p-5 md:min-w-0"
            >
              <h3 className="font-semibold text-slate-100">
                {'link' in item && item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{item.type}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.proves}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
