'use client'

import { useEffect, useState } from 'react'
import { CTA_LABELS } from '@/lib/cta-labels'
import {
  ArrowRightIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
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

  const handleServiceClick = (serviceTitle: string, serviceLink: string) => {
    trackClick()
    // Navigate to the service link
    window.location.href = serviceLink
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

      {/* Urgency Banner */}
      <div className="absolute top-0 left-0 w-full bg-emerald-600 text-white py-2 text-center text-sm font-medium">
        🔥 Limited spots available for Q1 2026. Book your strategy call today.
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
              Pick Your Fast Track
            </h2>
            <p className="mt-4 text-lg leading-8 text-navy-600">
              4 proven systems. 237 success stories. Which one fits you?
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
                  onClick={() => handleServiceClick(service.title, service.link)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: _index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleServiceClick(service.title, service.link)
                    }
                  }}
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
                  <div className="space-y-3 relative z-10">
                    <h3 className="text-xl font-bold text-navy-900 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-emerald-600 font-semibold">
                      {service.subtitle}
                    </p>
                    <p className="text-navy-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                    {service.price && (
                      <p className="text-2xl font-bold text-navy-900 pt-2">
                        {service.price}
                      </p>
                    )}
                  </div>

                  {/* Quick Benefits List - Always Visible */}
                  <div className="mt-4 pt-4 border-t border-silver-200">
                    <ul className="space-y-2">
                      {service.whatYouGet.slice(0, 3).map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-navy-600"
                        >
                          <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button (always visible) */}
                  <div className="mt-6 relative z-10">
                    <Link
                      href={service.link}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleServiceClick(service.title, service.link)
                      }}
                    >
                      Get Started
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
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
                  237 Entrepreneurs Started Here
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Book your free strategy call. No pitch, just clarity.
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
{CTA_LABELS.SCHEDULE_CONSULTATION}
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
