import React from 'next';
import { Metadata } from 'next';
import {
  AcademicCapIcon,
  RocketLaunchIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CodeBracketIcon,
  BeakerIcon,
  CloudIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  CpuChipIcon,
  DocumentTextIcon,
  TrophyIcon,
  StarIcon,
  BoltIcon,
  GlobeAltIcon,
  ServerIcon,
  ArrowTrendingUpIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Development Methodology | Strata Noble - Enterprise Development Practices',
  description: 'Discover our proven enterprise development methodology featuring agile practices, AI automation, quality assurance, and professional standards that deliver premium results.',
  keywords: 'development methodology, enterprise practices, agile development, AI automation, quality assurance, professional standards',
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
              <AcademicCapIcon className="h-5 w-5" />
              Enterprise Development Methodology
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Standards
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Agile practices enhanced with AI automation for rapid, reliable delivery 
              of enterprise-grade platforms that command premium valuations.
            </p>
          </div>

          {/* Methodology Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Quality Score', value: '100%', icon: StarIcon, color: 'emerald' },
              { label: 'Security Grade', value: '95/100', icon: ShieldCheckIcon, color: 'blue' },
              { label: 'Test Coverage', value: '95%+', icon: BeakerIcon, color: 'purple' },
              { label: 'Automation Rate', value: '85%', icon: CogIcon, color: 'amber' }
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

      {/* Development Philosophy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Development Philosophy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every line of code, every architectural decision, and every process is designed 
              to create enterprise-grade platforms that attract strategic buyers.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mb-20">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <TrophyIcon className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Excellence First</h3>
              <p className="text-gray-600 leading-relaxed">
                We don't compromise on quality. Every project is built to enterprise standards 
                with comprehensive documentation, rigorous testing, and professional code practices 
                that exceed industry benchmarks.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <RocketLaunchIcon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Strategic Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                Every platform is architected with acquisition in mind. We build scalable, 
                well-documented systems that strategic buyers recognize as valuable assets 
                worth premium investments.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CpuChipIcon className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Enhanced</h3>
              <p className="text-gray-600 leading-relaxed">
                Our Suite of Agents methodology leverages AI automation throughout the development 
                lifecycle, ensuring consistent quality while accelerating delivery timelines 
                without compromising standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Phase Development Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              6-Phase Development Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A systematic approach that ensures consistent delivery of enterprise-grade platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                phase: 'Phase 1',
                title: 'Strategic Planning',
                duration: '2-3 weeks',
                color: 'emerald',
                icon: DocumentTextIcon,
                activities: [
                  'Business requirements analysis',
                  'Technical architecture design',
                  'AI agent workflow planning',
                  'Risk assessment & mitigation'
                ],
                deliverables: [
                  'Technical specification document',
                  'Architecture diagrams',
                  'Development roadmap',
                  'Quality assurance plan'
                ]
              },
              {
                phase: 'Phase 2',
                title: 'Foundation Development',
                duration: '3-4 weeks',
                color: 'blue',
                icon: CodeBracketIcon,
                activities: [
                  'Core architecture implementation',
                  'Database schema creation',
                  'Authentication system setup',
                  'Security framework integration'
                ],
                deliverables: [
                  'Development environment',
                  'Core platform foundation',
                  'Security implementation',
                  'CI/CD pipeline setup'
                ]
              },
              {
                phase: 'Phase 3',
                title: 'Feature Development',
                duration: '4-6 weeks',
                color: 'purple',
                icon: CogIcon,
                activities: [
                  'Business logic implementation',
                  'API endpoint development',
                  'Frontend component creation',
                  'Integration layer building'
                ],
                deliverables: [
                  'Feature implementations',
                  'API documentation',
                  'Component library',
                  'Integration tests'
                ]
              },
              {
                phase: 'Phase 4',
                title: 'Quality Assurance',
                duration: '2-3 weeks',
                color: 'amber',
                icon: BeakerIcon,
                activities: [
                  'Comprehensive testing suite',
                  'Performance optimization',
                  'Security audit & testing',
                  'User acceptance testing'
                ],
                deliverables: [
                  'Test coverage report',
                  'Performance benchmarks',
                  'Security audit results',
                  'Bug fixes & improvements'
                ]
              },
              {
                phase: 'Phase 5',
                title: 'AI Integration',
                duration: '3-4 weeks',
                color: 'red',
                icon: CpuChipIcon,
                activities: [
                  'Suite of Agents implementation',
                  'Workflow automation setup',
                  'AI model integration',
                  'Intelligent monitoring deployment'
                ],
                deliverables: [
                  'AI agent workflows',
                  'Automation systems',
                  'Monitoring dashboards',
                  'Intelligence features'
                ]
              },
              {
                phase: 'Phase 6',
                title: 'Deployment & Optimization',
                duration: '2-3 weeks',
                color: 'indigo',
                icon: CloudIcon,
                activities: [
                  'Production environment setup',
                  'Performance monitoring',
                  'Documentation finalization',
                  'Team training & handover'
                ],
                deliverables: [
                  'Production deployment',
                  'Monitoring systems',
                  'Complete documentation',
                  'Team knowledge transfer'
                ]
              }
            ].map((phase, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className={`bg-${phase.color}-600 rounded-xl p-3 mr-4`}>
                    <phase.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className={`text-${phase.color}-600 font-semibold text-sm`}>{phase.phase}</div>
                    <h3 className="text-xl font-bold text-gray-900">{phase.title}</h3>
                    <div className="text-sm text-gray-600">{phase.duration}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Activities</h4>
                  <div className="space-y-2">
                    {phase.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 bg-${phase.color}-600 rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Deliverables</h4>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, delIndex) => (
                      <div key={delIndex} className="flex items-start text-sm text-gray-600">
                        <CheckBadgeIcon className={`h-4 w-4 text-${phase.color}-600 mt-0.5 mr-2 flex-shrink-0`} />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Quality Standards
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional standards that exceed industry benchmarks and ensure investment-grade deliverables
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Code Excellence Standards</h3>
              <div className="space-y-6">
                {[
                  {
                    standard: 'TypeScript Compliance',
                    requirement: '100% type safety with strict configuration',
                    status: 'Enforced',
                    color: 'emerald'
                  },
                  {
                    standard: 'ESLint Quality',
                    requirement: 'Zero warnings with professional rule set',
                    status: 'Automated',
                    color: 'blue'
                  },
                  {
                    standard: 'Code Documentation',
                    requirement: 'Comprehensive comments and API documentation',
                    status: 'Complete',
                    color: 'purple'
                  },
                  {
                    standard: 'Performance Optimization',
                    requirement: 'Core Web Vitals excellence (LCP < 2.5s)',
                    status: 'Validated',
                    color: 'amber'
                  }
                ].map((standard, index) => (
                  <div key={index} className={`bg-${standard.color}-50 rounded-2xl p-6 border border-${standard.color}-200`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold text-${standard.color}-900`}>{standard.standard}</h4>
                      <span className={`bg-${standard.color}-100 text-${standard.color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>
                        {standard.status}
                      </span>
                    </div>
                    <p className={`text-${standard.color}-700 text-sm`}>{standard.requirement}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Security & Testing Standards</h3>
              <div className="space-y-6">
                {[
                  {
                    standard: 'Security Framework',
                    requirement: 'Multi-layer protection with OWASP compliance',
                    score: '95/100',
                    color: 'red'
                  },
                  {
                    standard: 'Test Coverage',
                    requirement: 'Comprehensive unit, integration, and E2E testing',
                    score: '95%+',
                    color: 'emerald'
                  },
                  {
                    standard: 'Accessibility',
                    requirement: 'WCAG 2.1 AA compliance with screen reader support',
                    score: 'AA Compliant',
                    color: 'blue'
                  },
                  {
                    standard: 'Performance Monitoring',
                    requirement: 'Real-time monitoring with automated alerts',
                    score: 'Active',
                    color: 'purple'
                  }
                ].map((standard, index) => (
                  <div key={index} className={`bg-${standard.color}-50 rounded-2xl p-6 border border-${standard.color}-200`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold text-${standard.color}-900`}>{standard.standard}</h4>
                      <span className={`bg-${standard.color}-100 text-${standard.color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>
                        {standard.score}
                      </span>
                    </div>
                    <p className={`text-${standard.color}-700 text-sm`}>{standard.requirement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Excellence */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Technology Stack
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Carefully selected technologies that ensure scalability, security, and long-term maintainability
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {[
              {
                category: 'Frontend Excellence',
                icon: GlobeAltIcon,
                color: 'emerald',
                technologies: [
                  {
                    name: 'Next.js 15.3.5',
                    description: 'React framework with App Router, Server Components, and advanced caching',
                    justification: 'Industry-leading performance and developer experience'
                  },
                  {
                    name: 'TypeScript 5.8.3',
                    description: 'Strict type safety with comprehensive configuration',
                    justification: 'Eliminates runtime errors and improves code maintainability'
                  },
                  {
                    name: 'Tailwind CSS',
                    description: 'Utility-first styling with custom design system',
                    justification: 'Consistent UI with minimal CSS bundle size'
                  },
                  {
                    name: 'shadcn/ui + Radix',
                    description: 'Accessible component library with primitives',
                    justification: 'Enterprise-grade accessibility and component reusability'
                  }
                ]
              },
              {
                category: 'Backend Infrastructure',
                icon: ServerIcon,
                color: 'blue',
                technologies: [
                  {
                    name: 'Supabase Edge Functions',
                    description: 'Serverless backend with global edge distribution',
                    justification: 'Scalable architecture with built-in security features'
                  },
                  {
                    name: 'PostgreSQL 15',
                    description: 'Enterprise database with Row-Level Security',
                    justification: 'ACID compliance with advanced security policies'
                  },
                  {
                    name: 'Stripe Integration',
                    description: 'Complete payment processing and subscription management',
                    justification: 'Industry-standard payment processing with fraud protection'
                  },
                  {
                    name: 'AWS SES',
                    description: 'Transactional email with high deliverability rates',
                    justification: 'Reliable email delivery with comprehensive analytics'
                  }
                ]
              },
              {
                category: 'Quality Assurance',
                icon: BeakerIcon,
                color: 'purple',
                technologies: [
                  {
                    name: 'Jest + Playwright',
                    description: 'Comprehensive testing framework with E2E coverage',
                    justification: 'Reliable testing across all browser environments'
                  },
                  {
                    name: 'ESLint + Prettier',
                    description: 'Automated code quality and formatting enforcement',
                    justification: 'Consistent code style with professional standards'
                  },
                  {
                    name: 'GitHub Actions',
                    description: 'Automated CI/CD with quality gates and deployment',
                    justification: 'Streamlined deployment with automated quality checks'
                  },
                  {
                    name: 'Sentry Monitoring',
                    description: 'Real-time error tracking and performance monitoring',
                    justification: 'Proactive issue detection with comprehensive analytics'
                  }
                ]
              },
              {
                category: 'Security & Compliance',
                icon: ShieldCheckIcon,
                color: 'red',
                technologies: [
                  {
                    name: 'Multi-layer Security',
                    description: 'XSS protection, CSRF tokens, CSP headers, input validation',
                    justification: 'Comprehensive protection against common vulnerabilities'
                  },
                  {
                    name: 'JWT + RLS',
                    description: 'JSON Web Tokens with Row-Level Security policies',
                    justification: 'Secure authentication with granular data access control'
                  },
                  {
                    name: 'Encrypted Storage',
                    description: 'AES-256 encryption for sensitive data at rest',
                    justification: 'Enterprise-grade data protection standards'
                  },
                  {
                    name: 'Audit Logging',
                    description: 'Comprehensive audit trails for all system activities',
                    justification: 'Compliance readiness with detailed activity tracking'
                  }
                ]
              }
            ].map((stack, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
                <div className="flex items-center mb-8">
                  <div className={`bg-${stack.color}-100 rounded-xl p-3 mr-4`}>
                    <stack.icon className={`h-8 w-8 text-${stack.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stack.category}</h3>
                </div>
                
                <div className="space-y-6">
                  {stack.technologies.map((tech, techIndex) => (
                    <div key={techIndex} className="border-l-4 border-gray-200 pl-6">
                      <h4 className="font-bold text-gray-900 mb-2">{tech.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{tech.description}</p>
                      <p className={`text-${stack.color}-700 text-xs font-medium`}>
                        <strong>Why:</strong> {tech.justification}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Value Framework */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Business Value Framework
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              How our methodology translates into tangible business outcomes and premium platform valuations
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-emerald-900 rounded-3xl p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-bold text-emerald-300 mb-8">Strategic Advantages</h3>
                <div className="space-y-6">
                  {[
                    {
                      advantage: 'Reduced Acquisition Risk',
                      description: 'Professional development standards eliminate technical debt concerns and due diligence complications',
                      impact: 'Faster acquisition timelines'
                    },
                    {
                      advantage: 'Premium Valuation Justification',
                      description: 'Enterprise-grade architecture and comprehensive documentation support higher asking prices',
                      impact: '20-30% premium over market rate'
                    },
                    {
                      advantage: 'Strategic Buyer Appeal',
                      description: 'Professional foundation appeals to corporate acquirers seeking immediate deployment capabilities',
                      impact: 'Broader buyer interest pool'
                    },
                    {
                      advantage: 'Immediate Growth Capability',
                      description: 'Scalable architecture supports confident expansion without technical rewrites',
                      impact: 'Accelerated post-acquisition growth'
                    }
                  ].map((advantage, index) => (
                    <div key={index} className="bg-emerald-800/30 rounded-2xl p-6 border border-emerald-600/30">
                      <h4 className="font-bold text-emerald-200 mb-3">{advantage.advantage}</h4>
                      <p className="text-gray-300 text-sm mb-3">{advantage.description}</p>
                      <div className="inline-flex items-center bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
                        <BoltIcon className="h-3 w-3 mr-1" />
                        {advantage.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-blue-300 mb-8">Measurable Outcomes</h3>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { metric: '20-30%', label: 'Premium Valuation', icon: ArrowTrendingUpIcon },
                    { metric: 'Zero', label: 'Technical Debt', icon: CheckBadgeIcon },
                    { metric: '99%+', label: 'Reliability Score', icon: TrophyIcon },
                    { metric: '95%+', label: 'Security Rating', icon: ShieldCheckIcon }
                  ].map((outcome, index) => (
                    <div key={index} className="text-center bg-blue-900/30 rounded-2xl p-6 border border-blue-600/30">
                      <outcome.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">{outcome.metric}</div>
                      <div className="text-sm text-blue-200">{outcome.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-900/30 rounded-2xl p-6 border border-purple-600/30">
                  <h4 className="font-bold text-purple-200 mb-4">Investment Grade Platform Features</h4>
                  <div className="space-y-3">
                    {[
                      'Comprehensive technical documentation',
                      'Enterprise security and compliance',
                      'Scalable architecture patterns',
                      'Professional code standards',
                      'Automated testing and deployment',
                      'Real-time monitoring and alerting'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-purple-100">
                        <CheckBadgeIcon className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-emerald-600/30">
              <h4 className="text-xl font-bold text-emerald-200 mb-4">The Strata Noble Advantage</h4>
              <p className="text-gray-300 max-w-4xl mx-auto">
                <strong className="text-white">Investment-grade platforms</strong> that strategic buyers recognize 
                as valuable assets with comprehensive documentation, enterprise-ready architecture, and 
                professional development standards that justify premium acquisitions and enable immediate growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-300 to-emerald-200 bg-clip-text text-transparent">
              Ready to Experience Professional Development?
            </span>
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Let's apply our proven methodology to create an enterprise-grade platform 
            that showcases your vision and commands premium valuations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:bg-emerald-50 transition-colors"
            >
              Start Your Project
            </Link>
            <Link 
              href="/technology"
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-emerald-600 transition-colors"
            >
              Explore Our Technology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}