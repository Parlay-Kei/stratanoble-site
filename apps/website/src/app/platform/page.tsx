import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  TrophyIcon,
  UserGroupIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Platform | Strata Noble - Your CaaS Toolkit',
  description: 'Consulting-as-a-Service platform with guided diagnostics, achievement tracking, playbooks, dashboards, and expert support for entrepreneurs.',
  keywords: 'CaaS platform, business consulting platform, ACHIEVERY, diagnostic wizard, business playbooks',
};

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Consulting-as-a-Service{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Everything you need to turn your ideas into income. Guided assessments, 
            achievement tracking, expert playbooks, and real-time dashboards—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/discovery" 
              className="btn-primary btn-lg"
            >
              Start Your Free Assessment
            </Link>
            <Link 
              href="/solutions" 
              className="btn-secondary btn-lg"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Components Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Six Tools to Build Your Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each component works together to guide you from idea to income, 
              with clarity and confidence every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Diagnostic Wizard */}
            <PlatformFeatureCard
              icon={<SparklesIcon className="h-8 w-8 text-purple-600" />}
              title="Diagnostic Wizard"
              description="Discover your starting point with our guided assessment. Import your data, get instant insights, and receive your personalized roadmap."
              features={[
                'Guided questionnaire',
                'Data import & analysis',
                'Priority roadmap generation',
                'Baseline KPI dashboard'
              ]}
              cta="Start Assessment"
              ctaHref="/discovery"
              color="purple"
            />

            {/* ACHIEVERY */}
            <PlatformFeatureCard
              icon={<TrophyIcon className="h-8 w-8 text-emerald-600" />}
              title="ACHIEVERY"
              description="Track your wins and build momentum. AI-powered achievement tracking transforms daily actions into professional progress."
              features={[
                'Daily action logging',
                'AI reframing engine',
                'Progress visualization',
                'Weekly narrative summaries'
              ]}
              cta="Track Your Wins"
              ctaHref="/achievery-preview"
              color="emerald"
              badge="Featured"
            />

            {/* Playbook Library */}
            <PlatformFeatureCard
              icon={<DocumentTextIcon className="h-8 w-8 text-blue-600" />}
              title="Playbook Library"
              description="Step-by-step guidance for every business challenge. Modular SOPs with task templates and integrated documentation."
              features={[
                'Marketing playbooks',
                'Operations guides',
                'Finance templates',
                'Progress tracking'
              ]}
              cta="Browse Playbooks"
              ctaHref="/platform#playbooks"
              color="blue"
            />

            {/* KPI Dashboard */}
            <PlatformFeatureCard
              icon={<ChartBarIcon className="h-8 w-8 text-amber-600" />}
              title="KPI Dashboard"
              description="See your progress clearly with real-time metrics. Revenue, conversion, cost per lead, and burn rate—all in one view."
              features={[
                'Real-time metrics',
                'Peer benchmarking',
                'Anomaly alerts',
                'Custom reports'
              ]}
              cta="View Dashboard"
              ctaHref="/dashboard"
              color="amber"
            />

            {/* Expert Hub */}
            <PlatformFeatureCard
              icon={<UserGroupIcon className="h-8 w-8 text-rose-600" />}
              title="Expert Hub"
              description="Get support when you need it. Book sessions with vetted consultants, access in-app messaging, and join the community."
              features={[
                'On-demand sessions',
                'Vetted consultants',
                'In-app messaging',
                'Slack community'
              ]}
              cta="Connect with Experts"
              ctaHref="/schedule"
              color="rose"
            />

            {/* Workflow Builder */}
            <PlatformFeatureCard
              icon={<CogIcon className="h-8 w-8 text-indigo-600" />}
              title="Workflow Builder"
              description="Automate what matters with no-code workflows. Connect your tools, set triggers, and let the platform handle the rest."
              features={[
                'No-code automation',
                'Zapier integration',
                'Custom triggers',
                'External webhooks'
              ]}
              cta="Build Workflows"
              ctaHref="/platform#workflows"
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How the Platform Works
            </h2>
            <p className="text-lg text-gray-600">
              Four simple steps from idea to income
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Start with Assessment',
                description: 'Take the Diagnostic Wizard to understand where you are and where you want to go. Get your personalized roadmap in minutes.',
                color: 'purple'
              },
              {
                step: '02',
                title: 'Track Your Progress',
                description: 'Log daily actions in ACHIEVERY. Watch AI transform ordinary activities into professional achievements that build momentum.',
                color: 'emerald'
              },
              {
                step: '03',
                title: 'Follow Your Playbook',
                description: 'Execute step-by-step guides for marketing, operations, and finance. Track tasks and check off milestones as you progress.',
                color: 'blue'
              },
              {
                step: '04',
                title: 'Monitor & Optimize',
                description: 'Watch your KPIs in real-time dashboards. Get expert support when needed. Automate workflows as you scale.',
                color: 'amber'
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-${item.color}-100 text-${item.color}-700 flex items-center justify-center font-bold text-2xl`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-lg text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your Business?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Start with a free assessment and discover your path to prosperity.
          </p>
          <Link 
            href="/discovery" 
            className="inline-block bg-white text-emerald-600 font-bold py-4 px-10 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Start Your Free Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}

// Platform Feature Card Component
interface PlatformFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  color: string;
  badge?: string;
}

function PlatformFeatureCard({ 
  icon, 
  title, 
  description, 
  features, 
  cta, 
  ctaHref, 
  color,
  badge 
}: PlatformFeatureCardProps) {
  return (
    <div className={`relative bg-white rounded-3xl p-8 border border-${color}-200 hover:border-${color}-300 transition-all duration-300 hover:shadow-xl`}>
      {badge && (
        <span className={`absolute top-4 right-4 bg-${color}-100 text-${color}-700 px-3 py-1 rounded-full text-xs font-bold`}>
          {badge}
        </span>
      )}
      <div className={`bg-${color}-100 rounded-2xl p-4 inline-block mb-4`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className={`h-5 w-5 text-${color}-600 mt-0.5 mr-2 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Link 
        href={ctaHref}
        className={`block text-center bg-${color}-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-${color}-700 transition-colors`}
      >
        {cta}
      </Link>
    </div>
  );
}
