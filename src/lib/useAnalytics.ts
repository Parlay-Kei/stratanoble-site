import { useCallback, useEffect, useRef } from 'react'

import { 
  trackScrollDepth, 
  trackPageView, 
  trackServiceInteraction,
  trackTrustSignal,
  trackMobileMenu,
  trackCTAClick,
  trackCTAVariantShown,
  trackContactFormEvent,
  trackConversion,
  getCurrentPage
} from './analytics'

// Hook for tracking scroll depth
export function useScrollTracking() {
  const lastTrackedDepth = useRef(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)
      
      // Track at 25%, 50%, 75%, and 100% scroll depths
      const milestones = [25, 50, 75, 100]
      const shouldTrack = milestones.some(milestone => 
        scrollPercent >= milestone && lastTrackedDepth.current < milestone
      )
      
      if (shouldTrack) {
        trackScrollDepth(scrollPercent)
        lastTrackedDepth.current = Math.max(...milestones.filter(m => scrollPercent >= m))
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}

// Hook for tracking time on page
export function useTimeOnPage() {
  const startTime = useRef(Date.now())
  const hasTracked = useRef(false)
  
  useEffect(() => {
    const trackTimeOnPage = () => {
      if (!hasTracked.current) {
        const timeSpent = Math.round((Date.now() - startTime.current) / 1000)
        if (timeSpent >= 30) { // Track after 30 seconds
          trackPageView(getCurrentPage(), { time_on_page: timeSpent })
          hasTracked.current = true
        }
      }
    }
    
    const interval = setInterval(trackTimeOnPage, 10000) // Check every 10 seconds
    
    return () => {
      clearInterval(interval)
      trackTimeOnPage() // Track on unmount
    }
  }, [])
}

// Hook for tracking service interactions
export function useServiceTracking(serviceName: string) {
  const trackHover = useCallback(() => {
    trackServiceInteraction(serviceName, 'hover')
  }, [serviceName])
  
  const trackClick = useCallback(() => {
    trackServiceInteraction(serviceName, 'click')
  }, [serviceName])
  
  const trackDetails = useCallback(() => {
    trackServiceInteraction(serviceName, 'details')
  }, [serviceName])
  
  return { trackHover, trackClick, trackDetails }
}

// Hook for tracking trust signals
export function useTrustSignalTracking() {
  const trackTestimonialView = useCallback((testimonialId: string) => {
    trackTrustSignal('testimonial', 'view', { testimonial_id: testimonialId })
  }, [])
  
  const trackClientLogoClick = useCallback((clientName: string) => {
    trackTrustSignal('client_logo', 'click', { client_name: clientName })
  }, [])
  
  return { trackTestimonialView, trackClientLogoClick }
}

// Hook for tracking mobile menu
export function useMobileMenuTracking() {
  const trackOpen = useCallback(() => {
    trackMobileMenu('open')
  }, [])
  
  const trackClose = useCallback(() => {
    trackMobileMenu('close')
  }, [])
  
  return { trackOpen, trackClose }
}

// Hook for tracking CTA interactions
export function useCTATracking() {
  const trackClick = useCallback((type: 'primary' | 'secondary', variant?: number, page?: string) => {
    trackCTAClick(type, variant, page)
  }, [])
  
  const trackVariantShown = useCallback((variant: number, page?: string) => {
    trackCTAVariantShown(variant, page)
  }, [])
  
  return { trackClick, trackVariantShown }
}

// Hook for tracking contact form
export function useContactFormTracking() {
  const trackStart = useCallback((properties?: Record<string, string | number | boolean>) => {
    trackContactFormEvent('start', properties)
  }, [])
  
  const trackSubmit = useCallback((properties?: Record<string, string | number | boolean>) => {
    trackContactFormEvent('submit', properties)
  }, [])
  
  const trackSuccess = useCallback((properties?: Record<string, string | number | boolean>) => {
    trackContactFormEvent('success', properties)
  }, [])
  
  const trackError = useCallback((properties?: Record<string, string | number | boolean>) => {
    trackContactFormEvent('error', properties)
  }, [])
  
  return { trackStart, trackSubmit, trackSuccess, trackError }
}

// Hook for tracking conversions
export function useConversionTracking() {
  const trackWorkshopInterest = useCallback((properties?: Record<string, string | number | boolean>) => {
    trackConversion('workshop', properties)
  }, [])
  
  const trackConsultationRequest = useCallback((properties?: Record<string, string | number | boolean>) => {
    trackConversion('consultation', properties)
  }, [])
  
  const trackNewsletterSignup = useCallback((properties?: Record<string, string | number | boolean>) => {
    trackConversion('newsletter', properties)
  }, [])
  
  return { trackWorkshopInterest, trackConsultationRequest, trackNewsletterSignup }
}

// Comprehensive analytics hook
export function useAnalytics() {
  useScrollTracking()
  useTimeOnPage()
  
  return {
    service: useServiceTracking(''),
    trust: useTrustSignalTracking(),
    mobileMenu: useMobileMenuTracking(),
    cta: useCTATracking(),
    contactForm: useContactFormTracking(),
    conversion: useConversionTracking(),
  }
}
