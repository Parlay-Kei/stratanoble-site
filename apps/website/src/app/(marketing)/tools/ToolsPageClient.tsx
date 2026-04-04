'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const liveTools = [
  {
    name: 'Deployment Verification',
    tagline: 'Documented proof that the work was done right',
    description:
      'Every engagement includes a verification pack — documented evidence that your system was built, tested, and delivered as specified. No guesswork. No "trust me." Receipts.',
    featuresLabel: "What\u0027s in the verification pack",
    features: [
      'System build verification',
      'Flow testing results',
      'Deployment confirmation',
      'Complete handoff documentation',
    ],
    included:
      'Lead Rescue includes a receipt pack. Pipeline Buildout includes the full verification suite.',
    accent: true,
  },
  {
    name: 'Secure Delivery Folder',
    tagline: 'Every credential, asset, and document — secured and handed off',
    description:
      'All deliverables from your engagement — credentials, configurations, video walkthroughs, documentation — stored in a private folder you control. You own it. Access is governed and audit-trailed.',
    featuresLabel: "What\u0027s in your delivery folder",
    features: [
      'Private asset storage',
      'Governed credential access',
      'Video walkthroughs of your system',
      'Complete handoff package',
    ],
    included: 'Every engagement includes a secure delivery folder with all deliverables.',
    accent: true,
  },
];

const inDevTool = {
  name: 'ACHIEVERY',
  badge: 'In Development',
  tagline: 'Operator scorecard for service businesses',
  description:
    'A web and mobile experience within the Strata Noble ecosystem — track daily progress, pipeline health, and team execution in one view. Built for operators who want to see what moved, what stalled, and what needs attention — without digging through a pile of dashboards.',
  features: [
    'Daily progress tracking',
    'Pipeline health scoring',
    'Team execution visibility',
    'Milestone and alert system',
  ],
  included: 'Early access included with Pipeline Buildout engagements.',
};

export function ToolsPageClient() {
  return (
    <main className="min-h-screen bg-void/30">
      <section className="bg-command-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
          >
            What Ships With Every Engagement
          </motion.h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            These aren&apos;t add-ons. They&apos;re how we prove the work, secure the handoff, and give you visibility
            into your operation.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-command-navy text-center mb-10">Delivery Standards</h2>
          <div className="space-y-8">
            {liveTools.map((tool, idx) => (
              <motion.article
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-grey/25 rounded-xl shadow-sm overflow-hidden ring-1 ring-forest-green/15"
              >
                <div className="h-1 bg-forest-green" />
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-command-navy">{tool.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wide bg-field-sage/15 text-forest-green px-2.5 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-primary font-medium">{tool.tagline}</p>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{tool.description}</p>
                  <h4 className="text-sm font-semibold text-command-navy mt-8 mb-3">{tool.featuresLabel}</h4>
                  <ul className="space-y-2">
                    {tool.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-forest-green shrink-0 mt-0.5" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-6 pt-6 border-t border-slate-grey/20">{tool.included}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="text-command-navy font-medium leading-relaxed">
            All delivery tools are powered by Q Suite — the same business tools we use to run Strata Noble.
          </p>
          <Link href="/services" className="inline-block mt-4 text-primary font-semibold text-sm hover:underline">
            See our solutions →
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-command-navy text-center mb-4">In Development</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            We build tools as we need them. These are next on the roadmap.
          </p>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-void/30 border border-dashed border-slate-grey/30 rounded-xl p-8"
          >
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-command-navy">{inDevTool.name}</h3>
              <span className="text-xs font-semibold uppercase tracking-wide bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
                {inDevTool.badge}
              </span>
            </div>
            <p className="text-gray-800 font-medium">{inDevTool.tagline}</p>
            <p className="text-muted-foreground mt-4 leading-relaxed">{inDevTool.description}</p>
            <h4 className="text-sm font-semibold text-command-navy mt-8 mb-3">What it will include</h4>
            <ul className="space-y-2">
              {inDevTool.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-slate-grey shrink-0 mt-0.5" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-6 pt-6 border-t border-slate-grey/25">{inDevTool.included}</p>
          </motion.article>
        </div>
      </section>

      <section className="bg-command-navy py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to see how we deliver?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Every engagement includes deployment verification and a secure delivery folder. Start with the 48-Hour Lead Rescue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lead-rescue"
              className="bg-forest-green text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-shadow inline-block"
            >
              Start the 48-Hour Lead Rescue
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
