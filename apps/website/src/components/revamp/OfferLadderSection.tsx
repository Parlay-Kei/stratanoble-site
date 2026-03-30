'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: '48-Hour Lead Rescue',
    price: '$997',
    tagline: 'Stop the leak. Get receipts.',
    description:
      'We audit your lead flow, plug the biggest gaps, and deliver proof of the fix — all within 48 hours.',
    includes: [
      'Lead flow audit',
      'Intake capture fix',
      'Follow-up sequence',
      'ProofLoop receipt pack',
    ],
    cta: 'Start Lead Rescue',
    href: '/lead-rescue',
    badge: null as string | null,
    emphasized: false,
    tentative: false,
  },
  {
    name: '21-Day Pipeline Buildout',
    price: 'Starting at $4,997',
    tagline: 'Full operational system install.',
    description:
      'Complete pipeline infrastructure: intake, CRM, automations, dashboards, and training. You own it. We hand it off.',
    includes: [
      'Custom CRM setup',
      'Email sequences',
      '2 automation workflows',
      'Milestone dashboard',
      'Documentation & training',
    ],
    cta: 'Apply for the Buildout',
    href: '/pipeline-buildout',
    badge: 'Recommended',
    emphasized: true,
    tentative: false,
  },
  {
    name: 'Ongoing Operating Support',
    price: 'Custom',
    tagline: 'Keep the rhythm. Keep the visibility.',
    description:
      'For businesses that want continued operational partnership after the buildout. Weekly reviews, system tuning, and executive visibility — maintained for you.',
    includes: [
      'Weekly executive review',
      'System monitoring',
      'Ongoing configuration',
      'Priority support',
    ],
    cta: 'Contact Us',
    href: '/contact',
    badge: 'Coming Soon',
    emphasized: false,
    tentative: true,
  },
];

export function OfferLadderSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12"
        >
          How to Work With Us
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`relative flex flex-col rounded-xl p-8 bg-white shadow-sm ${
                tier.emphasized
                  ? 'border-2 border-primary shadow-lg md:-translate-y-1'
                  : tier.tentative
                    ? 'border border-dashed border-gray-300 bg-gray-50/80'
                    : 'border border-gray-200'
              }`}
            >
              {tier.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                    tier.emphasized ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tier.badge}
                </span>
              )}
              <p className="text-3xl font-bold text-navy mt-2">{tier.price}</p>
              <h3 className="text-xl font-bold text-primary mt-2">{tier.name}</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">{tier.tagline}</p>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed flex-1">{tier.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {tier.includes.map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`mt-8 inline-flex justify-center items-center rounded-lg px-4 py-3 text-sm font-semibold text-center transition-colors ${
                  tier.emphasized
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-2 border-navy text-navy hover:bg-navy hover:text-white'
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
