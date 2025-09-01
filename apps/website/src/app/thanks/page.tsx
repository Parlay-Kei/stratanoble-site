'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon, EnvelopeIcon, CalendarIcon, ChatBubbleLeftRightIcon, ChartBarIcon } from '@heroicons/react/24/outline';

function ThanksContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get('src') || 'contact';
  const [config, setConfig] = useState<{
    title: string;
    subtitle: string;
    description: string;
    nextSteps: Array<{
      icon: React.ReactNode;
      title: string;
      description: string;
    }>;
    actions: Array<{
      text: string;
      href: string;
      primary?: boolean;
      external?: boolean;
    }>;
  }>({
    title: 'Thank You!',
    subtitle: 'Message Received',
    description: 'We appreciate you reaching out to us.',
    nextSteps: [],
    actions: []
  });

  useEffect(() => {
    switch (source) {
      case 'contact':
        setConfig({
          title: 'Thank You!',
          subtitle: 'Message Received',
          description: "We've received your message and appreciate you taking the time to contact us.",
          nextSteps: [
            {
              icon: <EnvelopeIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />,
              title: 'Response Timeline',
              description: "Our team will review your inquiry and get back to you within 24 hours during business days."
            },
            {
              icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />,
              title: 'Personalized Response',
              description: "You'll receive a detailed response addressing your specific needs and questions."
            }
          ],
          actions: [
            {
              text: 'Schedule Discovery Call',
              href: '/discovery',
              primary: true
            },
            {
              text: 'Explore Services',
              href: '/services'
            }
          ]
        });
        break;

      case 'analysis':
        setConfig({
          title: 'Analysis Request Confirmed!',
          subtitle: 'Sample Analysis in Progress',
          description: "Thank you for requesting a sample analysis. We're excited to show you how data-driven insights can unlock opportunities for your business.",
          nextSteps: [
            {
              icon: <ChartBarIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />,
              title: 'Analysis Preparation',
              description: "Our team will review your information and prepare a sample analysis based on the pain points you've described."
            },
            {
              icon: <EnvelopeIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />,
              title: 'Delivery Timeline',
              description: "You'll receive your analysis and an invitation to discuss the findings within 2-3 business days."
            }
          ],
          actions: [
            {
              text: 'Learn More About Data Analysis',
              href: '/data-analysis',
              primary: true
            },
            {
              text: 'Explore Other Services',
              href: '/services'
            }
          ]
        });
        break;

      case 'discovery':
        setConfig({
          title: 'Discovery Call Scheduled!',
          subtitle: 'Next Steps Confirmed',
          description: "Your discovery session has been scheduled. We're looking forward to learning about your business and discussing how we can help you achieve your goals.",
          nextSteps: [
            {
              icon: <CalendarIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />,
              title: 'Session Preparation',
              description: "We'll prepare a customized agenda based on your business stage and challenges."
            },
            {
              icon: <EnvelopeIcon className="h-6 w-6 text-[#50C878] mt-1 flex-shrink-0" />,
              title: 'Confirmation Details',
              description: "Check your email for session details and a calendar invitation."
            }
          ],
          actions: [
            {
              text: 'Schedule Your Call',
              href: 'https://calendly.com/stratanoble/discovery',
              primary: true,
              external: true
            },
            {
              text: 'Contact Support',
              href: '/contact'
            }
          ]
        });
        break;

      default:
        // Keep default config
        break;
    }
  }, [source]);

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
              {config.title}
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-semibold text-[#50C878] mb-4"
            >
              {config.subtitle}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg leading-8 text-[#C0C0C0] mb-8"
            >
              {config.description}
            </motion.p>

            {config.nextSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">What Happens Next</h3>
                  <div className="space-y-4">
                    {config.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        {step.icon}
                        <div>
                          <h4 className="text-white font-semibold">{step.title}</h4>
                          <p className="text-[#C0C0C0] text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {config.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {config.actions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    {...(action.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className={`px-8 py-3 font-medium rounded-lg transition-colors flex items-center justify-center ${
                      action.primary
                        ? 'bg-[#50C878] hover:bg-[#3DB067] text-white'
                        : 'bg-transparent hover:bg-white/10 text-white border border-white/30'
                    }`}
                  >
                    {action.text}
                  </a>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-12 pt-8 border-t border-white/20"
            >
              <p className="text-sm text-[#C0C0C0]">
                Need immediate assistance? Call us at{' '}
                <a href="tel:702-721-3566" className="text-[#50C878] hover:text-[#3DB067]">
                  (702) 721-3566
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ThanksPage() {
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
      <ThanksContent />
    </Suspense>
  );
}
