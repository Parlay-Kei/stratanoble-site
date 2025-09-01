'use client';

import { motion } from 'framer-motion';
import { PortfolioCard } from './PortfolioCard';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { TechnologyStack } from './TechnologyStack';
import { DocumentationAuthority } from './DocumentationAuthority';
import { EnterpriseDevelopmentMethodology } from './EnterpriseDevelopmentMethodology';
import { 
  CodeBracketIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ServerIcon,
  CloudIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CircleStackIcon,
  CreditCardIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// DataSolutionsLV Case Study Data
const datasolutionslvData = {
  title: "DataSolutionsLV Platform",
  description: "Enterprise-grade SaaS platform for data solutions with 1,400+ active users and zero downtime",
  challenge: "Build a production-ready SaaS platform with enterprise-grade security, scalability, and performance requirements.",
  solution: "Delivered a comprehensive platform architecture with advanced security, AI automation, and scalable infrastructure supporting enterprise-level operations.",
  results: [
    "1,400+ active users tested and validated",
    "99.9% uptime with zero downtime deployment",
    "95/100 production readiness score",
    "37-second optimized build times",
    "100% TypeScript compliance with zero warnings",
    "Enterprise-grade security with multi-layer protection"
  ],
  techStack: [
    {
      category: "Frontend",
      technologies: ["Next.js 15.3.5", "React 19", "TypeScript 5.8.3", "Tailwind CSS", "shadcn/ui"]
    },
    {
      category: "Backend",
      technologies: ["Supabase Edge Functions", "PostgreSQL 15", "Row-Level Security", "JWT Authentication"]
    },
    {
      category: "Payments & Email",
      technologies: ["Stripe Billing", "AWS SES v2", "Subscription Management", "Transactional Email"]
    },
    {
      category: "Infrastructure",
      technologies: ["Netlify Edge", "Upstash Redis", "GitHub Actions", "Automated Testing"]
    },
    {
      category: "AI & Automation",
      technologies: ["OpenAI GPT-4o", "Suite of Agents", "Workflow Automation", "Intelligent Monitoring"]
    }
  ],
  metrics: [
    { label: "Active Users", value: "1,400+", icon: ChartBarIcon },
    { label: "Uptime", value: "99.9%", icon: ShieldCheckIcon },
    { label: "Build Time", value: "37s", icon: CodeBracketIcon },
    { label: "Security Score", value: "95/100", icon: ShieldCheckIcon }
  ],
  featured: true
};

const architectureLayers = [
  {
    name: "Frontend Layer",
    description: "Modern React-based user interface with optimized performance",
    technologies: ["Next.js 15.3.5", "React 19", "TypeScript", "Tailwind CSS"],
    icon: GlobeAltIcon,
    color: "border-blue-500"
  },
  {
    name: "API Layer",
    description: "Edge functions with comprehensive security and validation",
    technologies: ["Supabase Edge Functions", "Zod Validation", "Rate Limiting", "CORS"],
    icon: ServerIcon,
    color: "border-green-500"
  },
  {
    name: "Database Layer",
    description: "PostgreSQL with enterprise-grade security and performance",
    technologies: ["PostgreSQL 15", "Row-Level Security", "Connection Pooling", "Read Replicas"],
    icon: CircleStackIcon,
    color: "border-purple-500"
  },
  {
    name: "Integration Layer",
    description: "Third-party services with robust error handling",
    technologies: ["Stripe Billing", "AWS SES v2", "OpenAI GPT-4o", "Upstash Redis"],
    icon: CloudIcon,
    color: "border-orange-500"
  },
  {
    name: "Security Layer",
    description: "Multi-layer protection with compliance standards",
    technologies: ["XSS Protection", "CSRF Tokens", "CSP Headers", "Input Sanitization"],
    icon: ShieldCheckIcon,
    color: "border-red-500"
  }
];

export function DevelopmentPortfolio() {
  return (
    <section className="py-20 bg-gradient-to-br from-navy-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Development Portfolio
          </h2>
          <p className="text-xl text-navy-600 max-w-3xl mx-auto leading-relaxed">
            Showcasing enterprise-grade platform development with proven results, 
            technical excellence, and measurable business impact.
          </p>
        </motion.div>

        {/* Featured Case Study */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <PortfolioCard {...datasolutionslvData} />
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <ArchitectureDiagram
            title="Enterprise Architecture Overview"
            description="Multi-layer architecture designed for scalability, security, and performance"
            layers={architectureLayers}
          />
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <TechnologyStack />
        </motion.div>

        {/* Technical Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <CodeBracketIcon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Code Quality</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-2">100%</p>
            <p className="text-sm text-navy-600">TypeScript compliance with zero warnings</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <ShieldCheckIcon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Security Score</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-2">95/100</p>
            <p className="text-sm text-navy-600">Enterprise-grade security standards</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <ChartBarIcon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Performance</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-2">&lt;2.5s</p>
            <p className="text-sm text-navy-600">Core Web Vitals optimized</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <ServerIcon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Uptime</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-2">99.9%</p>
            <p className="text-sm text-navy-600">Production reliability target</p>
          </div>
        </motion.div>

        {/* Development Authority Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-navy-900 to-emerald-900 rounded-2xl p-8 text-white text-center mb-16"
        >
          <h3 className="text-2xl font-bold mb-4">
            Development Authority Validation
          </h3>
          <p className="text-lg text-navy-100 mb-6 max-w-4xl mx-auto">
            Our development methodology produces <strong>investment-grade platforms</strong> that 
            appeal to strategic buyers seeking enterprise-ready solutions with reduced acquisition 
            risk and clear expansion pathways.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold text-emerald-300 mb-2">Risk Reduction</h4>
              <p className="text-sm text-navy-100">Enterprise-grade foundation eliminates technical debt concerns</p>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-300 mb-2">Professional Standards</h4>
              <p className="text-sm text-navy-100">Documentation and architecture exceed industry norms</p>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-300 mb-2">Scalable Foundation</h4>
              <p className="text-sm text-navy-100">Production-ready platform supports immediate growth</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Documentation Authority Section */}
      <DocumentationAuthority />

      {/* Enterprise Development Methodology Section */}
      <EnterpriseDevelopmentMethodology />
    </section>
  );
}
