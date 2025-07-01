'use client'

import { motion } from 'framer-motion'

interface ClientLogo {
  name: string
  logo: string
  url?: string
}

// Enhanced client logos with more variety
const clientLogos: ClientLogo[] = [
  { name: 'TechStart Inc', logo: '🚀' },
  { name: 'InnovateCorp', logo: '💡' },
  { name: 'GrowthLabs', logo: '📈' },
  { name: 'FutureWorks', logo: '🌟' },
  { name: 'ScaleUp Solutions', logo: '⚡' },
  { name: 'Vision Ventures', logo: '🎯' },
  { name: 'Digital Dynamics', logo: '🌐' },
  { name: 'Cloud Catalyst', logo: '☁️' },
  { name: 'Data Driven', logo: '📊' },
  { name: 'Smart Solutions', logo: '🧠' },
  { name: 'Next Gen Tech', logo: '🔮' },
  { name: 'Elite Enterprises', logo: '🏆' },
]

interface ClientLogoStripProps {
  title?: string
  subtitle?: string
  className?: string
  variant?: 'default' | 'compact'
}

export function ClientLogoStrip({ 
  title = "Trusted by innovative companies",
  subtitle,
  className = '',
  variant = 'default'
}: ClientLogoStripProps) {
  return (
    <motion.div 
      className={`py-12 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {variant === 'compact' ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-8 md:gap-12 overflow-hidden">
            <div className="flex gap-8 md:gap-12 animate-scroll">
              {[...clientLogos, ...clientLogos].map((client, index) => (
                <motion.div
                  key={`${client.name}-${index}`}
                  className="flex items-center gap-2 text-navy-600 hover:text-emerald-600 transition-colors"
                  title={client.name}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-xl">{client.logo}</span>
                  <span className="text-sm font-medium hidden sm:block">{client.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-silver-200 pt-12">
          <div className="text-center mb-8">
            <h3 className="text-sm font-medium text-navy-600 mb-2">{title}</h3>
            {subtitle && (
              <p className="text-xs text-navy-500">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-8 md:gap-12 overflow-hidden">
            <div className="flex gap-8 md:gap-12 animate-scroll">
              {[...clientLogos, ...clientLogos].map((client, index) => (
                <motion.div
                  key={`${client.name}-${index}`}
                  className="flex items-center gap-2 text-navy-600 hover:text-emerald-600 transition-colors group"
                  title={client.name}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {client.logo}
                  </span>
                  <span className="text-sm font-medium hidden sm:block group-hover:font-semibold transition-all duration-300">
                    {client.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-navy-500">
            <div className="flex items-center gap-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              <span>500+ Projects Completed</span>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              <span>98% Client Satisfaction</span>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              <span>5+ Years Experience</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
} 