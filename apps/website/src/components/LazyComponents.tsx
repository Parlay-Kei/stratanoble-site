'use client';

import { lazy, Suspense, ReactNode } from 'react';

// Lazy load the ServicesSection component
const ServicesSection = lazy(() => 
  import('./ServicesSection').then(module => ({ default: module.ServicesSection }))
)

// Loading fallback component
const SectionLoadingFallback = () => (
  <div className="py-16 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 h-64"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Wrapper component for lazy sections
export function LazySectionWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SectionLoadingFallback />}>
      {children}
    </Suspense>
  )
}

// Lazy ServicesSection component
export function LazyServicesSection() {
  return <ServicesSection />
}
