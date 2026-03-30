'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, DollarSign, Shield } from 'lucide-react';

const modules = [
  {
    icon: LayoutDashboard,
    label: 'Q-CC',
    name: 'Command Center',
    description: 'Executive visibility, weekly review, activity feed',
  },
  {
    icon: Users,
    label: 'Q-ICMS',
    name: 'Client Operations',
    description: 'Lead pipeline, engagement lifecycle, touchpoints',
  },
  {
    icon: DollarSign,
    label: 'Q-ARI',
    name: 'Revenue Intelligence',
    description: 'Invoices, AR tracking, payment status, comms log',
  },
  {
    icon: Shield,
    label: 'Q-VAULT',
    name: 'Secure Storage',
    description: 'Credentials, API keys, audit trails, access governance',
  },
];

export function QSuiteSection() {
  return (
    <section id="q-suite" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left column — intro */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Built on Q Suite
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Strata Noble runs its own operations on Q Suite — the same modular
              system we configure and deploy for clients. This isn&apos;t a demo.
              It&apos;s our actual operating environment.
            </p>
            <p className="text-sm text-muted-foreground/70 italic">
              Strata Noble is transitioning its own operations onto the same Q Suite
              framework used in client delivery.
            </p>
            <Link href="/platform" className="inline-block text-sm text-primary font-semibold hover:underline">
              How Q Suite fits together →
            </Link>
          </motion.div>

          {/* Right column — module cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-primary font-bold text-lg">{mod.label}</span>
                  </div>
                  <p className="font-medium text-sm mb-1">{mod.name}</p>
                  <p className="text-muted-foreground text-sm">{mod.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
