'use client'

import { StarIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

import { testimonials } from '@/data/testimonials'

interface TestimonialCardProps {
  testimonial: (typeof testimonials)[number]
  variant?: 'default' | 'featured'
  className?: string
}

export function TestimonialCard({ testimonial, variant = 'default', className = '' }: TestimonialCardProps) {
  const isFeatured = variant === 'featured'
  
  return (
    <motion.div
      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-silver-200 hover:border-emerald-300 ${className}`}
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Quote Icon */}
      <div className="mb-4">
        <svg 
          className="h-8 w-8 text-emerald-200" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
      </div>

      {/* Testimonial Content */}
      <div className="space-y-4">
        {/* Quote Text */}
        <blockquote className="text-navy-700 leading-relaxed">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating ? 'text-yellow-400' : 'text-silver-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-navy-500">
            {testimonial.rating}/5
          </span>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 pt-2 border-t border-silver-100">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-navy-100 flex items-center justify-center text-lg font-semibold text-navy-700">
            {testimonial.author.name.charAt(0)}
          </div>
          
          {/* Author Details */}
          <div className="flex-1">
            <div className="font-semibold text-navy-900">
              {testimonial.author.name}
            </div>
            <div className="text-sm text-navy-600">
              {testimonial.author.title}
            </div>
            {testimonial.author.company && (
              <div className="text-sm text-emerald-600 font-medium">
                {testimonial.author.company}
              </div>
            )}
          </div>
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
            <StarIcon className="h-3 w-3" />
            Featured Review
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Featured testimonials component for the services section
export function FeaturedTestimonials() {
  const featured = testimonials.filter(t => t.featured).slice(0, 2)
  
  return (
    <section className="py-16 bg-silver-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-navy-600 max-w-2xl mx-auto">
            &ldquo;Real results from real entrepreneurs who&apos;ve transformed their businesses with our guidance.&rdquo;
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {featured.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              variant="featured"
            />
          ))}
        </div>
      </div>
    </section>
  )
} 