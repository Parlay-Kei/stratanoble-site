import React from 'react';
import { Metadata } from 'next';
import {
  CodeBracketIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  CloudIcon,
  CheckBadgeIcon,
  BeakerIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Technical Excellence | Strata Noble - Enterprise Development Practices',
  description: 'Discover our Suite of Agents automation strategy, enterprise development methodology, and technical standards that drive superior SaaS solutions.',
  keywords: 'technical excellence, enterprise development, suite of agents, automation, development methodology, technical standards',
};

export default function TechnicalExcellencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <CpuChipIcon className="h-5 w-5" />
              Enterprise-Grade Technical Excellence
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Suite of{' '}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                AI Agents
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Revolutionary automation strategy that transforms development workflows through 
              intelligent AI agent orchestration, delivering unprecedented efficiency and quality.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Development Speed', value: '10x', icon: RocketLaunchIcon },
              { label: 'Code Quality', value: '99%', icon: CheckBadgeIcon },
              { label: 'Test Coverage', value: '95%', icon: ShieldCheckIcon },
              { label: 'Automation Rate', value: '85%', icon: CogIcon }
            ].map((metric, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50">
                <metric.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suite of Agents Strategy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI Agent Orchestration Strategy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Four specialized AI agent teams working in harmony to automate every aspect of enterprise development
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Development Agents */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 rounded-2xl p-3 mr-4">
                  <CodeBracketIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">Development Team</h3>
                  <p className="text-blue-700">Autonomous Code Generation & Review</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-900">AI Code Generation</div>
                    <div className="text-blue-700 text-sm">GitHub Copilot & OpenAI Codex integration for intelligent code creation</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-900">Automated Testing</div>
                    <div className="text-blue-700 text-sm">AI-driven test generation with Testim and Mabl integration</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-900">CI/CD Automation</div>
                    <div className="text-blue-700 text-sm">GitHub Actions with SonarQube quality gates</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-900">Documentation Generation</div>
                    <div className="text-blue-700 text-sm">Dynamic documentation and release notes automation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operations Agents */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-8 border border-emerald-200">
              <div className="flex items-center mb-6">
                <div className="bg-emerald-600 rounded-2xl p-3 mr-4">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">Operations Team</h3>
                  <p className="text-emerald-700">Intelligent System Monitoring</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-900">AI-Powered Monitoring</div>
                    <div className="text-emerald-700 text-sm">Datadog AI Ops and New Relic for anomaly detection</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-900">Incident Management</div>
                    <div className="text-emerald-700 text-sm">Automated troubleshooting with PagerDuty AI integration</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-900">Predictive Scaling</div>
                    <div className="text-emerald-700 text-sm">ML-driven resource allocation based on usage patterns</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-900">Performance Analytics</div>
                    <div className="text-emerald-700 text-sm">Real-time insights and optimization recommendations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Administrative Agents */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-200">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 rounded-2xl p-3 mr-4">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-900">Administrative Team</h3>
                  <p className="text-purple-700">Process Automation Excellence</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-purple-900">Client Onboarding</div>
                    <div className="text-purple-700 text-sm">Automated user provisioning and subscription management</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-purple-900">Communication Hub</div>
                    <div className="text-purple-700 text-sm">AI-powered scheduling and email automation</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-purple-900">Document Management</div>
                    <div className="text-purple-700 text-sm">Intelligent contract generation and compliance tracking</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-purple-900">HR Automation</div>
                    <div className="text-purple-700 text-sm">RPA-driven HR processes and compliance management</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Agents */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8 border border-amber-200">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 rounded-2xl p-3 mr-4">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-900">Executive Team</h3>
                  <p className="text-amber-700">Strategic Intelligence Platform</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-900">Business Analytics</div>
                    <div className="text-amber-700 text-sm">Power BI and Tableau with AI-augmented insights</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-900">Financial Forecasting</div>
                    <div className="text-amber-700 text-sm">ML-powered budget management and scenario modeling</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-900">Market Intelligence</div>
                    <div className="text-amber-700 text-sm">Automated competitor analysis and trend identification</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-amber-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-900">Decision Support</div>
                    <div className="text-amber-700 text-sm">Strategic recommendations with scenario simulations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">AI Agent Orchestration Architecture</h3>
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="space-y-4">
                <div className="bg-blue-600/20 rounded-2xl p-4 border border-blue-400/30">
                  <CloudIcon className="h-6 w-6 text-blue-400 mb-2" />
                  <div className="font-semibold text-blue-300">Data Lake & Knowledge Base</div>
                  <div className="text-sm text-blue-200">AWS S3, Pinecone Vector DB</div>
                </div>
                <div className="bg-emerald-600/20 rounded-2xl p-4 border border-emerald-400/30">
                  <CommandLineIcon className="h-6 w-6 text-emerald-400 mb-2" />
                  <div className="font-semibold text-emerald-300">API Gateway</div>
                  <div className="text-sm text-emerald-200">Microservices Integration</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-6 inline-block mb-4">
                  <CpuChipIcon className="h-12 w-12 text-white" />
                </div>
                <div className="text-xl font-bold mb-2">Orchestration Layer</div>
                <div className="text-gray-400">Apache Airflow + Event-Driven Architecture</div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-600/20 rounded-2xl p-4 border border-purple-400/30">
                  <ArrowPathIcon className="h-6 w-6 text-purple-400 mb-2" />
                  <div className="font-semibold text-purple-300">Workflow Automation</div>
                  <div className="text-sm text-purple-200">n8n, Zapier Integration</div>
                </div>
                <div className="bg-amber-600/20 rounded-2xl p-4 border border-amber-400/30">
                  <ShieldCheckIcon className="h-6 w-6 text-amber-400 mb-2" />
                  <div className="font-semibold text-amber-300">Security & Compliance</div>
                  <div className="text-sm text-amber-200">GDPR, HIPAA, Audit Trails</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Development Practices */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Development Practices
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Industry-leading methodologies that ensure scalability, security, and maintainability
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Code Quality */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="bg-blue-600 rounded-2xl p-3 w-fit mb-6">
                <CodeBracketIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Code Excellence</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">TypeScript 5.8.3</div>
                    <div className="text-gray-600 text-sm">Full type safety with strict configuration</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">ESLint + Prettier</div>
                    <div className="text-gray-600 text-sm">Consistent code formatting and quality</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">SonarQube Integration</div>
                    <div className="text-gray-600 text-sm">Automated code quality gates</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Monorepo Architecture</div>
                    <div className="text-gray-600 text-sm">Shared components and utilities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testing Strategy */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="bg-emerald-600 rounded-2xl p-3 w-fit mb-6">
                <BeakerIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Testing Excellence</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">95% Test Coverage</div>
                    <div className="text-gray-600 text-sm">Jest with React Testing Library</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">E2E Testing</div>
                    <div className="text-gray-600 text-sm">Playwright automated browser testing</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">API Testing</div>
                    <div className="text-gray-600 text-sm">Comprehensive endpoint validation</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Visual Regression</div>
                    <div className="text-gray-600 text-sm">UI consistency across deployments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Performance */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="bg-purple-600 rounded-2xl p-3 w-fit mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Security & Performance</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">OWASP Compliance</div>
                    <div className="text-gray-600 text-sm">CSP, HSTS, XSS protection</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Core Web Vitals</div>
                    <div className="text-gray-600 text-sm">LCP &lt; 2.5s, FID &lt; 100ms, CLS &lt; 0.1</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Error Monitoring</div>
                    <div className="text-gray-600 text-sm">Sentry integration for real-time alerts</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">WCAG 2.1 AA</div>
                    <div className="text-gray-600 text-sm">Full accessibility compliance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Methodology */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Development Methodology & Standards
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Agile practices enhanced with AI automation for rapid, reliable delivery
            </p>
          </div>

          {/* Implementation Roadmap */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-3xl p-12 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">6-Month Implementation Roadmap</h3>
            <div className="grid md:grid-cols-5 gap-8">
              {[
                {
                  phase: 'Phase 1',
                  title: 'Planning & Design',
                  duration: '6 weeks',
                  tasks: ['AI agent workflows', 'Data architecture', 'Tool selection'],
                  color: 'blue'
                },
                {
                  phase: 'Phase 2',
                  title: 'Pilot Development',
                  duration: '4 weeks',
                  tasks: ['Prototype agents', 'Development team', 'Testing integration'],
                  color: 'emerald'
                },
                {
                  phase: 'Phase 3',
                  title: 'Integration',
                  duration: '6 weeks',
                  tasks: ['Business systems', 'Operations team', 'Admin automation'],
                  color: 'purple'
                },
                {
                  phase: 'Phase 4',
                  title: 'Executive Analytics',
                  duration: '4 weeks',
                  tasks: ['BI dashboards', 'Forecasting models', 'Decision support'],
                  color: 'amber'
                },
                {
                  phase: 'Phase 5',
                  title: 'Optimization',
                  duration: '6 weeks',
                  tasks: ['Performance tuning', 'Continuous learning', 'Scale expansion'],
                  color: 'red'
                }
              ].map((phase, index) => (
                <div key={index} className="text-center">
                  <div className={`bg-${phase.color}-600 text-white rounded-2xl p-4 mb-4`}>
                    <div className="font-bold text-lg">{phase.phase}</div>
                    <div className="text-sm opacity-90">{phase.duration}</div>
                  </div>
                  <div className="font-semibold text-gray-900 mb-3">{phase.title}</div>
                  <div className="space-y-1">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="text-sm text-gray-600">
                        • {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Core Technology Stack</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-xl p-3 mr-4">
                    <CodeBracketIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Next.js 15.3.5 with App Router</div>
                    <div className="text-gray-600 text-sm">React 18 with Server Components, streaming, and advanced caching</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-xl p-3 mr-4">
                    <CloudIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Supabase Database</div>
                    <div className="text-gray-600 text-sm">PostgreSQL with Row Level Security and real-time subscriptions</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-xl p-3 mr-4">
                    <CogIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Stripe Payment Processing</div>
                    <div className="text-gray-600 text-sm">Complete subscription management with webhooks</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-amber-100 rounded-xl p-3 mr-4">
                    <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">AWS Infrastructure</div>
                    <div className="text-gray-600 text-sm">SES email, S3 storage, CloudFront CDN</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Quality Assurance</h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">87/100</div>
                    <div className="text-sm text-gray-600">Platform Health Score</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">99%</div>
                    <div className="text-sm text-gray-600">Payment Success Rate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                    <div className="text-sm text-gray-600">Accessibility Score</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-600 mb-2">100%</div>
                    <div className="text-sm text-gray-600">Mobile Responsive</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="font-semibold text-gray-900 mb-3">Business Automation Ready</div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>✅ DocuSign NDA workflow automation</div>
                    <div>✅ Mailchimp lead nurture sequences</div>
                    <div>✅ AWS S3 document management</div>
                    <div>✅ Stripe subscription automation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Development Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Experience the power of AI-driven development with our Suite of Agents methodology. 
            Let's build something extraordinary together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact"
              className="bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl hover:bg-blue-50 transition-colors"
            >
              Schedule Technical Consultation
            </a>
            <a 
              href="/services"
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Our Services
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}