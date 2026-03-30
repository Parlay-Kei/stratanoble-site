// ServiceCardGrid data for landing page - Updated for four core offerings
export const services = [
  {
    icon: 'lightbulb',
    title: 'Done-For-You Strategy',
    subtitle: '90-Day Revenue Roadmap',
    description: 'Get unstuck with a custom action plan that drives revenue in 90 days or less.',
    link: '/services',
    price: 'From $1,200',
    whatYouGet: [
      '2-week delivery guarantee',
      'Revenue-focused roadmap',
      'Competitor analysis included',
      'Weekly check-ins for 90 days',
    ],
    packages: [
      {
        name: 'Lite',
        price: '$1,200',
        features: ['2-hour strategy session', 'Business model canvas', '30-day action plan', 'Email support']
      },
      {
        name: 'Core',
        price: '$2,500',
        features: ['4-hour deep dive', 'Market analysis report', 'Revenue model design', '90-day roadmap', '2 follow-up calls']
      },
      {
        name: 'Premium',
        price: '$5,000',
        features: ['Full strategy & execution', 'Quarterly reviews', 'Priority support', 'Implementation guidance', 'Success metrics tracking']
      }
    ],
    ctaPrimary: 'Book Free Discovery',
    ctaSecondary: 'Download One-Pager',
    calendlyLink: 'https://calendly.com/contact-stratanoble/30min',
    category: 'strategy'
  },
  {
    icon: 'academic-cap',
    title: 'Launch Bootcamp',
    subtitle: 'First $10K in 30 Days',
    description: 'Intensive workshop series with templates that generated $2.3M for past students.',
    link: '/services',
    price: 'From $97',
    whatYouGet: [
      'Next cohort starts Monday',
      '$10K revenue templates',
      '30-day money-back guarantee',
      'Only 12 spots per cohort',
    ],
    packages: [
      {
        name: 'Standard',
        price: '$97',
        features: ['Live workshop access', 'Recording access', 'Resource templates', 'Community access']
      },
      {
        name: 'VIP',
        price: '$197',
        features: ['All Standard features', '1-on-1 mentoring session', 'Priority Q&A', 'Exclusive resources', 'Lifetime access']
      }
    ],
    ctaPrimary: 'View Upcoming Workshops',
    ctaSecondary: 'Join Waitlist',
    calendlyLink: 'https://calendly.com/contact-stratanoble/30min',
    category: 'education'
  },
  {
    icon: 'chart-bar',
    title: 'Profit Maximizer Audit',
    subtitle: 'Find $50K+ Hidden Revenue',
    description: 'Data audit that finds an average of $50K in missed revenue opportunities.',
    link: '/data-analysis',
    price: 'From $800',
    whatYouGet: [
      '48-hour turnaround',
      'Average ROI: 12.3x',
      'No revenue found = full refund',
      'Implementation support included',
    ],
    packages: [
      {
        name: 'Analysis',
        price: '$800',
        features: ['Data audit', 'KPI identification', 'Performance report', 'Recommendations']
      },
      {
        name: 'Implementation',
        price: '$2,000',
        features: ['Full analysis', 'Dashboard setup', 'Process optimization', 'Team training', '30-day support']
      }
    ],
    ctaPrimary: 'Request Sample Analysis',
    ctaSecondary: 'View Case Studies',
    calendlyLink: 'https://calendly.com/contact-stratanoble/30min',
    category: 'analytics'
  },
  {
    icon: 'paint-brush',
    title: 'Authority Brand Sprint',
    subtitle: '0 to 10K Followers in 60 Days',
    description: 'Complete brand system that positions you as the go-to expert in your niche.',
    link: '/services',
    price: 'From $1,500',
    whatYouGet: [
      'Launch in 7 days',
      'Viral content templates',
      'Verified social accounts',
      'PR placement guarantee',
    ],
    packages: [
      {
        name: 'Starter',
        price: '$1,500',
        features: ['Logo design', 'Brand guidelines', 'Basic website', 'Social media setup']
      },
      {
        name: 'Growth',
        price: '$3,500',
        features: ['Full brand identity', 'Custom website', 'Content strategy', 'Social media management', 'SEO optimization']
      },
      {
        name: 'Authority',
        price: '$7,500',
        features: ['Complete brand suite', 'Advanced website', 'Content creation', 'Marketing automation', 'Ongoing support']
      }
    ],
    ctaPrimary: 'Get Custom Quote',
    ctaSecondary: 'View Portfolio',
    calendlyLink: 'https://calendly.com/contact-stratanoble/30min',
    category: 'branding'
  },
];

// Service categories for filtering
export const serviceCategories = [
  { id: 'all', name: 'All Services' },
  { id: 'strategy', name: 'Strategy & Consulting' },
  { id: 'education', name: 'Workshops & Training' },
  { id: 'analytics', name: 'Data & Analytics' },
  { id: 'branding', name: 'Brand & Digital' },
];

