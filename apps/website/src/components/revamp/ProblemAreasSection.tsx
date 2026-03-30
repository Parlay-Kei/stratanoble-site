'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PhoneOff,
  EyeOff,
  TrendingDown,
  Clock,
  KeyRound,
  Unplug,
} from 'lucide-react';

const problems = [
  {
    title: 'Lead Leakage',
    description:
      'Inquiries arrive but nobody follows up within the window. Leads go cold. Revenue walks.',
    Icon: PhoneOff,
  },
  {
    title: 'Pipeline Blindness',
    description:
      'No visibility into where deals stand. The pipeline lives in someone\'s head or a spreadsheet.',
    Icon: EyeOff,
  },
  {
    title: 'Revenue Gaps',
    description:
      'Invoices sent late, payments tracked manually, AR sits in an Excel file. Cash flow surprises.',
    Icon: TrendingDown,
  },
  {
    title: 'Execution Drift',
    description:
      'Work gets done but nobody reviews it. No weekly rhythm, no delivery health check.',
    Icon: Clock,
  },
  {
    title: 'Credential Chaos',
    description:
      'Passwords in Slack threads, API keys in Google Docs, no audit trail on who accessed what.',
    Icon: KeyRound,
  },
  {
    title: 'Tool Sprawl',
    description:
      'Six tools that don\'t talk to each other. Data lives in silos. Every handoff is manual.',
    Icon: Unplug,
  },
];

export function ProblemAreasSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Operational Problems We Solve</h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Service businesses lose revenue to the same handful of operational failures. We install the systems that
            eliminate them.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {problems.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <item.Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-bold text-lg text-navy mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
