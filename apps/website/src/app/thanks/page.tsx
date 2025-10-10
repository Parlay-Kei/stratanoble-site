'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

function ThanksContent() {
  const searchParams = useSearchParams();
  const source = searchParams?.get('src') || 'contact';
  const [config, setConfig] = useState<{
    title: string;
    subtitle: string;
    description: string;
    encouragement?: string;
    nextSteps: Array<{
      icon: React.ReactNode;
      title: string;
      description: string;
      timing?: string;
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
      case 'discovery':
        setConfig({
          title: 'You Did It! 🎉',
          subtitle: 'Your Journey Starts Now',
          description: "Thank you for sharing your story with us. Taking this step shows you're serious about turning your ideas into income - and that's exactly the mindset that leads to success.",
          encouragement: "Every successful entrepreneur started exactly where you are right now. The fact that you completed our discovery process puts you ahead of 90% of people who just think about it.",
          nextSteps: [
            {
              icon: <HeartIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'We\'re Reviewing Your Answers',
              description: "Our team is carefully reviewing what you shared to prepare personalized guidance that fits your specific situation.",
              timing: 'Within 24 hours'
            },
            {
              icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'Personal Call Invitation',
              description: "You'll receive an email with a link to schedule a friendly 30-minute call at a time that works for you.",
              timing: 'Check your inbox soon'
            },
            {
              icon: <LightBulbIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'Customized Action Plan',
              description: "During our call, we'll give you specific next steps based on your passion, situation, and goals.",
              timing: 'During your session'
            }
          ],
          actions: [
            {
              text: 'Explore Our Services',
              href: '/solutions',
              primary: true
            }
          ]
        });
        break;

      case 'contact':
        setConfig({
          title: 'Thank You for Reaching Out!',
          subtitle: 'Message Received',
          description: "We've received your message and appreciate you taking the time to contact us. Your interest in turning ideas into income is exactly what we love to support.",
          nextSteps: [
            {
              icon: <EnvelopeIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'Personalized Response',
              description: "Our team will review your message and get back to you with helpful information tailored to your specific needs.",
              timing: 'Within 24 hours'
            },
            {
              icon: <SparklesIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'Discovery Session Invitation',
              description: "We may invite you to our discovery process to better understand how we can support your entrepreneurial journey.",
              timing: 'In our response'
            }
          ],
          actions: [
            {
              text: 'Take Our Discovery Assessment',
              href: '/discovery',
              primary: true
            },
            {
              text: 'Learn How We Help',
              href: '/solutions'
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
              icon: <ChartBarIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'Analysis Preparation',
              description: "Our team will review your information and prepare a sample analysis based on the pain points you've described.",
              timing: 'Within 2-3 days'
            },
            {
              icon: <EnvelopeIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'Insights Delivery',
              description: "You'll receive your analysis along with an invitation to discuss the findings and next steps.",
              timing: 'Via email'
            }
          ],
          actions: [
            {
              text: 'Learn About Data Analysis',
              href: '/data-analysis',
              primary: true
            },
            {
              text: 'Explore Other Services',
              href: '/solutions'
            }
          ]
        });
        break;

      default:
        setConfig({
          title: 'Thank You!',
          subtitle: 'We Appreciate You',
          description: "Thank you for your interest in Strata Noble. We're here to help everyday people turn their ideas into income.",
          nextSteps: [
            {
              icon: <RocketLaunchIcon className="h-6 w-6 text-emerald-500 mt-1 flex-shrink-0" />,
              title: 'Explore Your Options',
              description: "Take a look at how we support entrepreneurs at every stage of their journey.",
              timing: 'Right now'
            }
          ],
          actions: [
            {
              text: 'Start Your Discovery',
              href: '/discovery',
              primary: true
            },
            {
              text: 'Learn Our Approach',
              href: '/solutions'
            }
          ]
        });
        break;
    }
  }, [source]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 pt-20">
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="relative">
                <CheckCircleIcon className="mx-auto h-24 w-24 text-emerald-400" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <SparklesIcon className="h-8 w-8 text-accent-gold" />
                </motion.div>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6"
            >
              {config.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-semibold text-accent-gold mb-6"
            >
              {config.subtitle}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg leading-8 text-gray-300 mb-8"
            >
              {config.description}
            </motion.p>

            {/* Encouragement Section */}
            {config.encouragement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-12"
              >
                <div className="bg-gradient-to-r from-emerald-500/20 to-accent-gold/20 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/30">
                  <div className="flex items-start space-x-4">
                    <HeartIcon className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white mb-3">You're Already on the Right Path</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {config.encouragement}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Next Steps */}
            {config.nextSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-12"
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-8">What Happens Next</h3>
                  <div className="space-y-6">
                    {config.nextSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                        className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl"
                      >
                        <div className="bg-white/10 rounded-lg p-2">
                          {step.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold">{step.title}</h4>
                            {step.timing && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                                {step.timing}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {config.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                {config.actions.map((action, index) => (
                  <motion.a
                    key={index}
                    href={action.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    {...(action.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className={`px-8 py-4 font-bold rounded-xl transition-all text-lg flex items-center justify-center ${
                      action.primary
                        ? 'bg-gradient-to-r from-accent-gold to-accent-gold/90 text-navy shadow-lg hover:shadow-xl'
                        : 'bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/20'
                    }`}
                  >
                    {action.text}
                  </motion.a>
                ))}
              </motion.div>
            )}

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="pt-8 border-t border-white/20"
            >
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400">
                  Questions? We're here to help!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                  <a 
                    href="tel:702-721-3566" 
                    className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-2"
                  >
                    <span>📞</span>
                    <span>(702) 721-3566</span>
                  </a>
                  <a 
                    href="/contact" 
                    className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-2"
                  >
                    <span>💬</span>
                    <span>Send us a message</span>
                  </a>
                </div>
              </div>
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
      <main className="min-h-screen bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20 pt-20">
        <div className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
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
