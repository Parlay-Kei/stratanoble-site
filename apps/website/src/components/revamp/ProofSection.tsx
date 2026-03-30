'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, Users, Receipt } from 'lucide-react';

const proofItems = [
  {
    icon: CalendarCheck,
    title: 'Operating rhythm',
    description: 'Weekly executive review run through Q-CC using real business data',
  },
  {
    icon: Users,
    title: 'Client visibility',
    description: 'Active clients and engagements managed in Q-ICMS with full lifecycle tracking',
  },
  {
    icon: Receipt,
    title: 'Revenue control',
    description: 'Every invoice tracked in Q-ARI with corresponding communications log',
  },
];

export function ProofSection() {
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
          Proof, Not Promises
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {proofItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Every pipeline install includes ProofLoop receipts and ANX Vault delivery.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:gap-4 transition-all group"
          >
            See What You Get
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
