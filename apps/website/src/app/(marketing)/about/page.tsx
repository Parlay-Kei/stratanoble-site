'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Note: Metadata export doesn't work with 'use client', handle via layout or remove animations
// For now, keeping animations as priority - metadata can be added via layout if needed

export default function AboutPage() {
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
              About Strata Noble
            </h1>
            <p className="text-xl text-gray-300 mt-6 leading-relaxed">
              We build lead-to-customer pipelines for service businesses. No fluff. Just systems that work.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <section className="max-w-3xl mx-auto space-y-16">
          {/* What We Build */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold mb-4">What We Build</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Lead-to-customer pipelines. We install intake systems, follow-up automation,
              and progress tracking for service businesses. No branding. No websites.
              Just the infrastructure that turns leads into customers.
            </p>
          </motion.div>

          {/* Social Proof - Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 text-center py-8"
          >
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-emerald-400">48hrs</div>
              <p className="text-sm text-gray-600 mt-2">Lead Rescue Delivery</p>
            </div>
            <div className="bg-gradient-to-br from-accent-gold/10 via-accent-gold/5 to-transparent border border-accent-gold/20 rounded-xl p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-accent-gold to-accent-cream bg-clip-text text-transparent">
                21 days
              </div>
              <p className="text-sm text-gray-600 mt-2">Full Pipeline Buildout</p>
            </div>
            <div className="bg-gradient-to-br from-navy/10 via-navy/5 to-transparent border border-navy/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-navy">100%</div>
              <p className="text-sm text-gray-600 mt-2">Custom Solutions</p>
            </div>
          </motion.div>

          {/* Who We Serve */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold mb-6">Who We Serve</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <span className="text-emerald-500 text-2xl flex-shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-lg">Service businesses with leads but no system</h3>
                  <p className="text-muted-foreground mt-1">
                    You're getting inquiries but losing them in the follow-up chaos.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <span className="text-emerald-500 text-2xl flex-shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-lg">Operators who know they're losing deals in follow-up</h3>
                  <p className="text-muted-foreground mt-1">
                    You can feel the revenue slipping through the cracks.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <span className="text-emerald-500 text-2xl flex-shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-lg">Teams ready for process, not just more leads</h3>
                  <p className="text-muted-foreground mt-1">
                    You need infrastructure before you scale marketing.
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* How We Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold mb-6">How We Work</h2>
            <div className="grid gap-6">
              <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 rounded-lg p-6">
                <h3 className="font-semibold text-xl mb-2">1. Scoped Engagements</h3>
                <p className="text-muted-foreground">
                  48-hour rescues or 21-day buildouts. Clear deliverables, fixed timelines.
                  No ongoing retainers or vague commitments.
                </p>
              </div>
              <div className="bg-gradient-to-r from-accent-gold/10 to-transparent border-l-4 border-accent-gold rounded-lg p-6">
                <h3 className="font-semibold text-xl mb-2">2. Manual-First</h3>
                <p className="text-muted-foreground">
                  We build with proven tools today. Automation layer ships later.
                  You get a working system now, not promises.
                </p>
              </div>
              <div className="bg-gradient-to-r from-navy/10 to-transparent border-l-4 border-navy rounded-lg p-6">
                <h3 className="font-semibold text-xl mb-2">3. Built in Public</h3>
                <p className="text-muted-foreground">
                  Track our platform development. Early clients get priority migration
                  to the unified automation platform when it ships.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social Proof - Testimonial-style Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 rounded-xl p-8 text-center"
          >
            <div className="text-accent-gold text-5xl mb-4">"</div>
            <p className="text-lg text-white italic leading-relaxed">
              Built by operators who understand the pain of losing leads.
              Designed for businesses that need systems, not just more marketing.
            </p>
            <div className="mt-6 text-gray-300">
              <p className="font-semibold">The Strata Noble Approach</p>
              <p className="text-sm">Infrastructure First, Automation Later</p>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl"
          >
            <h2 className="text-3xl font-bold">Ready to Stop Losing Leads?</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Start with a 48-hour rescue or apply for the full buildout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/lead-rescue"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-cream text-navy font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get the Lead Rescue
              </Link>
              <Link
                href="/phase-3"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-600/10 transition-all duration-300"
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
