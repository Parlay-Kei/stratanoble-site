'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface StepData {
  passion?: string;
  stage?: string;
  challenge?: string;
  timeCommitment?: string;
  successGoal?: string;
  name?: string;
  email?: string;
  support?: string;
}

export default function DiscoveryPage() {
  const showPricing = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<StepData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 7;

  const updateStepData = (key: keyof StepData, value: string) => {
    setStepData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Convert stepData to match your existing API format
      const formData = {
        name: stepData.name || '',
        email: stepData.email || '',
        businessStage: stepData.stage || '',
        mainChallenge: `${stepData.challenge} - Time available: ${stepData.timeCommitment} - Success goal: ${stepData.successGoal} - Passion area: ${stepData.passion}`,
        interestedTier: stepData.support || '',
      };

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'discovery',
          ...formData,
        }),
      });

      const result: unknown = await response.json();
      const errorMsg = (typeof result === 'object' && result !== null && 'error' in result && typeof (result as { error?: string }).error === 'string') ? (result as { error: string }).error : '';

      if (!response.ok) {
        throw new Error(errorMsg || 'Failed to submit form');
      }

      router.push('/thanks?src=discovery');
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'There was an error submitting your form. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: return !!stepData.passion;
      case 2: return !!stepData.stage;
      case 3: return !!stepData.challenge;
      case 4: return !!stepData.timeCommitment;
      case 5: return !!stepData.successGoal;
      case 6: return !!stepData.name && !!stepData.email;
      case 7: return !!stepData.support;
      default: return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  const steps = [
    {
      id: 1,
      title: "What energizes you?",
      subtitle: "Let's start with what you naturally enjoy",
      icon: HeartIcon,
      color: "from-pink-500 to-rose-500"
    },
    {
      id: 2,
      title: "Where are you now?",
      subtitle: "Every journey has a starting point",
      icon: RocketLaunchIcon,
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 3,
      title: "What's challenging you?",
      subtitle: "Let's identify what's holding you back",
      icon: LightBulbIcon,
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 4,
      title: "How much time do you have?",
      subtitle: "Realistic expectations lead to real results",
      icon: ClockIcon,
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: 5,
      title: "What does success look like?",
      subtitle: "Your definition of success guides everything",
      icon: CurrencyDollarIcon,
      color: "from-purple-500 to-violet-500"
    },
    {
      id: 6,
      title: "Let's connect",
      subtitle: "So we can personalize your experience",
      icon: UserGroupIcon,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 7,
      title: "How can we support you?",
      subtitle: "Choose what feels right for your situation",
      icon: SparklesIcon,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Think about what you do that makes time fly by. What do people come to you for advice about?
              </p>
            </div>
            <textarea
              value={stepData.passion || ''}
              onChange={(e) => updateStepData('passion', e.target.value)}
              placeholder="I love helping people with... or I'm passionate about... or I'm really good at..."
              rows={4}
              className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg resize-none"
              autoFocus
            />
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
              <p className="text-pink-700 text-sm">
                💡 <strong>Tip:</strong> Don't overthink this. Even "I'm good at organizing" or "I love cooking" can become income streams.
              </p>
            </div>
          </div>
        );

      case 2:
        const stageOptions = [
          {
            value: 'idea',
            title: 'Just an idea',
            description: 'I have thoughts but haven\'t started yet',
            icon: '💭',
            encouragement: 'Perfect starting point!'
          },
          {
            value: 'early',
            title: 'Taking first steps',
            description: 'I\'ve started but it\'s still early days',
            icon: '🌱',
            encouragement: 'You\'re ahead of most people!'
          },
          {
            value: 'established',
            title: 'Have something going',
            description: 'I have an established business or side income',
            icon: '🚀',
            encouragement: 'Ready to scale up!'
          }
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Where are you in your entrepreneurial journey right now?
              </p>
            </div>
            <div className="grid gap-4">
              {stageOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => updateStepData('stage', option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 border-2 rounded-2xl text-left transition-all ${
                    stepData.stage === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{option.title}</h3>
                      <p className="text-gray-600">{option.description}</p>
                      {stepData.stage === option.value && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-blue-600 font-medium mt-2"
                        >
                          ✨ {option.encouragement}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 3:
        const challengeOptions = [
          'I don\'t know where to start',
          'No one will want to buy what I offer',
          'I don\'t have enough time',
          'I\'m not qualified or expert enough',
          'I don\'t know how to find customers',
          'I\'m afraid of looking foolish',
          'I don\'t know how to price my services',
          'I\'m overwhelmed by all the advice out there'
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                What's your biggest challenge or fear right now? (Choose the one that resonates most)
              </p>
            </div>
            <div className="grid gap-3">
              {challengeOptions.map((challenge) => (
                <motion.button
                  key={challenge}
                  onClick={() => updateStepData('challenge', challenge)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    stepData.challenge === challenge
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      stepData.challenge === challenge ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                    }`}>
                      {stepData.challenge === challenge && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-700">{challenge}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-700 text-sm">
                🤗 <strong>Remember:</strong> Every successful entrepreneur has felt exactly the same way. These challenges are normal and solvable.
              </p>
            </div>
          </div>
        );

      case 4:
        const timeOptions = [
          {
            value: '2-3 hours',
            title: '2-3 hours per week',
            description: 'I have limited time but want to make progress',
            realistic: 'Perfect for testing and building confidence'
          },
          {
            value: '4-6 hours',
            title: '4-6 hours per week',
            description: 'I can dedicate regular time to this',
            realistic: 'Great for building momentum and seeing results'
          },
          {
            value: '7-10 hours',
            title: '7-10 hours per week',
            description: 'I\'m ready to prioritize this seriously',
            realistic: 'Excellent for rapid progress and growth'
          },
          {
            value: '10+ hours',
            title: 'More than 10 hours per week',
            description: 'This is a major focus for me right now',
            realistic: 'Amazing potential for quick transformation'
          }
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                How much time can you realistically dedicate per week? (Be honest - consistency beats big chunks)
              </p>
            </div>
            <div className="grid gap-4">
              {timeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => updateStepData('timeCommitment', option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 border-2 rounded-2xl text-left transition-all ${
                    stepData.timeCommitment === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900">{option.title}</h3>
                    <p className="text-gray-600">{option.description}</p>
                    {stepData.timeCommitment === option.value && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-emerald-600 font-medium"
                      >
                        ✅ {option.realistic}
                      </motion.p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 5:
        const successOptions = [
          {
            value: 'extra-income',
            title: 'Extra $500-1000/month',
            description: 'Supplement my current income',
            icon: '💰'
          },
          {
            value: 'replace-income',
            title: 'Replace my full-time income',
            description: 'Eventually work for myself',
            icon: '🏆'
          },
          {
            value: 'prove-possible',
            title: 'Just prove it\'s possible',
            description: 'Show myself I can do this',
            icon: '✨'
          },
          {
            value: 'help-others',
            title: 'Help people I care about',
            description: 'Make a meaningful impact',
            icon: '❤️'
          },
          {
            value: 'build-legacy',
            title: 'Build something lasting',
            description: 'Create a business I can be proud of',
            icon: '🌟'
          },
          {
            value: 'freedom',
            title: 'Have more freedom',
            description: 'Control my time and choices',
            icon: '🦋'
          }
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                What would success look like for you? (Choose what resonates most deeply)
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {successOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => updateStepData('successGoal', option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 border-2 rounded-2xl text-left transition-all ${
                    stepData.successGoal === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{option.title}</h3>
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Let's personalize your experience and keep you updated on your progress
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={stepData.name || ''}
                  onChange={(e) => updateStepData('name', e.target.value)}
                  placeholder="Your first name"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-lg"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={stepData.email || ''}
                  onChange={(e) => updateStepData('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  We'll send you personalized resources and updates. No spam, ever.
                </p>
              </div>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <p className="text-cyan-700 text-sm">
                🔒 <strong>Privacy first:</strong> Your information is secure and will never be shared with anyone.
              </p>
            </div>
          </div>
        );

      case 7:
        const supportOptions = [
          {
            value: 'none',
            title: 'Free Discovery Session Only',
            description: 'I just want to explore my options right now',
            price: 'Free',
            features: ['30-minute personalized call', 'Custom action plan', 'Resource recommendations']
          },
          {
            value: 'starter',
            title: 'Starter Support',
            description: 'Perfect for testing ideas and building confidence',
            price: showPricing ? '$47/month' : 'Starting level',
            features: ['All discovery benefits', 'Monthly group calls', 'Basic tools & templates', 'Email support']
          },
          {
            value: 'growth',
            title: 'Growth Support',
            description: 'Ready to turn your passion into consistent income',
            price: showPricing ? '$97/month' : 'Growth level',
            features: ['Everything in Starter', '1:1 monthly calls', 'Advanced tools', 'Priority support'],
            popular: true
          },
          {
            value: 'success',
            title: 'Success Support',
            description: 'Comprehensive support for scaling your business',
            price: showPricing ? '$197/month' : 'Success level',
            features: ['Everything in Growth', 'Weekly 1:1 calls', 'Done-for-you templates', 'Direct access']
          }
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Based on what you've shared, here's how we can support your journey:
              </p>
            </div>
            <div className="space-y-4">
              {supportOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => updateStepData('support', option.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-6 border-2 rounded-2xl text-left transition-all relative ${
                    stepData.support === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {option.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{option.title}</h3>
                        <p className="text-gray-600">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-indigo-600">{option.price}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-indigo-700 text-sm">
                💬 <strong>Not sure?</strong> We'll discuss what makes sense for your specific situation during our call. You can always start with the free discovery session.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex items-center mt-4 space-x-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  step.id === currentStep ? 'text-blue-600' : 
                  step.id < currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.id === currentStep ? 'bg-blue-100' :
                  step.id < currentStep ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium">{step.title.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
          >
            {/* Step Header */}
            <div className="text-center mb-12">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${steps[currentStep - 1].color} mb-6`}>
                {React.createElement(steps[currentStep - 1].icon, { className: "h-8 w-8 text-white" })}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-lg text-gray-600">
                {steps[currentStep - 1].subtitle}
              </p>
            </div>

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <motion.button
                onClick={prevStep}
                disabled={currentStep === 1}
                whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
                whileTap={currentStep > 1 ? { scale: 0.95 } : {}}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back</span>
              </motion.button>

              {currentStep < totalSteps ? (
                <motion.button
                  onClick={nextStep}
                  disabled={!canProceed}
                  whileHover={canProceed ? { scale: 1.05 } : {}}
                  whileTap={canProceed ? { scale: 0.95 } : {}}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                    canProceed
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  whileHover={canProceed && !isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={canProceed && !isSubmitting ? { scale: 0.95 } : {}}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                    canProceed && !isSubmitting
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Get My Discovery Session</span>
                      <RocketLaunchIcon className="h-5 w-5" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}