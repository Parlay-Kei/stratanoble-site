'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Note: Metadata export doesn't work with 'use client', handle via layout or remove animations
// For now, keeping animations as priority - metadata can be added via layout if needed

const resources = [
  {
    id: 'discovery-scorecard',
    title: 'Discovery Call Scorecard',
    description: 'Rate your discovery calls and identify gaps in your qualification process.',
    format: 'PDF',
    gated: false,
    downloadUrl: '/downloads/discovery-call-scorecard.pdf',
  },
  {
    id: 'follow-up-sequence',
    title: 'Follow-up Email Sequence',
    description: 'Three proven emails to nurture leads without being pushy.',
    format: '3 Emails',
    gated: true, // requires email
  },
  {
    id: 'pipeline-template',
    title: 'Pipeline Tracking Template',
    description: 'Notion or Airtable template to track every lead from first touch to close.',
    format: 'Template',
    gated: false,
    downloadUrl: 'https://notion.so/template-link',
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Gradient */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Resources
            </h1>
            <p className="text-xl text-gray-300 mt-6 leading-relaxed">
              Free tools to help you stop losing leads and start closing more deals.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {resources.map((resource, index) => (
            <ResourceCard key={resource.id} {...resource} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <section className="text-center mt-16 py-12 bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 rounded-xl max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white">Want More Than Templates?</h2>
            <p className="text-gray-300 mt-2 max-w-xl mx-auto">
              Get a complete lead-to-customer pipeline installed in 48 hours, or apply for our full Phase 3 buildout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/lead-rescue"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-cream text-navy font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get the 48-Hour Lead Rescue
              </Link>
              <Link
                href="/phase-3"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-accent-gold text-accent-gold font-semibold rounded-lg hover:bg-accent-gold/10 transition-all duration-300"
              >
                Apply for Phase 3
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function ResourceCard({ title, description, format, gated, downloadUrl, id, index }: typeof resources[0] & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border rounded-xl p-6 flex flex-col bg-white shadow-md hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300"
    >
      <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md self-start">
        {format}
      </span>
      <h3 className="text-lg font-semibold mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 flex-grow">{description}</p>

      {gated ? (
        <ResourceGateForm resourceId={id} />
      ) : (
        <a
          href={downloadUrl}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          download
        >
          Download Free
        </a>
      )}
    </motion.div>
  );
}

function ResourceGateForm({ resourceId }: { resourceId: string }) {
  // Simple email gate - submits to /api/intake/resource-download
  return (
    <form className="mt-4 space-y-2">
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Get Access
      </button>
    </form>
  );
}
