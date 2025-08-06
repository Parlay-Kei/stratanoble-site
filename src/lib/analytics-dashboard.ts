// Analytics Dashboard Configuration for Strata Noble
// This file defines the key metrics and events for the Looker Studio dashboard

export interface DashboardMetric {
  name: string
  description: string
  eventName: string
  category: 'engagement' | 'conversion' | 'navigation' | 'trust'
  type: 'count' | 'rate' | 'duration' | 'funnel'
  target?: number
  unit?: string
}

export interface DashboardConfig {
  title: string
  description: string
  metrics: DashboardMetric[]
  goals: DashboardGoal[]
  alerts: DashboardAlert[]
}

export interface DashboardGoal {
  name: string
  metric: string
  target: number
  timeframe: 'daily' | 'weekly' | 'monthly'
  description: string
}

export interface DashboardAlert {
  name: string
  condition: string
  threshold: number
  action: 'email' | 'slack' | 'dashboard'
  recipients: string[]
}

// Key metrics for the Strata Noble dashboard
export const DASHBOARD_METRICS: DashboardMetric[] = [
  // Engagement Metrics
  {
    name: 'Page Views',
    description: 'Total page views across the site',
    eventName: 'page_view',
    category: 'engagement',
    type: 'count',
    unit: 'views'
  },
  {
    name: 'Scroll Depth',
    description: 'Average scroll depth percentage',
    eventName: 'scroll_depth',
    category: 'engagement',
    type: 'rate',
    target: 75,
    unit: '%'
  },
  {
    name: 'Time on Page',
    description: 'Average time spent on pages',
    eventName: 'time_on_page',
    category: 'engagement',
    type: 'duration',
    target: 120,
    unit: 'seconds'
  },
  
  // CTA Metrics
  {
    name: 'CTA Clicks',
    description: 'Total CTA button clicks',
    eventName: 'cta_click',
    category: 'conversion',
    type: 'count',
    unit: 'clicks'
  },
  {
    name: 'CTA Click Rate',
    description: 'Percentage of visitors who click CTAs',
    eventName: 'cta_click',
    category: 'conversion',
    type: 'rate',
    target: 5,
    unit: '%'
  },
  {
    name: 'CTA Variant Performance',
    description: 'Performance comparison of CTA variants',
    eventName: 'cta_variant_shown',
    category: 'conversion',
    type: 'funnel',
    unit: 'conversion rate'
  },
  
  // Service Metrics
  {
    name: 'Service Hovers',
    description: 'Number of service card hovers',
    eventName: 'service_hover',
    category: 'engagement',
    type: 'count',
    unit: 'hovers'
  },
  {
    name: 'Service Clicks',
    description: 'Number of service detail clicks',
    eventName: 'service_click',
    category: 'conversion',
    type: 'count',
    unit: 'clicks'
  },
  {
    name: 'Service Conversion Rate',
    description: 'Rate of service hover to click conversion',
    eventName: 'service_click',
    category: 'conversion',
    type: 'rate',
    target: 15,
    unit: '%'
  },
  
  // Contact Form Metrics
  {
    name: 'Contact Form Starts',
    description: 'Number of contact form interactions started',
    eventName: 'contact_form_start',
    category: 'conversion',
    type: 'count',
    unit: 'starts'
  },
  {
    name: 'Contact Form Submissions',
    description: 'Number of successful form submissions',
    eventName: 'contact_form_success',
    category: 'conversion',
    type: 'count',
    unit: 'submissions'
  },
  {
    name: 'Contact Form Conversion Rate',
    description: 'Rate of form start to successful submission',
    eventName: 'contact_form_success',
    category: 'conversion',
    type: 'rate',
    target: 80,
    unit: '%'
  },
  
  // Trust Signal Metrics
  {
    name: 'Testimonial Views',
    description: 'Number of testimonial interactions',
    eventName: 'testimonial_view',
    category: 'trust',
    type: 'count',
    unit: 'views'
  },
  {
    name: 'Client Logo Clicks',
    description: 'Number of client logo interactions',
    eventName: 'client_logo_click',
    category: 'trust',
    type: 'count',
    unit: 'clicks'
  },
  
  // Navigation Metrics
  {
    name: 'Mobile Menu Opens',
    description: 'Number of mobile menu interactions',
    eventName: 'mobile_menu_open',
    category: 'navigation',
    type: 'count',
    unit: 'opens'
  },
  
  // Conversion Metrics
  {
    name: 'Workshop Interest',
    description: 'Number of workshop-related conversions',
    eventName: 'workshop_interest',
    category: 'conversion',
    type: 'count',
    unit: 'conversions'
  },
  {
    name: 'Consultation Requests',
    description: 'Number of consultation requests',
    eventName: 'consultation_request',
    category: 'conversion',
    type: 'count',
    unit: 'requests'
  },
  {
    name: 'Newsletter Signups',
    description: 'Number of newsletter subscriptions',
    eventName: 'newsletter_signup',
    category: 'conversion',
    type: 'count',
    unit: 'signups'
  }
]

