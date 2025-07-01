// Analytics configuration and utilities for Strata Noble
// Using Plausible Analytics for privacy-friendly tracking

declare global {
  interface Window {
    plausible?: (eventName: string, options?: PlausibleOptions) => void;
  }
}

interface PlausibleOptions {
  props?: Record<string, string | number | boolean>;
  u?: string; // URL
  callback?: () => void;
}

interface AnalyticsEvent {
  name: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, string | number | boolean>;
}

// Analytics event names for consistency
export const ANALYTICS_EVENTS = {
  // CTA Events
  CTA_CLICK: 'cta_click',
  CTA_VARIANT_SHOWN: 'cta_variant_shown',
  
  // Navigation Events
  NAVIGATION_CLICK: 'navigation_click',
  MOBILE_MENU_OPEN: 'mobile_menu_open',
  MOBILE_MENU_CLOSE: 'mobile_menu_close',
  
  // Service Events
  SERVICE_HOVER: 'service_hover',
  SERVICE_CLICK: 'service_click',
  SERVICE_DETAILS_VIEW: 'service_details_view',
  
  // Contact Events
  CONTACT_FORM_START: 'contact_form_start',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  CONTACT_FORM_SUCCESS: 'contact_form_success',
  CONTACT_FORM_ERROR: 'contact_form_error',
  
  // Trust Signal Events
  TESTIMONIAL_VIEW: 'testimonial_view',
  CLIENT_LOGO_CLICK: 'client_logo_click',
  
  // Page Events
  PAGE_VIEW: 'page_view',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  
  // Conversion Events
  WORKSHOP_INTEREST: 'workshop_interest',
  CONSULTATION_REQUEST: 'consultation_request',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
} as const;

// Initialize Plausible analytics
export function initAnalytics(): void {
  if (typeof window !== 'undefined') {
    // Add Plausible script if not already present
    if (!window.plausible) {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.setAttribute('data-domain', 'stratanoble.com');
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
      
      // Initialize plausible function
      window.plausible = function(eventName: string, options?: PlausibleOptions) {
        // This will be replaced by the Plausible script
        console.log('Plausible event:', eventName, options);
      };
    }
  }
}

// Track a custom event
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window !== 'undefined' && window.plausible) {
    const props: Record<string, string | number | boolean> = {
      category: event.category || 'general',
      action: event.action || event.name,
      ...event.properties,
    };
    
    if (event.label) props.label = event.label;
    if (event.value) props.value = event.value;
    
    window.plausible(event.name, { props });
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event.name, props);
    }
  }
}

// Track CTA clicks
export function trackCTAClick(type: 'primary' | 'secondary', variant?: number, page?: string): void {
  trackEvent({
    name: ANALYTICS_EVENTS.CTA_CLICK,
    category: 'engagement',
    action: 'cta_click',
    label: type,
    properties: {
      cta_type: type,
      variant: variant || 0,
      page: page || 'unknown',
      timestamp: Date.now(),
    },
  });
}

// Track CTA variant shown
export function trackCTAVariantShown(variant: number, page?: string): void {
  trackEvent({
    name: ANALYTICS_EVENTS.CTA_VARIANT_SHOWN,
    category: 'experiment',
    action: 'variant_shown',
    label: `variant_${variant}`,
    properties: {
      variant,
      page: page || 'unknown',
      timestamp: Date.now(),
    },
  });
}

// Track service interactions
export function trackServiceInteraction(serviceName: string, action: 'hover' | 'click' | 'details'): void {
  trackEvent({
    name: action === 'hover' ? ANALYTICS_EVENTS.SERVICE_HOVER : 
          action === 'click' ? ANALYTICS_EVENTS.SERVICE_CLICK : 
          ANALYTICS_EVENTS.SERVICE_DETAILS_VIEW,
    category: 'service',
    action,
    label: serviceName,
    properties: {
      service_name: serviceName,
      action,
      timestamp: Date.now(),
    },
  });
}

// Track contact form events
export function trackContactFormEvent(action: 'start' | 'submit' | 'success' | 'error', properties?: Record<string, string | number | boolean>): void {
  const eventName = action === 'start' ? ANALYTICS_EVENTS.CONTACT_FORM_START :
                   action === 'submit' ? ANALYTICS_EVENTS.CONTACT_FORM_SUBMIT :
                   action === 'success' ? ANALYTICS_EVENTS.CONTACT_FORM_SUCCESS :
                   ANALYTICS_EVENTS.CONTACT_FORM_ERROR;
  
  trackEvent({
    name: eventName,
    category: 'conversion',
    action: `contact_form_${action}`,
    properties: {
      ...properties,
      timestamp: Date.now(),
    },
  });
}

// Track scroll depth
export function trackScrollDepth(depth: number): void {
  trackEvent({
    name: ANALYTICS_EVENTS.SCROLL_DEPTH,
    category: 'engagement',
    action: 'scroll',
    value: depth,
    properties: {
      scroll_depth: depth,
      timestamp: Date.now(),
    },
  });
}

// Track page view
export function trackPageView(page: string, properties?: Record<string, string | number | boolean>): void {
  trackEvent({
    name: ANALYTICS_EVENTS.PAGE_VIEW,
    category: 'navigation',
    action: 'page_view',
    label: page,
    properties: {
      page,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      ...properties,
      timestamp: Date.now(),
    },
  });
}

// Track conversion events
export function trackConversion(type: 'workshop' | 'consultation' | 'newsletter', properties?: Record<string, string | number | boolean>): void {
  const eventName = type === 'workshop' ? ANALYTICS_EVENTS.WORKSHOP_INTEREST :
                   type === 'consultation' ? ANALYTICS_EVENTS.CONSULTATION_REQUEST :
                   ANALYTICS_EVENTS.NEWSLETTER_SIGNUP;
  
  trackEvent({
    name: eventName,
    category: 'conversion',
    action: type,
    properties: {
      conversion_type: type,
      ...properties,
      timestamp: Date.now(),
    },
  });
}

// Track mobile menu interactions
export function trackMobileMenu(action: 'open' | 'close'): void {
  trackEvent({
    name: action === 'open' ? ANALYTICS_EVENTS.MOBILE_MENU_OPEN : ANALYTICS_EVENTS.MOBILE_MENU_CLOSE,
    category: 'navigation',
    action: `mobile_menu_${action}`,
    properties: {
      action,
      timestamp: Date.now(),
    },
  });
}

// Track trust signal interactions
export function trackTrustSignal(type: 'testimonial' | 'client_logo', action: string, properties?: Record<string, string | number | boolean>): void {
  const eventName = type === 'testimonial' ? ANALYTICS_EVENTS.TESTIMONIAL_VIEW : ANALYTICS_EVENTS.CLIENT_LOGO_CLICK;
  
  trackEvent({
    name: eventName,
    category: 'trust',
    action,
    properties: {
      trust_signal_type: type,
      action,
      ...properties,
      timestamp: Date.now(),
    },
  });
}

// Utility to get current page name
export function getCurrentPage(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname || '/';
  }
  return '/';
}

// Auto-track page views
export function autoTrackPageViews(): void {
  if (typeof window !== 'undefined') {
    // Track initial page view
    trackPageView(getCurrentPage());
    
    // Track navigation changes (for SPA)
    let currentPage = getCurrentPage();
    
    const observer = new MutationObserver(() => {
      const newPage = getCurrentPage();
      if (newPage !== currentPage) {
        currentPage = newPage;
        trackPageView(currentPage);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// Initialize analytics on app start
export function initializeAnalytics(): void {
  initAnalytics();
  autoTrackPageViews();
}
