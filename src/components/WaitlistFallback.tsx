'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import WaitlistModal from './WaitlistModal';

export default function WaitlistFallback() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-silver-200">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Next Workshop Coming Soon!
          </h2>
          
          <p className="text-lg text-navy-600 mb-8 max-w-2xl mx-auto">
            Our current workshop cohort is full, but we&apos;re planning the next one. 
            Join the waitlist to be the first to know when registration opens.
          </p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="btn-primary btn-lg px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Join the Waitlist
            </motion.button>
            
            <p className="text-sm text-navy-500">
              Get notified when the next workshop opens for registration
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-silver-200">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">
              What You'll Learn
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-navy-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Validate your business idea</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Build your first MVP</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Launch and scale profitably</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <WaitlistModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 