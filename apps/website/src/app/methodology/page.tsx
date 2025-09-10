import React from 'react';
import { Metadata } from 'next';
import {
  HeartIcon,
  LightBulbIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  CursorArrowRaysIcon,
  TrophyIcon,
  StarIcon,
  HandRaisedIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Approach | Strata Noble - Turn Your Ideas Into Income',
  description: 'Discover our supportive 4-step approach that helps everyday entrepreneurs transform their ideas into income through Listen, Analyze, Plan, and Execute.',
  keywords: 'entrepreneurship approach, business support, idea validation, supportive consulting, everyday entrepreneurs',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <HeartIcon className="h-5 w-5" />
              Supportive Entrepreneurship Approach
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              From{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Ideas to Income
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A gentle, supportive approach that helps everyday entrepreneurs turn their 
              passions into profitable businesses without the overwhelm or intimidation.
            </p>
          </div>

          {/* Success Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Success Stories', value: '200+', icon: StarIcon, color: 'emerald' },
              { label: 'Average Growth', value: '300%', icon: ChartBarIcon, color: 'blue' },
              { label: 'Client Satisfaction', value: '98%', icon: HeartIcon, color: 'purple' },
              { label: 'Ideas Launched', value: '150+', icon: RocketLaunchIcon, color: 'amber' }
            ].map((metric, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50">
                <metric.icon className={`h-8 w-8 text-${metric.color}-600 mx-auto mb-3`} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why We're Different
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Entrepreneurship doesn't have to be overwhelming. We believe in meeting you where you are 
              and walking alongside you every step of the way.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mb-20">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <HeartIcon className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Human-First Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                We start with understanding you as a person, not just your business idea. 
                Your dreams, fears, and goals matter to us because they shape how we help you succeed.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <HandRaisedIcon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Intimidation Zone</h3>
              <p className="text-gray-600 leading-relaxed">
                Forget jargon and complex frameworks. We speak your language and break everything 
                down into clear, manageable steps that feel achievable, not overwhelming.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <SparklesIcon className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Success, Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                We're not here to impress you with how smart we are. We're here to help you 
                feel confident, supported, and excited about turning your ideas into income.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Supportive 4-Step Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A gentle journey from where you are now to where you want to be
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                step: 'Step 1',
                title: 'Listen',
                subtitle: 'We hear your vision',
                color: 'emerald',
                icon: EyeIcon,
                description: 'We start by really listening to you. What\'s your dream? What\'s holding you back? What success looks like to you? This isn\'t a sales call - it\'s about understanding your unique situation.',
                whatWeAsk: [
                  'What inspired this idea?',
                  'What does success mean to you?',
                  'What worries you most?',
                  'What resources do you have?'
                ],
                outcome: 'A clear picture of your goals and challenges'
              },
              {
                step: 'Step 2', 
                title: 'Analyze',
                subtitle: 'We explore possibilities',
                color: 'blue',
                icon: MagnifyingGlassIcon,
                description: 'Together, we dig into your idea and explore what\'s possible. We look at the market, identify opportunities, and uncover the potential you might not even see yet.',
                whatWeAsk: [
                  'Who needs what you offer?',
                  'What makes you different?',
                  'Where are the quick wins?',
                  'What\'s your competitive advantage?'
                ],
                outcome: 'A clear understanding of your opportunity'
              },
              {
                step: 'Step 3',
                title: 'Plan',
                subtitle: 'We map your path',
                color: 'purple',
                icon: DocumentTextIcon,
                description: 'We create a simple, clear roadmap that feels manageable. No 50-page business plans - just practical steps that move you forward without overwhelming you.',
                whatWeAsk: [
                  'What should you do first?',
                  'How do we test your idea cheaply?',
                  'What resources do you need?',
                  'How do we measure progress?'
                ],
                outcome: 'A clear, actionable roadmap forward'
              },
              {
                step: 'Step 4',
                title: 'Execute',
                subtitle: 'We support your journey',
                color: 'amber',
                icon: PlayIcon,
                description: 'We don\'t just hand you a plan and disappear. We stay with you as you take action, celebrate your wins, help you overcome obstacles, and adjust course when needed.',
                whatWeAsk: [
                  'How can we help you today?',
                  'What\'s working well?',
                  'Where are you stuck?',
                  'What do you need to move forward?'
                ],
                outcome: 'Real progress toward your income goals'
              }
            ].map((phase, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className={`bg-gradient-to-r from-${phase.color}-500 to-${phase.color}-600 p-6 text-white`}>
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 rounded-xl p-3 mr-4">
                      <phase.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold opacity-90">{phase.step}</div>
                      <h3 className="text-xl font-bold">{phase.title}</h3>
                      <div className="text-sm opacity-90">{phase.subtitle}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {phase.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Questions We Explore</h4>
                    <div className="space-y-2">
                      {phase.whatWeAsk.map((question, qIndex) => (
                        <div key={qIndex} className="flex items-start text-sm text-gray-600">
                          <div className={`w-1.5 h-1.5 bg-${phase.color}-600 rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                          {question}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`bg-${phase.color}-50 rounded-xl p-4 border border-${phase.color}-200`}>
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className={`h-4 w-4 text-${phase.color}-600 mr-2`} />
                      <span className={`text-${phase.color}-800 font-semibold text-sm`}>You'll Have</span>
                    </div>
                    <p className={`text-${phase.color}-700 text-sm`}>{phase.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Support You'll Receive */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Real Support You'll Receive
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We don't just give advice - we provide practical tools and ongoing support
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Practical Tools & Resources</h3>
              <div className="space-y-6">
                {[
                  {
                    tool: 'First Dollar Validator',
                    description: 'Simple framework to test if people will actually pay for your idea',
                    benefit: 'Validate your idea without big investment',
                    color: 'emerald'
                  },
                  {
                    tool: 'Progress Tracker',
                    description: 'Visual dashboard to track your milestones and celebrate wins',
                    benefit: 'Stay motivated and see your progress',
                    color: 'blue'
                  },
                  {
                    tool: 'Simple Business Canvas',
                    description: 'One-page business model that makes sense to real people',
                    benefit: 'Clarity without complexity',
                    color: 'purple'
                  },
                  {
                    tool: 'Revenue Roadmap',
                    description: 'Step-by-step path to your first $1,000 in revenue',
                    benefit: 'Clear next steps toward income',
                    color: 'amber'
                  }
                ].map((tool, index) => (
                  <div key={index} className={`bg-${tool.color}-50 rounded-2xl p-6 border border-${tool.color}-200`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold text-${tool.color}-900`}>{tool.tool}</h4>
                      <span className={`bg-${tool.color}-100 text-${tool.color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>
                        Tool
                      </span>
                    </div>
                    <p className={`text-${tool.color}-700 text-sm mb-3`}>{tool.description}</p>
                    <div className="flex items-center">
                      <SparklesIcon className={`h-4 w-4 text-${tool.color}-600 mr-2`} />
                      <span className={`text-${tool.color}-800 text-sm font-medium`}>{tool.benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Ongoing Support & Guidance</h3>
              <div className="space-y-6">
                {[
                  {
                    support: 'Weekly Check-ins',
                    description: 'Regular conversations to see how you\'re doing and where you need help',
                    icon: UserGroupIcon,
                    color: 'emerald'
                  },
                  {
                    support: 'Quick Question Support',
                    description: 'Text or email when you\'re stuck and need a quick answer or encouragement',
                    icon: CursorArrowRaysIcon,
                    color: 'blue'
                  },
                  {
                    support: 'Obstacle Problem-Solving',
                    description: 'When you hit a wall, we work together to find a way forward',
                    icon: LightBulbIcon,
                    color: 'purple'
                  },
                  {
                    support: 'Celebration & Encouragement',
                    description: 'Someone to share your wins with and encourage you through tough times',
                    icon: TrophyIcon,
                    color: 'amber'
                  }
                ].map((support, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className={`bg-${support.color}-100 rounded-xl p-3 mr-4`}>
                        <support.icon className={`h-6 w-6 text-${support.color}-600`} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{support.support}</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{support.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Makes Our Approach Different
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We've learned what actually works for everyday entrepreneurs
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-emerald-900 rounded-3xl p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-bold text-emerald-300 mb-8">Traditional Business Advice</h3>
                <div className="space-y-4">
                  {[
                    'Write a comprehensive business plan',
                    'Raise capital before you start',
                    'Think big from day one',
                    'Complex financial projections',
                    'Intimidating industry jargon',
                    'One-size-fits-all frameworks'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-red-300">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                      <span className="line-through opacity-75">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-blue-300 mb-8">The Strata Noble Way</h3>
                <div className="space-y-4">
                  {[
                    'Start with what you have right now',
                    'Test your idea with real customers first',
                    'Focus on your first dollar of revenue',
                    'Simple, clear next steps',
                    'Plain language and real support',
                    'Customized approach for your situation'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-emerald-300">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-emerald-600/30">
              <h4 className="text-xl font-bold text-emerald-200 mb-4">The Result?</h4>
              <p className="text-gray-300 max-w-4xl mx-auto text-lg">
                You feel <strong className="text-white">confident and supported</strong> instead of overwhelmed and confused. 
                You make <strong className="text-white">real progress</strong> instead of getting stuck in planning. 
                You start <strong className="text-white">earning income</strong> instead of just dreaming about it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real People, Real Results
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everyday entrepreneurs just like you who turned their ideas into income
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah',
                business: 'Handmade Jewelry',
                result: '$3,200/month',
                quote: 'I went from being scared to start to making my first sale in just 3 weeks.',
                color: 'emerald'
              },
              {
                name: 'Mike',
                business: 'Local Consulting',
                result: '$5,000/month',
                quote: 'The support made all the difference. I finally felt like someone believed in me.',
                color: 'blue'
              },
              {
                name: 'Lisa',
                business: 'Online Courses',
                result: '$8,500/month',
                quote: 'They helped me see opportunities I never would have found on my own.',
                color: 'purple'
              }
            ].map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
                <div className={`w-16 h-16 bg-${story.color}-100 rounded-full mx-auto mb-6 flex items-center justify-center`}>
                  <span className={`text-${story.color}-600 font-bold text-xl`}>{story.name[0]}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{story.name}</h4>
                <p className="text-gray-600 mb-2">{story.business}</p>
                <div className={`text-2xl font-bold text-${story.color}-600 mb-4`}>{story.result}</div>
                <p className="text-gray-700 italic">"{story.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-300 to-emerald-200 bg-clip-text text-transparent">
              Ready to Turn Your Ideas Into Income?
            </span>
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Let's start with a simple conversation about your ideas and see how we can help you move forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:bg-emerald-50 transition-colors inline-flex items-center justify-center"
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Start Our Conversation
            </Link>
            <Link 
              href="/platform"
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-emerald-600 transition-colors inline-flex items-center justify-center"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Explore Our Tools
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-emerald-500/30">
            <p className="text-emerald-200 text-sm">
              No high-pressure sales. No overwhelming complexity. Just real support for real people with real dreams.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}