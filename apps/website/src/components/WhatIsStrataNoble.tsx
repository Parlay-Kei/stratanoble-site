'use client';

import React from 'react'
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  BuildingOfficeIcon,
  LightBulbIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export function WhatIsStrataNoble() {
  // Primary identity statement from MESSAGING_FRAMEWORK.md
  const identityStatement = {
    heading: "What Is StrataNoble?",
    statement: "StrataNoble helps everyday operators turn heavy, chaotic businesses into something they can actually manage. We work with solo and small business owners—practices, shops, studios, consultancies—who are carrying the whole thing on their backs and need clearer decisions, calmer operations, and more honest plans.",
    shortForm: "A platform for everyday entrepreneurs who want clear strategy, real market intelligence, and AI tools that turn scattered ideas into sustainable income."
  };

  // What We Are NOT - from MESSAGING_FRAMEWORK.md
  const whatWeAreNot = [
    "A get-rich-quick scheme",
    "For VC-backed startups",
    "Another generic \"business support\" platform",
    "A replacement for doing the work"
  ];

  // Framework-aligned business segments for imagery showcase
  const businessSegments = [
    {
      id: 'local-practice',
      title: 'Local Practices & Services',
      description: 'Family medicine, dental, salons, gyms, repair shops',
      image: '/images/entrepreneurs/local-practice.jpg',
      gradient: 'from-accent-gold to-accent-cream',
      delay: 0.1
    },
    {
      id: 'solo-consultant',
      title: 'Solo and Micro-Firms',
      description: 'Consultants, designers, bookkeepers, coaches',
      image: '/images/entrepreneurs/solo-consultant.jpg',
      gradient: 'from-emerald-500 to-emerald-300',
      delay: 0.2
    },
    {
      id: 'small-team',
      title: 'Small Teams with No Real Back Office',
      description: 'Agencies, boutiques, specialist shops',
      image: '/images/entrepreneurs/small-team.jpg',
      gradient: 'from-blue-600 to-blue-400',
      delay: 0.3
    },
    {
      id: 'overwhelmed-owner',
      title: 'The Overwhelmed Owner',
      description: 'Carrying the whole thing on your back',
      image: '/images/entrepreneurs/overwhelmed-owner.jpg',
      gradient: 'from-navy to-blue-800',
      delay: 0.4
    }
  ];

  const coreValues = [
    {
      icon: LightBulbIcon,
      title: 'Clarity Over Confusion',
      description: 'We cut through the noise and provide clear, actionable guidance that eliminates guesswork.',
      gradient: 'from-accent-gold to-accent-cream',
      delay: 0.1
    },
    {
      icon: ChartBarIcon,
      title: 'Evidence Over Guesswork',
      description: 'Every strategy is backed by data, market intelligence, and proven methodologies.',
      gradient: 'from-emerald-500 to-emerald-300',
      delay: 0.2
    },
    {
      icon: HeartIcon,
      title: 'Sustainability Over Quick Wins',
      description: 'We build for long-term success, not short-term gains. Your growth is our mission.',
      gradient: 'from-blue-600 to-blue-400',
      delay: 0.3
    }
  ];

  const differentiators = [
    {
      icon: BuildingOfficeIcon,
      title: 'Consulting-as-a-Service',
      description: 'Get enterprise-level consulting expertise through an affordable subscription model, not expensive one-time engagements.',
      stat: 'Starting at $47/mo',
      statLabel: 'vs $5,000+ traditional consulting',
      gradient: 'from-accent-gold to-accent-cream',
      delay: 0.1
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Tools',
      description: 'Combine human expertise with cutting-edge AI tools that accelerate your path from idea to income.',
      stat: '3x faster',
      statLabel: 'than traditional methods',
      gradient: 'from-emerald-500 to-emerald-300',
      delay: 0.2
    },
    {
      icon: UserGroupIcon,
      title: 'Built for the Overlooked',
      description: 'Designed specifically for underserved entrepreneurs and small teams who need systems, strategy, and accountability.',
      stat: '100% personalized',
      statLabel: 'to your unique situation',
      gradient: 'from-blue-600 to-blue-400',
      delay: 0.3
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trusted Operating Partner',
      description: 'We don\'t just consult—we become your ongoing partner in building a sustainable, profitable business.',
      stat: '73% success rate',
      statLabel: 'for our clients',
      gradient: 'from-navy to-blue-800',
      delay: 0.4
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Identity Statement Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Identity Statement Content */}
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-6 py-2 rounded-full text-sm font-semibold mb-6"
              >
                Who We Are
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6 leading-tight"
              >
                {identityStatement.heading}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-600 mb-6 leading-relaxed"
              >
                {identityStatement.statement}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg text-gray-500 mb-6 leading-relaxed italic"
              >
                {identityStatement.shortForm}
              </motion.p>

              {/* What We Are NOT */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-navy mb-3">What We Are NOT</h3>
                <ul className="space-y-2">
                  {whatWeAreNot.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-xl flex items-center justify-center">
                    <RocketLaunchIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-1">Our Mission</h3>
                    <p className="text-gray-600">
                      Help people succeed doing what they love.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-accent-gold to-accent-cream rounded-xl flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-1">Our Vision</h3>
                    <p className="text-gray-600">
                      A world where every entrepreneur has access to the tools, knowledge, and support to 
                      future-proof their business and achieve true freedom.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Diverse Imagery Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {businessSegments.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: segment.delay }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    className={`relative group ${index === 0 || index === 3 ? 'row-span-2' : ''}`}
                  >
                    <div className="relative h-full min-h-[200px] rounded-2xl overflow-hidden shadow-lg">
                      {/* Image with fallback gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${segment.gradient} opacity-90`}>
                        <Image
                          src={segment.image}
                          alt={`${segment.title} - ${segment.description}`}
                          fill
                          className="object-cover mix-blend-overlay"
                          unoptimized
                          onError={(e) => {
                            // Hide image on error, show gradient background
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      
                      {/* Overlay content */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 flex flex-col justify-end">
                        <h4 className="text-white font-bold text-lg mb-2">{segment.title}</h4>
                        <p className="text-white/90 text-sm">{segment.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Company Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-navy via-navy/95 to-blue-900 rounded-3xl p-8 sm:p-12 text-white mb-16 shadow-2xl relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6"
            >
              <BuildingOfficeIcon className="h-12 w-12 text-accent-gold mb-4" />
            </motion.div>

            <h3 className="text-3xl sm:text-4xl font-bold mb-6">
              For Solo and Small Business Owners Carrying It All
            </h3>

            <div className="space-y-6 text-lg text-blue-100 leading-relaxed max-w-4xl">
              <p>
                We work with <strong className="text-white">practices, shops, studios, and consultancies</strong> where 
                the owner is carrying the whole operation on their back. You need <strong className="text-white">clearer decisions, 
                calmer operations, and more honest plans</strong>—not another corporate consulting pitch.
              </p>

              <p>
                Our platform delivers <strong className="text-white">clear strategy, real market intelligence, and AI tools</strong> 
                that turn scattered ideas into sustainable income—all through an affordable subscription that grows with your business.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-300 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-2xl mb-6 shadow-lg relative z-10"
            >
              <RocketLaunchIcon className="h-8 w-8 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-navy mb-4 relative z-10">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
              Help people succeed doing what they love.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-accent-gold to-accent-cream opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-gold to-accent-cream rounded-2xl mb-6 shadow-lg relative z-10"
            >
              <SparklesIcon className="h-8 w-8 text-navy" />
            </motion.div>

            <h3 className="text-2xl font-bold text-navy mb-4 relative z-10">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed relative z-10">
              Become the trusted operating partner for every self-funded entrepreneur who needs systems, strategy, 
              and accountability, delivering AI-powered insights and human expertise through a single friction-free experience.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-navy text-center mb-12">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: value.delay }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-2xl mb-6 shadow-lg relative z-10`}
                  >
                    <value.icon className={`h-8 w-8 ${value.gradient.includes('navy') ? 'text-white' : 'text-white'}`} />
                  </motion.div>

                  <div className="space-y-4 relative z-10">
                    <h4 className="text-xl font-bold text-navy group-hover:text-navy/90 transition-colors">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What Makes Us Different */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-navy mb-4">
              What Makes Us Different
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't sell hope. We build it into the foundation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {differentiators.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: item.delay }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl mb-6 shadow-lg relative z-10`}
                  >
                    <item.icon className={`h-8 w-8 ${item.gradient.includes('navy') ? 'text-white' : 'text-white'}`} />
                  </motion.div>

                  <div className="space-y-4 relative z-10">
                    <h4 className="text-2xl font-bold text-navy group-hover:text-navy/90 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Statistics */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`bg-gradient-to-r ${item.gradient} p-4 rounded-xl ${item.gradient.includes('navy') ? 'text-white' : 'text-navy'}`}
                    >
                      <div className="text-2xl font-bold">{item.stat}</div>
                      <div className="text-sm opacity-80">{item.statLabel}</div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center bg-gradient-to-r from-navy to-blue-900 rounded-3xl p-12 text-white"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mb-6"
          >
            <HeartIcon className="h-12 w-12 text-accent-gold mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-3xl font-bold mb-4">
            Ready to Experience the StrataNoble Difference?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the growing community of entrepreneurs who've turned their passions into profitable businesses 
            with our proven methodology and AI-powered tools.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.a
              href="/contact?utm_source=what-is-strata&utm_medium=cta&utm_campaign=start-journey"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-accent-gold to-accent-cream text-navy px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Start Your Journey
            </motion.a>
            
            <motion.a
              href="/solutions"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/20 transition-all duration-300"
            >
              Explore Our Services
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

