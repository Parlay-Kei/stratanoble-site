'use client';

import React from 'react';
import { motion } from 'framer-motion';
interface CaseStudy {
  clientType: string;
  industry: string;
  problem: string;
  fix: string;
  result: string;
  timeline: string;
  modulesUsed: string[];
}

/* CASE STUDY: Constructed from delivery model — replace with real client data when available */
const caseStudies: CaseStudy[] = [
  {
    clientType: 'Home Service Operator',
    industry: 'HVAC / Plumbing',
    problem:
      'Getting 40+ leads/month from Google Ads but closing less than 15%. No follow-up system. Office manager tracking leads in a notebook. Calls going to voicemail after hours.',
    fix:
      'Installed Q-ICMS for lead capture and pipeline tracking. Set up speed-to-lead routing with Q-CC calling infrastructure. Built follow-up sequence for every inquiry.',
    result:
      'Follow-up response time dropped from 6+ hours to under 15 minutes. Close rate increased. Pipeline visible for the first time.',
    timeline: '21 days (Pipeline Buildout)',
    modulesUsed: ['Q-ICMS', 'Q-CC'],
  },
  {
    clientType: 'Consulting / Professional Services',
    industry: 'Advisory firm',
    problem:
      'Managing 12 active clients across spreadsheets and email. Invoices sent manually, sometimes weeks late. No visibility into which clients were current, overdue, or at risk.',
    fix:
      'Installed Q-ICMS for client lifecycle tracking and engagement management. Deployed Q-ARI for invoice tracking and AR dashboard. Weekly review rhythm established via Q-CC.',
    result:
      'AR visibility went from zero to real-time. Late invoicing eliminated. Weekly operating rhythm established.',
    timeline: '21 days (Pipeline Buildout)',
    modulesUsed: ['Q-ICMS', 'Q-ARI', 'Q-CC'],
  },
  {
    clientType: 'Real Estate Team',
    industry: '4-person buyer/seller team',
    problem:
      'Lead sources across 3 platforms, no central pipeline. Team members using personal phones with no call logging. Credentials for MLS, CRM, and marketing tools scattered across text threads.',
    fix:
      '48-Hour Lead Rescue to centralize intake, followed by Q-VAULT deployment for credential governance. Pipeline consolidated into Q-ICMS.',
    result:
      'All leads funneled to single intake. Credential access audit-trailed. Team pipeline visible to lead agent for first time.',
    timeline: '48 hours (Lead Rescue) + 2 weeks',
    modulesUsed: ['Q-ICMS', 'Q-VAULT', 'Q-CC'],
  },
];

export function CaseStudySection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* CASE STUDY: Constructed from delivery model — replace with real client data when available */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">What This Looks Like in Practice</h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Real operational problems. Real system installs. Real results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {caseStudies.map((cs, idx) => (
            <motion.article
              key={cs.clientType}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white border border-gray-200 border-t-4 border-t-primary rounded-xl p-6 shadow-sm flex flex-col"
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded">
                  {cs.clientType}
                </span>
                <span className="text-xs text-muted-foreground">{cs.industry}</span>
              </div>
              <span className="inline-flex w-fit text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full mb-4">
                {cs.timeline}
              </span>
              <div className="space-y-4 flex-1 text-sm">
                <div>
                  <p className="font-semibold text-navy mb-1">Problem</p>
                  <p className="text-muted-foreground leading-relaxed">{cs.problem}</p>
                </div>
                <div>
                  <p className="font-semibold text-navy mb-1">Fix</p>
                  <p className="text-muted-foreground leading-relaxed">{cs.fix}</p>
                </div>
                <div>
                  <p className="font-semibold text-navy mb-1">Result</p>
                  <p className="text-muted-foreground leading-relaxed">{cs.result}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-gray-100">
                {cs.modulesUsed.map((mod) => (
                  <span
                    key={mod}
                    className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
