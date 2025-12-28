'use client';

import { motion } from 'framer-motion';
import { 
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
  AcademicCapIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const implementationRoadmap = [
  {
    phase: 'Phase 1',
    title: 'Planning & Design',
    duration: '6 weeks',
    tasks: ['AI agent workflows', 'Data architecture', 'Tool selection'],
    color: 'blue',
    icon: DocumentTextIcon
  },
  {
    phase: 'Phase 2',
    title: 'Pilot Development',
    duration: '4 weeks',
    tasks: ['Prototype agents', 'Development team', 'Testing integration'],
    color: 'emerald',
    icon: CodeBracketIcon
  },
  {
    phase: 'Phase 3',
    title: 'Integration',
    duration: '6 weeks',
    tasks: ['Business systems', 'Operations team', 'Admin automation'],
    color: 'purple',
    icon: CogIcon
  },
  {
    phase: 'Phase 4',
    title: 'Executive Analytics',
    duration: '4 weeks',
    tasks: ['BI dashboards', 'Forecasting models', 'Decision support'],
    color: 'amber',
    icon: ChartBarIcon
  },
  {
    phase: 'Phase 5',
    title: 'Optimization',
    duration: '6 weeks',
    tasks: ['Performance tuning', 'Continuous learning', 'Scale expansion'],
    color: 'red',
    icon: RocketLaunchIcon
  }
];

const technologyStack = [
  {
    category: 'Frontend Engineering',
    icon: CodeBracketIcon,
    color: 'blue',
    technologies: [
      { name: 'Next.js 15.3.5', description: 'React 18 with Server Components and streaming' },
      { name: 'TypeScript 5.8.3', description: 'Full type safety with strict configuration' },
      { name: 'Tailwind CSS', description: 'Utility-first styling with design system' },
      { name: 'shadcn/ui', description: 'Accessible components with Radix UI primitives' }
    ]
  },
  {
    category: 'Backend Infrastructure',
    icon: CloudIcon,
    color: 'emerald',
    technologies: [
      { name: 'Supabase Edge Functions', description: 'Serverless backend with global distribution' },
      { name: 'PostgreSQL 15', description: 'Enterprise database with Row Level Security' },
      { name: 'Stripe Integration', description: 'Complete subscription management platform' },
      { name: 'AWS SES', description: 'Transactional email with high deliverability' }
    ]
  },
  {
    category: 'Quality Assurance',
    icon: BeakerIcon,
    color: 'purple',
    technologies: [
      { name: 'Jest + Playwright', description: 'Comprehensive testing with E2E coverage' },
      { name: 'ESLint + Prettier', description: 'Automated code quality and formatting' },
      { name: 'TypeScript Strict', description: '100% type safety with zero warnings' },
      { name: 'Automated CI/CD', description: 'GitHub Actions with quality gates' }
    ]
  },
  {
    category: 'Security & Monitoring',
    icon: ShieldCheckIcon,
    color: 'red',
    technologies: [
      { name: 'Multi-layer Security', description: 'XSS, CSRF, CSP, and input validation' },
      { name: 'Sentry Monitoring', description: 'Real-time error tracking and alerts' },
      { name: 'Structured Logging', description: 'Comprehensive audit trails' },
      { name: 'Performance Monitoring', description: 'Core Web Vitals optimization' }
    ]
  }
];

const qualityMetrics = [
  {
    metric: '87/100',
    label: 'Platform Health Score',
    description: 'Comprehensive technical assessment',
    color: 'blue'
  },
  {
    metric: '99%',
    label: 'Payment Success Rate',
    description: 'Reliable transaction processing',
    color: 'emerald'
  },
  {
    metric: '95%',
    label: 'Accessibility Score',
    description: 'WCAG 2.1 AA compliance',
    color: 'purple'
  },
  {
    metric: '100%',
    label: 'Mobile Responsive',
    description: 'Perfect responsive design',
    color: 'amber'
  }
];

const businessAutomation = [
  {
    title: 'DocuSign NDA Workflow',
    description: 'Automated legal document processing',
    status: 'Production Ready',
    icon: DocumentTextIcon,
    features: ['Digital signature automation', 'Secure document storage', 'Email notifications']
  },
  {
    title: 'Mailchimp Lead Nurturing',
    description: 'Intelligent email sequence automation',
    status: 'Production Ready',
    icon: ArrowPathIcon,
    features: ['Multi-sequence campaigns', 'Automatic lead sync', 'Engagement tracking']
  },
  {
    title: 'AWS S3 Document Management',
    description: 'Enterprise document storage system',
    status: 'Production Ready',
    icon: CloudIcon,
    features: ['Secure storage', 'Pre-signed URLs', 'Audit trails']
  },
  {
    title: 'Stripe Subscription Automation',
    description: 'Complete payment and billing automation',
    status: 'Production Ready',
    icon: CogIcon,
    features: ['Subscription management', 'Webhook processing', 'Revenue tracking']
  }
];

export function EnterpriseDevelopmentMethodology() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <AcademicCapIcon className="h-5 w-5" />
            Enterprise Development Methodology
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Development{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Standards
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Agile practices enhanced with AI automation for rapid, reliable delivery 
            of enterprise-grade platforms.
          </p>
        </motion.div>

        {/* Implementation Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              6-Month Implementation Roadmap
            </h3>
            <div className="grid md:grid-cols-5 gap-8">
              {implementationRoadmap.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`bg-${phase.color}-600 text-white rounded-2xl p-6 mb-4 relative`}>
                    <phase.icon className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-bold text-lg">{phase.phase}</div>
                    <div className="text-sm opacity-90">{phase.duration}</div>
                    
                    {/* Connector Line */}
                    {index < implementationRoadmap.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                    )}
                  </div>
                  <div className="font-semibold text-gray-900 mb-3">{phase.title}</div>
                  <div className="space-y-1">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="text-sm text-gray-600">
                        • {task}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Core Technology Stack</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade technologies selected for scalability, security, and maintainability
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {technologyStack.map((stack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
              >
                <div className="flex items-center mb-6">
                  <div className={`bg-${stack.color}-100 rounded-xl p-3 mr-4`}>
                    <stack.icon className={`h-6 w-6 text-${stack.color}-600`} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{stack.category}</h4>
                </div>
                <div className="space-y-4">
                  {stack.technologies.map((tech, techIndex) => (
                    <div key={techIndex} className="border-l-4 border-gray-200 pl-4">
                      <div className="font-semibold text-gray-900 mb-1">{tech.name}</div>
                      <div className="text-sm text-gray-600">{tech.description}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quality Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Quality Assurance Metrics</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Measurable quality standards that ensure enterprise-grade delivery
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {qualityMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-4xl font-bold text-${metric.color}-600 mb-2`}>
                    {metric.metric}
                  </div>
                  <div className="font-semibold text-gray-900 mb-2">{metric.label}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Business Automation Ready */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Business Automation Ready</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Production-ready automation systems that streamline business operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {businessAutomation.map((automation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
              >
                <div className="flex items-start mb-6">
                  <div className="bg-emerald-100 rounded-xl p-3 mr-4">
                    <automation.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{automation.title}</h4>
                    <p className="text-gray-600 mb-3">{automation.description}</p>
                    <span className="inline-flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <CheckBadgeIcon className="h-4 w-4 mr-1" />
                      {automation.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {automation.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Strategic Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-gray-900 to-emerald-900 rounded-3xl p-12 text-white text-center"
        >
          <TrophyIcon className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-6">Strategic Business Excellence</h3>
          <p className="text-lg text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Our enterprise development methodology produces <strong className="text-emerald-300">investment-grade platforms</strong> that 
            command premium valuations through reduced technical risk, comprehensive documentation, 
            and scalable architecture designed for strategic acquisition.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-300 mb-2">20-30%</div>
              <div className="font-semibold text-gray-200 mb-2">Premium Valuation</div>
              <div className="text-sm text-gray-300">Due to professional development standards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300 mb-2">Zero</div>
              <div className="font-semibold text-gray-200 mb-2">Technical Debt</div>
              <div className="text-sm text-gray-300">Clean, maintainable codebase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-300 mb-2">Enterprise</div>
              <div className="font-semibold text-gray-200 mb-2">Security Grade</div>
              <div className="text-sm text-gray-300">Multi-layer protection standards</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}