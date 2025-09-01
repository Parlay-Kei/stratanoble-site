'use client';

import { motion } from 'framer-motion';
import { 
  ServerIcon, 
  CloudIcon, 
  ShieldCheckIcon, 
  CpuChipIcon,
  GlobeAltIcon,
  CircleStackIcon,
  CreditCardIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface ArchitectureLayer {
  name: string;
  description: string;
  technologies: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ArchitectureDiagramProps {
  title: string;
  description: string;
  layers: ArchitectureLayer[];
}

export function ArchitectureDiagram({ title, description, layers }: ArchitectureDiagramProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-navy-900 mb-2">{title}</h3>
        <p className="text-navy-600">{description}</p>
      </div>

      {/* Architecture Layers */}
      <div className="space-y-6">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative p-6 rounded-xl border-2 ${layer.color} transition-all duration-300 hover:shadow-md`}
          >
            {/* Layer Header */}
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${layer.color.replace('border-', 'bg-').replace('-500', '-100')} mr-4`}>
                <layer.icon className={`w-6 h-6 ${layer.color.replace('border-', 'text-').replace('-500', '-600')}`} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-navy-900">{layer.name}</h4>
                <p className="text-sm text-navy-600">{layer.description}</p>
              </div>
            </div>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {layer.technologies.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${layer.color.replace('border-', 'bg-').replace('-500', '-100')} ${layer.color.replace('border-', 'text-').replace('-500', '-700')}`}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Connection Arrow */}
            {index < layers.length - 1 && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-6 bg-white border-2 border-navy-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-navy-400 rounded-full"></div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Architecture Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-navy-50 rounded-xl"
      >
        <h4 className="text-lg font-semibold text-navy-900 mb-4">Architecture Benefits</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <ShieldCheckIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h5 className="font-medium text-navy-900">Enterprise Security</h5>
            <p className="text-sm text-navy-600">Multi-layer protection with compliance standards</p>
          </div>
          <div className="text-center">
            <GlobeAltIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h5 className="font-medium text-navy-900">Global Scalability</h5>
            <p className="text-sm text-navy-600">Edge distribution with auto-scaling infrastructure</p>
          </div>
          <div className="text-center">
            <CpuChipIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h5 className="font-medium text-navy-900">High Performance</h5>
            <p className="text-sm text-navy-600">Optimized for speed with intelligent caching</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
