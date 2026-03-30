'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LeadLeakCheckForm } from '@/components/forms/LeadLeakCheckForm';

export function LeadLeakCheckSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Find Out Where Your Leads Are Leaking
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Free diagnostic in 48 hours. We'll show you exactly where prospects are falling through the cracks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-void/30 border border-slate-grey/25 rounded-2xl p-8 md:p-12 shadow-sm"
          >
            <LeadLeakCheckForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
