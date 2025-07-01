'use client';

import { useState } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { services, serviceCategories } from '@/data/services';
import { ServiceCard } from './ServiceCard';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

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

          {/* Category Filter */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-[#50C878] text-white shadow-lg'
                    : 'bg-white/10 text-[#C0C0C0] hover:bg-white/20 border border-white/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                subtitle={service.subtitle}
                description={service.description}
                icon={<span className="text-3xl">{service.icon}</span>}
                price={service.price}
                whatYouGet={service.whatYouGet}
                packages={service.packages}
                ctaPrimary={service.ctaPrimary}
                ctaSecondary={service.ctaSecondary}
                calendlyLink={service.calendlyLink}
                category={service.category}
                link={service.link}
              />
            ))}
          </div>

          {/* Add a direct link to Brand & Digital Presence Packages */}
          <div className="mt-12 text-center">
            <a href="/services/brand-digital" className="inline-block px-8 py-3 bg-[#003366] hover:bg-[#50C878] text-white font-bold rounded-full transition-colors border border-white/20">
              Explore Brand & Digital Presence Packages
            </a>
          </div>

          {/* No services message */}
          {filteredServices.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-[#C0C0C0] text-lg">
                No services found for the selected category.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
