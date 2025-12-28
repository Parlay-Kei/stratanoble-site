'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Note: Metadata export doesn't work with 'use client', handle via layout or remove animations
// For now, keeping animations as priority - metadata can be added via layout if needed

const projects = [
  {
    id: 'data-solutions-lv',
    title: 'Data Solutions LV',
    description: 'Voice AI cold calling system with OpenAI Realtime API integration.',
    demonstrates: 'AI voice automation, lead qualification, Twilio integration',
    status: 'Live' as const,
    link: null, // or URL
  },
  {
    id: 'pipeline-install-1',
    title: 'Service Business Pipeline',
    description: 'End-to-end lead capture and follow-up system for a local services company.',
    demonstrates: 'CRM setup, email automation, progress tracking',
    status: 'Complete' as const,
    link: null,
  },
  // Add more projects as needed
];

export default function StudioPage() {
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
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full"
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
              Studio
            </h1>
            <p className="text-xl text-gray-300 mt-6 leading-relaxed">
              Systems we've built. Problems we've solved. Real results for real businesses.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Trust Indicators */}
        <section className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-emerald-400">48hr</div>
              <p className="text-sm text-gray-600 mt-2">Average Lead Rescue Delivery</p>
            </div>
            <div className="bg-gradient-to-br from-accent-gold/10 via-accent-gold/5 to-transparent border border-accent-gold/20 rounded-xl p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent">
                100%
              </div>
              <p className="text-sm text-gray-600 mt-2">Client Satisfaction Rate</p>
            </div>
            <div className="bg-gradient-to-br from-navy/10 via-navy/5 to-transparent border border-navy/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-navy">21d</div>
              <p className="text-sm text-gray-600 mt-2">Phase 3 Buildout Timeline</p>
            </div>
          </motion.div>
        </section>

        {/* Projects Grid */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} {...project} index={index} />
            ))}
          </div>
        </section>

        {/* Expertise Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-muted/30 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Our Expertise</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Systems We Build</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    Lead capture and intake systems
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    Follow-up automation sequences
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    CRM implementation and optimization
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    Progress tracking dashboards
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Technologies We Use</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    OpenAI API for AI automation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    Twilio for voice and SMS
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    Popular CRM platforms
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    Custom integrations and workflows
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="text-center mt-16 py-12 bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 rounded-xl max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white">Want to Be Next?</h2>
            <p className="text-gray-300 mt-2 max-w-xl mx-auto">
              Let's build your lead-to-customer pipeline. Start with a quick rescue or apply for the full buildout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/lead-rescue"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-cream text-navy font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start with Lead Rescue
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

function ProjectCard({ title, description, demonstrates, status, link, index }: typeof projects[0] & { index: number }) {
  const statusStyles = {
    'Live': 'bg-green-100 text-green-800',
    'Complete': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border rounded-xl p-6 bg-white shadow-md hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100'}`}>
          {status}
        </span>
      </div>
      <p className="text-muted-foreground">{description}</p>
      <div className="mt-4 pt-4 border-t">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Demonstrates
        </span>
        <p className="text-sm mt-1">{demonstrates}</p>
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-emerald-600 font-medium hover:text-emerald-700 hover:underline"
        >
          View Project →
        </a>
      ) : (
        <span className="mt-4 inline-block text-muted-foreground text-sm">
          Case study coming soon
        </span>
      )}
    </motion.div>
  );
}
