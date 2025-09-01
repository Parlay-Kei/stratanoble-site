'use client';

import { motion } from 'framer-motion';
import { ArrowTopRightOnSquareIcon, CodeBracketIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TechStack {
  category: string;
  technologies: string[];
}

interface Metric {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PortfolioCardProps {
  title: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  techStack: TechStack[];
  metrics: Metric[];
  imageUrl?: string;
  demoUrl?: string;
  featured?: boolean;
}

export function PortfolioCard({
  title,
  description,
  challenge,
  solution,
  results,
  techStack,
  metrics,
  imageUrl,
  demoUrl,
  featured = false
}: PortfolioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-2xl overflow-hidden ${
        featured 
          ? 'bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-900 text-white shadow-2xl' 
          : 'bg-white shadow-lg hover:shadow-xl'
      } transition-all duration-300 hover:scale-[1.02]`}
    >
      {featured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-emerald-500 text-white border-0">
            Featured Case Study
          </Badge>
        </div>
      )}

      {/* Hero Image */}
      {imageUrl && (
        <div className="relative h-64 bg-gradient-to-br from-navy-100 to-emerald-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl text-navy-300">🏗️</div>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className={`text-2xl font-bold mb-2 ${featured ? 'text-white' : 'text-navy-900'}`}>
            {title}
          </h3>
          <p className={`text-lg ${featured ? 'text-navy-100' : 'text-navy-600'}`}>
            {description}
          </p>
        </div>

        {/* Challenge & Solution */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className={`font-semibold mb-2 ${featured ? 'text-emerald-300' : 'text-navy-800'}`}>
              Challenge
            </h4>
            <p className={`text-sm ${featured ? 'text-navy-100' : 'text-navy-600'}`}>
              {challenge}
            </p>
          </div>
          <div>
            <h4 className={`font-semibold mb-2 ${featured ? 'text-emerald-300' : 'text-navy-800'}`}>
              Solution
            </h4>
            <p className={`text-sm ${featured ? 'text-navy-100' : 'text-navy-600'}`}>
              {solution}
            </p>
          </div>
        </div>

        {/* Key Results */}
        <div className="mb-8">
          <h4 className={`font-semibold mb-3 ${featured ? 'text-emerald-300' : 'text-navy-800'}`}>
            Key Results
          </h4>
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                  featured ? 'bg-emerald-400' : 'bg-emerald-500'
                }`} />
                <span className={`text-sm ${featured ? 'text-navy-100' : 'text-navy-600'}`}>
                  {result}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <metric.icon className={`w-6 h-6 mx-auto mb-2 ${
                featured ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
              <div className={`text-lg font-bold ${featured ? 'text-white' : 'text-navy-900'}`}>
                {metric.value}
              </div>
              <div className={`text-xs ${featured ? 'text-navy-200' : 'text-navy-500'}`}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mb-8">
          <h4 className={`font-semibold mb-3 ${featured ? 'text-emerald-300' : 'text-navy-800'}`}>
            Technology Stack
          </h4>
          <div className="space-y-3">
            {techStack.map((stack, index) => (
              <div key={index}>
                <div className={`text-sm font-medium mb-2 ${featured ? 'text-navy-200' : 'text-navy-600'}`}>
                  {stack.category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {stack.technologies.map((tech, techIndex) => (
                    <Badge 
                      key={techIndex} 
                      variant={featured ? "secondary" : "outline"}
                      className={featured ? 'bg-navy-700 text-navy-100' : ''}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {demoUrl && (
          <div className="flex justify-center">
            <Button
              variant={featured ? "secondary" : "outline"}
              className={featured ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
              onClick={() => window.open(demoUrl, '_blank', 'noopener,noreferrer')}
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
              View Case Study
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
