import Link from 'next/link';
import { ENTRY_PRODUCTS } from '@/data/offerings';

export function EntryProductsGrid() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-command-navy md:text-3xl">
          Entry products
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Fixed-scope deliverables for small businesses. No discovery call required.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {ENTRY_PRODUCTS.map((product) => (
            <article
              key={product.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <h3 className="text-base font-bold text-command-navy">{product.name}</h3>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>
              <p className="mt-4 text-xl font-bold text-command-navy">{product.priceLabel}</p>
              <Link
                href={product.ctaLink}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-command-navy px-4 py-2 text-sm font-semibold text-command-navy hover:bg-command-navy hover:text-white transition-colors"
              >
                {product.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
