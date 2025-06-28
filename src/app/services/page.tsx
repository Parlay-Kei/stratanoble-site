"use client"

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { services } from '@/data/services'
import { ServiceCard } from './ServiceCard'

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244]">
      <Header />
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Our Services
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#C0C0C0]">
              Comprehensive solutions to transform your passion into a profitable business
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.subtitle}
                icon={<span className="text-3xl">{service.icon}</span>}
                ctaText="Learn More"
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
} 