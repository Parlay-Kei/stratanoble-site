import React from 'next';
import { Metadata } from 'next';
import {
  CpuChipIcon,
  CodeBracketIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CogIcon,
  CloudIcon,
  RocketLaunchIcon,
  BoltIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BeakerIcon,
  CheckBadgeIcon,
  CommandLineIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  TrophyIcon,
  StarIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Technology & AI Strategy | Strata Noble - Suite of Agents Automation',
  description: 'Discover our revolutionary Suite of Agents technology strategy featuring AI-powered development workflows, intelligent automation, and advanced enterprise integrations.',
  keywords: 'Suite of Agents, AI automation, technology strategy, intelligent development, enterprise AI, development agents, operations agents',
};

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-purple-100 text-purple-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <CpuChipIcon className="h-5 w-5" />
              Suite of Agents Technology
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Development
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Revolutionary AI agent orchestration that transforms development workflows through 
              intelligent automation, delivering unprecedented efficiency and enterprise-grade quality.
            </p>
          </div>

          {/* Technology Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Development Speed', value: '10x', icon: RocketLaunchIcon, color: 'purple' },
              { label: 'Automation Rate', value: '85%', icon: CogIcon, color: 'blue' },
              { label: 'Quality Score', value: '99%', icon: CheckBadgeIcon, color: 'emerald' },
              { label: 'Agent Teams', value: '4', icon: CpuChipIcon, color: 'amber' }
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

      {/* Suite of Agents Overview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Suite of Agents Revolution
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Four specialized AI agent teams working in perfect harmony to automate every aspect 
              of enterprise development, from code generation to strategic decision making.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">🤖 Intelligent Orchestration</h3>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Traditional development processes are limited by human capacity and prone to 
                  inconsistency. Our Suite of Agents transcends these limitations through intelligent 
                  AI orchestration that maintains enterprise-grade standards while accelerating delivery.
                </p>
                
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-4">Core Advantages</h4>
                  <div className="space-y-3">
                    {[
                      { advantage: 'Consistent Quality', description: 'AI agents never have bad days or make tired mistakes' },
                      { advantage: '24/7 Operation', description: 'Continuous development and monitoring without human limitations' },
                      { advantage: 'Scalable Intelligence', description: 'Add complexity without proportional resource increases' },
                      { advantage: 'Learning System', description: 'Agents improve performance through continuous feedback loops' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckBadgeIcon className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-purple-900">{item.advantage}</div>
                          <div className="text-purple-700 text-sm">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">🎯 Strategic Integration</h3>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-6 inline-block mb-4">
                    <CpuChipIcon className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Event-Driven Architecture</h4>
                  <p className="text-gray-600">Seamless communication between agent teams</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { component: 'Apache Kafka', description: 'Message streaming' },
                    { component: 'Vector Databases', description: 'Knowledge storage' },
                    { component: 'API Gateway', description: 'Service orchestration' },
                    { component: 'Workflow Engine', description: 'Process automation' }
                  ].map((component, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <div className="font-semibold text-gray-900 text-sm mb-1">{component.component}</div>
                      <div className="text-xs text-gray-600">{component.description}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">&lt; 100ms</div>
                    <div className="text-sm text-gray-600">Inter-agent Communication</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Teams Detail */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Development Agents */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200">
              <div className="flex items-center mb-8">
                <div className="bg-blue-600 rounded-2xl p-4 mr-6">
                  <CodeBracketIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">Development Agents</h3>
                  <p className="text-blue-700">Autonomous Code Generation & Quality Assurance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { metric: '10x', label: 'Faster Coding' },
                  { metric: '100%', label: 'Type Safety' },
                  { metric: '95%+', label: 'Test Coverage' },
                  { metric: 'Zero', label: 'Lint Warnings' }
                ].map((metric, index) => (
                  <div key={index} className="bg-blue-200/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-900 mb-1">{metric.metric}</div>
                    <div className="text-xs text-blue-700">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-blue-900 mb-4">Core Capabilities</h4>
                {[
                  {
                    capability: 'AI Code Generation',
                    description: 'GitHub Copilot & OpenAI Codex integration for intelligent code creation',
                    tools: ['GitHub Copilot', 'OpenAI Codex', 'Tabnine']
                  },
                  {
                    capability: 'Automated Testing',
                    description: 'AI-driven test generation with comprehensive coverage analysis',
                    tools: ['Testim', 'Mabl', 'Jest AI']
                  },
                  {
                    capability: 'Quality Gates',
                    description: 'SonarQube integration with automated code review and refactoring',
                    tools: ['SonarQube', 'CodeClimate', 'DeepCode']
                  },
                  {
                    capability: 'Documentation Generation',
                    description: 'Dynamic API docs, release notes, and code documentation',
                    tools: ['GitBook AI', 'Notion AI', 'Custom NLP']
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-blue-200/30 rounded-xl p-4">
                    <div className="font-semibold text-blue-900 mb-2">{item.capability}</div>
                    <div className="text-blue-700 text-sm mb-3">{item.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {item.tools.map((tool, toolIndex) => (
                        <span key={toolIndex} className="bg-blue-300/50 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations Agents */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-8 border border-emerald-200">
              <div className="flex items-center mb-8">
                <div className="bg-emerald-600 rounded-2xl p-4 mr-6">
                  <ChartBarIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">Operations Agents</h3>
                  <p className="text-emerald-700">Intelligent System Monitoring & Optimization</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { metric: '99.9%', label: 'Uptime' },
                  { metric: '< 30s', label: 'Response Time' },
                  { metric: '100%', label: 'Monitoring' },
                  { metric: 'Predictive', label: 'Scaling' }
                ].map((metric, index) => (
                  <div key={index} className="bg-emerald-200/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-900 mb-1">{metric.metric}</div>
                    <div className="text-xs text-emerald-700">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-emerald-900 mb-4">Core Capabilities</h4>
                {[
                  {
                    capability: 'AI-Powered Monitoring',
                    description: 'Datadog AI Ops and New Relic for intelligent anomaly detection',
                    tools: ['Datadog AI', 'New Relic', 'Prometheus']
                  },
                  {
                    capability: 'Incident Management',
                    description: 'Automated troubleshooting with PagerDuty AI integration',
                    tools: ['PagerDuty AI', 'Opsgenie', 'Slack Bot']
                  },
                  {
                    capability: 'Predictive Scaling',
                    description: 'ML-driven resource allocation based on usage patterns',
                    tools: ['AWS Auto Scaling', 'Kubernetes HPA', 'Custom ML']
                  },
                  {
                    capability: 'Performance Analytics',
                    description: 'Real-time insights and optimization recommendations',
                    tools: ['Grafana', 'Kibana', 'Custom Dashboards']
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-emerald-200/30 rounded-xl p-4">
                    <div className="font-semibold text-emerald-900 mb-2">{item.capability}</div>
                    <div className="text-emerald-700 text-sm mb-3">{item.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {item.tools.map((tool, toolIndex) => (
                        <span key={toolIndex} className="bg-emerald-300/50 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Administrative Agents */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-200">
              <div className="flex items-center mb-8">
                <div className="bg-purple-600 rounded-2xl p-4 mr-6">
                  <DocumentTextIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-900">Administrative Agents</h3>
                  <p className="text-purple-700">Business Process Automation Excellence</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { metric: 'Automated', label: 'Onboarding' },
                  { metric: '24/7', label: 'Support' },
                  { metric: '100%', label: 'Compliance' },
                  { metric: 'Smart', label: 'Scheduling' }
                ].map((metric, index) => (
                  <div key={index} className="bg-purple-200/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-900 mb-1">{metric.metric}</div>
                    <div className="text-xs text-purple-700">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-purple-900 mb-4">Core Capabilities</h4>
                {[
                  {
                    capability: 'Client Onboarding',
                    description: 'Automated user provisioning and subscription management workflows',
                    tools: ['UiPath', 'Power Automate', 'Zapier']
                  },
                  {
                    capability: 'Communication Hub',
                    description: 'AI-powered scheduling, email automation, and customer support',
                    tools: ['Calendly AI', 'Mailchimp', 'Intercom AI']
                  },
                  {
                    capability: 'Document Management',
                    description: 'Intelligent contract generation and compliance tracking',
                    tools: ['DocuSign AI', 'PandaDoc', 'Airtable']
                  },
                  {
                    capability: 'HR Automation',
                    description: 'RPA-driven HR processes and compliance management',
                    tools: ['BambooHR', 'Workday', 'Custom RPA']
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-purple-200/30 rounded-xl p-4">
                    <div className="font-semibold text-purple-900 mb-2">{item.capability}</div>
                    <div className="text-purple-700 text-sm mb-3">{item.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {item.tools.map((tool, toolIndex) => (
                        <span key={toolIndex} className="bg-purple-300/50 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Agents */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8 border border-amber-200">
              <div className="flex items-center mb-8">
                <div className="bg-amber-600 rounded-2xl p-4 mr-6">
                  <AcademicCapIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-900">Executive Agents</h3>
                  <p className="text-amber-700">Strategic Intelligence & Decision Support</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { metric: 'Real-time', label: 'Analytics' },
                  { metric: 'Predictive', label: 'Forecasting' },
                  { metric: 'Strategic', label: 'Insights' },
                  { metric: 'Automated', label: 'Reports' }
                ].map((metric, index) => (
                  <div key={index} className="bg-amber-200/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-900 mb-1">{metric.metric}</div>
                    <div className="text-xs text-amber-700">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-amber-900 mb-4">Core Capabilities</h4>
                {[
                  {
                    capability: 'Business Analytics',
                    description: 'Power BI and Tableau with AI-augmented insights and forecasting',
                    tools: ['Power BI AI', 'Tableau', 'ThoughtSpot']
                  },
                  {
                    capability: 'Financial Forecasting',
                    description: 'ML-powered budget management and scenario modeling',
                    tools: ['Adaptive Insights', 'Anaplan', 'Custom ML']
                  },
                  {
                    capability: 'Market Intelligence',
                    description: 'Automated competitor analysis and trend identification',
                    tools: ['Crayon', 'Klenty', 'Custom NLP']
                  },
                  {
                    capability: 'Decision Support',
                    description: 'Strategic recommendations with scenario simulations',
                    tools: ['Watson Analytics', 'Palantir', 'Custom AI']
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-amber-200/30 rounded-xl p-4">
                    <div className="font-semibold text-amber-900 mb-2">{item.capability}</div>
                    <div className="text-amber-700 text-sm mb-3">{item.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {item.tools.map((tool, toolIndex) => (
                        <span key={toolIndex} className="bg-amber-300/50 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Technical Architecture
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade infrastructure designed for scale, security, and seamless AI integration
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="bg-gray-900 rounded-3xl p-12 text-white mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">AI Agent Orchestration Architecture</h3>
            
            <div className="grid lg:grid-cols-3 gap-8 items-center mb-12">
              {/* Input Layer */}
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-xl font-bold text-blue-300 mb-6">Input Layer</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Business Requirements', icon: DocumentTextIcon, color: 'blue' },
                    { name: 'Performance Metrics', icon: ChartBarIcon, color: 'emerald' },
                    { name: 'User Interactions', icon: GlobeAltIcon, color: 'purple' },
                    { name: 'System Events', icon: ServerIcon, color: 'amber' }
                  ].map((input, index) => (
                    <div key={index} className={`bg-${input.color}-600/20 rounded-2xl p-4 border border-${input.color}-400/30`}>
                      <input.icon className={`h-6 w-6 text-${input.color}-400 mb-2`} />
                      <div className={`font-semibold text-${input.color}-300 text-sm`}>{input.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Orchestration Core */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-8 inline-block mb-6">
                  <CpuChipIcon className="h-16 w-16 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Orchestration Engine</h4>
                <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Apache Airflow</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Event Bus (Kafka)</span>
                      <span className="text-green-400">Streaming</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Vector Database</span>
                      <span className="text-green-400">Indexed</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">API Gateway</span>
                      <span className="text-green-400">Routing</span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">&lt; 100ms response time</div>
              </div>

              {/* Output Layer */}
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-xl font-bold text-emerald-300 mb-6">Output Layer</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Code Generation', icon: CodeBracketIcon, color: 'blue' },
                    { name: 'System Optimization', icon: CogIcon, color: 'emerald' },
                    { name: 'Process Automation', icon: ArrowPathIcon, color: 'purple' },
                    { name: 'Strategic Insights', icon: LightBulbIcon, color: 'amber' }
                  ].map((output, index) => (
                    <div key={index} className={`bg-${output.color}-600/20 rounded-2xl p-4 border border-${output.color}-400/30`}>
                      <output.icon className={`h-6 w-6 text-${output.color}-400 mb-2`} />
                      <div className={`font-semibold text-${output.color}-300 text-sm`}>{output.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Flow */}
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-300 mb-6">Data Flow & Security</h4>
              <div className="grid grid-cols-4 gap-6">
                {[
                  { component: 'Encryption', description: 'AES-256 end-to-end', icon: ShieldCheckIcon },
                  { component: 'Authentication', description: 'OAuth 2.0 + JWT', icon: CheckBadgeIcon },
                  { component: 'Audit Logging', description: 'Complete trail', icon: DocumentTextIcon },
                  { component: 'Rate Limiting', description: 'Intelligent throttling', icon: WrenchScrewdriverIcon }
                ].map((component, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <component.icon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <div className="font-semibold text-gray-300 text-sm mb-2">{component.component}</div>
                    <div className="text-gray-400 text-xs">{component.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Core AI Technologies</h3>
              <div className="space-y-6">
                {[
                  {
                    category: 'Large Language Models',
                    technologies: ['OpenAI GPT-4o', 'Anthropic Claude', 'Google PaLM'],
                    use_case: 'Natural language processing, code generation, and decision support'
                  },
                  {
                    category: 'Specialized AI Models',
                    technologies: ['GitHub Copilot', 'OpenAI Codex', 'Custom Fine-tuned Models'],
                    use_case: 'Code generation, automated testing, and technical documentation'
                  },
                  {
                    category: 'Machine Learning Platforms',
                    technologies: ['AWS SageMaker', 'Azure ML', 'Google AI Platform'],
                    use_case: 'Model training, deployment, and performance monitoring'
                  },
                  {
                    category: 'Vector Databases',
                    technologies: ['Pinecone', 'Weaviate', 'Chroma'],
                    use_case: 'Knowledge storage, semantic search, and context retrieval'
                  }
                ].map((tech, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">{tech.category}</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tech.technologies.map((technology, techIndex) => (
                        <span key={techIndex} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {technology}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{tech.use_case}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Integration & Orchestration</h3>
              <div className="space-y-6">
                {[
                  {
                    category: 'Workflow Orchestration',
                    technologies: ['Apache Airflow', 'Prefect', 'n8n', 'Zapier'],
                    use_case: 'Complex workflow management and task coordination'
                  },
                  {
                    category: 'Event Streaming',
                    technologies: ['Apache Kafka', 'AWS EventBridge', 'RabbitMQ'],
                    use_case: 'Real-time event processing and agent communication'
                  },
                  {
                    category: 'API Management',
                    technologies: ['Kong Gateway', 'AWS API Gateway', 'Azure API Management'],
                    use_case: 'Service orchestration and external integrations'
                  },
                  {
                    category: 'Monitoring & Analytics',
                    technologies: ['Datadog AI Ops', 'New Relic', 'Custom Dashboards'],
                    use_case: 'Performance monitoring and intelligent alerting'
                  }
                ].map((tech, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">{tech.category}</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tech.technologies.map((technology, techIndex) => (
                        <span key={techIndex} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                          {technology}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{tech.use_case}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Roadmap */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Implementation Strategy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A proven 6-month roadmap for deploying Suite of Agents technology 
              across your enterprise development workflows
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-12">
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                {
                  month: 'Month 1',
                  phase: 'Planning & Architecture',
                  focus: 'Design agent workflows and select technology stack',
                  deliverables: ['Technical specifications', 'Architecture diagrams', 'Tool selection']
                },
                {
                  month: 'Month 2',
                  phase: 'Development Agent Deployment',
                  focus: 'Implement coding assistants and automated testing',
                  deliverables: ['AI code generation', 'Automated testing', 'Quality gates']
                },
                {
                  month: 'Month 3',
                  phase: 'Operations Agent Integration',
                  focus: 'Deploy monitoring and incident management systems',
                  deliverables: ['AI monitoring', 'Auto-scaling', 'Incident response']
                },
                {
                  month: 'Month 4',
                  phase: 'Administrative Automation',
                  focus: 'Implement business process automation workflows',
                  deliverables: ['User onboarding', 'Communication hub', 'Compliance']
                },
                {
                  month: 'Month 5',
                  phase: 'Executive Intelligence',
                  focus: 'Deploy analytics and strategic decision support',
                  deliverables: ['BI dashboards', 'Forecasting', 'Market analysis']
                },
                {
                  month: 'Month 6',
                  phase: 'Optimization & Scale',
                  focus: 'Fine-tune performance and expand capabilities',
                  deliverables: ['Performance optimization', 'Learning systems', 'Scale expansion']
                }
              ].map((phase, index) => (
                <div key={index} className="text-center">
                  <div className="bg-purple-600 text-white rounded-2xl p-4 mb-4">
                    <div className="font-bold text-sm mb-1">{phase.month}</div>
                    <RocketLaunchIcon className="h-8 w-8 mx-auto" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3">{phase.phase}</h4>
                  <p className="text-gray-600 text-sm mb-4">{phase.focus}</p>
                  <div className="space-y-1">
                    {phase.deliverables.map((deliverable, delIndex) => (
                      <div key={delIndex} className="text-xs text-gray-500">
                        • {deliverable}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 pt-8 border-t border-purple-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Expected Outcomes</h4>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { outcome: '10x Development Speed', icon: RocketLaunchIcon },
                  { outcome: '85% Process Automation', icon: CogIcon },
                  { outcome: '99% Quality Consistency', icon: StarIcon },
                  { outcome: '24/7 Intelligent Operations', icon: BoltIcon }
                ].map((outcome, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <outcome.icon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900 text-sm">{outcome.outcome}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Transformational Business Impact
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
              Suite of Agents technology doesn't just improve development—it revolutionizes 
              your entire business model and competitive positioning.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-purple-200 mb-8">Immediate Benefits</h3>
              <div className="space-y-6">
                {[
                  {
                    benefit: 'Accelerated Time-to-Market',
                    impact: '10x faster development cycles',
                    description: 'AI agents work continuously, never tire, and maintain consistent quality standards'
                  },
                  {
                    benefit: 'Reduced Operational Costs',
                    impact: '60% reduction in manual tasks',
                    description: 'Automated processes eliminate repetitive work and human error'
                  },
                  {
                    benefit: 'Enhanced Code Quality',
                    impact: '99% consistency rate',
                    description: 'AI agents never have bad days and always follow best practices'
                  },
                  {
                    benefit: 'Predictive Problem Solving',
                    impact: '80% issues prevented',
                    description: 'ML algorithms identify and resolve issues before they impact users'
                  }
                ].map((benefit, index) => (
                  <div key={index} className="bg-purple-700/30 rounded-2xl p-6 border border-purple-400/30">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-purple-100">{benefit.benefit}</h4>
                      <span className="bg-purple-500/50 text-purple-100 px-3 py-1 rounded-full text-sm font-semibold">
                        {benefit.impact}
                      </span>
                    </div>
                    <p className="text-purple-200 text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-blue-200 mb-8">Strategic Advantages</h3>
              <div className="space-y-6">
                {[
                  {
                    advantage: 'Market Differentiation',
                    value: 'Unique competitive positioning',
                    description: 'AI-powered development capabilities that competitors cannot easily replicate'
                  },
                  {
                    advantage: 'Scalability Without Limits',
                    value: 'Linear growth costs',
                    description: 'Add complexity and features without proportional increases in team size'
                  },
                  {
                    advantage: 'Investment Appeal',
                    value: '20-30% premium valuations',
                    description: 'Advanced AI capabilities attract strategic buyers and justify higher prices'
                  },
                  {
                    advantage: 'Future-Proof Technology',
                    value: 'Continuous improvement',
                    description: 'AI agents learn and improve automatically, keeping you ahead of competitors'
                  }
                ].map((advantage, index) => (
                  <div key={index} className="bg-blue-700/30 rounded-2xl p-6 border border-blue-400/30">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-blue-100">{advantage.advantage}</h4>
                      <span className="bg-blue-500/50 text-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
                        {advantage.value}
                      </span>
                    </div>
                    <p className="text-blue-200 text-sm">{advantage.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
              <TrophyIcon className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">The Suite of Agents Advantage</h3>
              <p className="text-purple-100 max-w-4xl mx-auto mb-8">
                <strong className="text-white">Revolutionary AI technology</strong> that transforms your development 
                process from a cost center into a competitive advantage. Platforms built with Suite of Agents 
                methodology command premium valuations because strategic buyers recognize the operational 
                excellence and growth potential that AI automation provides.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">10x</div>
                  <div className="font-semibold text-purple-100">Development Speed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-300 mb-2">99%</div>
                  <div className="font-semibold text-purple-100">Quality Consistency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">85%</div>
                  <div className="font-semibold text-purple-100">Process Automation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Deploy AI-Powered Development?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your development process with Suite of Agents technology. 
            Let's build the future of intelligent enterprise platforms together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-purple-700 transition-colors"
            >
              Schedule AI Strategy Session
            </Link>
            <Link 
              href="/portfolio"
              className="border-2 border-purple-600 text-purple-600 font-bold py-4 px-8 rounded-2xl hover:bg-purple-50 transition-colors"
            >
              View Our Results
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}