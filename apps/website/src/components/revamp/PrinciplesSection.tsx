'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, BarChart3, Zap } from 'lucide-react';

const principles = [
  {
    title: 'Clarity',
    description: 'Leave with a plan + next steps',
    icon: Target,
  },
  {
    title: 'Evidence',
    description: 'Pipeline shows what\'s working',
    icon: BarChart3,
  },
  {
    title: 'Sustainability',
    description: 'Follow-up runs when you\'re busy',
    icon: Zap,
  },
];

export function PrinciplesSection() {
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
          How We Work
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {principles.map((principle, idx) => {
            const Icon = principle.icon;
            return (
              <motion.div
                key={principle.title}
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
                  <h3 className="text-xl font-bold">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
