import React from 'react';
import { Metadata } from 'next';
import {
  ChartBarIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UsersIcon,
  CpuChipIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  BeakerIcon,
  CloudIcon,
  CogIcon,
  BoltIcon,
  StarIcon,
  TrophyIcon,
  GlobeAltIcon,
  ServerIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Development Portfolio | Strata Noble - Enterprise Platform Showcase',
  description: 'Explore our enterprise development portfolio featuring DataSolutionsLV platform serving 1,400+ users with 99.9% uptime and premium valuation results.',
  keywords: 'development portfolio, enterprise platforms, DataSolutionsLV, case study, technical excellence, platform development',
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <TrophyIcon className="h-5 w-5" />
              Enterprise Development Portfolio
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Platform{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Excellence
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Showcasing enterprise-grade platform development that delivers measurable business 
              value and commands premium valuations in the marketplace.
            </p>
          </div>

          {/* Portfolio Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Active Users', value: '1,400+', icon: UsersIcon, color: 'emerald' },
              { label: 'Uptime Achievement', value: '99.9%', icon: CheckBadgeIcon, color: 'blue' },
              { label: 'Premium Valuation', value: '20-30%', icon: ArrowTrendingUpIcon, color: 'purple' },
              { label: 'Security Score', value: '95/100', icon: ShieldCheckIcon, color: 'amber' }
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

      {/* Featured Project: DataSolutionsLV */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Project: DataSolutionsLV Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Enterprise SaaS platform designed for data solutions with advanced security, 
              AI automation, and scalable architecture supporting 1,400+ active users.
            </p>
          </div>

          {/* Project Overview */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">🎯 Project Challenge</h3>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Build a production-ready SaaS platform for data solutions with enterprise-grade 
                  security, scalability, and performance requirements that could support rapid 
                  growth and attract strategic acquisition opportunities.
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Key Requirements</h4>
                  <div className="space-y-3">
                    {[
                      'Support 1,400+ concurrent active users',
                      'Achieve 99.9% uptime with zero-downtime deployments',
                      'Enterprise-grade security and compliance',
                      'AI automation and intelligent workflows',
                      'Scalable architecture for future growth',
                      'Professional documentation standards'
                    ].map((requirement, index) => (
                      <div key={index} className="flex items-start">
                        <CheckBadgeIcon className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">🚀 Solution Delivered</h3>
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">37s</div>
                    <div className="text-sm text-gray-600">Optimized Build Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">300kB</div>
                    <div className="text-sm text-gray-600">First Load Bundle</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                    <div className="text-sm text-gray-600">TypeScript Safety</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-600 mb-2">Zero</div>
                    <div className="text-sm text-gray-600">ESLint Warnings</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Performance Excellence</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>LCP (Largest Contentful Paint)</span>
                      <span className="font-semibold text-green-600">&lt; 2.5s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FID (First Input Delay)</span>
                      <span className="font-semibold text-green-600">&lt; 100ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CLS (Cumulative Layout Shift)</span>
                      <span className="font-semibold text-green-600">&lt; 0.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Success Rate</span>
                      <span className="font-semibold text-green-600">99%+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              🏗️ Enterprise Architecture Excellence
            </h3>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Frontend Layer */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 rounded-2xl p-3 mr-4">
                    <GlobeAltIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900">Frontend Excellence</h4>
                    <p className="text-blue-700">Modern React Architecture</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { tech: 'Next.js 15.3.5', desc: 'App Router with Server Components' },
                    { tech: 'React 19', desc: 'Latest features and optimizations' },
                    { tech: 'TypeScript 5.8.3', desc: 'Strict type safety enforcement' },
                    { tech: 'Tailwind CSS', desc: 'Custom design system' },
                    { tech: 'shadcn/ui', desc: 'Accessible component library' }
                  ].map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4">
                      <div className="font-semibold text-blue-900">{item.tech}</div>
                      <div className="text-sm text-blue-700">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backend Layer */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-8 border border-emerald-200">
                <div className="flex items-center mb-6">
                  <div className="bg-emerald-600 rounded-2xl p-3 mr-4">
                    <ServerIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-emerald-900">Backend Infrastructure</h4>
                    <p className="text-emerald-700">Scalable Edge Computing</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { tech: 'Supabase Edge', desc: 'Global edge function runtime' },
                    { tech: 'PostgreSQL 15', desc: 'Enterprise database with RLS' },
                    { tech: 'JWT Authentication', desc: 'Secure user management' },
                    { tech: 'Row-Level Security', desc: 'Data access control' },
                    { tech: 'Real-time Subscriptions', desc: 'Live data synchronization' }
                  ].map((item, index) => (
                    <div key={index} className="border-l-4 border-emerald-400 pl-4">
                      <div className="font-semibold text-emerald-900">{item.tech}</div>
                      <div className="text-sm text-emerald-700">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integration Layer */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-200">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-600 rounded-2xl p-3 mr-4">
                    <CloudIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-purple-900">Enterprise Integrations</h4>
                    <p className="text-purple-700">Third-party Service Layer</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { tech: 'Stripe Billing', desc: 'Complete subscription management' },
                    { tech: 'AWS SES v2', desc: 'Transactional email delivery' },
                    { tech: 'Upstash Redis', desc: 'Caching and job processing' },
                    { tech: 'OpenAI GPT-4o', desc: 'AI-powered features' },
                    { tech: 'Webhook Processing', desc: 'Event-driven integrations' }
                  ].map((item, index) => (
                    <div key={index} className="border-l-4 border-purple-400 pl-4">
                      <div className="font-semibold text-purple-900">{item.tech}</div>
                      <div className="text-sm text-purple-700">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-gray-900 rounded-3xl p-8 text-white">
              <h4 className="text-2xl font-bold text-center mb-8">System Architecture Flow</h4>
              <div className="grid lg:grid-cols-5 gap-6 items-center">
                <div className="text-center">
                  <div className="bg-blue-600/20 border border-blue-400/30 rounded-2xl p-4 mb-3">
                    <GlobeAltIcon className="h-8 w-8 text-blue-400 mx-auto" />
                  </div>
                  <div className="font-semibold text-blue-300">Client Layer</div>
                  <div className="text-xs text-blue-200">Next.js Frontend</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-emerald-600/20 border border-emerald-400/30 rounded-2xl p-4 mb-3">
                    <ServerIcon className="h-8 w-8 text-emerald-400 mx-auto" />
                  </div>
                  <div className="font-semibold text-emerald-300">API Gateway</div>
                  <div className="text-xs text-emerald-200">Edge Functions</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-600/20 border border-purple-400/30 rounded-2xl p-4 mb-3">
                    <CircleStackIcon className="h-8 w-8 text-purple-400 mx-auto" />
                  </div>
                  <div className="font-semibold text-purple-300">Database</div>
                  <div className="text-xs text-purple-200">PostgreSQL</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-amber-600/20 border border-amber-400/30 rounded-2xl p-4 mb-3">
                    <CloudIcon className="h-8 w-8 text-amber-400 mx-auto" />
                  </div>
                  <div className="font-semibold text-amber-300">Integrations</div>
                  <div className="text-xs text-amber-200">Third-party APIs</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-red-600/20 border border-red-400/30 rounded-2xl p-4 mb-3">
                    <ShieldCheckIcon className="h-8 w-8 text-red-400 mx-auto" />
                  </div>
                  <div className="font-semibold text-red-300">Security</div>
                  <div className="text-xs text-red-200">Multi-layer</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Integration Showcase */}
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-12 text-white mb-20">
            <div className="text-center mb-12">
              <CpuChipIcon className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">🤖 Advanced AI Integration</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Revolutionary Suite of Agents architecture delivering unprecedented automation and intelligence
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'Development Agents',
                  description: 'Automated coding, review, and testing workflows',
                  icon: CodeBracketIcon,
                  features: ['AI code generation', 'Automated testing', 'Quality assurance', 'Documentation']
                },
                {
                  title: 'Operations Agents',
                  description: 'Intelligent system monitoring and optimization',
                  icon: ChartBarIcon,
                  features: ['Anomaly detection', 'Auto-scaling', 'Incident response', 'Performance tuning']
                },
                {
                  title: 'Administrative Agents',
                  description: 'Business process automation and workflows',
                  icon: DocumentTextIcon,
                  features: ['User onboarding', 'Billing automation', 'Communication', 'Compliance']
                },
                {
                  title: 'Executive Agents',
                  description: 'Strategic insights and business intelligence',
                  icon: TrophyIcon,
                  features: ['Analytics dashboards', 'Forecasting', 'Decision support', 'Market analysis']
                }
              ].map((agent, index) => (
                <div key={index} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                  <agent.icon className="h-10 w-10 text-blue-400 mb-4" />
                  <h4 className="font-bold text-white mb-3">{agent.title}</h4>
                  <p className="text-gray-300 text-sm mb-4">{agent.description}</p>
                  <div className="space-y-2">
                    {agent.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-xs text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Performance */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">🔒 Enterprise Security</h3>
              <div className="space-y-6">
                {[
                  {
                    title: 'Multi-Layer Protection',
                    description: 'Comprehensive security with input validation, XSS protection, CSRF tokens, and CSP headers',
                    score: '95/100'
                  },
                  {
                    title: 'Compliance Ready',
                    description: 'Regular security audits, structured logging, and comprehensive audit trails',
                    score: 'Enterprise'
                  },
                  {
                    title: 'Data Protection',
                    description: 'Row-level security policies, encrypted data storage, and secure API endpoints',
                    score: 'Verified'
                  }
                ].map((security, index) => (
                  <div key={index} className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-red-900">{security.title}</h4>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {security.score}
                      </span>
                    </div>
                    <p className="text-red-700 text-sm">{security.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">⚡ Performance Excellence</h3>
              <div className="bg-gray-50 rounded-2xl p-8">
                <h4 className="font-bold text-gray-900 mb-6">Core Web Vitals</h4>
                <div className="space-y-4 mb-6">
                  {[
                    { metric: 'LCP', value: '< 2.5s', description: 'Largest Contentful Paint' },
                    { metric: 'FID', value: '< 100ms', description: 'First Input Delay' },
                    { metric: 'CLS', value: '< 0.1', description: 'Cumulative Layout Shift' }
                  ].map((vital, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{vital.metric}</div>
                        <div className="text-sm text-gray-600">{vital.description}</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{vital.value}</div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">31</div>
                      <div className="text-xs text-gray-600">Pages Pre-Generated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">99%+</div>
                      <div className="text-xs text-gray-600">Uptime Target</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">37s</div>
                      <div className="text-xs text-gray-600">Build Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Value Delivered */}
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">💰 Measurable Business Value</h3>
              <p className="text-emerald-100 max-w-3xl mx-auto">
                Professional development standards that deliver tangible ROI and position 
                platforms for premium valuations and strategic acquisition.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                {
                  metric: '20-30%',
                  label: 'Premium Valuation',
                  description: 'Above market rate due to reduced technical risk',
                  icon: ArrowTrendingUpIcon
                },
                {
                  metric: 'Zero',
                  label: 'Technical Debt',
                  description: 'Clean architecture and professional standards',
                  icon: CheckBadgeIcon
                },
                {
                  metric: '1,400+',
                  label: 'User Capacity',
                  description: 'Proven scalability under production load',
                  icon: UsersIcon
                },
                {
                  metric: '99%+',
                  label: 'Reliability',
                  description: 'Enterprise-grade uptime and performance',
                  icon: TrophyIcon
                }
              ].map((value, index) => (
                <div key={index} className="text-center">
                  <value.icon className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
                  <div className="text-4xl font-bold mb-2">{value.metric}</div>
                  <div className="font-semibold text-emerald-100 mb-2">{value.label}</div>
                  <div className="text-sm text-emerald-200">{value.description}</div>
                </div>
              ))}
            </div>

            <div className="text-center pt-8 border-t border-emerald-400/20">
              <h4 className="text-xl font-bold text-emerald-100 mb-4">Strategic Platform Positioning</h4>
              <p className="text-emerald-200 max-w-4xl mx-auto">
                <strong className="text-white">Investment-grade platforms</strong> developed with our methodology 
                appeal to strategic buyers seeking enterprise-ready solutions with comprehensive documentation, 
                scalable architecture, and reduced acquisition risk that enables immediate growth and expansion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Build Your Portfolio Success?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Let's create an enterprise-grade platform that showcases your vision while 
            commanding premium valuations through professional development excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              Start Your Project
            </Link>
            <Link 
              href="/methodology"
              className="border-2 border-emerald-600 text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:bg-emerald-50 transition-colors"
            >
              View Our Methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}