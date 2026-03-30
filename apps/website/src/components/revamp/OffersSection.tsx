'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const offers = [
  {
    name: 'Lead Rescue',
    description: 'Stop the leak, ship receipts, 48 hours',
    poweredBy: ['Q-ICMS', 'Q-CC'],
    href: '/lead-rescue',
    cta: 'Start Lead Rescue',
  },
  {
    name: 'Revenue Control',
    description: 'AR cleanup, invoice tracking, payment visibility',
    poweredBy: ['Q-ARI'],
    href: '/contact',
    cta: 'Get Started',
  },
  {
    name: 'Operations Visibility',
    description: 'Executive dashboard, weekly review rhythm',
    poweredBy: ['Q-CC'],
    href: '/contact',
    cta: 'Get Started',
  },
  {
    name: 'Secure Infrastructure',
    description: 'Credential governance, audit trails',
    poweredBy: ['Q-VAULT'],
    href: '/contact',
    cta: 'Get Started',
  },
];

export function OffersSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12"
        >
          What We Deploy
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {offers.map((offer, idx) => (
            <motion.div
              key={offer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <h3 className="text-primary font-bold text-lg mb-2">{offer.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                {offer.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {offer.poweredBy.map((mod) => (
                  <span
                    key={mod}
                    className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
                  >
                    {mod}
                  </span>
                ))}
              </div>
              <Link
                href={offer.href}
                className="text-primary font-semibold text-sm hover:underline"
              >
                {offer.cta} &rarr;
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
