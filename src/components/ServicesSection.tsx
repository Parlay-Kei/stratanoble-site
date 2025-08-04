'use client'

import { useEffect, useState } from 'react'
import { 
  ArrowRightIcon, 
  CheckIcon, 
  LightBulbIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useServiceTracking, useContactFormTracking } from '@/lib/useAnalytics'
import { services } from '@/data/services'

export function ServicesSection() {
  const [progress, setProgress] = useState(0)
  const [lastViewedService, setLastViewedService] = useState<string | null>(null)
  const [, setHoveredService] = useState<string | null>(null)
  const { trackHover, trackClick, trackDetails } = useServiceTracking('')
  const { trackSubmit } = useContactFormTracking()

  // Track scroll progress for the progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setProgress(Math.min(scrollPercent, 100))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleServiceHover = (serviceTitle: string) => {
    setLastViewedService(serviceTitle)
    setHoveredService(serviceTitle)
    trackHover()
  }

  const handleServiceLeave = () => {
    setHoveredService(null)
  }

  const handleServiceClick = (_serviceTitle: string) => {
    trackClick()
  }

  const handleServiceDetails = (_serviceTitle: string) => {
    trackDetails()
  }

  const getContactUrl = () => {
    if (lastViewedService) {
      return `/contact?service=${encodeURIComponent(lastViewedService)}`
    }
    return '/contact'
  }

  const handleContactClick = () => {
    trackSubmit({
      service: lastViewedService || 'general',
      source: 'services_section',
      cta_type: 'consultation_request'
    })
  }


  // Get the appropriate icon component for each service
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'lightbulb':
        return <LightBulbIcon className="h-8 w-8 text-emerald-600" />
      case 'academic-cap':
        return <AcademicCapIcon className="h-8 w-8 text-emerald-600" />
      case 'chart-bar':
        return <ChartBarIcon className="h-8 w-8 text-emerald-600" />
      case 'paint-brush':
        return <PaintBrushIcon className="h-8 w-8 text-emerald-600" />
      default:
        return <LightBulbIcon className="h-8 w-8 text-emerald-600" />
    }
  }

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-br from-silver-50 to-white relative">
      {/* Progress Bar */}
      <div className="fixed top-16 left-0 w-full h-1 bg-silver-200 z-40">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-navy-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div 
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight heading-primary sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-lg leading-8 text-navy-600">
              Comprehensive solutions to transform your passion into a profitable business
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, _index) => {
              return (
                <motion.div
                  key={service.title}
                  className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-silver-200 hover:border-emerald-300 cursor-pointer overflow-hidden"
                  onMouseEnter={() => handleServiceHover(service.title)}
                  onMouseLeave={handleServiceLeave}
                  onFocus={() => handleServiceHover(service.title)}
                  onBlur={handleServiceLeave}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: _index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  {/* Enhanced Service Icon */}
                  <div className="mb-6 relative">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-navy-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      {getServiceIcon(service.icon)}
                    </motion.div>
                  </div>

                  {/* Service Content */}
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-xl font-bold text-navy-900 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-navy-600 leading-relaxed">
                      {service.subtitle}
                    </p>
                    <p className="text-navy-500 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Enhanced Hover State - What You Get */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 border-2 border-emerald-200 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ scale: 0.95 }}
                    whileHover={{ scale: 1 }}
                    onAnimationStart={() => handleServiceDetails(service.title)}
                  >
                    <div className="h-full flex flex-col justify-center">
                      <motion.h4 
                        className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <CheckIcon className="h-5 w-5 text-emerald-500" />
                        What You Get:
                      </motion.h4>
                      <ul className="space-y-3">
                        {service.whatYouGet.map((item, idx) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-start gap-3 text-sm text-navy-700"
                            initial={{ opacity: 0, x: -20 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                          >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      {/* Quick CTA on Hover */}
                      <motion.div 
                        className="mt-6 pt-4 border-t border-emerald-200"
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link
                          href={service.link}
                          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold text-sm group/link"
                          onClick={() => handleServiceClick(service.title)}
                        >
                          Learn more about this service
                          <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Learn More Link (visible when not hovered) */}
                  <div className="mt-6 relative z-10">
                    <Link
                      href={service.link}
                      className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium group/link"
                      onClick={() => handleServiceClick(service.title)}
                    >
                      Learn more
                      <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>


          {/* Enhanced CTA Section with Progress Nudge */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-navy-600 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Transform Your Business?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  {lastViewedService 
                    ? `Let's discuss your ${lastViewedService.toLowerCase()} needs`
                    : "Let's discuss how we can help you achieve your goals"
                  }
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={getContactUrl()}
                    className="btn bg-white text-navy-900 hover:bg-silver-100 btn-lg inline-flex items-center group shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleContactClick}
                  >
                    Schedule a Consultation
                    <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
