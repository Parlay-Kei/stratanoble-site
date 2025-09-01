'use client';

import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  AcademicCapIcon,
  TrophyIcon,
  CheckBadgeIcon,
  StarIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  BeakerIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const documentationStats = [
  { label: 'Technical Documents', value: '50+', icon: DocumentTextIcon, color: 'blue' },
  { label: 'Code Quality Score', value: '100%', icon: CodeBracketIcon, color: 'emerald' },
  { label: 'Security Compliance', value: '95/100', icon: ShieldCheckIcon, color: 'purple' },
  { label: 'Test Coverage', value: '95%+', icon: BeakerIcon, color: 'amber' }
];

const documentationCategories = [
  {
    title: 'Technical Specifications',
    icon: DocumentTextIcon,
    color: 'blue',
    items: [
      { name: 'Architecture Documents', status: '15+ Complete' },
      { name: 'API Documentation', status: 'Comprehensive' },
      { name: 'Security Protocols', status: 'Enterprise-Grade' },
      { name: 'Deployment Guides', status: 'Step-by-step' }
    ]
  },
  {
    title: 'Knowledge Transfer',
    icon: AcademicCapIcon,
    color: 'emerald',
    items: [
      { name: 'Code Comments', status: '100% Coverage' },
      { name: 'Setup Guides', status: 'Detailed' },
      { name: 'Troubleshooting', status: 'Comprehensive' },
      { name: 'Best Practices', status: 'Documented' }
    ]
  },
  {
    title: 'Audit Compliance',
    icon: TrophyIcon,
    color: 'purple',
    items: [
      { name: 'Quality Reports', status: 'Generated' },
      { name: 'Security Audits', status: 'Passed' },
      { name: 'Performance Reports', status: 'Excellent' },
      { name: 'Compliance Docs', status: 'Complete' }
    ]
  }
];

const professionalStandards = [
  {
    title: 'Code Quality Excellence',
    description: '100% TypeScript compliance with zero ESLint warnings',
    icon: StarIcon,
    color: 'blue',
    metrics: ['Zero warnings', 'Type-safe', 'Consistent style', 'Best practices']
  },
  {
    title: 'Documentation Mastery',
    description: '50+ technical documents with comprehensive coverage',
    icon: StarIcon,
    color: 'emerald',
    metrics: ['Complete coverage', 'Clear structure', 'Regular updates', 'Easy navigation']
  },
  {
    title: 'Security Leadership',
    description: 'Multi-layer protection exceeding industry standards',
    icon: StarIcon,
    color: 'purple',
    metrics: ['Enterprise-grade', 'Compliance ready', 'Regular audits', 'Risk mitigation']
  },
  {
    title: 'Testing Excellence',
    description: 'Comprehensive test coverage with automated quality gates',
    icon: StarIcon,
    color: 'amber',
    metrics: ['95%+ coverage', 'E2E testing', 'Quality gates', 'Automated CI/CD']
  }
];

const businessImpactMetrics = [
  {
    metric: '20-30%',
    label: 'Premium Valuation',
    description: 'Due to reduced technical risk and professional standards',
    icon: ArrowTrendingUpIcon
  },
  {
    metric: 'Zero',
    label: 'Technical Debt',
    description: 'Clean architecture and professional development practices',
    icon: CheckBadgeIcon
  },
  {
    metric: '99%+',
    label: 'Success Rate',
    description: 'Reliable deployment and operational excellence',
    icon: TrophyIcon
  },
  {
    metric: '1,400+',
    label: 'User Capacity',
    description: 'Proven scalability with enterprise-grade performance',
    icon: ChartBarIcon
  }
];

export function DocumentationAuthority() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
            Documentation Authority
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Technical{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive documentation and technical standards that validate professional 
            development practices and reduce acquisition risk.
          </p>
        </motion.div>

        {/* Documentation Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {documentationStats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50">
              <stat.icon className={`h-8 w-8 text-${stat.color}-600 mx-auto mb-3`} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Documentation Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid lg:grid-cols-3 gap-8 mb-16"
        >
          {documentationCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className={`bg-${category.color}-600 rounded-xl p-3 w-fit mb-6`}>
                <category.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">{category.title}</h3>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-gray-600">{item.name}</span>
                    <span className={`font-semibold text-${category.color}-600`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Professional Standards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Standards Exceeded
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Industry-leading practices that establish technical authority and reduce business risk
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {professionalStandards.map((standard, index) => (
              <div key={index} className={`bg-${standard.color}-50 rounded-2xl p-8 border border-${standard.color}-200`}>
                <div className="flex items-start mb-6">
                  <standard.icon className={`h-6 w-6 text-${standard.color}-600 mt-1 mr-4`} />
                  <div>
                    <div className={`font-bold text-${standard.color}-900 text-lg mb-2`}>{standard.title}</div>
                    <div className={`text-${standard.color}-700`}>{standard.description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {standard.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className={`bg-${standard.color}-100 rounded-lg p-3 text-center`}>
                      <div className={`text-sm font-medium text-${standard.color}-800`}>{metric}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Suite of Agents Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gray-900 rounded-3xl p-12 text-white mb-16"
        >
          <div className="text-center mb-12">
            <CpuChipIcon className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">AI-Enhanced Documentation</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our Suite of Agents methodology includes intelligent documentation generation and maintenance,
              ensuring comprehensive coverage and continuous updates.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Development Agents',
                description: 'Automated code documentation and API specs',
                icon: CodeBracketIcon,
                color: 'blue'
              },
              {
                title: 'Operations Agents',
                description: 'System monitoring and performance documentation',
                icon: ChartBarIcon,
                color: 'emerald'
              },
              {
                title: 'Administrative Agents',
                description: 'Process documentation and compliance tracking',
                icon: DocumentTextIcon,
                color: 'purple'
              },
              {
                title: 'Executive Agents',
                description: 'Business intelligence and strategic documentation',
                icon: AcademicCapIcon,
                color: 'amber'
              }
            ].map((agent, index) => (
              <div key={index} className="text-center">
                <div className={`bg-${agent.color}-600/20 border border-${agent.color}-400/30 rounded-2xl p-6 mb-4`}>
                  <agent.icon className={`h-8 w-8 text-${agent.color}-400 mx-auto mb-3`} />
                  <div className={`font-bold text-${agent.color}-300 mb-2`}>{agent.title}</div>
                  <div className={`text-sm text-${agent.color}-200`}>{agent.description}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Business Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-12 text-white"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Measurable Business Impact</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Professional documentation and technical excellence translate directly into 
              business value and premium platform valuations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessImpactMetrics.map((item, index) => (
              <div key={index} className="text-center">
                <item.icon className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">{item.metric}</div>
                <div className="font-semibold text-blue-100 mb-2">{item.label}</div>
                <div className="text-sm text-blue-200">{item.description}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 pt-8 border-t border-blue-400/20">
            <h4 className="text-xl font-bold text-blue-100 mb-4">Strategic Platform Positioning</h4>
            <p className="text-blue-200 max-w-3xl mx-auto">
              Platforms developed with our documentation methodology and technical standards command 
              <strong className="text-white"> 20-30% premium valuations</strong> due to reduced technical risk, 
              comprehensive knowledge transfer, and enterprise-ready foundations that appeal to strategic buyers.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}