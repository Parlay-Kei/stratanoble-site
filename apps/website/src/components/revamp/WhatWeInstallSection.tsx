'use client';

import React from 'react';
import { motion } from 'framer-motion';

const installSteps = [
  { step: 1, title: 'Intake', description: 'Capture every lead automatically' },
  { step: 2, title: 'Qualify', description: 'Score and prioritize by fit' },
  { step: 3, title: 'Follow-up', description: 'Automated nurture sequences' },
  { step: 4, title: 'Track', description: 'Progress visibility dashboard' },
  { step: 5, title: 'Close', description: 'Conversion-focused workflow' },
];

export function WhatWeInstallSection() {
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
          What We Install
        </motion.h2>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 max-w-6xl mx-auto">
          {installSteps.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col items-center text-center relative flex-1"
            >
              <div className="w-16 h-16 md:w-12 md:h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl md:text-lg shadow-lg">
                {step.step}
              </div>
              <h3 className="font-semibold text-lg md:text-base mt-4">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                {step.description}
              </p>

              {/* Arrow connector for desktop */}
              {idx < installSteps.length - 1 && (
                <div className="hidden md:block absolute left-[calc(50%+2rem)] top-6 w-[calc(100%-4rem)] h-0.5 bg-border">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-border border-y-4 border-y-transparent" />
                </div>
              )}

              {/* Arrow connector for mobile */}
              {idx < installSteps.length - 1 && (
                <div className="md:hidden flex items-center justify-center my-4">
                  <div className="w-0.5 h-8 bg-border relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-t-8 border-t-border border-x-4 border-x-transparent" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
