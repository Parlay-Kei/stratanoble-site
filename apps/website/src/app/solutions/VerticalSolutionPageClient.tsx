'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { verticalContent, type VerticalSlug } from './verticalContent';

interface Props {
  slug: VerticalSlug;
}

export function VerticalSolutionPageClient({ slug }: Props) {
  const v = verticalContent[slug];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 text-white py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold leading-tight"
          >
            {v.headline}
          </motion.h1>
          <p className="text-lg md:text-xl text-gray-300 mt-6 leading-relaxed">{v.subheadline}</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-navy mb-8">Where it breaks first</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {v.pains.map((pain, idx) => (
            <motion.div
              key={pain.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <pain.Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-bold text-navy">{pain.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{pain.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-navy mb-4">What we install</h2>
          <p className="text-muted-foreground mb-6">
            Scoped to your vertical — powered by Q Suite modules, configured in your tools (Notion, Airtable, HubSpot,
            Zapier, and what you already run).
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {v.modules.map((m) => (
              <span key={m} className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-semibold">
                {m}
              </span>
            ))}
          </div>
          <ul className="space-y-3">
            {v.installed.map((line) => (
              <li key={line} className="flex gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-navy mb-6">What this looks like</h2>
        <article className="rounded-xl border border-gray-200 border-t-4 border-t-primary bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{v.scenario.clientType}</p>
          <p className="text-sm text-muted-foreground mt-1">{v.scenario.industry}</p>
          <span className="inline-block mt-4 text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            {v.scenario.timeline}
          </span>
          <div className="mt-6 space-y-4 text-sm">
            <div>
              <p className="font-semibold text-navy">Problem</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">{v.scenario.problem}</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Fix</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">{v.scenario.fix}</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Result</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">{v.scenario.result}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-navy mb-3">Recommended path</h2>
        <p className="text-muted-foreground leading-relaxed">{v.offerPath}</p>
      </section>

      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Link href="/solutions" className="text-sm text-emerald-200 hover:text-white underline-offset-4 hover:underline inline-block">
            ← All solutions
          </Link>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={v.primaryHref}
              className="inline-flex justify-center items-center rounded-lg px-8 py-4 font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transition-shadow"
            >
              {v.primaryCta}
            </Link>
            <Link
              href={v.secondaryHref}
              className="inline-flex justify-center items-center rounded-lg px-8 py-4 font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              {v.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
