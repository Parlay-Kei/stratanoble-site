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
          title: 'Diagnostic Request Received',
          subtitle: 'We Have What We Need',
          description: "Thanks for sharing your business context. We will review your intake and outline the fastest path to tighten lead capture and follow-up.",
          encouragement: "You made the right move by bringing operational friction into the open. Clear systems beat guesswork every time.",
          nextSteps: [
            {
              icon: <HeartIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'We\'re Reviewing Your Answers',
              description: "Our team is reviewing what you shared to map leak points, priorities, and the best next engagement path.",
              timing: 'Within 24 hours'
            },
            {
              icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'Next-Step Invite',
              description: "You'll receive a clear next step, including any call invite needed to confirm scope and fit.",
              timing: 'Check your inbox soon'
            },
            {
              icon: <LightBulbIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'Scoped Recommendation',
              description: "We will send a focused recommendation tied to your current operational bottlenecks.",
              timing: 'During your session'
            }
          ],
          actions: [
            {
              text: 'Explore Our Services',
              href: '/services',
              primary: true
            }
          ]
        });
        break;

      case 'contact':
        setConfig({
          title: 'Thank You for Reaching Out!',
          subtitle: 'Message Received',
          description: "We've received your message and will route it to the right team member.",
          nextSteps: [
            {
              icon: <EnvelopeIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'Personalized Response',
              description: "Our team will review your note and reply with the right next step for your service needs.",
              timing: 'Within 24 hours'
            },
            {
              icon: <SparklesIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'Diagnostic or Scope Follow-up',
              description: "If needed, we will invite you to a short diagnostic or scoping call to confirm fit.",
              timing: 'In our response'
            }
          ],
          actions: [
            {
              text: 'Start a Free Diagnostic',
              href: '/contact',
              primary: true
            },
            {
              text: 'Learn How We Help',
              href: '/services'
            }
          ]
        });
        break;

      case 'analysis':
        setConfig({
          title: 'Diagnostic Request Confirmed',
          subtitle: 'Review in Progress',
          description: "Thanks for requesting a diagnostic review. We will prepare a practical recommendation based on the issues you flagged.",
          nextSteps: [
            {
              icon: <ChartBarIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'Analysis Preparation',
              description: "Our team will review your information and prepare a scoped diagnostic recommendation.",
              timing: 'Within 2-3 days'
            },
            {
              icon: <EnvelopeIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'Findings Delivery',
              description: "You'll receive findings with a recommended next step and optional follow-up call.",
              timing: 'Via email'
            }
          ],
          actions: [
            {
              text: 'Explore Lead Rescue',
              href: '/lead-rescue',
              primary: true
            },
            {
              text: 'Explore Other Services',
              href: '/services'
            }
          ]
        });
        break;

      default:
        setConfig({
          title: 'Thank You!',
          subtitle: 'We Appreciate You',
          description: "Thank you for your interest in Strata Noble. We install operational systems for service businesses.",
          nextSteps: [
            {
              icon: <RocketLaunchIcon className="h-6 w-6 text-forest-green mt-1 flex-shrink-0" />,
              title: 'Choose Your Next Step',
              description: "Review our engagements and pick the path that fits your current operational priorities.",
              timing: 'Right now'
            }
          ],
          actions: [
            {
              text: 'Start Your Diagnostic',
              href: '/contact',
              primary: true
            },
            {
              text: 'Learn Our Approach',
              href: '/services'
            }
          ]
        });
        break;
    }
  }, [source]);

  return (
    <main className="min-h-screen bg-command-navy pt-20">
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <CheckCircleIcon className="mx-auto h-24 w-24 text-field-sage" />
                <SparklesIcon className="absolute -top-2 -right-2 h-8 w-8 text-field-sage" />
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6"
            >
              {config.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="text-2xl font-semibold text-field-sage mb-6"
            >
              {config.subtitle}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              className="text-lg leading-8 text-gray-300 mb-8"
            >
              {config.description}
            </motion.p>

            {/* Encouragement Section */}
            {config.encouragement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.5 }}
                className="mb-12"
              >
                <div className="bg-forest-green/10 rounded-sm p-8 border border-forest-green/30">
                  <div className="flex items-start space-x-4">
                    <HeartIcon className="h-8 w-8 text-field-sage flex-shrink-0 mt-1" />
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
                transition={{ duration: 0.2, delay: 0.6 }}
                className="mb-12"
              >
                <div className="bg-void border border-slate-grey/30 rounded-sm p-8">
                  <h3 className="text-2xl font-bold text-white mb-8">What Happens Next</h3>
                  <div className="space-y-6">
                    {config.nextSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 * index }}
                        className="flex items-start space-x-4 p-4 bg-command-navy/80 border border-slate-grey/20 rounded-sm"
                      >
                        <div className="bg-command-navy rounded-sm p-2 border border-slate-grey/20">
                          {step.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold">{step.title}</h4>
                            {step.timing && (
                              <span className="text-xs bg-forest-green/20 text-field-sage px-2 py-1 rounded-sm font-mono">
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
                transition={{ duration: 0.2, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                {config.actions.map((action, index) => (
                  <motion.a
                    key={index}
                    href={action.href}
                    {...(action.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className={`px-8 py-4 font-bold rounded-sm transition-opacity duration-200 text-lg flex items-center justify-center ${
                      action.primary
                        ? 'bg-field-sage text-command-navy hover:opacity-90'
                        : 'bg-transparent text-white border-2 border-slate-grey hover:border-forest-green hover:text-field-sage'
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
              transition={{ duration: 0.2, delay: 1.0 }}
              className="pt-8 border-t border-white/20"
            >
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-grey">
                  Questions? We're here to help!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                  <a 
                    href="tel:702-721-3566" 
                    className="text-field-sage hover:text-field-sage transition-colors flex items-center space-x-2"
                  >
                    <span>📞</span>
                    <span>(702) 721-3566</span>
                  </a>
                  <a 
                    href="/contact" 
                    className="text-field-sage hover:text-field-sage transition-colors flex items-center space-x-2"
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

export function ThanksPageClient() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-command-navy pt-20">
        <div className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
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
