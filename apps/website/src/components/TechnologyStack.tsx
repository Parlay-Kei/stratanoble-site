'use client';

import { motion } from 'framer-motion';
import { 
  CodeBracketIcon, 
  ServerIcon, 
  CloudIcon, 
  ShieldCheckIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  CreditCardIcon,
  EnvelopeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface TechnologyCategory {
  name: string;
  description: string;
  technologies: {
    name: string;
    description: string;
    version?: string;
    category: 'frontend' | 'backend' | 'infrastructure' | 'ai' | 'security';
  }[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const technologyCategories: TechnologyCategory[] = [
  {
    name: "Frontend Excellence",
    description: "Modern React-based user interface with optimized performance",
    icon: GlobeAltIcon,
    color: "from-blue-500 to-blue-600",
    technologies: [
      { name: "Next.js", description: "React framework with App Router", version: "15.3.5", category: "frontend" },
      { name: "React", description: "Component-based UI library", version: "19", category: "frontend" },
      { name: "TypeScript", description: "Type-safe JavaScript", version: "5.8.3", category: "frontend" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework", category: "frontend" },
      { name: "shadcn/ui", description: "Re-usable component library", category: "frontend" }
    ]
  },
  {
    name: "Backend Infrastructure",
    description: "Scalable serverless architecture with enterprise security",
    icon: ServerIcon,
    color: "from-green-500 to-green-600",
    technologies: [
      { name: "Supabase", description: "Backend-as-a-Service platform", category: "backend" },
      { name: "PostgreSQL", description: "Enterprise database", version: "15", category: "backend" },
      { name: "Edge Functions", description: "Serverless compute with Deno", category: "backend" },
      { name: "Row-Level Security", description: "Database-level access control", category: "security" },
      { name: "JWT Authentication", description: "Secure token-based auth", category: "security" }
    ]
  },
  {
    name: "AI & Automation",
    description: "Advanced AI integration with intelligent workflow automation",
    icon: SparklesIcon,
    color: "from-purple-500 to-purple-600",
    technologies: [
      { name: "OpenAI GPT-4o", description: "Advanced language model", category: "ai" },
      { name: "Suite of Agents", description: "AI-powered workflow automation", category: "ai" },
      { name: "Custom Models", description: "Domain-specific AI fine-tuning", category: "ai" },
      { name: "Intelligent Monitoring", description: "Predictive system health", category: "ai" }
    ]
  },
  {
    name: "Enterprise Integrations",
    description: "Production-ready third-party service integrations",
    icon: CloudIcon,
    color: "from-orange-500 to-orange-600",
    technologies: [
      { name: "Stripe Billing", description: "Subscription payment processing", category: "infrastructure" },
      { name: "AWS SES v2", description: "Transactional email service", category: "infrastructure" },
      { name: "Upstash Redis", description: "Serverless caching and queues", category: "infrastructure" },
      { name: "Netlify Edge", description: "Global CDN and edge functions", category: "infrastructure" }
    ]
  },
  {
    name: "Security & Compliance",
    description: "Multi-layer security with enterprise-grade protection",
    icon: ShieldCheckIcon,
    color: "from-red-500 to-red-600",
    technologies: [
      { name: "XSS Protection", description: "Cross-site scripting prevention", category: "security" },
      { name: "CSRF Tokens", description: "Cross-site request forgery protection", category: "security" },
      { name: "CSP Headers", description: "Content Security Policy", category: "security" },
      { name: "Input Validation", description: "Comprehensive data sanitization", category: "security" }
    ]
  }
];

export function TechnologyStack() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-navy-900 mb-2">Technology Stack</h3>
        <p className="text-navy-600">Enterprise-grade technologies powering scalable, secure, and performant applications</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technologyCategories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative group"
          >
            <div className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-white h-full`}>
              {/* Category Header */}
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <category.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{category.name}</h4>
                  <p className="text-sm text-white/80">{category.description}</p>
                </div>
              </div>

              {/* Technologies List */}
              <div className="space-y-3">
                {category.technologies.map((tech, techIndex) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: (index * 0.1) + (techIndex * 0.05) }}
                    className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-sm">{tech.name}</h5>
                        <p className="text-xs text-white/70 mt-1">{tech.description}</p>
                      </div>
                      {tech.version && (
                        <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                          {tech.version}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Performance Metrics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="md:col-span-2 lg:col-span-3"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-navy-600 rounded-xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-4 text-center">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <CpuChipIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">37s</div>
                <div className="text-xs text-white/80">Build Time</div>
              </div>
              <div className="text-center">
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">95/100</div>
                <div className="text-xs text-white/80">Security Score</div>
              </div>
              <div className="text-center">
                <GlobeAltIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">&lt;2.5s</div>
                <div className="text-xs text-white/80">Core Web Vitals</div>
              </div>
                             <div className="text-center">
                 <CircleStackIcon className="w-8 h-8 mx-auto mb-2" />
                 <div className="text-2xl font-bold">99.9%</div>
                 <div className="text-xs text-white/80">Uptime</div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