// Dashboard goals for tracking progress
export const DASHBOARD_GOALS: DashboardGoal[] = [
  {
    name: 'Increase CTA Click Rate',
    metric: 'CTA Click Rate',
    target: 5,
    timeframe: 'monthly',
    description: 'Achieve 5% CTA click rate across all pages'
  },
  {
    name: 'Improve Contact Form Conversion',
    metric: 'Contact Form Conversion Rate',
    target: 80,
    timeframe: 'monthly',
    description: 'Maintain 80% contact form completion rate'
  },
  {
    name: 'Boost Service Engagement',
    metric: 'Service Conversion Rate',
    target: 15,
    timeframe: 'monthly',
    description: 'Convert 15% of service hovers to clicks'
  },
  {
    name: 'Increase Scroll Depth',
    metric: 'Scroll Depth',
    target: 75,
    timeframe: 'monthly',
    description: 'Achieve 75% average scroll depth'
  }
]

// Dashboard alerts for monitoring
export const DASHBOARD_ALERTS: DashboardAlert[] = [
  {
    name: 'Low CTA Performance',
    condition: 'CTA Click Rate < 2%',
    threshold: 2,
    action: 'email',
    recipients: ['steve@stratanoble.com']
  },
  {
    name: 'Form Drop-off Alert',
    condition: 'Contact Form Conversion Rate < 60%',
    threshold: 60,
    action: 'email',
    recipients: ['steve@stratanoble.com']
  },
  {
    name: 'High Bounce Rate',
    condition: 'Scroll Depth < 25%',
    threshold: 25,
    action: 'slack',
    recipients: ['#analytics-alerts']
  }
]

// Dashboard configuration
export const DASHBOARD_CONFIG: DashboardConfig = {
  title: 'Strata Noble Analytics Dashboard',
  description: 'Key metrics and performance indicators for the Strata Noble website',
  metrics: DASHBOARD_METRICS,
  goals: DASHBOARD_GOALS,
  alerts: DASHBOARD_ALERTS
}

// Weekly report configuration
export const WEEKLY_REPORT_CONFIG = {
  title: 'Strata Noble Weekly Analytics Report',
  metrics: [
    'Page Views',
    'CTA Clicks',
    'Contact Form Submissions',
    'Service Hovers',
    'Scroll Depth'
  ],
  recipients: ['steve@stratanoble.com'],
  schedule: 'every Monday at 9:00 AM',
  format: 'email'
}

// Export functions for dashboard integration
export function getMetricValue(_metricName: string): number {
  // This would integrate with Plausible API to get actual values
  // For now, return placeholder data
  return Math.floor(Math.random() * 100)
}

export function getMetricTrend(_metricName: string): 'up' | 'down' | 'stable' {
  // This would calculate trend based on historical data
  const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable']
  return trends[Math.floor(Math.random() * trends.length)]
}

export function generateWeeklyReport(): string {
  const report = {
    period: 'Last Week',
    summary: 'Website performance overview',
    metrics: DASHBOARD_METRICS.slice(0, 5).map(metric => ({
      name: metric.name,
      value: getMetricValue(metric.name),
      trend: getMetricTrend(metric.name),
      target: metric.target
    })),
    recommendations: [
      'Consider A/B testing different CTA button colors',
      'Optimize contact form for mobile users',
      'Add more testimonials to build trust'
    ]
  }
  
  return JSON.stringify(report, null, 2)
} 