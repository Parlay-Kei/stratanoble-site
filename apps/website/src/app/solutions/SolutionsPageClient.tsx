'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Workflow,
  Users,
  Wallet,
  Shield,
  LayoutDashboard,
  Check,
} from 'lucide-react';

import { CaseStudySection } from '@/components/revamp/CaseStudySection';

const solutions = [
  {
    name: 'Lead Flow Control',
    problem:
      'Leads arrive but nobody follows up in time. Prospects go cold. Revenue walks.',
    installed: [
      'Intake capture',
      'Speed-to-lead routing',
      'Follow-up sequences',
      'Pipeline dashboard',
    ],
    modules: ['Q-ICMS', 'Q-CC'],
    cta: 'Start with Lead Rescue',
    href: '/lead-rescue',
    emphasize: true,
    Icon: Workflow,
  },
  {
    name: 'Client Operations Control',
    problem:
      'Client work is tracked in spreadsheets, Slack threads, and memory. No lifecycle visibility.',
    installed: [
      'Client lifecycle tracking',
      'Engagement management',
      'Touchpoint logging',
      'Status dashboards',
    ],
    modules: ['Q-ICMS'],
    cta: 'Get Started',
    href: '/contact',
    emphasize: false,
    Icon: Users,
  },
  {
    name: 'Receivables Control',
    problem:
      'Invoices sent late, payments tracked manually, AR lives in Excel. Cash flow surprises every month.',
    installed: [
      'Invoice tracking',
      'Payment status monitoring',
      'AR dashboard',
      'Communications log',
    ],
    modules: ['Q-ARI'],
    cta: 'Get Started',
    href: '/contact',
    emphasize: false,
    Icon: Wallet,
  },
  {
    name: 'Secure Business Operations',
    problem:
      'Passwords in Slack, API keys in Google Docs, no audit trail on who has access to what.',
    installed: [
      'Credential governance',
      'Access controls',
      'Audit trails',
      'Secure handoff vault',
    ],
    modules: ['Q-VAULT'],
    cta: 'Get Started',
    href: '/contact',
    emphasize: false,
    Icon: Shield,
  },
  {
    name: 'Executive Visibility',
    problem:
      'The owner is the only person who knows what is going on. No weekly review rhythm, no operational dashboard.',
    installed: [
      'Executive dashboard',
      'Weekly review cadence',
      'Activity feeds',
      'Delivery health metrics',
    ],
    modules: ['Q-CC'],
    cta: 'Get Started',
    href: '/contact',
    emphasize: false,
    Icon: LayoutDashboard,
    fullWidth: true,
  },
];

const deliverySteps = [
  { step: 1, title: 'Discovery', description: 'Scope and friction map' },
  { step: 2, title: 'Implementation', description: 'Install and wire systems' },
  { step: 3, title: 'Handoff', description: 'Docs, training, proof pack' },
  { step: 4, title: 'Optional support', description: 'Rhythm and tuning' },
];

export function SolutionsPageClient() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/40 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold text-navy"
          >
            Operational Control Systems for Service Businesses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-lg text-muted-foreground mt-6 leading-relaxed"
          >
            Every engagement delivers a specific operational outcome. Scoped, installed, and handed off.
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {solutions
            .filter((s) => !s.fullWidth)
            .map((sol, idx) => (
              <motion.article
                key={sol.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className={`rounded-xl p-8 bg-white border shadow-sm flex flex-col ${
                  sol.emphasize ? 'border-2 border-primary ring-2 ring-primary/15' : 'border-gray-200'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <sol.Icon className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-navy">{sol.name}</h2>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{sol.problem}</p>
                <p className="text-sm font-semibold text-navy mt-6 mb-2">What gets installed</p>
                <ul className="space-y-2 text-sm text-muted-foreground flex-1">
                  {sol.installed.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {sol.modules.map((mod) => (
                    <span
                      key={mod}
                      className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
                <Link
                  href={sol.href}
                  className={`mt-6 inline-flex font-semibold text-sm ${
                    sol.emphasize ? 'text-primary hover:underline' : 'text-primary hover:underline'
                  }`}
                >
                  {sol.cta} &rarr;
                </Link>
              </motion.article>
            ))}
        </div>

        {solutions
          .filter((s) => s.fullWidth)
          .map((sol) => (
            <motion.article
              key={sol.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto mt-8 rounded-xl p-8 bg-white border border-gray-200 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <sol.Icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-navy">{sol.name}</h2>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-3xl">{sol.problem}</p>
                  <p className="text-sm font-semibold text-navy mt-6 mb-2">What gets installed</p>
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {sol.installed.map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5 mt-6">
                    {sol.modules.map((mod) => (
                      <span
                        key={mod}
                        className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                  <Link href={sol.href} className="mt-6 inline-flex font-semibold text-sm text-primary hover:underline">
                    {sol.cta} &rarr;
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-navy mb-3">By industry</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl mx-auto">
            Same operating framework — written for how you actually run the business.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Link
              href="/solutions/consultants"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-primary hover:text-primary transition-colors"
            >
              Consultants &amp; agencies
            </Link>
            <Link
              href="/solutions/home-services"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-primary hover:text-primary transition-colors"
            >
              Home services
            </Link>
            <Link
              href="/solutions/real-estate"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-primary hover:text-primary transition-colors"
            >
              Real estate teams
            </Link>
            <Link
              href="/solutions/appointment-businesses"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-primary hover:text-primary transition-colors"
            >
              Appointment businesses
            </Link>
          </div>
        </div>
      </section>

      <CaseStudySection />

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How Delivery Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
            {deliverySteps.map((s, idx) => (
              <div key={s.step} className="flex flex-col items-center text-center relative flex-1 w-full">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold mt-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[180px]">{s.description}</p>
                {idx < deliverySteps.length - 1 && (
                  <div className="hidden md:block absolute left-[calc(50%+1.5rem)] top-6 w-[calc(100%-3rem)] h-0.5 bg-border">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-border border-y-4 border-y-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/how-it-works" className="text-primary font-semibold text-sm hover:underline">
              See the full delivery model →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-xl border border-gray-200 bg-white p-10 shadow-sm"
        >
          <h2 className="text-2xl md:text-3xl font-bold">Start Where It Hurts Most</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/lead-rescue"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-lg transition-shadow"
            >
              48-Hour Lead Rescue — $997
            </Link>
            <Link
              href="/pipeline-buildout"
              className="inline-flex justify-center items-center rounded-lg px-6 py-3 text-sm font-semibold border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors"
            >
              21-Day Pipeline Buildout — $4,997
            </Link>
          </div>
          <p className="text-muted-foreground mt-6">
            Not sure which?{' '}
            <Link href="/contact" className="text-primary font-semibold hover:underline">
              Talk to us
            </Link>
            .
          </p>
        </motion.div>
      </section>
    </div>
  );
}
