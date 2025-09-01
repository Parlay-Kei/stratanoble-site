'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // Send kickoff email
      fetch('/api/stripe/kickoff-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setEmailSent(true);
          }
        })
        .catch((_error) => {
          // console.error('Error sending kickoff email:', _error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244] pt-20">
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <CheckCircleIcon className="mx-auto h-24 w-24 text-[#50C878]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg leading-8 text-[#C0C0C0] mb-8"
            >
              Thank you for choosing Strata Noble! Your Solution Services package has been confirmed.
            </motion.p>

            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#50C878]"></div>
                  <span className="text-white">Setting up your kickoff...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-6"
              >
                {/* Next Steps */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">What Happens Next</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <EnvelopeIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-white font-semibold">Kickoff Email</h3>
                        <p className="text-[#C0C0C0] text-sm">
                          {emailSent 
                            ? "We've sent you a detailed kickoff email with next steps and resources."
                            : "You'll receive a detailed kickoff email within the next hour."
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <CalendarIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-white font-semibold">Discovery Call</h3>
                        <p className="text-[#C0C0C0] text-sm">
                          Schedule your first strategy session within the next 48 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://calendly.com/stratanoble/discovery"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-[#50C878] hover:bg-[#3DB067] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    Schedule Discovery Call
                  </a>
                  <a
                    href="/contact"
                    className="px-8 py-3 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg border border-white/30 transition-colors flex items-center justify-center"
                  >
                    Contact Support
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244] pt-20">
        <div className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#50C878]"></div>
                <span className="text-white text-lg">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
